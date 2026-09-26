"""Mininja console programs — card commands plus durable teammate bots.

A program is a named command that returns a card. Last stream text is the
next program's input.
"""
from __future__ import annotations

import json
import re
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parent

LEDGER = {
    "checkout": "~/mininja",
    "published": "v0.10.3",
    "candidate": "v0.10.4",
    "sealed": "2026-08-12",
    "captures": 69,
}

SERVICES = [
    {
        "id": "api",
        "name": "mininja-api",
        "label": "The brain",
        "bind": "127.0.0.1:8000",
        "job": "The program that talks, remembers, and hands work to everything else.",
        "next": "If the machine feels stuck, start here.",
    },
    {
        "id": "web",
        "name": "mininja-web",
        "label": "Review desk",
        "bind": "127.0.0.1:3200",
        "job": "The screen a person uses to accept or reject saved work.",
        "next": "Open this when you need to approve something.",
    },
    {
        "id": "postgres",
        "name": "mininja-postgres",
        "label": "Memory",
        "bind": "127.0.0.1:5432",
        "job": f"{LEDGER['captures']} conversations live here.",
        "next": "Look here if chat forgets things.",
    },
]

BLOCKERS = [
    {
        "id": "reviews",
        "title": "Finish leftover reviews",
        "why": "A review is a yes or no on saved work. You finish the queue before anyone reads the next release.",
        "days": 2,
        "needs": [],
    },
    {
        "id": "read104",
        "title": "Get a second reader on the next release",
        "why": "The next release stays unpublished until a second person reads it. That step starts after leftover reviews end.",
        "days": 1,
        "needs": ["reviews"],
    },
    {
        "id": "publish",
        "title": "Publish the next release",
        "why": "You publish after the second read is done.",
        "days": 1,
        "needs": ["read104"],
    },
    {
        "id": "board",
        "title": "Decide the old board files",
        "why": "The old board is off. You keep or delete the files. No other job waits on this decision.",
        "days": 1,
        "needs": [],
    },
]

FROZEN_TURN = [
    {"id": "helper", "fitness": 0.41, "prompt": "You are a helper."},
    {"id": "spec", "fitness": 0.78, "prompt": "Answer in one block. Name the check you will pass."},
    {"id": "gate", "fitness": 0.91, "prompt": "Lock the test before you answer. Refuse a winner if nothing passed."},
]

PGEON_SEED = {
    "questions": [
        {
            "id": "add",
            "prompt": "add two numbers",
            "criterion": "solution(2, 3) === 5 && solution(0, 0) === 0",
            "closed": True,
        }
    ],
    "answers": [
        {"id": "a1", "question_id": "add", "author": "anon", "passed": True, "votes": 1},
        {"id": "a2", "question_id": "add", "author": "charlie", "passed": True, "votes": 3},
        {"id": "a3", "question_id": "add", "author": "bravo", "passed": False, "votes": 5},
    ],
}

COMPOUND_SEED = {
    "phase": "next",
    "depth": 2,
    "focus": "brief compiles the session. persist-stream still waits on a store.",
    "decision": "terminate",
    "residuals": "persist-stream is blocked. brief is session-only.",
    "instruction": "Owner: persist-stream, or stop.",
    "criteria": [
        {"id": "1", "text": "Sidecar shows phase, coverage, status, and decision.", "done": True},
        {"id": "2", "text": "Each program does one job.", "done": True},
        {"id": "3", "text": "Pickable lines are commands.", "done": True},
        {"id": "4", "text": "turn exists as a named pending module.", "done": True},
        {"id": "5", "text": "When refine is on, turn produces one fitness pick.", "done": True},
    ],
    "modules": [
        {"id": "shell", "purpose": "route a line to a card", "iface": "cmd → card", "status": "OK"},
        {"id": "pgeon", "purpose": "gate answers", "iface": "pgeon", "status": "OK"},
        {"id": "refine", "purpose": "toggle prompt turns", "iface": "refine", "status": "OK"},
        {"id": "hero", "purpose": "hold him and the guest", "iface": "face + bird", "status": "OK"},
        {"id": "compound", "purpose": "sidecar the run", "iface": "compound", "status": "OK"},
        {"id": "qa", "purpose": "read the register", "iface": "qa", "status": "OK"},
        {"id": "turn", "purpose": "one fitness pick", "iface": "turn", "status": "OK"},
        {"id": "save", "purpose": "keep the last stream", "iface": "save", "status": "OK"},
        {"id": "ralph", "purpose": "outer gate for ongoing work", "iface": "ralph", "status": "OK"},
        {"id": "brief", "purpose": "compile fact source loop", "iface": "brief", "status": "OK"},
        {"id": "bots", "purpose": "named teammates on a computer", "iface": "task", "status": "OK"},
    ],
}

