"""Load and save console.json. One job: durable console state."""
from __future__ import annotations

import fcntl
import json
import os
from contextlib import contextmanager
from datetime import datetime, timezone

from console.engine import empty_state, run as engine_run
from console.paths import CONSOLE_PATH, DATA_DIR, LOCK_PATH

LOG_CAP = 400


class ConsoleCorrupt(RuntimeError):
    pass


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@contextmanager
def locked():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    fd = os.open(LOCK_PATH, os.O_CREAT | os.O_RDWR, 0o600)
    try:
        fcntl.flock(fd, fcntl.LOCK_EX)
        yield
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)


def load() -> dict:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not CONSOLE_PATH.exists():
        return empty_state()
    raw = CONSOLE_PATH.read_text()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ConsoleCorrupt(f"{CONSOLE_PATH} is not JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise ConsoleCorrupt(f"{CONSOLE_PATH} is not an object")
    state = empty_state()
    state.update(data)
    return state


def save(state: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp = CONSOLE_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, indent=2) + "\n")
    tmp.replace(CONSOLE_PATH)


def apply(text: str) -> dict:
    """Run one program against durable state. Returns the card."""
    with locked():
        state = load()
        card, state = engine_run(state, text)
        if card.get("title") == "__clear__":
            state["log"] = []
        else:
            log = state.setdefault("log", [])
            log.append({"kind": "cmd", "text": text, "ts": now_iso()})
            log.append({"kind": "card", "card": card, "ts": now_iso()})
            state["log"] = log[-LOG_CAP:]
        save(state)
        return card


def public() -> dict:
    with locked():
        state = load()
        return {
            "refine": bool(state.get("refine")),
            "offline": bool(state.get("offline")),
            "log": state.get("log") or [],
        }
