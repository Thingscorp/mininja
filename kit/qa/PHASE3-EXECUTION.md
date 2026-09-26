# Phase 3 — Kit QA execution

| Field | Value |
|-------|-------|
| Date | 2026-09-25 (ET) |
| Branch | `feat/monorepo-public` |
| Tip at execution | `dd4def8` (`docs(motion): idle/blink keep-current stage — DEFECT-DOC-001`) |
| Kit versions | mark **1.6.0** · scene **1.6.1** |
| Kit JSON mutated? | **No** |
| PR #1 merged? | **No** |
| Runner | `node kit/qa/run-tests.mjs` |

---

## Coverage summary

| Metric | Count |
|--------|------:|
| Features in matrix | 29 |
| Features tested | 29 |
| Test cases generated | 87 |
| Test cases executed | 87 |
| Passed | 87 |
| Failed | 0 |
| Mobile scenarios | N/A (kit JSON SoT) |

Scenario mix: happy, error, boundary, invalid, permission/security (SoT integrity / forbidden names), performance (motion ordering).

---

## Gates run

### `node kit/check-consumers.mjs`

**PASS**

```text
kit/check-consumers OK — mark v1.6.0 · scene v1.6.1 · stageWidthPx=420 · walk=170 run=280 · stages=7 · console habitat aligned
```

### `node kit/qa/run-tests.mjs`

**PASS** — 87 passed, 0 failed.

### `python3 scripts/sim-grid-habitat.py`

**PASS** — locked; hard_fail=0 soft_fail=0; pass_count=195; Monte Carlo ok; garden heights 12..72; drifts none vs SCENERY/TERMINAL-MOTION/GARDEN.

Report artifact (not committed; scripts-owned): `scripts/sim-grid-habitat-report.json`.

---

## Features tested

All matrix rows `KIT-MARK-*`, `KIT-SCENE-*`, `KIT-GARDEN-*`, `KIT-RECIPE-001`, `KIT-VAL-*`, `KIT-VER-001`, `KIT-DEP-*` → **Tested** on 2026-09-25.

Executable suites live under `kit/qa/tests/`:

- `mark.test.mjs` — creature / mark SoT
- `scene.test.mjs` — habitat glass SoT + bridge/doc integrity
- `garden-recipe-val-deps.test.mjs` — garden, recipe seams, validators, versioning, console/adapters/docs deps

---

## Defects

| ID | Severity | Status | Notes |
|----|----------|--------|-------|
| DEFECT-DOC-001 | low | **Fixed** | TERMINAL-MOTION idle/blink stage now `—` (keep-current); matches kit omit. Fixed in `dd4def8` (CoS-approved). Kit JSON untouched. |

No new kit SoT defects found in Phase 2–3 execution.

Open kit JSON defects: **none**.

---

## Confidence score (kit SoT only)

**92 / 100**

Rationale:

- (+ ) Closed catalogs (15 faces, 16 emotions, 22 actions, 7 stages, weather, propKinds) asserted with key parity to bridge.
- (+ ) Geometry / motion / garden silhouette cross-checked by executable tests **and** sim-grid (195 checks).
- (+ ) check-consumers + Casque / dual-seed / registerFromKit consumer contracts green.
- (+ ) DEFECT-DOC-001 closed without kit churn.
- (−8) Residual risk: console banner literals could drift if edited outside check-consumers patterns; adapter CSS motion subset is sampled from CSS literals not exhaustive DOM; recipe runner still later-plate (seams tested, runtime not).

---

## Standing rules honored

- Recipes later plate; system graph connected; face/stage/action/mood/growth ids preserved
- No PR #1 merge · no force-push · no invented kit constants · never Casque as a name
- Kit JSON held; commit scope `kit/qa/` only

---

## Phase 4 recommendations (smallest fixes)

1. **Optional STYLEGUIDE/PORTING note** — label unbridged emotions (`alert`, `relieved`, `sad`, `startled`) as habitat/SceneIntent expansion (docs only).
2. **CI wire-up** — add `node kit/check-consumers.mjs && node kit/qa/run-tests.mjs` to the smallest existing CI job (no new workflow proliferation).
3. **Adapter golden snapshots** — optional 15-face + unknown→idle string fixtures under `adapters/mark/` tests (not kit JSON).
4. **Hold** recipe runner / GitHub growth bridge until recipes plate schedules.
5. **Do not** add `stage: dock` to kit `legacyFaceBridge.idle|blink` — doc now matches omit/keep-current.
