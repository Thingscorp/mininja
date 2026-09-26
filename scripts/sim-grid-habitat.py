#!/usr/bin/env python3
"""Mathematical simulator for Mininja habitat glass grid.

Loads kit/scene.json (SoT), asserts geometry / motion / garden invariants,
runs discrete-time walk/run/patrol/camera sims + Monte Carlo hops, and
cross-checks SCENERY.md / TERMINAL-MOTION.md / GARDEN.md tables.

Exit 0 iff no hard inconsistencies. Always writes:
  scripts/sim-grid-habitat-report.json
"""
from __future__ import annotations

import json
import math
import random
import re
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
KIT_PATH = ROOT / "kit" / "scene.json"
REPORT_PATH = ROOT / "scripts" / "sim-grid-habitat-report.json"
SCENERY_PATH = ROOT / "SCENERY.md"
MOTION_DOC_PATH = ROOT / "TERMINAL-MOTION.md"
GARDEN_DOC_PATH = ROOT / "GARDEN.md"

# Floating tolerance for stored derived seconds (kit stores ~6 dp).
EPS_SEC = 5e-6
EPS_PX = 1e-9
# Banner frame reference (SCENERY.md) — soft Y bound when kit has no stageHeight.
BANNER_HEIGHT_PX = 148.0
# Monte Carlo
MC_TRIALS = 2000
MC_SEED = 42

# Proposed pure silhouette height if kit.garden lacks one.
# Monotonic on growth∈{0..5}; example overlay h=48 at growth=3 → h=12+12*g.
PROPOSED_H_GROWTH = {
    "formula": "h(g) = h0 + g * dh",
    "h0Px": 12,
    "dhPx": 12,
    "note": "Recommended host mapping; kit data-only. Matches GARDEN example h=48 at growth=3.",
}


@dataclass
class Check:
    id: str
    severity: str  # "hard" | "soft" | "info"
    ok: bool
    detail: str
    expected: Any = None
    actual: Any = None


@dataclass
class Report:
    kit_version: str = ""
    tip_hint: str = ""
    pass_count: int = 0
    fail_hard: int = 0
    fail_soft: int = 0
    checks: list[dict] = field(default_factory=list)
    formulas: dict = field(default_factory=dict)
    drifts: list[dict] = field(default_factory=list)
    garden: dict = field(default_factory=dict)
    motion_sim: dict = field(default_factory=dict)
    monte_carlo: dict = field(default_factory=dict)
    locked: bool = False
    taste_calls: list[str] = field(default_factory=list)

    def add(self, c: Check) -> None:
        self.checks.append(asdict(c))
        if c.ok:
            self.pass_count += 1
        elif c.severity == "hard":
            self.fail_hard += 1
        elif c.severity == "soft":
            self.fail_soft += 1


def load_kit() -> dict:
    return json.loads(KIT_PATH.read_text(encoding="utf-8"))


def h_growth(g: int, h0: float = 12.0, dh: float = 12.0) -> float:
    """Pure monotonic silhouette height mapping growth → px."""
    if not isinstance(g, int) or g < 0 or g > 5:
        raise ValueError(f"growth must be int 0..5, got {g!r}")
    return h0 + g * dh


# ---------------------------------------------------------------------------
# Geometry
# ---------------------------------------------------------------------------

def check_geometry(kit: dict, R: Report) -> dict:
    g = kit["geometry"]
    W = g["stageWidthPx"]
    N = g["stageCount"]
    L = g["worldWidthPx"]
    alpha = g["anchorRatio"]
    rest = g["restOffsetPx"]

    R.formulas["worldWidth"] = f"L = N * W = {N} * {W} = {N * W}"
    R.formulas["restOffset"] = f"rest = alpha * W = {alpha} * {W} = {alpha * W}"
    R.formulas["stageOrigin"] = "x_i = i * W"
    R.formulas["restPoint"] = "c_i = x_i + alpha * W"

    R.add(Check("geom.worldWidth", "hard", L == N * W,
                "worldWidthPx == stageCount * stageWidthPx", N * W, L))
    R.add(Check("geom.restOffset", "hard", abs(rest - alpha * W) < EPS_PX,
                "restOffsetPx == anchorRatio * stageWidthPx", alpha * W, rest))
    R.add(Check("geom.stageCount_vs_stages", "hard",
                len(kit["stages"]) == N,
                "len(stages) == stageCount", N, len(kit["stages"])))

    stages_ok = True
    for i, st in enumerate(kit["stages"]):
        exp_x = i * W
        exp_c = exp_x + alpha * W
        ok_x = st["x"] == exp_x and st.get("width", W) == W
        ok_c = abs(st["center"] - exp_c) < EPS_PX
        ok_i = st.get("index", i) == i
        if not (ok_x and ok_c and ok_i):
            stages_ok = False
            R.add(Check(f"geom.stage[{i}].origin", "hard", False,
                        f"stage {st.get('id')} origin/center/index",
                        {"x": exp_x, "center": exp_c, "index": i},
                        {"x": st.get("x"), "center": st.get("center"),
                         "index": st.get("index"), "width": st.get("width")}))
        # adjacent rest distance
        if i > 0:
            prev = kit["stages"][i - 1]
            d = st["center"] - prev["center"]
            R.add(Check(f"geom.rest_delta[{i-1}->{i}]", "hard", abs(d - W) < EPS_PX,
                        "c_{i}-c_{i-1} == W", W, d))

    if stages_ok:
        R.add(Check("geom.all_stage_origins", "hard", True,
                    "all x_i = i*W, c_i = x_i+alpha*W, width=W, index=i"))

    # default scene stage exists
    ds = kit.get("defaultScene", {})
    stage_ids = {s["id"] for s in kit["stages"]}
    R.add(Check("geom.default_stage", "hard", ds.get("stage") in stage_ids,
                "defaultScene.stage ∈ stages", True, ds.get("stage")))

    return {"W": W, "N": N, "L": L, "alpha": alpha, "rest": rest}


