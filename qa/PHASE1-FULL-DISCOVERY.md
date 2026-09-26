# Phase 1 — Full monorepo feature discovery

| Field | Value |
|-------|-------|
| Date | 2026-09-25 (ET) |
| Branch | `feat/monorepo-public` |
| Tip at discovery start | `f93360d` (`git pull --ff-only` — already up to date) |
| Canonical matrix | [`qa/monorepo-feature-matrix.csv`](monorepo-feature-matrix.csv) |
| Kit-only prior | [`kit/qa/kit-feature-matrix.csv`](../kit/qa/kit-feature-matrix.csv) (absorbed as `KIT-*` rows) |
| Console prior | [`console/qa/feature-register.csv`](../console/qa/feature-register.csv) (Aug 17 — superseded for IDs; habitat cmds were missing) |
| Feature count | **130** (126 live · 3 retired · 1 deferred) |
| Kit JSON changed? | **No** |
| Console UI rewritten? | **No** (report-only; Apps/Linear owns craft) |
| Adapter APIs invented? | **No** (Ports owns craft) |
| PR #1 merged? | **No** |

---

## CoS guardrails honored

- Report-only + tests/docs defects
- No console UI rewrite · no invented adapter APIs
- Kit JSON SoT — no silent dual tables; prefer doc/consumer fixes
- `feat/monorepo-public` only · no force-push · no PR #1 merge
- Mascot unnamed (never Casque)
- Standing graph: **mark/faces ↔ habitat ↔ garden ↔ recipes** (recipes later-plate, not orphaned)
- Adapter defects → **Ports** · console/bot UI → **Apps**

---

## Coverage by module

| Module | Features | Notes |
|--------|----------|-------|
| **kit/** (SoT) | 43 (`KIT-MARK` 11 · `SCENE` 16 · `GARDEN` 3 · `RECIPE` 1 · `VAL` 3 · `VER` 1 · `DEP` 8) | Absorbed from kit Phase 1–6 matrix; check-consumers PASS on tip |
| **console/** | 59 | Routes, boot, banner/habitat, commands (incl. **scene/feel/do/go** missing from Aug register), plugins, auth, preview bridge, P2P lib, tooling, retired/deferred |
| **adapters/** | 6 | mark / ansi / react / presence + README — existing exports only |
| **examples/** | 6 | cli-banner, readme-badge, remix, react preview, presence preview, README |
| **bot/** | 9 | Launcher UI, CLI, REST/SSE API, engine parity, teammates, seed |
| **scripts/ + CI** | 2 | sim-grid-habitat · `.github/workflows/kit-qa.yml` |
| **Brand docs + assets** | 5 | README/BRAND/PORTING/system-graph narrators + `assets/visuals` |

### Console surfaces covered (live code)

- Routes: `/`, `/login`, `/api/auth/$`, document head, error screen
- `Mininja` boot, command input/chips, offline/wake/clear/unknown
- Builtins: help now todo plan look + **scene / feel / do / go**
- Habitat: `Banner` strip, walk/run/patrol, `scene.ts` `registerFromKit` / `SceneIntent`
- Plugins: pgeon refine turn save compound qa ralph brief + dispatch/stream
- Auth stack (env-only OAuth, gates, middleware, pglite/Postgres migrate)
- Preview host bridge · P2P library (unwired UI)
- Tooling: kit-align, brand-check, unit/e2e runners

### Still incomplete / watch items (do **not** claim 100% product QA)

These are **discovered** but need deeper Phase 2–3 executable coverage or owner follow-up — they are **not** undocumented:

1. **Bot static UI** (`bot/static/index.html` ~1k LOC) — feature rows exist; full Linear-bar visual pass + grove-id ↔ kit stage-id audit still open → Apps
2. **Bot ↔ console program parity** — engine.py vs plugins may drift; matrix notes parity defect path → Apps
3. **P2P `/api/rtc`** — library only; no console route yet (deferred product, not orphaned)
4. **console `plugins/qa/features.json`** — still mirrors Aug `Fnn` register; will drift from this monorepo matrix until Apps regenerates JSON (docs/tests fix preferred)
5. **Auth email/password + popup paths** — branched; need env-matrix tests before calling complete
6. **Multiplayer ICE failure modes** — library surface; not UI-tested
7. **Brand asset pixel audit** vs kit numbers — spot-check only in Phase 1
8. **Recipes runner** — intentionally later plate; vocabulary seams documented (`KIT-RECIPE-001`, `DOC-GRAPH-001`)

Phase 1 claims **every identifiable feature is in the spreadsheet**. It does **not** claim every feature is TESTED.

---

## System graph pulse

| Seam | Status |
|------|--------|
| mark/faces (`kit/mark.json` 15) | Covered `KIT-MARK-*` + adapter/examples consumers |
| habitat (`kit/scene.json` 7 stages · 16 emotions · 22 actions) | Covered `KIT-SCENE-*` + `CON-BANNER-*` + `CON-SCENE-*` |
| garden (growth 0..5, no GitHub bridge) | Covered `KIT-GARDEN-*` + `DOC-GRAPH-001` |
| recipes (later plate) | Covered `KIT-RECIPE-001` + RECIPES.md narrator — **not orphaned** |

`node kit/check-consumers.mjs` → **PASS** (mark v1.6.0 · scene v1.6.1 · console habitat aligned).

---

## Open defects / flags (report-only)

| ID | Owner | Sev | Summary |
|----|-------|-----|---------|
| DEFECT-CON-UI-001 | Apps/Linear | low | `AppErrorComponent` uses zinc tokens not Hubzz bg/fg |
| DEFECT-CON-DOC-001 | Apps | low | Root `og:type` is `website`; brand-check heuristic still speaks `x:game` for canvas apps — buddy may warn |
| DEFECT-CON-QA-001 | Apps | medium | `plugins/qa/features.json` / old `Fnn` register drift vs monorepo matrix |
| (kit) DEFECT-DOC-002/003 | Docs | low | Fixed in prior kit loops (HABITAT-PORT / CONSTRUCTION) — counted on `KIT-DEP-*` |
| Adapter craft gaps | Ports | — | None newly invented; facing-wins already on tip — retest in Phase 2 suites |

No kit JSON churn proposed. No console UI rewrite proposed.

---

## Iteration coverage pulse

| Area | Phase 1 documented? | Open defects flagged? |
|------|---------------------|------------------------|
| kit | yes (43) | prior DOC fixed; SoT held |
| adapters | yes (6) | → Ports if Phase 2 fails facing/presence |
| examples | yes (6) | none yet |
| console | yes (59) | UI-001, DOC-001, QA-001 → Apps |
| bot | yes (9) | parity/grove audit → Apps |

---

## Exit criteria

- [x] Entire tree scoped (kit · adapters · examples · console · bot · scripts/CI · brand docs)
- [x] One canonical CSV with exact columns
- [x] Every identifiable user-facing feature / workflow / screen / API / config / business process rowed
- [x] Incomplete areas listed explicitly (no false “complete QA” claim)
- [x] Recipes kept on graph
