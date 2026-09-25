#!/usr/bin/env python3
"""Silent JSON filter over console programs. One card on stdout."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from console.engine import is_command
from console.store import ConsoleCorrupt, apply


def usage() -> None:
    sys.stderr.write("usage: mininja cmd <program> [args]\n")


def main(argv: list[str]) -> int:
    if argv in (["-h"], ["--help"]):
        usage()
        return 0
    if not argv:
        usage()
        return 2
    if argv[0] == "-":
        text = sys.stdin.read().strip()
    else:
        text = " ".join(argv).strip()
    if not text:
        sys.stderr.write("cmd: empty program\n")
        return 2
    try:
        card = apply(text)
    except ConsoleCorrupt as exc:
        sys.stderr.write(f"cmd: {exc}\n")
        return 1
    json.dump(card, sys.stdout, ensure_ascii=False, separators=(",", ":"))
    sys.stdout.write("\n")
    if not is_command(text):
        sys.stderr.write("cmd: unknown program\n")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