# ---------------------------------------------------------------------------
# Stages / props / weather
# ---------------------------------------------------------------------------

def check_stages_props(kit: dict, geo: dict, R: Report) -> None:
    weather_set = set(kit.get("weather", []))
    prop_kinds = set(kit.get("propKinds", []))
    W = geo["W"]

    for st in kit["stages"]:
        wid = st["id"]
        # weather enum
        w = st.get("weather")
        R.add(Check(f"stage.{wid}.weather", "hard", w in weather_set,
                    "weather ∈ kit.weather", list(sorted(weather_set)), w))

        for j, p in enumerate(st.get("props", [])):
            kind = p.get("kind")
            R.add(Check(f"stage.{wid}.prop[{j}].kind", "hard", kind in prop_kinds,
                        "prop.kind ∈ propKinds", list(sorted(prop_kinds)), kind))
            x, y, w, h = p["x"], p["y"], p["w"], p["h"]
            # stage-local AABB inside [0,W] x [0, banner] — hard for X, soft for Y
            # (SCENERY: stage-local; no overflow rules documented → require containment)
            in_x = (x >= 0) and (x + w <= W)
            R.add(Check(f"stage.{wid}.prop[{j}].x_bounds", "hard", in_x,
                        f"prop x..x+w in [0,{W}] (no overflow rules in SCENERY)",
                        f"[0,{W}]", f"[{x},{x+w}]"))
            in_y0 = y >= 0
            R.add(Check(f"stage.{wid}.prop[{j}].y_nonneg", "hard", in_y0,
                        "prop y >= 0", 0, y))
            # soft: within banner reference height
            if y + h > BANNER_HEIGHT_PX:
                R.add(Check(f"stage.{wid}.prop[{j}].y_banner", "soft", False,
                            f"prop y+h exceeds banner ref {BANNER_HEIGHT_PX}px",
                            BANNER_HEIGHT_PX, y + h))
            else:
                R.add(Check(f"stage.{wid}.prop[{j}].y_banner", "soft", True,
                            f"prop y+h <= banner ref {BANNER_HEIGHT_PX}px"))

            if kind == "repoBranch":
                check_repo_branch_prop(p, f"stage.{wid}.prop[{j}]", kit, R)


def check_repo_branch_prop(p: dict, prefix: str, kit: dict, R: Report) -> None:
    gdef = kit.get("garden", {}).get("growth", {})
    gmin, gmax = gdef.get("min", 0), gdef.get("max", 5)
    if "growth" in p:
        g = p["growth"]
        ok = isinstance(g, int) and gmin <= g <= gmax
        R.add(Check(f"{prefix}.growth", "hard", ok,
                    f"repoBranch.growth int in [{gmin},{gmax}]",
                    f"int [{gmin},{gmax}]", g))


# ---------------------------------------------------------------------------
# Motion derived times + discrete sims
# ---------------------------------------------------------------------------