FROM_FACE = {
    "allowed": "best",
    "sandbox": "flap",
    "denied": "sulk",
    "error": "startle",
    "cancelled": "sulk",
    "warning": "peck",
    "completed": "perch",
}

COMMANDS = [
    "now",
    "todo",
    "plan",
    "brief",
    "look",
    "api",
    "pgeon",
    "refine",
    "turn",
    "save",
    "compound",
    "qa",
    "ralph",
    "offline",
    "wake",
    "clear",
    "help",
]
SHELL = COMMANDS + ["overview", "gantt", "reviews", "read104", "publish", "board", "web", "postgres"]
ALIASES = {
    "sleep": "offline",
    "online": "wake",
    "reconnect": "wake",
}


def _load_json(name: str):
    return json.loads((ROOT / name).read_text())


_ralph_path = ROOT / "ralph-items.json"
RALPH_ITEMS = (
    json.loads(_ralph_path.read_text()).get("items") or []
    if _ralph_path.is_file()
    else []
)
QA_FEATURES = _load_json("qa-features.json")
QA_DEFECTS = _load_json("qa-defects.json")


def empty_state() -> dict:
    return {
        "refine": False,
        "stream": "",
        "kept": [],
        "kept_n": 0,
        "pgeon": deepcopy(PGEON_SEED),
        "compound": deepcopy(COMPOUND_SEED),
        "offline": False,
        "log": [],
    }


def schedule(items: list | None = None) -> list:
    items = items or BLOCKERS
    by_id = {b["id"]: b for b in items}
    start: dict[str, int] = {}

    def earliest(bid: str, stack: set[str] | None = None) -> int:
        stack = stack or set()
        if bid in start:
            return start[bid]
        if bid in stack:
            for x in stack:
                start[x] = 0
            return 0
        stack.add(bid)
        b = by_id.get(bid)
        if not b:
            return 0
        s = 0
        for n in b["needs"]:
            if n in stack:
                continue
            dep = by_id.get(n)
            if not dep:
                continue
            s = max(s, earliest(n, stack) + dep["days"])
        prev = start.get(bid)
        start[bid] = s if prev is None else min(prev, s)
        return start[bid]

    laid = []
    for b in items:
        s = earliest(b["id"])
        laid.append(
            {
                **b,
                "start": s,
                "end": s + b["days"],
                "ready": len(b["needs"]) == 0,
                "critical": False,
                "waitingOn": [by_id[n]["title"] if n in by_id else n for n in b["needs"]],
            }
        )
    finish = max((r["end"] for r in laid), default=0)
    on_path: set[str] = set()

    def walk(bid: str) -> None:
        if bid in on_path:
            return
        on_path.add(bid)
        cur = next((x for x in laid if x["id"] == bid), None)
        if not cur:
            return
        for x in laid:
            if x["id"] in cur["needs"] and x["end"] == cur["start"]:
                walk(x["id"])

    for r in laid:
        if r["end"] == finish:
            walk(r["id"])
    for r in laid:
        r["critical"] = r["id"] in on_path
    laid.sort(key=lambda r: (r["start"], r["end"]))
    return laid


def find_blocker(q: str):
    s = q.lower().strip()
    if not s:
        return None
    rows = schedule()
    exact = next((b for b in rows if b["id"] == s), None)
    if exact:
        return exact
    if len(s) < 4:
        return None
    return next((b for b in rows if s in b["title"].lower()), None)


def find_service(q: str):
    s = q.lower().strip()
    if not s:
        return None
    return next(
        (
            x
            for x in SERVICES
            if x["id"] == s or x["name"].replace("mininja-", "") == s or x["label"].lower() == s
        ),
        None,
    )


