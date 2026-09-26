# Phase 6 — Kit recursive QA (rediscovery + regress)

| Field | Value |
|-------|-------|
| Date | 2026-09-25 (ET) |
| Branch | `feat/monorepo-public` |
| Tip after `git pull --ff-only` | `5490424` (already up to date) |
| Kit versions | mark **1.6.0** · scene **1.6.1** |
| Kit JSON mutated? | **No** |
| PR #1 merged? | **No** |
| Force-push? | **No** |
| New feature count | **8** (29 → **37**) |
| Runner | `node kit/qa/run-tests.mjs` |

---

## Coverage Summary

| Metric | Count |
|--------|------:|
| Features in matrix (pre) | 29 |
| Features rediscovered (new) | 8 |
| Features in matrix (post) | **37** |
| Features tested this loop | **37** |
| Test cases (pre) | 87 |
| Test cases added | 24 |
| Test cases executed | **111** |
| Passed | **111** |
| Failed | **0** |
| check-consumers | **PASS** |
| sim-grid-habitat | **PASS** (pass=195 hard_fail=0 soft_fail=0; Monte Carlo ok) |
| CI workflow `.github/workflows/kit-qa.yml` | **valid** (Node 22; check-consumers + run-tests; no app install) |

Scope of score: **kit SoT only** (`kit/mark.json`, `kit/scene.json`, `kit/check-consumers.mjs`, brand narrators, thin adapter contracts, kit-qa CI). **Not** Apps UI / `register*` screens / recipe runner runtime.

---

## Features Tested

### Prior matrix (regress — all green)
`KIT-MARK-001`…`009`, `KIT-SCENE-001`…`010`, `KIT-GARDEN-001`…`003`, `KIT-RECIPE-001`, `KIT-VAL-001`…`002`, `KIT-VER-001`, `KIT-DEP-001`…`003`.

### Rediscovered this loop (new Feature IDs)

| Feature ID | Name | Why it was missing |
|------------|------|--------------------|
| `KIT-MARK-010` | Face motion closed vocabulary | Faces declared `motion` but closed set `{null,pulse,bounce,shake}` never matrixed |
| `KIT-SCENE-011` | Emotion eyes/tone/optional-motion schema | `KIT-SCENE-007` covered ids only; eyes[2], `muted`, optional motion, TERMINAL-MOTION parity undocumented as features |
| `KIT-SCENE-012` | Action motion/pose/fx closed vocabularies | `KIT-SCENE-008` covered ids only; pose/fx/motion closed sets + doc parity |
| `KIT-SCENE-013` | `scene.source` provenance | SoT metadata field + historical-console narrator contract |
| `KIT-SCENE-014` | Stock stage prop layout fields | Stock props `kind,x,y,w,h` contract beyond kind enum |
| `KIT-VAL-003` | CI kit-qa workflow gate | Phase 4 added workflow; never matrixed |
| `KIT-DEP-004` | BRAND-RULES narration contract | Omitted from `KIT-DEP-003` narrator list |
| `KIT-DEP-005` | Adapter facing-wins contract | Noted in PORTING / DEP-002 notes; no executable asserts |

Executable suite added: `kit/qa/tests/phase6-rediscovery.test.mjs` (auto-loaded by `run-tests.mjs`).

---

## Defects Found

| ID | Severity | Summary | Disposition |
|----|----------|---------|-------------|
| — | — | **None** this loop | — |

Prior `DEFECT-DOC-001` remains **Fixed** (idle/blink keep-current). No new rows in `defects.csv`.

### Waived (prefer note over inventing constants)

| Topic | Note |
|-------|------|
| SceneIntent `intensity` ∈ `{0,1,2}` | Documented in TERMINAL-MOTION; **not** an enum in kit JSON (defaultScene only stores `1`). Prefer waive — do not invent kit enum. |
| Auto-blink 6–14s | STYLEGUIDE host guidance only — not kit SoT (`KIT-MARK-010`). |
| Apps UI / recipe runner | Explicitly out of scope; seams still connected (`KIT-RECIPE-001`). |

---

## Defects Fixed

None required this loop (docs + kits already aligned; rediscovery deepened coverage only).

---

## Remaining Risks

1. **Apps UI / `register*` screens** — consumer contract tested; implementation UX owned by Mininja Apps (out of scope).
2. **Recipe runner runtime** — later plate; vocabulary seams asserted, no runner under `kit/`.
3. **Console banner literals** — `check-consumers` patterns can miss novel inline forks outside known regexes.
4. **Presence CSS** — motion ids sampled from `data-motion="…"` literals, not a full DOM/CSSOM exhaust.
5. **Intensity enum** — host-doc-only; a future CoS may choose to lift `{0,1,2}` into kit (not done here).

---

## Confidence Score (kit SoT only)

**94 / 100**

Rationale:

- (+) Closed catalogs + deep emotion/action schema parity with TERMINAL-MOTION.
- (+) Geometry/motion/garden locked by executable tests **and** sim-grid (195).
- (+) check-consumers + Casque / dual-seed / registerFromKit + CI kit-qa green.
- (+) Facing-wins adapter contract now executable; BRAND-RULES narrator gated.
- (+) Rediscovery added 8 SoT features without kit JSON churn.
- (−6) Residual: Apps UI out of scope; recipe runner later; banner/CSS sample risk; intensity enum waived as doc-only.

**Not 100%** — Apps UI / recipe runner remain out of scope by standing rules.

---

## Standing rules honored

- System graph connected; recipes later plate; Linear-minimal docs
- No merge PR #1 · no force-push · no unrelated kit JSON churn · never Casque as a name
- Docs preferred; waive over inventing constants
- Commit scope: `kit/qa/` (+ harness path) only

---

## Gates (copy/paste)

```bash
node kit/check-consumers.mjs && node kit/qa/run-tests.mjs
python3 scripts/sim-grid-habitat.py
```

All **PASS** at Phase 6 execution.