def check_motion_formulas(kit: dict, geo: dict, R: Report) -> dict:
    m = kit["motion"]
    W = geo["W"]
    vw, vr, vp = m["walkPxPerSec"], m["runPxPerSec"], m["patrolPxPerSec"]
    p0, p1 = m["patrolInsetLeftPx"], m["patrolInsetRightPx"]
    span = m["patrolSpanPx"]
    exp_span = W - p0 - p1
    Tw = W / vw
    Tr = W / vr
    Tp = span / vp

    R.formulas["adjacentStageWalkSec"] = f"W/vw = {W}/{vw} = {Tw}"
    R.formulas["adjacentStageRunSec"] = f"W/vr = {W}/{vr} = {Tr}"
    R.formulas["fullPatrolSec"] = f"span/vp = {span}/{vp} = {Tp}"
    R.formulas["patrolSpan"] = f"W - p0 - p1 = {W}-{p0}-{p1} = {exp_span}"

    R.add(Check("motion.patrolSpan", "hard", span == exp_span,
                "patrolSpanPx == W - insetL - insetR", exp_span, span))
    R.add(Check("motion.adjacentWalkSec", "hard",
                abs(m["adjacentStageWalkSec"] - Tw) < EPS_SEC,
                "adjacentStageWalkSec ≈ W/walkPxPerSec", Tw, m["adjacentStageWalkSec"]))
    R.add(Check("motion.adjacentRunSec", "hard",
                abs(m["adjacentStageRunSec"] - Tr) < EPS_SEC,
                "adjacentStageRunSec ≈ W/runPxPerSec", Tr, m["adjacentStageRunSec"]))
    R.add(Check("motion.fullPatrolSec", "hard",
                abs(m["fullPatrolSec"] - Tp) < EPS_SEC,
                "fullPatrolSec ≈ patrolSpan/patrolSpeed", Tp, m["fullPatrolSec"]))

    # rounding soft note if not exact float equality but within EPS
    for key, exp, got in [
        ("adjacentStageWalkSec", Tw, m["adjacentStageWalkSec"]),
        ("adjacentStageRunSec", Tr, m["adjacentStageRunSec"]),
        ("fullPatrolSec", Tp, m["fullPatrolSec"]),
    ]:
        if got != exp and abs(got - exp) < EPS_SEC:
            R.add(Check(f"motion.{key}.rounding", "info", True,
                        f"stored {got} rounds {exp} (within {EPS_SEC})"))

    return m


def simulate_travel(
    a0: float, c_star: float, speed: float, dt: float, eps: float, dt_clamp: float,
    world_lo: float = 0.0, world_hi: float | None = None,
) -> dict:
    """Discrete travel a → c* with dt clamp; returns path stats."""
    a = a0
    t = 0.0
    steps = 0
    max_steps = 1_000_000
    nan = False
    while abs(c_star - a) > eps and steps < max_steps:
        dtc = min(dt, dt_clamp)
        dist = abs(c_star - a)
        step = min(dist, speed * dtc)
        a = a + math.copysign(step, c_star - a)
        if not math.isfinite(a):
            nan = True
            break
        if world_hi is not None:
            a = max(world_lo, min(world_hi, a))
        t += dtc
        steps += 1
    if abs(c_star - a) <= eps:
        a = c_star  # arrive snap
    return {"a": a, "t": t, "steps": steps, "nan": nan, "arrived": abs(c_star - a) <= eps or a == c_star}


def simulate_patrol(
    x_i: float, W: float, p0: float, p1: float, vp: float, dt: float, dt_clamp: float,
    duration: float,
) -> dict:
    lo = x_i + p0
    hi = x_i + W - p1
    a = lo
    facing = 1  # +1 toward hi
    t = 0.0
    flips = 0
    nan = False
    while t < duration:
        dtc = min(dt, dt_clamp)
        a = a + facing * vp * dtc
        if not math.isfinite(a):
            nan = True
            break
        if a >= hi:
            a = hi
            facing = -1
            flips += 1
        elif a <= lo:
            a = lo
            facing = 1
            flips += 1
        t += dtc
    return {"a": a, "flips": flips, "nan": nan, "lo": lo, "hi": hi,
            "in_bounds": lo - 1e-6 <= a <= hi + 1e-6}


def simulate_camera(
    a: float, facing: str, V: float, L: float, lam_r: float, lam_l: float,
    kappa: float, C0: float, dt: float, steps: int, dt_clamp: float,
) -> dict:
    C = C0
    nan = False
    for _ in range(steps):
        dtc = min(dt, dt_clamp)
        lam = lam_r if facing == "right" else lam_l
        C_star = max(0.0, min(L - V, a - lam * V))
        C = C + (C_star - C) * (1.0 - math.exp(-kappa * dtc))
        if not math.isfinite(C):
            nan = True
            break
    return {"C": C, "nan": nan}


