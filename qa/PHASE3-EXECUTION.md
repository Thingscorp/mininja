# Phase 3 — Monorepo QA execution

| Field | Value |
|-------|-------|
| Date | 2026-09-25 (ET) |
| Branch | `feat/monorepo-public` |
| Tip at Phase 2 start | `23d4465` (`git pull --ff-only` — already up to date) |
| Tip after this commit | _(see git log — this commit)_ |
| Kit versions | mark **1.6.0** · scene **1.6.1** |
| Kit JSON mutated? | **No** |
| Console UI rewritten? | **No** (report-only; Apps/Linear owns craft) |
| Adapter APIs invented? | **No** (Ports owns craft) |
| PR #1 merged? | **No** |
| Runners | `node kit/qa/run-tests.mjs` · `node qa/tests/run-tests.mjs` · `node kit/check-consumers.mjs` · `python3 scripts/sim-grid-habitat.py` |

---

## CoS guardrails honored

1. Report-only + tests/docs defects — no console UI rewrite; no invented adapter APIs
2. Kit JSON SoT — no silent dual tables; dual-table findings logged as consumer defects
3. Stayed on `feat/monorepo-public`; no merge of PR #1
4. Pulse coverage by kit / adapters / examples / console / bot + open defects
5. Adapter craft → **Ports** (agent `092fe5be-3a2a-4828-9855-bbbb8f1dabc4` — executor cannot `SendToAgent`; **parent must flag Ports**). Console/bot UI → **Apps** (Notes in `qa/defects.csv`)

---

## Counts

| Metric | Count |
|--------|------:|
| Features in matrix | **130** (126 live · 3 retired · 1 deferred) |
| Features Tested (Phase 3) | **126** live |
| Deferred (documented) | **1** (`CON-MP-001` P2P lib / no `/api/rtc` route) |
| Retired | **3** |
| Test cases in `qa/monorepo-test-cases.csv` | **368** |
| Test cases Passed | **361** |
| Test cases Failed (known defects) | **6** |
| Test cases Deferred | **1** |
| `kit/qa` executable | **129 PASS / 0 FAIL** |
| `qa/tests` executable suites | **21 PASS / 0 FAIL** |
| `kit/check-consumers` | **OK** |
| `sim-grid-habitat` | **locked · hard_fail=0** |
| Open defects (`qa/defects.csv`) | **6** |

---

## Coverage by surface (confidence)

Confidence is **per surface**, not one hedged kit-only percentage.