def _write_stream(state: dict, text: str) -> None:
    t = (text or "").strip()
    if t:
        state["stream"] = t


def _score(prompt: str) -> float:
    n = 0.28
    if re.search(r"lock|refuse|fail closed", prompt, re.I):
        n += 0.34
    if re.search(r"test|check|pass", prompt, re.I):
        n += 0.22
    if 24 < len(prompt) < 180:
        n += 0.1
    if re.search(r"one (line|block)", prompt, re.I):
        n += 0.08
    return min(0.99, round(n, 2))


def _ranked_turn(seed: str | None) -> list:
    if not (seed or "").strip():
        return sorted(FROZEN_TURN, key=lambda c: -c["fitness"])
    base = re.sub(r"\s+", " ", seed).strip()
    spec = f"{base} State the check in one line." if re.search(r"check|test", base, re.I) else f"Name the check you will pass. {base}"
    shut = f"{base} Fail closed." if re.search(r"lock|refuse", base, re.I) else f"Lock the test before you answer. {base}"
    rows = [
        {"id": "seed", "prompt": base, "fitness": _score(base)},
        {"id": "spec", "prompt": spec, "fitness": _score(spec)},
        {"id": "shut", "prompt": shut, "fitness": _score(shut)},
    ]
    rows.sort(key=lambda c: -c["fitness"])
    return rows


def _feat(row: dict) -> dict:
    return {
        "id": row.get("Feature ID"),
        "name": row.get("Feature Name"),
        "story": row.get("User Story"),
        "tests": row.get("Test Cases"),
        "status": row.get("Current Status"),
        "defects": int(row.get("Defect Count") or 0),
        "severity": row.get("Severity"),
    }


def _def(row: dict) -> dict:
    return {
        "id": row.get("Defect ID"),
        "feature": row.get("Feature ID"),
        "status": row.get("Status"),
        "severity": row.get("Severity"),
        "steps": row.get("Reproduction steps"),
    }


FEATS = [_feat(r) for r in QA_FEATURES]
DEFS = [_def(r) for r in QA_DEFECTS]


def _bird(card: dict) -> dict:
    face = card.get("face")
    if face:
        card["bird"] = FROM_FACE.get(face, "perch")
    return card


def _pgeon_ranked(store: dict, qid: str) -> list:
    rows = [a for a in store["answers"] if a["question_id"] == qid]
    rows.sort(key=lambda a: (0 if a["passed"] else 1, -a["votes"]))
    return rows


def _pgeon_best(store: dict, qid: str):
    passed = [a for a in _pgeon_ranked(store, qid) if a["passed"]]
    return passed[0] if passed else None


def _pgeon_best_card(state: dict, qid: str) -> dict:
    store = state["pgeon"]
    q = next((x for x in store["questions"] if x["id"] == qid), None)
    if not q:
        return {"title": "pgeon", "bottom": f"no question {qid}", "face": "error"}
    ranked = _pgeon_ranked(store, qid)
    best = _pgeon_best(store, qid)
    if not best:
        return {
            "title": q["id"],
            "tag": "none",
            "fields": [{"label": "test", "value": q["criterion"]}],
            "bottom": "no best",
            "face": "denied",
        }
    return {
        "title": q["id"],
        "tag": "verified",
        "fields": [
            {
                "label": "best" if a["id"] == best["id"] else a["author"],
                "value": (
                    f"pass  {a['votes']}" + (f"  {a['author']}" if a["id"] == best["id"] else "")
                    if a["passed"]
                    else f"fail  {a['votes']}  gated"
                ),
            }
            for a in ranked
        ],
        "rows": [f"pgeon vote {a['author']}" for a in ranked if a["id"] != best["id"]],
        "bottom": "Votes cannot mint best.",
        "face": "allowed",
    }


def is_command(raw: str) -> bool:
    head = (raw or "").strip().split()[0].lower().lstrip("/") if (raw or "").strip() else ""
    head = re.sub(r"[^a-z0-9]", "", head)
    if head in COMMANDS or head in ALIASES or find_service(head) or find_blocker(head):
        return True
    if head in ("look", "overview", "gantt"):
        return True
    return False