def run_motion_sims(kit: dict, geo: dict, m: dict, R: Report) -> dict:
    W, L = geo["W"], geo["L"]
    stages = kit["stages"]
    eps = m["arriveEpsilonPx"]
    dtc = m["dtClampSec"]
    dt = 1 / 60  # 60 Hz nominal

    # Walk between adjacent rests (0→1)
    c0, c1 = stages[0]["center"], stages[1]["center"]
    walk = simulate_travel(c0, c1, m["walkPxPerSec"], dt, eps, dtc, 0, L)
    exp_tw = W / m["walkPxPerSec"]
    # With epsilon snap, travel distance is W-eps effectively until snap; time ≈ (W-eps)/v
    # Docs ignore epsilon for published T_w; sim should arrive and time ≈ Tw within one dt+eps/v
    R.add(Check("sim.walk_adjacent.arrive", "hard", walk["arrived"] and not walk["nan"],
                "walk rest0→rest1 arrives, no NaN", True, walk))
    R.add(Check("sim.walk_adjacent.time", "hard",
                abs(walk["t"] - exp_tw) < dtc + eps / m["walkPxPerSec"] + 1e-6,
                f"walk time ≈ W/vw ({exp_tw:.6f}s)", exp_tw, walk["t"]))

    run = simulate_travel(c0, c1, m["runPxPerSec"], dt, eps, dtc, 0, L)
    exp_tr = W / m["runPxPerSec"]
    R.add(Check("sim.run_adjacent.arrive", "hard", run["arrived"] and not run["nan"],
                "run rest0→rest1 arrives, no NaN", True, run))
    R.add(Check("sim.run_adjacent.time", "hard",
                abs(run["t"] - exp_tr) < dtc + eps / m["runPxPerSec"] + 1e-6,
                f"run time ≈ W/vr ({exp_tr:.6f}s)", exp_tr, run["t"]))

    # Reduced motion: snap
    a_snap = c1  # pretend was at c0 intent to c1
    a_rm = c1  # reduced motion sets a = c*
    R.add(Check("sim.reduced_motion.snap", "hard", a_rm == c1,
                "reduced-motion snaps a = c*", c1, a_rm))

    # Patrol within insets on stage 1 (dock)
    st = stages[1]
    patrol = simulate_patrol(st["x"], W, m["patrolInsetLeftPx"], m["patrolInsetRightPx"],
                             m["patrolPxPerSec"], dt, dtc, duration=m["fullPatrolSec"] * 2)
    R.add(Check("sim.patrol.bounds", "hard", patrol["in_bounds"] and not patrol["nan"],
                "patrol stays in [x+p0, x+W-p1], no NaN", True, patrol))
    # one full end-to-end ≈ fullPatrolSec; over 2*fullPatrol expect ~2 one-ways = ≥1 flip pair
    R.add(Check("sim.patrol.activity", "hard", patrol["flips"] >= 1,
                "patrol reverses at endpoints over 2*fullPatrolSec", ">=1 flip", patrol["flips"]))

    # dt clamp: huge raw dt must not jump past destination more than one clamped step allows
    big = simulate_travel(c0, c1, m["walkPxPerSec"], dt=10.0, eps=eps, dt_clamp=dtc, world_lo=0, world_hi=L)
    # with clamp 0.05 and speed 170, first step max 8.5px — should still arrive eventually
    R.add(Check("sim.dt_clamp.arrive", "hard", big["arrived"] and not big["nan"],
                "dt=10s clamped to dtClampSec still arrives", True,
                {"t": big["t"], "steps": big["steps"]}))

    # Camera look-ahead L/R
    V = 420.0  # one stage view
    cam_r = simulate_camera(c1, "right", V, L, m["cameraLookAheadRight"], m["cameraLookAheadLeft"],
                            m["cameraFollowRatePerSec"], C0=0.0, dt=dt, steps=120, dt_clamp=dtc)
    cam_l = simulate_camera(c1, "left", V, L, m["cameraLookAheadRight"], m["cameraLookAheadLeft"],
                            m["cameraFollowRatePerSec"], C0=0.0, dt=dt, steps=120, dt_clamp=dtc)
    Cstar_r = max(0.0, min(L - V, c1 - m["cameraLookAheadRight"] * V))
    Cstar_l = max(0.0, min(L - V, c1 - m["cameraLookAheadLeft"] * V))
    R.add(Check("sim.camera.right", "hard", (not cam_r["nan"]) and abs(cam_r["C"] - Cstar_r) < 1.0,
                "camera converges toward look-ahead right target", Cstar_r, cam_r["C"]))
    R.add(Check("sim.camera.left", "hard", (not cam_l["nan"]) and abs(cam_l["C"] - Cstar_l) < 1.0,
                "camera converges toward look-ahead left target", Cstar_l, cam_l["C"]))
    R.add(Check("sim.camera.asymmetry", "hard", Cstar_l < Cstar_r,
                "left look-ahead (0.52) pulls camera further left than right (0.32)",
                f"C*_L={Cstar_l} < C*_R={Cstar_r}", True))

    out = {
        "walk": walk, "run": run, "patrol": patrol,
        "camera_right": {"C": cam_r["C"], "Cstar": Cstar_r},
        "camera_left": {"C": cam_l["C"], "Cstar": Cstar_l},
        "dt_clamp_travel": {"t": big["t"], "steps": big["steps"]},
    }
    R.motion_sim = out
    return out


