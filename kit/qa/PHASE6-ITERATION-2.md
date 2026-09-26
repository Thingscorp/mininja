# Phase 6 — Kit recursive QA (iteration 2 rediscovery + regress)

| Field | Value |
|-------|-------|
| Date | 2026-09-25 (ET) |
| Branch | `feat/monorepo-public` |
| Tip after `git pull --ff-only` | `d5c72b7` (ff included README mp4-embed drop atop prior Phase 6 `e48672e`) |
| Kit versions | mark **1.6.0** · scene **1.6.1** |
| Kit JSON mutated? | **No** |
| PR #1 merged? | **No** |
| Force-push? | **No** |
| New feature count | **6** (37 → **43**) |
| Runner | `node kit/qa/run-tests.mjs` |

---

## Coverage Summary

| Metric | Count |
|--------|------:|
| Features in matrix (pre / at e48672e) | 37 |
| Features rediscovered (new) | 6 |
| Features in matrix (post) | **43** |
| Features tested this loop | **43** |
| Test cases (pre) | 111 |
| Test cases added | 18 |
| Test cases executed | **129** |
| Passed | **129** |
| Failed | **0** |
| check-consumers | **PASS** |
| sim-grid-habitat | **PASS** (pass=195 hard_fail=0 soft_fail=0; Monte Carlo ok) |
| CI workflow `.github/workflows/kit-qa.yml` | **unchanged / still valid** |

Scope of score: **kit SoT only** (`kit/mark.json`, `kit/scene.json`, `kit/check-consumers.mjs`, brand narrators, thin adapter contracts, kit-qa CI). **Not** Apps UI / `register*` screens / recipe runner runtime.

---

## Features Tested

### Prior matrix (regress — all green)
`KIT-MARK-001`…`010`, `KIT-SCENE-001`…`014`, `KIT-GARDEN-001`…`003`, `KIT-RECIPE-001`, `KIT-VAL-001`…`003`, `KIT-VER-001`, `KIT-DEP-001`…`005`.

### Rediscovered this loop (new Feature IDs)

| Feature ID | Name | Why it was missing |
|------------|------|--------------------|
| `KIT-SCENE-015` | Geometry formula object SoT | `geometry.formula` strings present; stage x/center tested under SCENE-006 but formula object never matrixed |
| `KIT-SCENE-016` | Motion derived timing identities | sim-grid locked patrolSpan / adjacent / fullPatrol; kit/qa had no executable feature |
| `KIT-MARK-011` | Face eyes slot embedded in lines | CONSTRUCTION eye-slot rule; faces.eyes vs lines[1] parity never asserted |
| `KIT-DEP-006` | CONSTRUCTION.md narration contract | Omitted from DEP-003 narrator list (like BRAND-RULES before) |
| `KIT-DEP-007` | kit/README.md SoT narration | In ID-VOCAB narrators; never matrixed as DEP feature |
| `KIT-DEP-008` | HABITAT-PORT SoT currency | Stale port note claimed dual STAGE_SEED + v1.5.0 |

Executable suite added: `kit/qa/tests/phase6-iteration-2.test.mjs` (auto-loaded by `run-tests.mjs`).

---

## Defects Found

| ID | Severity | Summary | Disposition |
|----|----------|---------|-------------|
| DEFECT-DOC-002 | low | HABITAT-PORT claimed `console` STAGE_SEED dual table + stale kit v1.5.0 | **Fixed** (doc-only) |
| DEFECT-DOC-003 | low | CONSTRUCTION narrated kit numbers without `kit/mark.json` pointer | **Fixed** (doc-only Related link) |

Prior `DEFECT-DOC-001` remains **Fixed**. No kit JSON churn.

### Waived (prefer note over inventing constants)

| Topic | Note |
|-------|------|
| SceneIntent `intensity` ∈ `{0,1,2}` | Still host-doc-only (TERMINAL-MOTION); not lifted into kit |
| Auto-blink 6–14s | STYLEGUIDE host guidance only |
| TRADEMARK.md kit pointer | Ownership prose aligned with `mark.owner`; Linear-minimal — not matrixed this loop |
| Apps UI / recipe runner | Out of scope; seams connected (`KIT-RECIPE-001`) |

---

## Defects Fixed

1. **DEFECT-DOC-002** — `HABITAT-PORT.md`: prior-suite column renamed; monorepo row now `registerFromKit` / no dual seed; SoT cites live scene **1.6.1** (or kit file); alignment gate notes STAGE_SEED forbid.
2. **DEFECT-DOC-003** — `CONSTRUCTION.md` Related: added `[kit/mark.json](kit/mark.json)` machine SoT pointer.

---

## Remaining Risks

1. **Apps UI / `register*` screens** — consumer contract tested; implementation UX owned by Mininja Apps.
2. **Recipe runner runtime** — later plate; vocabulary seams asserted, no runner under `kit/`.
3. **Console banner literals** — `check-consumers` patterns can miss novel inline forks outside known regexes.
4. **Presence CSS** — motion ids sampled from `data-motion="…"` literals, not full CSSOM exhaust.
5. **Intensity enum** — host-doc-only; future CoS may lift `{0,1,2}` into kit (not done).
6. **Saturation** — remaining brand prose (TRADEMARK, asset READMEs) is thin; further loops likely yield doc polish over new SoT seams.

---

## Confidence Score (kit SoT only)

**96 / 100**

Rationale:

- (+) Prior Phase 6 closed catalogs + deep emotion/action schema still green (111→129).
- (+) Geometry formula object + motion derived timings now executable in kit/qa **and** sim-grid (195).
- (+) Face eyes↔lines slot parity locks “glyphs ARE the mark.”
- (+) CONSTRUCTION + kit/README + HABITAT-PORT narrators gated; two stale-doc defects fixed without kit JSON churn.
- (+) check-consumers + CI kit-qa path unchanged and green.
- (−4) Residual: Apps UI / recipe runner out of scope; banner/CSS sample risk; intensity waived; TRADEMARK thin.

**Not 100%** — Apps UI / recipe runner remain out of scope by standing rules.

---

## Standing rules honored

- System graph connected; recipes later plate; Linear-minimal docs
- No merge PR #1 · no force-push · no unrelated kit JSON churn · never Casque as a name
- Docs preferred; waive over inventing constants
- Commit scope: `kit/qa/` + smallest narrator doc fixes (`CONSTRUCTION.md`, `HABITAT-PORT.md`)
- No mp4 deleted by this loop. None under `kit/` or local brand assets. README front-page GitHub user-attachments glimpse URL already removed at `d5c72b7` (parent); URL was `https://github.com/user-attachments/assets/76965444-03ec-45f8-9dd7-a37f9d35fb0f` — not a repo file

---

## Gates (copy/paste)

```bash
node kit/check-consumers.mjs && node kit/qa/run-tests.mjs
python3 scripts/sim-grid-habitat.py
```

All **PASS** at Phase 6 iteration 2 execution.
