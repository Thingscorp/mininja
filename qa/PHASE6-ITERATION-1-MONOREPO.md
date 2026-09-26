# Phase 6 — Iteration 1 rediscovery (monorepo)

| Field | Value |
|-------|-------|
| Date | 2026-09-25 22:14 EDT |
| Branch | `feat/monorepo-public` |
| Tip | `a34f103` |
| Prior matrix | **130** |
| Post matrix | **138** (+8 rediscovered) |
| Kit JSON mutated? | **No** |

## Coverage by surface

| Surface | Features (approx) | Confidence | Notes |
|---------|------------------:|------------|-------|
| **kit/** SoT | 51 | **High (~95%)** | +KIT-VAL-004 look-ahead closed-set |
| **adapters/** | 7 | **High (~90%)** | +ADP-MARK-003 facing-wins executable |
| **examples/** | 6 | **High (~88%)** | unchanged this pulse |
| **console/** kit-align + habitat | ~14 | **High (~90%)** | Apps fixed banner; +CON-BANNER-004 / CON-TOOL-004 |
| **console/** routes/boot/cmds/plugins/auth | ~45 | **Medium (~70%)** | source-level; Apps fixed UI/QA JSON |
| **console/** Linear visual | subset | **Med (~60%)** | Apps fixed error chrome; no new e2e |
| **bot/** API/CLI/engine | 8 | **High (~90%)** | Apps habitat parity + ZONES hydrate; +BOT-SHELL-001 |
| **bot/** UI grove | 2 | **High (~85%)** | kit stage ids hydrated |
| **scripts + CI** | 2 | **High (~90%)** | |
| **docs + assets** | 8 | **High (~88%)** | +DOC-TM/CHANGE/STYLE |

## Features Tested (this iteration)

Rediscovered Feature IDs: `KIT-VAL-004`, `CON-TOOL-004`, `CON-BANNER-004`, `DOC-TM-001`, `DOC-CHANGE-001`, `DOC-STYLE-001`, `BOT-SHELL-001`, `ADP-MARK-003`.

Executable suite: `qa/tests/phase6-rediscovery.test.mjs` (auto-loaded by `qa/tests/run-tests.mjs`).

Also re-executed full Phase 5 suite (129 kit + 22 monorepo).

## Defects Found / Fixed

| ID | Found? | Fixed? |
|----|--------|--------|
| New this iteration | **None** | — |
| Prior six Apps defects | Reconfirmed closed on `a34f103` | **Fixed** |

## Remaining Risks

- Console Vite unit/e2e still not run (deps absent) — medium residual on auth/plugins runtime.
- Bot product UI beyond kit-hydrate (Linear density) — Apps craft if regressions appear.
- Recipe runner runtime still later plate — seams kept in graph, not claimed complete product.

## Confidence by surface

See table above. **Overall exit: allowed** — no critical/high Apps-owned opens remain; regress green; rediscovery pulse complete (+8 features, 0 new defects).

## Phase 6 found new features?

**Yes — 8** (130 → 138).
