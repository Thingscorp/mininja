#!/usr/bin/env python3
"""Silent filter: teammate name in, #rrggbb out."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from console.tint import tint


def main(argv: list[str]) -> int:
    if argv in (["-h"], ["--help"]):
        sys.stderr.write("usage: mininja tint <name>\n")
        return 0
    if not argv:
        sys.stderr.write("usage: mininja tint <name>\n")
        return 2
    sys.stdout.write(tint(" ".join(argv)) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
