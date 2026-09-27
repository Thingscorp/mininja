"""Host settings SoT — one JSON file beside credentials.json.

CLI (mininja config) writes; server + console read. No secrets here.
"""
from __future__ import annotations

import json
import os
import threading
from pathlib import Path
from typing import Any

from console.paths import DATA_DIR, HOST_CONFIG_PATH

LOCK = threading.RLock()

SCHEMA_V = 1

# Flat keys — aspect is metadata for docs / list grouping only.
DEFAULTS: dict[str, Any] = {
    "defaultMode": "auto",
    "showPlants": True,
    "showSticky": True,
    "maxParallel": 4,
    "reducedMotion": False,
}

ASPECT: dict[str, str] = {
    "defaultMode": "general",
    "showPlants": "habitat",
    "showSticky": "habitat",
    "maxParallel": "composer",
    "reducedMotion": "appearance",
}

MODES = ("draft", "auto", "free")

# Cloud env vars — presence only (hostname may be shown for HOST).
CLOUD_ENV = (
    "MININJA_CLOUD_HOST",
    "MININJA_REMOTE_HOME",
    "MININJA_REMOTE_GROK",
    "MININJA_REMOTE_ROOT",
    "MININJA_REMOTE_CWD",
    "MININJA_CLOUD_REMOTE_WRAP",
)


def path_for_docs() -> str:
    return str(HOST_CONFIG_PATH)


def defaults() -> dict[str, Any]:
    return dict(DEFAULTS)


def _empty_file() -> dict:
    return {"v": SCHEMA_V}


def _load_raw() -> dict:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not HOST_CONFIG_PATH.exists():
        return _empty_file()
    try:
        data = json.loads(HOST_CONFIG_PATH.read_text())
    except (OSError, json.JSONDecodeError):
        return _empty_file()
    if not isinstance(data, dict):
        return _empty_file()
    data.setdefault("v", SCHEMA_V)
    return data


def _save_raw(data: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    payload = dict(data)
    payload["v"] = SCHEMA_V
    # Drop unknown None; keep only known keys + v
    clean = {"v": SCHEMA_V}
    for key in DEFAULTS:
        if key in payload:
            clean[key] = payload[key]
    tmp = HOST_CONFIG_PATH.with_suffix(".tmp")
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
    try:
        os.write(fd, (json.dumps(clean, indent=2) + "\n").encode())
    finally:
        os.close(fd)
    tmp.replace(HOST_CONFIG_PATH)


def merged() -> dict[str, Any]:
    """Defaults overlaid with file values (known keys only)."""
    with LOCK:
        raw = _load_raw()
        out = defaults()
        for key in DEFAULTS:
            if key in raw:
                out[key] = raw[key]
        # Re-clamp / coerce so a hand-edited file cannot break the server.
        out["maxParallel"] = _clamp_parallel(out.get("maxParallel"))
        mode = out.get("defaultMode")
        if mode not in MODES:
            out["defaultMode"] = DEFAULTS["defaultMode"]
        for bkey in ("showPlants", "showSticky", "reducedMotion"):
            out[bkey] = bool(out.get(bkey))
        return out


def get(key: str) -> Any:
    key = (key or "").strip()
    if key not in DEFAULTS:
        raise KeyError(f"unknown key: {key}")
    return merged()[key]


def set_value(key: str, value: Any) -> Any:
    key = (key or "").strip()
    if key not in DEFAULTS:
        raise KeyError(f"unknown key: {key}")
    coerced = coerce(key, value)
    with LOCK:
        raw = _load_raw()
        raw[key] = coerced
        _save_raw(raw)
    return coerced


def unset(key: str) -> None:
    key = (key or "").strip()
    if key not in DEFAULTS:
        raise KeyError(f"unknown key: {key}")
    with LOCK:
        raw = _load_raw()
        if key in raw:
            del raw[key]
            _save_raw(raw)


def reset_all() -> dict[str, Any]:
    """Wipe file → all defaults."""
    with LOCK:
        _save_raw(_empty_file())
    return merged()


def _clamp_parallel(value: Any) -> int:
    try:
        n = int(value)
    except (TypeError, ValueError):
        n = int(DEFAULTS["maxParallel"])
    return max(1, min(16, n))


def coerce(key: str, value: Any) -> Any:
    if key == "defaultMode":
        s = str(value).strip().lower()
        if s not in MODES:
            raise ValueError(f"defaultMode must be one of {', '.join(MODES)}")
        return s
    if key == "maxParallel":
        return _clamp_parallel(value)
    if key in ("showPlants", "showSticky", "reducedMotion"):
        if isinstance(value, bool):
            return value
        s = str(value).strip().lower()
        if s in ("1", "true", "yes", "on"):
            return True
        if s in ("0", "false", "no", "off"):
            return False
        raise ValueError(f"{key} must be true or false")
    raise ValueError(f"cannot set {key}")


def get_max_parallel() -> int:
    return int(merged()["maxParallel"])


def get_default_mode() -> str:
    mode = merged()["defaultMode"]
    return mode if mode in MODES else "auto"


def list_rows() -> list[dict[str, Any]]:
    """Human/table friendly rows."""
    cfg = merged()
    rows = []
    for key, default in DEFAULTS.items():
        rows.append(
            {
                "aspect": ASPECT.get(key, ""),
                "key": key,
                "value": cfg[key],
                "default": default,
            }
        )
    return rows


def public_payload(*, listen: str | None = None) -> dict[str, Any]:
    """Safe JSON for GET /api/host-config (no secrets)."""
    cfg = merged()
    out: dict[str, Any] = {
        "v": SCHEMA_V,
        "path": path_for_docs(),
        "config": cfg,
        "maxParallel": cfg["maxParallel"],
        "defaultMode": cfg["defaultMode"],
    }
    if listen:
        out["botListen"] = listen
    return out


def cloud_status() -> list[dict[str, Any]]:
    """Env presence for remote — hostnames OK for CLOUD_HOST."""
    rows = []
    for name in CLOUD_ENV:
        raw = os.environ.get(name, "")
        set_ = bool(str(raw).strip())
        row: dict[str, Any] = {"env": name, "set": set_}
        if name == "MININJA_CLOUD_HOST" and set_:
            row["host"] = str(raw).strip()
        rows.append(row)
    return rows


def known_keys() -> list[str]:
    return list(DEFAULTS.keys())
