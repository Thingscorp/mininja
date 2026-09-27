#!/usr/bin/env python3
"""Host config CLI — get/set/list/reset host settings (file SoT).

  mininja config              # list
  mininja config list
  mininja config get maxParallel
  mininja config set maxParallel 6
  mininja config unset maxParallel
  mininja config keys         # credential slot labels (no secrets)
  mininja config cloud        # MININJA_CLOUD_* env presence
  mininja config path
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from console import credentials as creds
from console import host_config as hc


def usage() -> None:
    sys.stderr.write(
        "usage: mininja config [list|get|set|unset|keys|cloud|path|reset] …\n"
        "       mininja config get <key>\n"
        "       mininja config set <key> <value>\n"
        "       mininja config unset <key>\n"
        "       mininja config [--json]\n"
    )


def _want_json(argv: list[str]) -> tuple[list[str], bool]:
    out: list[str] = []
    flag = False
    for a in argv:
        if a in ("--json", "-j"):
            flag = True
        else:
            out.append(a)
    return out, flag


def _print_table(rows: list[dict]) -> None:
    # aspect  key  value
    w_a = max((len(str(r.get("aspect") or "")) for r in rows), default=6)
    w_k = max((len(str(r.get("key") or "")) for r in rows), default=3)
    w_a = max(w_a, 6)
    w_k = max(w_k, 3)
    print(f"{'ASPECT'.ljust(w_a)}  {'KEY'.ljust(w_k)}  VALUE")
    for r in rows:
        print(f"{str(r['aspect']).ljust(w_a)}  {str(r['key']).ljust(w_k)}  {r['value']}")


def cmd_list(as_json: bool) -> int:
    rows = hc.list_rows()
    if as_json:
        json.dump(
            {"v": hc.SCHEMA_V, "path": hc.path_for_docs(), "config": hc.merged()},
            sys.stdout,
            indent=2,
        )
        sys.stdout.write("\n")
    else:
        _print_table(rows)
        print(f"path  {hc.path_for_docs()}")
    return 0


def cmd_get(key: str, as_json: bool) -> int:
    try:
        val = hc.get(key)
    except KeyError as exc:
        sys.stderr.write(f"config: {exc}\n")
        sys.stderr.write(f"known: {', '.join(hc.known_keys())}\n")
        return 2
    if as_json:
        json.dump({"key": key, "value": val}, sys.stdout)
        sys.stdout.write("\n")
    else:
        print(val if not isinstance(val, bool) else ("true" if val else "false"))
    return 0


def cmd_set(key: str, raw: str, as_json: bool) -> int:
    try:
        val = hc.set_value(key, raw)
    except KeyError as exc:
        sys.stderr.write(f"config: {exc}\n")
        sys.stderr.write(f"known: {', '.join(hc.known_keys())}\n")
        return 2
    except ValueError as exc:
        sys.stderr.write(f"config: {exc}\n")
        return 2
    if as_json:
        json.dump({"key": key, "value": val}, sys.stdout)
        sys.stdout.write("\n")
    else:
        shown = val if not isinstance(val, bool) else ("true" if val else "false")
        print(f"{key}={shown}")
    return 0


def cmd_unset(key: str, as_json: bool) -> int:
    try:
        hc.unset(key)
        val = hc.get(key)
    except KeyError as exc:
        sys.stderr.write(f"config: {exc}\n")
        return 2
    if as_json:
        json.dump({"key": key, "value": val, "unset": True}, sys.stdout)
        sys.stdout.write("\n")
    else:
        shown = val if not isinstance(val, bool) else ("true" if val else "false")
        print(f"{key}={shown} (default)")
    return 0


def cmd_keys(as_json: bool) -> int:
    slots = creds.list_slots()
    rows = [
        {
            "id": s.get("id"),
            "label": s.get("label") or "",
            "kind": s.get("kind"),
            "provider": s.get("provider"),
            "env": s.get("env") or "",
            "has_secret": bool(s.get("has_secret")),
        }
        for s in slots
    ]
    if as_json:
        json.dump({"slots": rows, "path": creds.path_for_docs()}, sys.stdout, indent=2)
        sys.stdout.write("\n")
    else:
        if not rows:
            print("(no credential slots)")
            print(f"path  {creds.path_for_docs()}")
            return 0
        w_l = max(len(r["label"]) for r in rows)
        w_l = max(w_l, 5)
        print(f"{'LABEL'.ljust(w_l)}  KIND   PROVIDER   ENV  HAS_SECRET  ID")
        for r in rows:
            print(
                f"{r['label'].ljust(w_l)}  {(r['kind'] or ''):<5}  "
                f"{(r['provider'] or ''):<9}  {(r['env'] or ''):<16}  "
                f"{'yes' if r['has_secret'] else 'no':<10}  {(r['id'] or '')[:8]}…"
            )
        print(f"path  {creds.path_for_docs()}")
    return 0


def cmd_cloud(as_json: bool) -> int:
    rows = hc.cloud_status()
    if as_json:
        json.dump({"cloud": rows}, sys.stdout, indent=2)
        sys.stdout.write("\n")
    else:
        for r in rows:
            flag = "yes" if r["set"] else "no"
            extra = f"  {r['host']}" if r.get("host") else ""
            print(f"{r['env']:<28}  {flag}{extra}")
    return 0


def cmd_path() -> int:
    print(hc.path_for_docs())
    return 0


def cmd_reset(as_json: bool) -> int:
    cfg = hc.reset_all()
    if as_json:
        json.dump({"v": hc.SCHEMA_V, "config": cfg}, sys.stdout, indent=2)
        sys.stdout.write("\n")
    else:
        print("reset → defaults")
        _print_table(hc.list_rows())
    return 0


def main(argv: list[str]) -> int:
    argv, as_json = _want_json(argv)
    if argv in (["-h"], ["--help"]):
        usage()
        return 0
    if not argv or argv[0] in ("list", "ls"):
        return cmd_list(as_json)
    cmd = argv[0]
    rest = argv[1:]
    if cmd == "get":
        if len(rest) != 1:
            usage()
            return 2
        return cmd_get(rest[0], as_json)
    if cmd == "set":
        if len(rest) < 2:
            usage()
            return 2
        return cmd_set(rest[0], " ".join(rest[1:]), as_json)
    if cmd == "unset":
        if len(rest) != 1:
            usage()
            return 2
        return cmd_unset(rest[0], as_json)
    if cmd == "keys":
        return cmd_keys(as_json)
    if cmd == "cloud":
        return cmd_cloud(as_json)
    if cmd == "path":
        return cmd_path()
    if cmd == "reset":
        return cmd_reset(as_json)
    # Bare key → get (unix-y shortcut)
    if cmd in hc.known_keys() and not rest:
        return cmd_get(cmd, as_json)
    usage()
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