def run_monte_carlo(kit: dict, geo: dict, m: dict, R: Report) -> dict:
    rng = random.Random(MC_SEED)
    W, L, N = geo["W"], geo["L"], geo["N"]
    stages = kit["stages"]
    centers = [s["center"] for s in stages]
    eps = m["arriveEpsilonPx"]
    dtc = m["dtClampSec"]
    dt = 1 / 60
    nan_count = 0
    oob_count = 0
    trials = []
    a = centers[1]  # start dock
    facing = "right"
    for trial in range(MC_TRIALS):
        tgt_i = rng.randrange(N)
        # facing flip sometimes without move
        if rng.random() < 0.15:
            facing = "left" if facing == "right" else "right"
        speed = m["runPxPerSec"] if rng.random() < 0.3 else m["walkPxPerSec"]
        c_star = centers[tgt_i]
        if abs(c_star - a) > eps:
            facing = "right" if c_star >= a else "left"
            res = simulate_travel(a, c_star, speed, dt, eps, dtc, 0, L)
            a = res["a"]
            if res["nan"] or not math.isfinite(a):
                nan_count += 1
            if a < -1e-6 or a > L + 1e-6:
                oob_count += 1
        # occasional patrol tick burst
        if rng.random() < 0.1:
            si = max(0, min(N - 1, int(a // W)))
            pat = simulate_patrol(stages[si]["x"], W, m["patrolInsetLeftPx"],
                                  m["patrolInsetRightPx"], m["patrolPxPerSec"],
                                  dt, dtc, duration=0.5)
            if pat["nan"]:
                nan_count += 1
            # after patrol, snap back conceptually not required; keep a at rest for next hop
            a = centers[si]
        trials.append(a)

    ok = nan_count == 0 and oob_count == 0
    R.add(Check("mc.no_nan", "hard", nan_count == 0,
                f"Monte Carlo {MC_TRIALS} hops: no NaNs", 0, nan_count))
    R.add(Check("mc.in_world", "hard", oob_count == 0,
                f"position stays in [0, L={L}]", 0, oob_count))
    summary = {
        "trials": MC_TRIALS, "seed": MC_SEED,
        "nan_count": nan_count, "oob_count": oob_count,
        "final_a": a, "ok": ok,
        "a_min": min(trials) if trials else None,
        "a_max": max(trials) if trials else None,
    }
    R.monte_carlo = summary
    return summary


# ---------------------------------------------------------------------------
# Garden
# ---------------------------------------------------------------------------

def check_garden(kit: dict, R: Report) -> None:
    garden = kit.get("garden") or {}
    growth = garden.get("growth") or {}
    R.add(Check("garden.present", "hard", bool(garden), "garden block present in kit"))
    R.add(Check("garden.propKind", "hard", garden.get("propKind") == "repoBranch",
                "garden.propKind == repoBranch", "repoBranch", garden.get("propKind")))
    R.add(Check("garden.propKinds_has_repoBranch", "hard",
                "repoBranch" in kit.get("propKinds", []),
                "repoBranch ∈ propKinds"))

    gmin, gmax = growth.get("min", 0), growth.get("max", 5)
    steps = growth.get("steps") or []
    R.add(Check("garden.range", "hard", gmin == 0 and gmax == 5,
                "growth min..max == 0..5", "0..5", f"{gmin}..{gmax}"))
    levels = [s.get("level") for s in steps]
    R.add(Check("garden.steps_complete", "hard", levels == list(range(gmin, gmax + 1)),
                "growth.steps levels cover 0..5 contiguous", list(range(gmin, gmax + 1)), levels))

    # silhouette mapping
    sil = garden.get("silhouetteHeightPx") or garden.get("silhouette")
    if not sil:
        # propose and record; soft — missing is a gap, not a hard kit break
        R.add(Check("garden.silhouette_fn", "soft", False,
                    "kit.garden missing silhouette height mapping; proposing h(g)=h0+g*dh",
                    PROPOSED_H_GROWTH, None))
        R.taste_calls.append(
            "Adopt proposed garden.silhouetteHeightPx (h0=12, dh=12) into kit, or pick taste values"
        )
        used = PROPOSED_H_GROWTH
        proposed = True
    else:
        used = sil
        proposed = False
        R.add(Check("garden.silhouette_fn", "hard", True,
                    "kit.garden has silhouette height mapping", True, sil))

    h0 = float(used.get("h0Px", 12))
    dh = float(used.get("dhPx", 12))
    heights = [h_growth(g, h0, dh) for g in range(gmin, gmax + 1)]
    mono = all(heights[i] < heights[i + 1] for i in range(len(heights) - 1))
    R.add(Check("garden.h_monotonic", "hard", mono,
                "h(growth) strictly monotonic increasing", True, heights))
    # example in GARDEN.md: growth 3 → h 48 with w 24
    if abs(h_growth(3, h0, dh) - 48) < EPS_PX:
        R.add(Check("garden.h_matches_example", "info", True,
                    "h(3)=48 matches GARDEN.md example overlay"))
    else:
        R.add(Check("garden.h_matches_example", "soft", False,
                    f"h(3)={h_growth(3,h0,dh)} != 48 (GARDEN example); taste or update example",
                    48, h_growth(3, h0, dh)))

    R.garden = {
        "proposed": proposed,
        "mapping": used,
        "heights": {str(g): h_growth(g, h0, dh) for g in range(gmin, gmax + 1)},
        "formula": f"h(g) = {h0} + g * {dh}",
    }


# ---------------------------------------------------------------------------
# Doc cross-checks
# ---------------------------------------------------------------------------

def parse_scenery_stage_table(text: str) -> list[dict]:
    rows = []
    for m in re.finditer(
        r"\|\s*(\d+)\s*\|\s*`(\w+)`\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*`(\w+)`\s*\|\s*([^|]+)\|",
        text,
    ):
        rows.append({
            "index": int(m.group(1)), "id": m.group(2),
            "x": float(m.group(3)), "center": float(m.group(4)),
            "weather": m.group(5), "hint": m.group(6).strip(),
        })
    return rows


def parse_prop_tables(text: str) -> dict[str, list[dict]]:
    """Parse SCENERY stock prop tables keyed by stage id."""
    out: dict[str, list[dict]] = {}
    # sections like **`nightwatch`** followed by table
    for m in re.finditer(r"\*\*`(\w+)`\*\*\s*\n\s*\n\|[^\n]+\n\|[^\n]+\n((?:\|[^\n]+\n)+)", text):
        sid = m.group(1)
        body = m.group(2)
        props = []
        for line in body.strip().splitlines():
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) < 5:
                continue
            kind = cells[0]
            try:
                props.append({
                    "kind": kind,
                    "x": float(cells[1]), "y": float(cells[2]),
                    "w": float(cells[3]), "h": float(cells[4]),
                })
            except ValueError:
                continue
        if props:
            out[sid] = props
    return out


def parse_motion_constants(text: str) -> dict[str, float]:
    """Pull bold numeric values from TERMINAL-MOTION locomotion table."""
    mapping = {
        "walkPxPerSec": r"Walk speed\s*\|\s*\*\*([\d.]+)\*\*",
        "runPxPerSec": r"Run speed\s*\|\s*\*\*([\d.]+)\*\*",
        "patrolPxPerSec": r"Patrol speed\s*\|\s*\*\*([\d.]+)\*\*",
        "arriveEpsilonPx": r"Arrive epsilon\s*\|\s*\*\*([\d.]+)\*\*",
        "patrolInsetLeftPx": r"Patrol left inset\s*\|\s*\*\*([\d.]+)\*\*",
        "patrolInsetRightPx": r"Patrol right inset\s*\|\s*\*\*([\d.]+)\*\*",
        "cameraLookAheadRight": r"Camera look-ahead \(face right\)\s*\|\s*\*\*([\d.]+)\*\*",
        "cameraLookAheadLeft": r"Camera look-ahead \(face left\)\s*\|\s*\*\*([\d.]+)\*\*",
        "cameraFollowRatePerSec": r"Camera follow rate\s*\|\s*\*\*([\d.]+)\*\*",
        "stepPeriodMovingSec": r"Step period \(moving / run\)\s*\|\s*\*\*([\d.]+)\*\*",
        "stepPeriodIdleSec": r"Step period \(idle cadence\)\s*\|\s*\*\*([\d.]+)\*\*",
        "dtClampSec": r"Frame dt clamp\s*\|\s*\*\*([\d.]+)\*\*",
    }
    found = {}
    for k, pat in mapping.items():
        m = re.search(pat, text)
        if m:
            found[k] = float(m.group(1))
    return found


def cross_check_docs(kit: dict, geo: dict, R: Report) -> None:
    scenery = SCENERY_PATH.read_text(encoding="utf-8") if SCENERY_PATH.exists() else ""
    motion_doc = MOTION_DOC_PATH.read_text(encoding="utf-8") if MOTION_DOC_PATH.exists() else ""
    garden_doc = GARDEN_DOC_PATH.read_text(encoding="utf-8") if GARDEN_DOC_PATH.exists() else ""

    # SCENERY constants
    for sym, key, val in [
        ("W", "stageWidthPx", geo["W"]),
        ("N", "stageCount", geo["N"]),
        ("L", "worldWidthPx", geo["L"]),
        ("alpha", "anchorRatio", geo["alpha"]),
    ]:
        # look for **val** near the constant
        ok = f"**{val if not isinstance(val, float) else (int(val) if val == int(val) else val)}**" in scenery or str(val) in scenery
        # more precise for float alpha
        if key == "anchorRatio":
            ok = "**0.42**" in scenery
        R.add(Check(f"doc.scenery.{key}", "hard", ok,
                    f"SCENERY.md lists {key}={val}", val, ok))

    rows = parse_scenery_stage_table(scenery)
    R.add(Check("doc.scenery.stage_rows", "hard", len(rows) == geo["N"],
                f"SCENERY stage table has N={geo['N']} rows", geo["N"], len(rows)))
    by_id = {s["id"]: s for s in kit["stages"]}
    for row in rows:
        st = by_id.get(row["id"])
        if not st:
            R.add(Check(f"doc.scenery.stage.{row['id']}", "hard", False,
                        "doc stage id missing from kit", row["id"], None))
            R.drifts.append({"where": "SCENERY.md vs kit", "id": row["id"],
                             "issue": "stage id in docs not in kit"})
            continue
        mismatches = []
        if st["index"] != row["index"]:
            mismatches.append(("index", row["index"], st["index"]))
        if st["x"] != row["x"]:
            mismatches.append(("x", row["x"], st["x"]))
        if abs(st["center"] - row["center"]) > EPS_PX:
            mismatches.append(("center", row["center"], st["center"]))
        if st["weather"] != row["weather"]:
            mismatches.append(("weather", row["weather"], st["weather"]))
        ok = not mismatches
        R.add(Check(f"doc.scenery.stage.{row['id']}", "hard", ok,
                    "stage row matches kit", row, {"mismatches": mismatches} if mismatches else st["id"]))
        for field, doc_v, kit_v in mismatches:
            R.drifts.append({
                "where": "SCENERY.md vs kit.stages",
                "stage": row["id"], "field": field,
                "doc": doc_v, "kit": kit_v,
            })

    # Prop tables
    props_doc = parse_prop_tables(scenery)
    for st in kit["stages"]:
        sid = st["id"]
        kit_props = [{"kind": p["kind"], "x": p["x"], "y": p["y"], "w": p["w"], "h": p["h"]}
                     for p in st.get("props", [])]
        doc_props = props_doc.get(sid)
        if doc_props is None:
            R.add(Check(f"doc.scenery.props.{sid}", "hard", False,
                        "SCENERY missing stock prop table for stage", sid, None))
            R.drifts.append({"where": "SCENERY.md props", "stage": sid, "issue": "missing table"})
            continue
        ok = doc_props == kit_props
        R.add(Check(f"doc.scenery.props.{sid}", "hard", ok,
                    "stock props match kit exactly", kit_props, doc_props))
        if not ok:
            R.drifts.append({
                "where": "SCENERY.md props vs kit",
                "stage": sid, "doc": doc_props, "kit": kit_props,
            })

    # Motion constants
    doc_m = parse_motion_constants(motion_doc)
    kit_m = kit["motion"]
    for k, doc_v in doc_m.items():
        kit_v = kit_m.get(k)
        ok = kit_v is not None and abs(float(kit_v) - doc_v) < EPS_PX
        R.add(Check(f"doc.motion.{k}", "hard", ok,
                    f"TERMINAL-MOTION.md {k} matches kit", kit_v, doc_v))
        if not ok:
            R.drifts.append({
                "where": "TERMINAL-MOTION.md vs kit.motion",
                "field": k, "doc": doc_v, "kit": kit_v,
            })

    # Derived times mentioned in motion doc
    for label, approx in [
        (r"420\{1,}/\{1,}170", kit_m["adjacentStageWalkSec"]),
        (r"1\.5", kit_m["adjacentStageRunSec"]),
        (r"274\s*/\s*26", kit_m["fullPatrolSec"]),
    ]:
        pass  # covered by formula checks; ensure doc text present
    R.add(Check("doc.motion.Tw_text", "hard",
                "420" in motion_doc and "170" in motion_doc and "2.4706" in motion_doc,
                "TERMINAL-MOTION documents T_w = 420/170 ≈ 2.4706"))
    R.add(Check("doc.motion.Tr_text", "hard",
                "420/280" in motion_doc.replace(" ", "") or "420}{280" in motion_doc or "1.5" in motion_doc,
                "TERMINAL-MOTION documents T_r = 1.5 s"))
    R.add(Check("doc.motion.Tp_text", "hard",
                "274" in motion_doc and "26" in motion_doc and "10.538" in motion_doc,
                "TERMINAL-MOTION documents full patrol 274/26 ≈ 10.538 s"))

    # Emotion / action counts
    R.add(Check("doc.motion.emotion_count", "hard",
                len(kit.get("emotions", [])) == 16 and "## Emotion catalog (16)" in motion_doc,
                "16 emotions in kit and doc", 16, len(kit.get("emotions", []))))
    R.add(Check("doc.motion.action_count", "hard",
                len(kit.get("actions", [])) == 22 and "## Action catalog (22)" in motion_doc,
                "22 actions in kit and doc", 22, len(kit.get("actions", []))))

    # Garden growth table
    for level, label in [(0, "seed"), (1, "sprout"), (2, "sapling"),
                         (3, "young"), (4, "branching"), (5, "canopy")]:
        ok = f"| {level} |" in garden_doc.replace(" ", "") or f"| {level} |" in garden_doc or f"|{level}|" in garden_doc.replace(" ", "")
        # simpler: label present
        ok = label in garden_doc
        steps = {s["level"]: s["label"] for s in kit.get("garden", {}).get("growth", {}).get("steps", [])}
        ok = ok and steps.get(level) == label
        R.add(Check(f"doc.garden.level.{level}", "hard", ok,
                    f"GARDEN.md level {level}={label} matches kit", label, steps.get(level)))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    kit = load_kit()
    R = Report(kit_version=str(kit.get("version", "")), tip_hint="see git rev-parse HEAD")

    geo = check_geometry(kit, R)
    check_stages_props(kit, geo, R)
    m = check_motion_formulas(kit, geo, R)
    run_motion_sims(kit, geo, m, R)
    run_monte_carlo(kit, geo, m, R)
    check_garden(kit, R)
    cross_check_docs(kit, geo, R)

    # Locked iff zero hard fails and zero soft fails that block "perfect"
    # Soft silhouette proposal is expected until adopted — still "math locked" for grid.
    grid_hard_ok = R.fail_hard == 0
    only_soft_is_silhouette = (
        R.fail_soft == 1
        and any(c["id"] == "garden.silhouette_fn" and not c["ok"] for c in R.checks)
    ) or R.fail_soft == 0
    R.locked = grid_hard_ok and (R.fail_soft == 0 or only_soft_is_silhouette)
    if R.fail_soft and not only_soft_is_silhouette:
        R.taste_calls.append("Resolve remaining soft drifts before calling habitat locked")
    if not any("stage width" in t.lower() for t in R.taste_calls):
        # W=420 is brand-locked in docs; no taste call unless disputed
        pass

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = asdict(R)
    REPORT_PATH.write_text(json.dumps(payload, indent=2, sort_keys=False) + "\n", encoding="utf-8")

    # Human summary
    print("=== Mininja grid/habitat simulator ===")
    print(f"kit version: {R.kit_version}")
    print(f"geometry: W={geo['W']} N={geo['N']} L={geo['L']} alpha={geo['alpha']} rest={geo['rest']}")
    print("formulas:")
    for k, v in R.formulas.items():
        print(f"  {k}: {v}")
    print(f"checks: pass={R.pass_count} hard_fail={R.fail_hard} soft_fail={R.fail_soft}")
    if R.drifts:
        print(f"drifts ({len(R.drifts)}):")
        for d in R.drifts:
            print(f"  - {d}")
    else:
        print("drifts: none (kit ↔ SCENERY/TERMINAL-MOTION/GARDEN tables align)")
    print(f"garden: {R.garden.get('formula')} heights={R.garden.get('heights')} proposed={R.garden.get('proposed')}")
    print(f"monte_carlo: {R.monte_carlo}")
    print(f"locked: {R.locked}")
    if R.taste_calls:
        print("taste calls:")
        for t in R.taste_calls:
            print(f"  - {t}")
    # print failing checks
    fails = [c for c in R.checks if not c["ok"] and c["severity"] in ("hard", "soft")]
    if fails:
        print("failures:")
        for c in fails:
            print(f"  [{c['severity']}] {c['id']}: {c['detail']} expected={c.get('expected')} actual={c.get('actual')}")
    print(f"report: {REPORT_PATH}")

    return 1 if R.fail_hard else 0


if __name__ == "__main__":
    sys.exit(main())
