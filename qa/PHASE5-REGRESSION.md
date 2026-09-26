# Phase 5 — Regression (monorepo QA)

| Field | Value |
|-------|-------|
| Date | 2026-09-25 22:14 EDT |
| Branch | `feat/monorepo-public` |
| Tip | `a34f103` |
| Apps tip claimed | `a34f103` (all 6 defects closed) |

## Commands

```
git pull --ff-only
node kit/check-consumers.mjs
node console/scripts/kit-align.mjs
node --test console/scripts/brand-check.test.mjs
node kit/qa/run-tests.mjs
node qa/tests/run-tests.mjs
python3 scripts/sim-grid-habitat.py
```

## Results

| Runner | Result |
|--------|--------|
| `kit/check-consumers.mjs` | **OK** (look-ahead closed-set green) |
| `console/scripts/kit-align.mjs` | **OK** |
| `brand-check.test.mjs` | **14 pass / 0 fail** |
| `kit/qa/run-tests.mjs` | **129 pass / 0 fail** |
| `qa/tests/run-tests.mjs` | **22 pass / 0 fail** (incl. Phase 6 rediscovery) |
| `sim-grid-habitat.py` | **locked · hard_fail=0 · pass=195** |

## Defects after regress

| Metric | Count |
|--------|------:|
| Open / Open-Apps | **0** |
| Fixed | **6** |

All six Apps-owned closures verified green. Matrix defect counts zeroed for affected features. Exit **not** blocked on Apps.

## Artifacts touched

- `qa/defects.csv` — Status=Fixed for all six; tip note `a34f103`
- `qa/monorepo-feature-matrix.csv` — defect counts + Phase 6 rows
- `qa/monorepo-test-cases.csv` — Phase 6 cases
- `kit/check-consumers.mjs` — look-ahead closed-set
- `HABITAT-PORT.md` — banner dual-table row
