#!/usr/bin/env python3
"""Unit smoke: credential assign / share / change / unshare (no real secrets)."""
from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))


def main() -> int:
    tmp = tempfile.mkdtemp(prefix="mininja-cred-")
    os.environ["MININJA_DATA"] = tmp
    # Re-import paths/credentials after override
    import importlib
    import console.paths as paths
    importlib.reload(paths)
    import console.credentials as creds
    importlib.reload(creds)

    assert paths.CREDENTIALS_PATH.parent == Path(tmp)

    # create env slot
    slot, err = creds.create_slot({"label": "shared-xai", "kind": "env", "provider": "xai", "env": "XAI_API_KEY"})
    assert err is None, err
    assert slot["id"] and slot["kind"] == "env" and slot["has_secret"] is False
    assert "secret" not in slot

    # create anthropic slot
    claude, err = creds.create_slot({"label": "claude", "kind": "env", "provider": "anthropic"})
    assert err is None, err
    assert claude["env"] == "ANTHROPIC_API_KEY"
    assert claude["provider"] == "anthropic"

    # reject duplicate label
    _, err = creds.create_slot({"label": "claude", "kind": "env", "provider": "anthropic"})
    assert err and "already" in err

    # local slot with fake secret (fixture only — not a real key)
    local, err = creds.create_slot({
        "label": "pasted",
        "kind": "local",
        "provider": "other",
        "secret": "test-fixture-not-a-real-key",
    })
    assert err is None, err
    assert local["has_secret"] is True
    pub = creds.get_slot(local["id"])
    assert pub and "secret" not in pub and pub["has_secret"] is True

    # assign / share: two pals → one slot
    bots = [
        {"id": "pal-a", "name": "Ada", "credential_id": slot["id"]},
        {"id": "pal-b", "name": "Bob", "credential_id": slot["id"]},
    ]
    listed = creds.list_slots(bots)
    shared = next(s for s in listed if s["id"] == slot["id"])
    assert shared["share_count"] == 2
    assert set(shared["bound_pal_ids"]) == {"pal-a", "pal-b"}

    # change binding
    bots[0]["credential_id"] = claude["id"]
    listed = creds.list_slots(bots)
    assert next(s for s in listed if s["id"] == claude["id"])["share_count"] == 1
    assert next(s for s in listed if s["id"] == slot["id"])["share_count"] == 1

    # unshare
    bots[1]["credential_id"] = None
    listed = creds.list_slots(bots)
    assert next(s for s in listed if s["id"] == slot["id"])["share_count"] == 0

    # resolve unbound
    r = creds.resolve_for_pal({"id": "x", "name": "Zoe"})
    assert r["ok"] is False and r["unbound"] is True
    assert "no LLM credential" in (r["error"] or "")

    # resolve env unset
    r = creds.resolve_for_pal({"id": "pal-a", "name": "Ada", "credential_id": claude["id"]})
    assert r["ok"] is False
    assert "unset" in (r["error"] or "").lower() or "ANTHROPIC" in (r["error"] or "")

    # resolve env set
    os.environ["ANTHROPIC_API_KEY"] = "test-fixture-anthropic"
    r = creds.resolve_for_pal({"id": "pal-a", "name": "Ada", "credential_id": claude["id"]})
    assert r["ok"] is True
    assert "claude" in (r["using"] or "")
    assert r["inject"].get("ANTHROPIC_API_KEY") == "test-fixture-anthropic"
    # public resolve must not leak inject
    pub_r = creds.public_resolve({"id": "pal-a", "name": "Ada", "credential_id": claude["id"]})
    assert "inject" not in pub_r
    assert pub_r["ok"] is True

    # resolve local
    r = creds.resolve_for_pal({"id": "pal-c", "name": "Cara", "credential_id": local["id"]})
    assert r["ok"] is True and "local" in (r["using"] or "")
    assert "test-fixture-not-a-real-key" in r["inject"].values()

    # delete slot
    assert creds.delete_slot(local["id"]) is True
    assert creds.get_slot(local["id"]) is None

    # scrub
    dirty = {"id": "z", "secret": "nope", "api_key": "nope", "name": "Z"}
    clean = creds.scrub_public_bot(dirty)
    assert "secret" not in clean and "api_key" not in clean

    # file mode / path
    assert paths.CREDENTIALS_PATH.exists()
    raw = paths.CREDENTIALS_PATH.read_text()
    assert "test-fixture-anthropic" not in raw  # env value never persisted
    assert "test-fixture-not-a-real-key" not in raw  # deleted
    assert "ANTHROPIC_API_KEY" in raw  # env slot name ok

    print("PASS  credentials-smoke (assign/share/change/unshare/resolve)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
