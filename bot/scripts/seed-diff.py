#!/usr/bin/env python3
"""Diff two seed snapshots. Stdout is the text diff. Pure filter."""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path


def usage() -> None:
    sys.stderr.write("usage: seed-diff.py [olddir] newdir\n")


def files_of(folder: Path) -> dict[str, str]:
    out = {}
    if not folder or not folder.exists():
        return out
    for path in sorted(folder.iterdir()):
        if not path.is_file() or path.name.startswith("."):
            continue
        if path.name == "manifest.json":
            continue
        out[path.name] = hashlib.sha256(path.read_bytes()).hexdigest()
    return out


def manifest_stamp(folder: Path) -> str:
    man = folder / "manifest.json" if folder else None
    if man and man.is_file():
        try:
            data = json.loads(man.read_text())
            return str(data.get("stamp") or folder.name)
        except json.JSONDecodeError:
            return folder.name
    return folder.name if folder else "(none)"


def diff_maps(old: dict[str, str], new: dict[str, str]) -> dict[str, list[str]]:
    old_keys = set(old)
    new_keys = set(new)
    return {
        "added": sorted(new_keys - old_keys),
        "removed": sorted(old_keys - new_keys),
        "changed": sorted(k for k in sorted(old_keys & new_keys) if old[k] != new[k]),
        "unchanged": sorted(k for k in sorted(old_keys & new_keys) if old[k] == new[k]),
    }


def render(old_dir: Path | None, new_dir: Path) -> str:
    old_map = files_of(old_dir) if old_dir else {}
    new_map = files_of(new_dir)
    parts = diff_maps(old_map, new_map)
    lines = [
        "# official seed",
        f"from: {manifest_stamp(old_dir) if old_dir else '(none)'}",
        f"to:   {manifest_stamp(new_dir)}",
        f"files: {len(new_map)}",
        f"added: {len(parts['added'])}",
        f"removed: {len(parts['removed'])}",
        f"changed: {len(parts['changed'])}",
        f"unchanged: {len(parts['unchanged'])}",
    ]
    for label in ("added", "removed", "changed"):
        if parts[label]:
            lines.append(label + ":")
            for name in parts[label]:
                lines.append(f"  {name}")
    lines.append("")
    return "\n".join(lines)


def main(argv: list[str]) -> int:
    if argv in (["-h"], ["--help"]) or not argv:
        usage()
        return 0 if argv else 2
    if len(argv) == 1:
        old_dir = None
        new_dir = Path(argv[0])
    elif len(argv) == 2:
        old_dir = Path(argv[0]) if argv[0] not in ("", "-", "none") else None
        new_dir = Path(argv[1])
    else:
        usage()
        return 2
    if not new_dir.is_dir():
        sys.stderr.write(f"seed-diff: missing {new_dir}\n")
        return 1
    if old_dir is not None and not old_dir.is_dir():
        sys.stderr.write(f"seed-diff: missing {old_dir}\n")
        return 1
    sys.stdout.write(render(old_dir, new_dir))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
