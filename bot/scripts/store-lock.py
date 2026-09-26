#!/usr/bin/env python3
"""Prove parallel cmd writers serialize. One job: log length == 2N."""
from __future__ import annotations

import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main() -> int:
    n = int(os.environ.get("STORE_LOCK_N") or "12")
    data = os.environ.get("MININJA_DATA", "").strip()
    if not data:
        sys.stderr.write("store-lock: MININJA_DATA required\n")
        return 2
    mininja = str(ROOT / "mininja")
    env = os.environ.copy()

    def one(_: int) -> subprocess.CompletedProcess:
        return subprocess.run(
            [mininja, "cmd", "now"],
            cwd=str(ROOT),
            env=env,
            capture_output=True,
            text=True,
        )

    with ThreadPoolExecutor(max_workers=min(8, n)) as pool:
        rows = list(pool.map(one, range(n)))
    bad = [r for r in rows if r.returncode != 0 or r.stderr or not r.stdout.endswith("\n")]
    if bad:
        sys.stderr.write(f"store-lock: {len(bad)} writer(s) failed\n")
        sys.stderr.write(bad[0].stderr or bad[0].stdout)
        return 1
    path = Path(data) / "console.json"
    try:
        state = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError) as exc:
        sys.stderr.write(f"store-lock: {exc}\n")
        return 1
    log = state.get("log") or []
    want = n * 2
    if len(log) != want:
        sys.stderr.write(f"store-lock: log {len(log)} != {want}\n")
        return 1
    sys.stdout.write(f"OK  {n} writers, log {len(log)}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
