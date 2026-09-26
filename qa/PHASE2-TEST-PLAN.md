# Phase 2 — Monorepo test plan stubs

| Field | Value |
|-------|-------|
| Date | 2026-09-25 (ET) |
| Branch | `feat/monorepo-public` |
| Depends on | [`PHASE1-FULL-DISCOVERY.md`](PHASE1-FULL-DISCOVERY.md) · [`monorepo-feature-matrix.csv`](monorepo-feature-matrix.csv) |
| Rule | Report-only + tests/docs. No console UI rewrite. No invented adapter APIs. Kit JSON held. |

Every live matrix row already carries at least one **SUITE-*** plan in the `Test Cases` column. This doc organizes execution order and points at runners.

---

## Suite catalog (by module)

### kit/ — SoT (highest priority; already executable)

| Suite | Features | Runner |
|-------|----------|--------|
| SUITE-KIT-* (all `TC-KIT-*`) | `KIT-MARK/SCENE/GARDEN/RECIPE/VAL/VER/DEP-*` | `node kit/qa/run-tests.mjs` (129 PASS on tip) |
| check-consumers | `KIT-VAL-001` | `node kit/check-consumers.mjs` |
| sim-grid | `KIT-VAL-002` / `SCR-SIM-001` | `python3 scripts/sim-grid-habitat.py` |
| CI | `KIT-VAL-003` / `CI-KIT-001` | `.github/workflows/kit-qa.yml` |

### adapters/ — Ports craft (retest; do not invent APIs)

| Suite | Features | Plan |
|-------|----------|------|
| SUITE-ADP-MARK-001 | facing-wins, unknown→idle, deep mergeMark | `qa/tests/adapters-mark.test.mjs` |
| SUITE-ADP-ANSI-001 | tone ANSI, plain, facing | extend mark suite or ansi file |
| SUITE-ADP-REACT-001 | DOM attr contract via examples/react/preview.mjs stdout | `qa/tests/adapters-react-preview.test.mjs` |
| SUITE-ADP-PRES-001 | presenceAttrs + truncation + css ⊂ actions | `qa/tests/adapters-presence.test.mjs` |
| SUITE-ADP-DOC-001 | README kit pointers / no Casque | grep assertion in monorepo-docs.test.mjs |

Failures → **Ports** (craft), not Apps.

### examples/ — stranger path

| Suite | Features | Plan |
|-------|----------|------|
| SUITE-EX-CLI-001 | cli-banner idle / --list / facing | `qa/tests/examples-cli.test.mjs` |
| SUITE-EX-REMIX-001 | wink overlay derives lines | shell `print-face.mjs` |
| SUITE-EX-REACT-001 | preview attrs | shared with ADP-REACT |
| SUITE-EX-PRES-001 | slots + chip + roster | `preview.mjs --list-actions` |
| SUITE-EX-BADGE-001 / EX-DOC-001 | badge + README | docs grep |

### console/ — Apps (source + unit; no UI rewrite)

| Suite | Features | Plan |
|-------|----------|------|
| SUITE-CON-SCENE-005 | registerFromKit / no dual seed / no Casque | `console/scripts/kit-align.mjs` + `qa/tests/console-kit-align.test.mjs` |
| SUITE-CON-SCENE-001..004 | scene/feel/do/go | `console` unit via existing `src/lib/*.test.ts` when deps installed; stub asserts cardFor verbs in source |
| SUITE-CON-BANNER-002 | walk/run 170/280 | source assert vs kit motion (kit-align sibling) |
| SUITE-CON-PLUG-* | plugin verbs | existing `src/plugins/**/*.test.ts` |
| SUITE-CON-AUTH-* | env branches | source/contract tests only in Phase 2 |
| SUITE-CON-ROUTE / UI | Linear-bar visual | Phase 3+ manual / e2e — **Apps** |
| SUITE-CON-MP-001 | P2P lib constructs | light import test when deps present |

UI defects → **Apps/Linear**. Do not patch JSX in this QA loop.

### bot/ — Apps

| Suite | Features | Plan |
|-------|----------|------|
| SUITE-BOT-API-001 | health/cmd/CRUD | `qa/tests/bot-api-smoke.test.mjs` (spawn server or dry import) |
| SUITE-BOT-CLI-001 | cmd/tint/check | scripts/cmd-smoke.py |
| SUITE-BOT-ENG-001 | program parity list | compare engine is_command set vs console help rows |
| SUITE-BOT-UI-* | Linear-bar | Phase 3 manual → Apps |
| SUITE-BOT-TEAM-* | local/remote env gate | unit with env cleared |

### scripts / docs

| Suite | Features | Plan |
|-------|----------|------|
| SUITE-SCR-SIM-001 | report ↔ kit | parse report JSON |
| SUITE-DOC-* | narrators | `qa/tests/monorepo-docs.test.mjs` |
| SUITE-CI-KIT-001 | workflow file | YAML step assert |

---

## Execution order (Phase 2 → 3)

1. Kit SoT gate (already green)
2. Adapters facing/presence (Ports risk)
3. Console kit-align + scene command source contracts (Apps risk without UI touch)
4. Examples stranger path
5. Bot API/CLI smoke
6. Docs/system-graph grep
7. Phase 3: run suites, log defects to `qa/defects.csv` (create when first fail)

---

## Phase 2 started artifacts

| Path | Role |
|------|------|
| `qa/tests/run-tests.mjs` | Monorepo Phase 2 runner (adapters/console-align/docs/examples) |
| `qa/tests/adapters-mark.test.mjs` | SUITE-ADP-MARK-001 |
| `qa/tests/adapters-presence.test.mjs` | SUITE-ADP-PRES-001 |
| `qa/tests/console-kit-align.test.mjs` | SUITE-CON-SCENE-005 / CON-TOOL-001 |
| `qa/tests/monorepo-docs.test.mjs` | SUITE-DOC-* / system graph |
| `qa/tests/examples-cli.test.mjs` | SUITE-EX-CLI-001 |

---

## Out of scope for Phase 2 executables

- Rewriting `console/src/components/*` or `bot/static/index.html`
- New adapter public exports
- Kit JSON edits
- Merging PR #1