def run(state: dict, raw: str) -> tuple[dict, dict]:
    """Return (card, next_state)."""
    text = (raw or "").strip()
    if not text:
        return {"title": "Unknown command", "bottom": "Use help.", "face": "error"}, state

    if text.lower() in ("offline", "sleep"):
        state["offline"] = True
        return {"title": "Offline", "tag": "sleeping", "bottom": "Type wake to return.", "face": "offline"}, state
    if text.lower() in ("wake", "online", "reconnect"):
        state["offline"] = False
        return {"title": "Online", "bottom": "Watching again.", "face": "completed"}, state
    if state.get("offline"):
        return {"title": "Offline", "bottom": "Type wake to try again.", "face": "offline"}, state
    if text.lower() == "clear":
        state["log"] = []
        return {"title": "__clear__", "face": "idle"}, state

    parts = text.strip().split()
    head = parts[0].lower().lstrip("/")
    argv = parts[1:]
    cmd = re.sub(r"[^a-z0-9]", "", head)
    arg = " ".join(argv)

    card: dict | None = None
    if cmd == "help":
        card = {"title": "help", "rows": COMMANDS[:]}
    elif cmd in ("now", "overview"):
        card = {
            "title": "now",
            "fields": [
                {"label": "live", "value": LEDGER["published"]},
                {"label": "next", "value": f"{LEDGER['candidate']} unpublished"},
                {"label": "saved", "value": str(LEDGER["captures"])},
            ],
            "face": "completed",
        }
    elif cmd in ("plan", "gantt"):
        card = {"title": "plan", "gantt": schedule(), "face": "executing"}
    elif cmd == "todo":
        card = {"title": "todo", "rows": [r["title"] for r in schedule()], "face": "executing"}
    elif cmd == "brief":
        card = _brief(state)
    elif cmd == "refine":
        card = _refine(state, argv)
    elif cmd == "turn":
        card = _turn(state)
    elif cmd == "save":
        card = _save(state, argv)
    elif cmd == "compound":
        card = _compound(state, argv)
    elif cmd == "qa":
        card = _qa(argv)
    elif cmd == "ralph":
        card = _ralph(argv)
    elif cmd == "pgeon":
        card = _pgeon(state, argv)
    elif cmd == "look" or find_service(cmd) or find_service(arg):
        svc = find_service(arg or cmd) or SERVICES[0]
        card = {
            "title": svc["label"],
            "tag": svc["bind"],
            "bottom": svc["job"],
            "rows": [svc["next"]],
            "face": "executing",
        }
    else:
        named = find_blocker(arg or cmd)
        if named and (find_blocker(cmd) or (arg and find_blocker(arg))):
            card = {
                "title": named["title"],
                "tag": "ready" if named["ready"] else f"after {', '.join(named['waitingOn'])}",
                "bottom": named["why"],
                "rows": [
                    f"{named['days']} day" + ("" if named["days"] == 1 else "s"),
                    f"starts on day {named['start'] + 1}",
                ],
                "face": "completed" if named["ready"] else "warning",
            }
    if card is None:
        card = {"title": "Unknown command", "bottom": "Use help.", "face": "error"}
    if card.get("stream"):
        _write_stream(state, card["stream"])
    if cmd == "pgeon":
        _bird(card)
    return card, state


def _brief(state: dict) -> dict:
    lines = [
        {"kind": "fact", "text": f"{LEDGER['published']} is live"},
        {"kind": "fact", "text": f"{LEDGER['candidate']} is unpublished"},
        {"kind": "fact", "text": f"{LEDGER['captures']} saved"},
    ]
    kept = state.get("kept") or []
    if kept:
        for k in kept:
            lines.append({"kind": "source", "text": f"{k['id']}  {k['text']}"})
    else:
        lines.append({"kind": "source", "text": "none"})
    loose = state.get("stream") or ""
    if loose and not any(k["text"] == loose for k in kept):
        lines.append({"kind": "source", "text": f"peek  {loose}"})
    for job in schedule():
        lines.append(
            {
                "kind": "loop",
                "text": job["title"] if job["ready"] else f"{job['title']}  after {', '.join(job['waitingOn'])}",
            }
        )
    for item in RALPH_ITEMS:
        if item.get("passes"):
            continue
        lines.append(
            {
                "kind": "loop",
                "text": f"{item['id']}  hold" if item.get("blocked") else f"{item['id']}  wait",
            }
        )
    md = "\n".join(
        f"**{'open loop' if l['kind']=='loop' else l['kind']}** {l['text']}" for l in lines
    )
    return {
        "title": "brief",
        "tag": f"{sum(1 for l in lines if l['kind']=='fact')}f",
        "fields": [
            {"label": "loop" if l["kind"] == "loop" else l["kind"], "value": l["text"]} for l in lines
        ],
        "rows": ["save"],
        "bottom": "Source is not a fact. Capture does not promote.",
        "face": "completed",
        "stream": md,
    }


