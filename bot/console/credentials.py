"""Host-only LLM credential slots + per-pal bindings.

Secrets live under DATA_DIR (Application Support / MININJA_DATA) — never in
kit/, recipes, or git. Public APIs return slot metadata only (no raw values).
"""
from __future__ import annotations

import json
import os
import re
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from console.paths import CREDENTIALS_PATH, DATA_DIR

LOCK = threading.RLock()

# Env var names we will inject when resolving a slot (first hit wins for local paste).
_PROVIDER_ENV = {
    "xai": "XAI_API_KEY",
    "openai": "OPENAI_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY",
    "other": "MININJA_LLM_API_KEY",
}

_ENV_NAME_RE = re.compile(r"^[A-Z][A-Z0-9_]{0,63}$")
_LABEL_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._\-/ ]{0,63}$")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def empty_store() -> dict:
    return {"version": 1, "slots": {}}


def _load() -> dict:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not CREDENTIALS_PATH.exists():
        return empty_store()
    try:
        data = json.loads(CREDENTIALS_PATH.read_text())
    except (OSError, json.JSONDecodeError):
        return empty_store()
    if not isinstance(data, dict):
        return empty_store()
    data.setdefault("version", 1)
    data.setdefault("slots", {})
    if not isinstance(data["slots"], dict):
        data["slots"] = {}
    return data


