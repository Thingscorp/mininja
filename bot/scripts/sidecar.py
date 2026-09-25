#!/usr/bin/env python3
"""Print the unix-compound sidecar from items.json. One job."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ITEMS = ROOT / ".mininja" / "items.json"

MARK = {
    True: "OK",
    False: "..",
}


def bar(done: int, total: int, width: int = 10) -> str:
    if total <= 0:
        return "░" * width
    n = round(done / total * width)
    return "█" * n + "░" * (width - n)


def main() -> int:
    data = json.loads(ITEMS.read_text())
    items = data.get("items") or []
    rows = []
    active = None
    locked = 0
    blocked = 0
    pending = 0
    for item in items:
        if item.get("blocked"):
            status = "--"
            blocked += 1
        elif item.get("passes"):
            status = "OK"
            locked += 1
        else:
            status = ".."
            pending += 1
            if active is None:
                active = item
                status = ">>"
        name = item["id"]
        if status == ">>":
            name = f"**{name}**"
        rows.append((status, name, item.get("description") or "", item.get("category") or ""))
    goal_items = [i for i in items if not i.get("blocked")]
    done = sum(1 for i in goal_items if i.get("passes"))
    total = len(goal_items)
    pct = round(done / total * 100) if total else 0
    coverage = bar(done, total)
    lines = [
        "### unix-compound · sidecar",
        f"**Phase** {'next' if pending else 'terminate'} | **Coverage** {coverage} {pct}% | **Depth** 1",
        f"**Active** → `{active['id'] if active else '—'}`",
        "",
        "| S | Module | Purpose | Interface |",
        "|---|--------|---------|-----------|",
    ]
    shown = rows
    if len(rows) > 8:
        ok_rows = [r for r in rows if r[0] == "OK"]
        rest = [r for r in rows if r[0] != "OK"]
        shown = ok_rows[-3:] + rest
        hidden = len(ok_rows) - min(3, len(ok_rows))
        if hidden > 0:
            lines.append(f"| OK | _{hidden} locked_ | prior modules | — |")
    for status, name, desc, cat in shown:
        extra = " <- ACTIVE" if status == ">>" else ""
        lines.append(f"| {status} | {name} | {desc} | {cat} |{extra}")
    decision = "terminate" if pending == 0 else "continue"
    residuals = ", ".join(i["id"] for i in items if i.get("blocked")) or "none"
    lines += [
        "",
        f"**Focus** {active['description'] if active else 'goal locked'}",
        f"**Goal Progress** {done}/{total}",
        f"**Decision** {decision}",
        f"**Residuals** {residuals}",
        "",
    ]
    sys.stdout.write("\n".join(lines))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