| Surface | Features | Executable evidence | Confidence | Notes |
|---------|---------:|---------------------|------------|-------|
| **kit/** SoT | 43 | 129 kit QA + check-consumers + sim-grid | **High (~95%)** | JSON unchanged; formulas locked |
| **adapters/** | 6 | mark/ansi/react-preview/presence/docs suites | **High (~90%)** | Existing exports only; Ports owns craft. **No adapter defects this pass.** Parent: flag Ports only if future craft fails. |
| **examples/** | 6 | cli-banner / remix / react preview / presence / badge / README | **High (~88%)** | Stranger path green |
| **console/** kit-align + habitat cmds | ~10 | kit-align + scene/feel/do/go source + banner speeds | **High (~85%)** | Speeds 170/280/26 match kit; look-ahead drift = DEFECT-CON-BANNER-002 |
| **console/** routes/boot/cmds/plugins/auth | ~45 | Source-level / script / static analysis (no Selenium; no `node_modules` unit run) | **Medium (~65%)** | Contracts asserted in source; full Vite unit/e2e not run this pass (deps absent). Linear-bar visual → Apps |
| **console/** UI visual (Linear bar) | (subset) | Source tokens + known error-screen drift | **Low–Med (~45%)** | DEFECT-CON-UI-001 open; no chrome e2e invented |
| **bot/** API/CLI/engine/seed | 6 | Live HTTP smoke on ephemeral server + cmd/tint + engine parse | **High (~85%)** | Health/cmd/CRUD bots green |
| **bot/** UI grove + engine parity | 3 | Static HTML ZONES audit + COMMANDS vs console | **Med (~60%)** | DEFECT-BOT-UI-002 + DEFECT-BOT-ENG-001 open → Apps |
| **scripts + CI** | 2 | sim-grid + workflow YAML | **High (~90%)** | |
| **docs + assets** | 5 | narrator grep + asset presence | **High (~85%)** | Spot-check assets vs kit grid; pixel audit not exhaustive |

**Do not claim Phase 6 complete.** Phase 3 executed expanded suites and logged defects; deeper console unit/e2e (after `npm ci`) and Linear-bar visual pass remain Apps follow-ups.

---

## Pulse — system graph

| Seam | Status |
|------|--------|
| mark/faces | Kit Tested + adapters/examples green |
| habitat (stages/emotions/actions/motion) | Kit Tested; console registerFromKit aligned; bot ZONES **fork** (defect) |
| garden | Kit + GARDEN.md + sim-grid |
| recipes | Later plate; RECIPES.md seams kept — not orphaned |

---

## Defects found / reconfirmed

| Defect ID | Feature | Severity | Owner | Summary |
|-----------|---------|----------|-------|---------|
| DEFECT-CON-UI-001 | CON-ROUTE-005 | low | Apps/Linear | Error screen zinc utilities vs Hubzz tokens |
| DEFECT-CON-DOC-001 | CON-ROUTE-004 | low | Apps | brand-check still emphasizes `og:type x:game` (buddy uses `website`) |
| DEFECT-CON-QA-001 | CON-PLUG-007 | medium | Apps | `plugins/qa/features.json` still Aug `Fnn` register vs monorepo matrix |
| DEFECT-BOT-ENG-001 | BOT-ENG-001 | medium | Apps | Bot `COMMANDS` omit `scene`/`feel`/`do`/`go` (console habitat parity gap) |
| DEFECT-BOT-UI-002 | BOT-UI-002 | medium | Apps | Bot `ZONES` dual table (`watch/roost/desk/forge/loop/board`) ≠ kit stage ids |
| DEFECT-CON-BANNER-002 | CON-BANNER-002 | low | Apps/Linear | Camera look-ahead hardcoded `0.35` vs kit `0.32`/`0.52` (speeds OK) |

### Parent handoff

- **Ports** (`092fe5be-3a2a-4828-9855-bbbb8f1dabc4`): no adapter defects this pass; still own facing-wins / presence craft if regressions appear. Executor cannot `SendToAgent`.
- **Apps**: own all six open defects above (UI + bot parity + QA JSON regenerate). Prefer docs/tests/consumer fixes; **do not** edit kit JSON for dual-table fixes.

---

## Suites executed (`qa/tests/`)

```
adapters-ansi.test.mjs
adapters-docs.test.mjs
adapters-mark-lockup.test.mjs
adapters-mark.test.mjs
adapters-presence.test.mjs
adapters-react-preview.test.mjs
bot-api-smoke.test.mjs
bot-cli-engine.test.mjs
bot-team-source.test.mjs
bot-ui-source.test.mjs
console-kit-align.test.mjs
console-plugins-auth.test.mjs
console-scene-banner.test.mjs
console-source-contracts.test.mjs
docs-assets.test.mjs
examples-badge-docs.test.mjs
examples-cli.test.mjs
examples-presence.test.mjs
examples-remix.test.mjs
monorepo-docs.test.mjs
scripts-sim-ci.test.mjs
```

Result: **21 passed, 0 failed**.

---

## Artifacts

| Path | Role |
|------|------|
| `qa/monorepo-feature-matrix.csv` | Status + defect counts + Last Tested Date |
| `qa/monorepo-test-cases.csv` | Phase 2 expanded scenarios + Phase 3 results |
| `qa/defects.csv` | Open defects |
| `qa/PHASE2-TEST-PLAN.md` | Suite catalog (prior) |
| `qa/PHASE3-EXECUTION.md` | This report |
| `qa/tests/*` | Executable monorepo suites |

---

## Out of scope (unchanged)

- Rewriting `console/src/components/*` or `bot/static/index.html`
- New adapter public exports
- Kit JSON edits
- Merging PR #1
- Claiming Phase 6 complete
