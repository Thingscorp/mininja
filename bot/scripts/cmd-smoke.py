#!/usr/bin/env python3
"""Run every console program as a silent JSON card. One job."""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from console.engine import ALIASES, SHELL


def programs() -> list[str]:
    seen = []
    for name in list(SHELL) + list(ALIASES):
        if name not in seen:
            seen.append(name)
    return seen


def run_one(mininja: Path, name: str, base: Path) -> tuple[str, str]:
    data = base / f"smoke-{name}"
    data.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    env["MININJA_DATA"] = str(data)
    proc = subprocess.run(
        [str(mininja), "cmd", name],
        cwd=str(ROOT),
        env=env,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        return name, f"exit {proc.returncode} stderr={proc.stderr.strip()!r}"
    if proc.stderr:
        return name, f"stderr not silent: {proc.stderr.strip()!r}"
    if proc.stdout.count("\n") != 1 or not proc.stdout.endswith("\n"):
        return name, "stdout must be one JSON line"
    try:
        card = json.loads(proc.stdout)
    except json.JSONDecodeError as exc:
        return name, f"json: {exc}"
    if not isinstance(card, dict) or not card.get("title"):
        return name, f"missing title: {card!r}"
    return name, ""


def main() -> int:
    mininja = ROOT / "mininja"
    raw = os.environ.get("MININJA_DATA", "").strip()
    if raw:
        base = Path(raw).expanduser()
    else:
        import tempfile

        base = Path(tempfile.mkdtemp(prefix="mininja-smoke-"))
    fail = 0
    for name in programs():
        _, err = run_one(mininja, name, base)
        if err:
            sys.stderr.write(f"XX  {name}: {err}\n")
            fail += 1
        else:
            sys.stdout.write(f"OK  {name}\n")
    if fail:
        sys.stderr.write(f"cmd-smoke: {fail} program(s) failed\n")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