def _refine(state: dict, argv: list[str]) -> dict:
    verb = (argv[0] if argv else "").lower()
    if not verb:
        state["refine"] = not state.get("refine")
    elif verb == "on":
        state["refine"] = True
    elif verb == "off":
        state["refine"] = False
    elif verb == "reset":
        state["refine"] = False
    else:
        return {"title": "refine", "bottom": "on or off.", "face": "error"}
    on = bool(state.get("refine"))
    return {
        "title": "refine",
        "tag": "on" if on else "off",
        "bottom": "Type turn. Fitness is not verified." if on else "Prompt turns are off.",
        "face": "warning" if on else "cancelled",
    }


def _turn(state: dict) -> dict:
    if not state.get("refine"):
        return {
            "title": "turn",
            "tag": "off",
            "bottom": "refine is off.",
            "face": "denied",
            "ask": {"q": "Turn needs refine on.", "yes": "refine on"},
        }
    seed = state.get("stream") or ""
    ranked = _ranked_turn(seed)
    top = ranked[0]
    return {
        "title": "turn",
        "tag": "loop" if seed else "fitness",
        "fields": [
            {
                "label": "lead" if c["id"] == top["id"] else c["id"],
                "value": f"{c['fitness']:.2f}  {c['id']}  {c['prompt']}" if c["id"] == top["id"] else f"{c['fitness']:.2f}",
            }
            for c in ranked
        ],
        "rows": ["save"],
        "bottom": "Fitness is not verified. pgeon grades.",
        "face": "warning",
        "stream": top["prompt"],
    }


def _save(state: dict, argv: list[str]) -> dict:
    verb = (argv[0] if argv else "").lower()
    if verb == "reset":
        state["stream"] = ""
        state["kept"] = []
        state["kept_n"] = 0
        return {"title": "save", "tag": "reset", "bottom": "stream cleared.", "face": "cancelled"}
    if verb == "list":
        items = state.get("kept") or []
        if not items:
            return {"title": "save", "bottom": "nothing saved.", "face": "denied"}
        return {
            "title": "save",
            "tag": str(len(items)),
            "fields": [{"label": k["id"], "value": k["text"]} for k in items],
            "rows": [f"pgeon ask {k['id']}" for k in items],
            "bottom": "Output is input.",
            "face": "completed",
        }
    if verb:
        item = next((k for k in state.get("kept") or [] if k["id"] == verb), None)
        if not item:
            return {"title": "save", "bottom": f"no {verb}", "face": "error"}
        return {
            "title": item["id"],
            "fields": [{"label": "text", "value": item["text"]}],
            "rows": [f"pgeon ask {item['id']}"],
            "face": "completed",
        }
    last = (state.get("stream") or "").strip()
    if not last:
        return {
            "title": "save",
            "tag": "empty",
            "bottom": "nothing on the stream. run turn first.",
            "face": "denied",
        }
    if any(k["text"] == last for k in state.get("kept") or []):
        return {"title": "save", "tag": "empty", "bottom": "already saved.", "face": "denied"}
    state["kept_n"] = int(state.get("kept_n") or 0) + 1
    item = {"id": f"s{state['kept_n']}", "text": last}
    state.setdefault("kept", []).append(item)
    return {
        "title": "save",
        "tag": item["id"],
        "fields": [{"label": "text", "value": item["text"]}],
        "rows": [f"pgeon ask {item['id']}", "save list"],
        "bottom": "Output is input.",
        "face": "completed",
    }