def _save(store: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp = CREDENTIALS_PATH.with_suffix(".tmp")
    # Mode 0o600 — host-only secrets file
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    try:
        os.write(fd, (json.dumps(store, indent=2) + "\n").encode())
    finally:
        os.close(fd)
    tmp.replace(CREDENTIALS_PATH)
    try:
        os.chmod(CREDENTIALS_PATH, 0o600)
    except OSError:
        pass


def _public_slot(slot: dict, bindings: dict[str, str] | None = None) -> dict:
    """Strip secrets. bindings: pal_id -> slot_id."""
    sid = slot.get("id")
    bound = []
    if bindings:
        bound = sorted(pid for pid, s in bindings.items() if s == sid)
    kind = slot.get("kind") or "env"
    return {
        "id": sid,
        "label": slot.get("label") or "",
        "kind": kind,
        "env": slot.get("env") or "",
        "provider": slot.get("provider") or "other",
        "has_secret": bool(slot.get("secret")),
        "created_at": slot.get("created_at"),
        "bound_pal_ids": bound,
        "share_count": len(bound),
    }


def _bindings_from_bots(bots: list[dict]) -> dict[str, str]:
    out: dict[str, str] = {}
    for bot in bots or []:
        cid = bot.get("credential_id")
        bid = bot.get("id")
        if cid and bid:
            out[bid] = cid
    return out


def list_slots(bots: list[dict] | None = None) -> list[dict]:
    with LOCK:
        store = _load()
        bindings = _bindings_from_bots(bots or [])
        return [_public_slot(s, bindings) for s in store["slots"].values()]


def get_slot(slot_id: str, bots: list[dict] | None = None) -> dict | None:
    with LOCK:
        store = _load()
        slot = store["slots"].get(slot_id)
        if not slot:
            return None
        return _public_slot(slot, _bindings_from_bots(bots or []))


def create_slot(payload: dict) -> tuple[dict | None, str | None]:
    """Create a credential slot. Returns (public_slot, error)."""
    label = (payload.get("label") or "").strip()
    if not label or not _LABEL_RE.match(label):
        return None, "label required (letters, numbers, ._- / space)"
    kind = (payload.get("kind") or "env").strip().lower()
    if kind not in ("env", "local"):
        return None, "kind must be env or local"
    provider = (payload.get("provider") or "other").strip().lower()
    if provider not in _PROVIDER_ENV:
        provider = "other"
    env_name = (payload.get("env") or "").strip().upper()
    if kind == "env":
        if not env_name:
            env_name = _PROVIDER_ENV[provider]
        if not _ENV_NAME_RE.match(env_name):
            return None, "env must look like XAI_API_KEY"
    secret = payload.get("secret")
    if secret is not None:
        secret = str(secret).strip()
        if not secret:
            secret = None
    if kind == "local" and not secret:
        return None, "local slot needs a secret (stored host-only, never in git)"
    if kind == "env":
        secret = None  # env slots never store raw values

    slot = {
        "id": str(uuid.uuid4()),
        "label": label,
        "kind": kind,
        "env": env_name if kind == "env" else (env_name or _PROVIDER_ENV[provider]),
        "provider": provider,
        "created_at": now_iso(),
    }
    if secret:
        slot["secret"] = secret

    with LOCK:
        store = _load()
        # Reject duplicate labels (operator clarity)
        for existing in store["slots"].values():
            if (existing.get("label") or "").lower() == label.lower():
                return None, f"label already used: {existing.get('label')}"
        store["slots"][slot["id"]] = slot
        _save(store)
    return _public_slot(slot, {}), None


def patch_slot(slot_id: str, payload: dict) -> tuple[dict | None, str | None]:
    with LOCK:
        store = _load()
        slot = store["slots"].get(slot_id)
        if not slot:
            return None, "not found"
        if "label" in payload:
            label = (payload.get("label") or "").strip()
            if not label or not _LABEL_RE.match(label):
                return None, "bad label"
            for sid, existing in store["slots"].items():
                if sid != slot_id and (existing.get("label") or "").lower() == label.lower():
                    return None, f"label already used: {existing.get('label')}"
            slot["label"] = label
        if "provider" in payload:
            provider = (payload.get("provider") or "other").strip().lower()
            if provider not in _PROVIDER_ENV:
                provider = "other"
            slot["provider"] = provider
        if "env" in payload:
            env_name = (payload.get("env") or "").strip().upper()
            if env_name and not _ENV_NAME_RE.match(env_name):
                return None, "env must look like XAI_API_KEY"
            if env_name:
                slot["env"] = env_name
        if "secret" in payload:
            secret = payload.get("secret")
            if secret is None or str(secret).strip() == "":
                slot.pop("secret", None)
            else:
                slot["secret"] = str(secret).strip()
                slot["kind"] = "local"
        if "kind" in payload:
            kind = (payload.get("kind") or slot.get("kind") or "env").strip().lower()
            if kind not in ("env", "local"):
                return None, "kind must be env or local"
            if kind == "env":
                slot.pop("secret", None)
            slot["kind"] = kind
        _save(store)
        return _public_slot(slot, {}), None


def delete_slot(slot_id: str) -> bool:
    with LOCK:
        store = _load()
        if slot_id not in store["slots"]:
            return False
        del store["slots"][slot_id]
        _save(store)
        return True


def scrub_public_bot(bot: dict) -> dict:
    """Ensure bot dict never leaks a raw secret field (defensive)."""
    row = dict(bot)
    row.pop("secret", None)
    row.pop("api_key", None)
    row.pop("apiKey", None)
    return row


def resolve_for_pal(bot: dict) -> dict:
    """Resolve bound credential for a pal run.

    Returns:
      {
        ok: bool,
        unbound: bool,
        slot_id, label, kind, env, provider,
        using: str,          # human summary, never the secret
        inject: dict,        # env vars to merge into subprocess (may include secret)
        error: str | None,
      }
    """
    name = bot.get("name") or bot.get("id") or "pal"
    cid = (bot.get("credential_id") or "").strip()
    if not cid:
        return {
            "ok": False,
            "unbound": True,
            "slot_id": None,
            "label": None,
            "kind": None,
            "env": None,
            "provider": None,
            "using": None,
            "inject": {},
            "error": f"no LLM credential bound for {name} — assign a key slot in Edit",
        }

    with LOCK:
        store = _load()
        slot = store["slots"].get(cid)
        if not slot:
            return {
                "ok": False,
                "unbound": False,
                "slot_id": cid,
                "label": None,
                "kind": None,
                "env": None,
                "provider": None,
                "using": None,
                "inject": {},
                "error": f"credential slot missing for {name} (id {cid[:8]}…) — reassign or unshare",
            }

        label = slot.get("label") or cid[:8]
        kind = slot.get("kind") or "env"
        env_name = (slot.get("env") or "").strip() or _PROVIDER_ENV.get(slot.get("provider") or "other", "MININJA_LLM_API_KEY")
        provider = slot.get("provider") or "other"
        inject: dict[str, str] = {}

        if kind == "local":
            secret = slot.get("secret")
            if not secret:
                return {
                    "ok": False,
                    "unbound": False,
                    "slot_id": cid,
                    "label": label,
                    "kind": kind,
                    "env": env_name,
                    "provider": provider,
                    "using": f"slot {label} (empty)",
                    "inject": {},
                    "error": f"slot {label} has no secret stored — paste a key or switch to env",
                }
            inject[env_name] = secret
            # Also set common provider aliases so thin clients find something
            for alias in set(_PROVIDER_ENV.values()):
                inject.setdefault(alias, secret)
            using = f"slot {label} (local) for {name}"
            return {
                "ok": True,
                "unbound": False,
                "slot_id": cid,
                "label": label,
                "kind": kind,
                "env": env_name,
                "provider": provider,
                "using": using,
                "inject": inject,
                "error": None,
            }

        # kind == env
        value = os.environ.get(env_name, "").strip()
        if not value:
            return {
                "ok": False,
                "unbound": False,
                "slot_id": cid,
                "label": label,
                "kind": kind,
                "env": env_name,
                "provider": provider,
                "using": f"slot {label} → ${env_name} (unset)",
                "inject": {},
                "error": f"env ${env_name} unset for slot {label} (pal {name})",
            }
        inject[env_name] = value
        using = f"slot {label} → ${env_name} for {name}"
        return {
            "ok": True,
            "unbound": False,
            "slot_id": cid,
            "label": label,
            "kind": kind,
            "env": env_name,
            "provider": provider,
            "using": using,
            "inject": inject,
            "error": None,
        }


def public_resolve(bot: dict) -> dict:
    """Resolve summary safe for JSON APIs (no inject secrets)."""
    r = resolve_for_pal(bot)
    return {
        "ok": r["ok"],
        "unbound": r["unbound"],
        "slot_id": r["slot_id"],
        "label": r["label"],
        "kind": r["kind"],
        "env": r["env"],
        "provider": r["provider"],
        "using": r["using"],
        "error": r["error"],
    }


def path_for_docs() -> str:
    return str(CREDENTIALS_PATH)