def _compound(state: dict, argv: list[str]) -> dict:
    verb = (argv[0] if argv else "").lower()
    if verb == "reset":
        state["compound"] = deepcopy(COMPOUND_SEED)
        return {"title": "compound", "tag": "reset", "bottom": "seed restored.", "face": "cancelled"}
    s = state["compound"]
    done = sum(1 for c in s["criteria"] if c["done"])
    total = len(s["criteria"])
    pct = round(done / total * 100) if total else 0
    n = round(pct / 10)
    bar = "█" * n + "░" * (10 - n)
    cur = next((m for m in s["modules"] if m["status"] in (">>", "..")), None)
    if not cur:
        cur = next((m for m in s["modules"] if m["status"] == "--"), None)
    locked = [m for m in s["modules"] if m["status"] == "OK"]
    tail = locked[-3:]
    fields = [
        {"label": "cover", "value": f"{bar}  {pct}%"},
        {"label": "goal", "value": f"{done}/{total}"},
        {"label": "build", "value": s["instruction"]},
    ]
    fields.extend({"label": m["status"], "value": f"{m['id']}  {m['purpose']}"} for m in tail)
    if cur:
        fields.append({"label": cur["status"], "value": f"{cur['id']}  {cur['purpose']}"})
    return {
        "title": "sidecar",
        "tag": f"{s['phase']}  {pct}%",
        "fields": fields,
        "bottom": s["focus"],
        "face": "completed" if s["decision"] == "terminate" else "executing",
    }


def _qa(argv: list[str]) -> dict:
    verb = (argv[0] if argv else "").lower()

    def open_defs():
        return [d for d in DEFS if d["status"] not in ("fixed", "waived")]

    def sidecar():
        tested = sum(1 for f in FEATS if f["status"] == "TESTED")
        retired = sum(1 for f in FEATS if f["status"] == "RETIRED")
        live = len(FEATS) - retired
        open_ = open_defs()
        high = [d for d in open_ if d["severity"] in ("high", "critical")]
        conf = max(0, min(100, round(tested / max(1, live) * 100 - len(high) * 15 - len(open_) * 5)))
        stop = tested == live and not high and not open_
        return {
            "title": "qa",
            "tag": f"{conf}%",
            "fields": [
                {"label": "live", "value": f"{tested}/{live}"},
                {"label": "open", "value": str(len(open_))},
            ],
            "rows": [f"qa {f['id']}" for f in FEATS if f["status"] != "RETIRED"],
            "bottom": "Register is current." if stop else "Open work remains.",
            "face": "completed" if stop else "warning",
        }

    if not verb or verb in ("help", "discover", "tests", "run", "next"):
        return sidecar()
    if verb == "defects":
        open_ = open_defs()
        return {
            "title": "defects",
            "tag": f"{len(open_)} open / {len(DEFS)}",
            "rows": [f"{d['id']}  {d['feature']}  {d['status']}  {d['severity']}" for d in DEFS],
            "bottom": "Open items still count." if open_ else "All closed or waived.",
            "face": "warning" if open_ else "completed",
        }
    fid = verb.upper() if re.match(r"^f\d+", verb, re.I) else verb
    f = next((x for x in FEATS if (x["id"] or "").lower() == fid.lower()), None)
    if not f:
        return {"title": "qa", "bottom": "qa, qa F01, or qa defects.", "face": "error"}
    return {
        "title": f["id"],
        "tag": f["status"],
        "fields": [
            {"label": "name", "value": f["name"] or ""},
            {"label": "tests", "value": str(f["tests"] or "")},
            {"label": "defects", "value": str(f["defects"])},
            {"label": "severity", "value": str(f["severity"] or "")},
        ],
        "bottom": f["story"] or "",
        "face": "completed",
    }


def _ralph(argv: list[str]) -> dict:
    verb = (argv[0] if argv else "").lower()
    passing = sum(1 for i in RALPH_ITEMS if i.get("passes"))
    blocked = sum(1 for i in RALPH_ITEMS if i.get("blocked"))
    remaining = [i for i in RALPH_ITEMS if not i.get("passes") and not i.get("blocked")]
    if not verb or verb == "status":
        nxt = remaining[0] if remaining else None
        return {
            "title": "ralph",
            "tag": f"{passing}/{len(RALPH_ITEMS)}",
            "fields": [
                {"label": "run", "value": "stopped"},
                {"label": "pass", "value": str(passing)},
                {"label": "wait", "value": str(len(remaining))},
                {"label": "hold", "value": str(blocked)},
            ],
            "rows": [f"ralph {nxt['id']}"] if nxt else [],
            "bottom": nxt["description"] if nxt else "Nothing eligible.",
            "face": "executing" if nxt else "completed",
        }
    item = next((i for i in RALPH_ITEMS if i["id"] == verb), None)
    if not item:
        return {"title": "ralph", "bottom": "ralph, or ralph <id>.", "face": "error"}
    return {
        "title": item["id"],
        "tag": "pass" if item.get("passes") else ("hold" if item.get("blocked") else "wait"),
        "bottom": item.get("description") or "",
        "face": "allowed" if item.get("passes") else ("cancelled" if item.get("blocked") else "warning"),
    }


def _pgeon(state: dict, argv: list[str]) -> dict:
    store = state["pgeon"]
    verb = (argv[0] if argv else "").lower()
    rest = " ".join(argv[1:]).strip()

    def qid(arg: str) -> str:
        s = re.sub(r"[^a-z0-9]", "", (arg or "add").lower()) or "add"
        return s

    if not verb or verb in ("best", "open") or next((q for q in store["questions"] if q["id"] == qid(verb)), None):
        target = "add" if (not verb or verb in ("best", "open")) else qid(verb)
        return _pgeon_best_card(state, target)
    if verb == "reset":
        state["pgeon"] = deepcopy(PGEON_SEED)
        return {"title": "pgeon", "tag": "reset", "bottom": "seed restored.", "face": "cancelled"}
    if verb == "ask":
        arg = rest or "add"
        if not arg or arg == "add":
            q = next((x for x in store["questions"] if x["id"] == "add"), None)
            if not q:
                return {"title": "pgeon", "bottom": "no question add", "face": "error"}
            return {
                "title": q["id"],
                "tag": "locked",
                "fields": [{"label": "test", "value": q["criterion"]}],
                "bottom": "Locked before answers existed.",
                "face": "completed",
            }
        saved = next((k for k in state.get("kept") or [] if k["id"] == arg.lower()), None)
        if saved:
            existing = next((x for x in store["questions"] if x["id"] == saved["id"]), None)
            if not existing:
                store["questions"].append(
                    {"id": saved["id"], "prompt": saved["id"], "criterion": saved["text"], "closed": False}
                )
            card = _pgeon_best_card(state, saved["id"])
            if not _pgeon_best(store, saved["id"]):
                card["bottom"] = "locked from the stream. no best."
            return card
        qid_ = qid(arg)
        if not next((x for x in store["questions"] if x["id"] == qid_), None):
            store["questions"].append(
                {"id": qid_, "prompt": qid_, "criterion": "locked at ask-time", "closed": False}
            )
        return _pgeon_best_card(state, qid_)
    if verb == "vote":
        author = (rest or "bravo").lower()
        answer = next((a for a in store["answers"] if a["question_id"] == "add" and a["author"] == author), None)
        if not answer:
            return {"title": "vote", "bottom": f"no author {author}", "face": "error"}
        answer["votes"] += 1
        best = _pgeon_best(store, "add")
        wins = 0
        if best:
            for q in store["questions"]:
                if q.get("closed") and (_pgeon_best(store, q["id"]) or {}).get("author") == best["author"]:
                    wins += 1
        return {
            "title": "vote",
            "tag": author,
            "fields": [
                {"label": "votes", "value": str(answer["votes"])},
                {"label": "best", "value": best["author"] if best else "none"},
                {"label": "wins", "value": str(wins)},
            ],
            "bottom": None if answer["passed"] else "best unchanged",
            "face": "completed" if answer["passed"] else "sandbox",
        }
    return {"title": "pgeon", "bottom": "pgeon, pgeon vote bravo, pgeon ask empty.", "face": "error"}
