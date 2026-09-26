# Old console / bot — carry-over inventory (Mininja Kit)

**Audience:** Russ / Apps (console+bot UI) / Kit (mark+scene SoT only).  
**Date:** 2026-09-26 (ET).  
**Scope:** Inventory + ownership (historical). **No kit JSON edits.** Bot `@` / rally / retarget rows updated 2026-09-26 — see [`OCCAM-UNIX-APPS.md`](OCCAM-UNIX-APPS.md).

Product vocabulary: **pals** = agent creatures ([`GLANCE.md`](../GLANCE.md)). Habitat = glance / rubber-duck strip. Kit = `mark.json` + `scene.json`. Console/bot = Mininja Apps.

---

## Repo identity

| Source | Remote | Tip used | Notes |
|--------|--------|----------|-------|
| **Primary old console** | https://github.com/Thingscorp/mininja-console | Local `/workspace/mininja-console` @ **`da272c1`** (`feat/casque-scene-suite`) | Scene-driven banner landed here. Remote `HEAD` → `ralph/loop-install` @ **`adf769d`** (docs-only host-attach draft after scene tip). |
| Audit console clone | same | `/workspace/_audit-mininja-console` (same tree family) | Used for scrub notes in [`/_audit-mininja-FINDINGS.md`](../../_audit-mininja-FINDINGS.md) |
| **Old bot** | https://github.com/Thingscorp/mininja-bot | Audit tip **`7b16764`** (`main`); monorepo `bot/` is the cleaned + evolved copy | Meaningful commit: `1080b4b` *feat: mininja console plus named teammates* |
| **Target monorepo** | https://github.com/Thingscorp/mininja | branch `feat/monorepo-public` | Habitat port note: [`HABITAT-PORT.md`](../HABITAT-PORT.md) |

### Last meaningful old-console commits (`da272c1` line)

| SHA | Summary |
|-----|---------|
| `da272c1` | Expand Casque into a scene-driven side-scroller banner |
| `b60519b` | feat: mininja console (terminal buddy + programs) |
| `903d169` | brief compiles fact / source / open loop |
| `c08c710` / `d3b4ff2` | turn reads the stream |
| `2864196` | install Ralph loop |

---

## Architecture map (old suite → one screen)

```
┌─────────────────────────────────────────────────────────────────┐
│  mininja-console (React / TanStack Start)                       │
│  ┌─ Banner (scene strip) ─┐  ┌─ optional Pigeon / refine flag ─┐ │
│  └────────────────────────┘  └─────────────────────────────────┘ │
│  message log (cmd ❯ / out cards)                                 │
│  ❯ command composer  ← programs only (now todo plan …)           │
│  NO multi-pal · NO @-mention · NO teammate roster                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  mininja-bot (Python HTTP + static/index.html)  ← multi-pal home │
│  world-grove (ASCII trees per kit stage) + walker lockup         │
│  aside: console | bot₁…botₙ (tint by name) · new bot · ⌘N        │
│  log (console cards OR per-bot messages)                         │
│  #composer textarea → selected target (console shell OR /tasks)  │
│  stop / edit / delete · routines · permission mode · computer    │
└─────────────────────────────────────────────────────────────────┘

Shared program brain (ported twice): cardFor / engine plugins
  now · todo · plan · brief · pgeon · refine · turn · save ·
  compound · qa · ralph · scene/feel/do/go · offline/wake/clear
```

**Critical finding (updated 2026-09-26 ET):** Russ’s “text composer to `@` any agent anytime” is **shipped on monorepo bot** (`parseMention`, autocomplete, `@all` rally, `@console` programs — see [`seams/04-bot-host.md`](seams/04-bot-host.md)). React `console/` remains programs-only (single unnamed buddy). Old-suite history below still describes pre-monorepo bot (sidebar-select only). Prefer seams 03/04 over GAP rows marked **STALE**.

---

## MUST carry (product behaviors)

Concrete evidence paths. Essence only — not every file.

### 1. Composer / targeting agents — **P0**

| Behavior | Where it lived | Shape / notes |
|----------|----------------|---------------|
| **Command composer (programs)** | Old: `src/components/mininja.tsx` (`aria-label="command"`, `run()`, `START` chips). Bot: `#composer` / `#task` / `#taskForm` in `bot/static/index.html` | Trim → dispatch; empty no-op; Enter send; console chips for verbs. |
| **Teammate composer (tasks)** | `bot/static/index.html` `runLine()` → `POST /api/bots/:id/tasks` `{ text }` | Placeholder *“a task for {name}”* when a bot is selected. |
| **Target = selected pal** | Bot sidebar `.bots` + `selected` (`"console"` \| bot id) | Sidebar remains **fallback**. Monorepo bot also ships `@Name` / `@all` / `@console` in the same mouth. |
| **Pull-off job** | `stop` button → `POST /api/bots/:id/stop` → `stop_bot()` (`bot/server.py`) | SIGTERM process group / cloud stop. Closest shipped “pull off.” |
| **Refuse double-assign** | `start_task`: if `bot_id in RUNS` → `"already working"` | No silent retarget mid-flight. |
| **Parallel cap** | `MAX_PARALLEL = 4` in `bot/server.py` | At most 4 working bots. |
| **Assign loops (routines)** | Bot create/edit dialog → `routine: { enabled, interval_minutes, prompt }` | Scheduler thread fires `start_task` on interval. |
| **Permission modes** | Bot `mode`: `draft` \| `auto` \| `free` → CLI flags (`--tools` draft / `--permission-mode auto` / `--always-approve`) | Fail-closed posture is product, not kit. |
| **Rally-all / emergency blast** | Monorepo bot: `POST /api/rally` + `#rallyAll` + `@all …` | **Shipped on bot** (2026-09-26). Console still missing. Old GAP “not implemented” = **STALE** for bot. |
| **@-mention syntax** | Monorepo bot: `parseMention` + mention menu | **Shipped on bot**. Console still missing. Old GAP = **STALE** for bot. |

### 2. Pals / bots / agents model — **P1**

| Field | Shape (bot `new_bot` / `public_state`) |
|-------|----------------------------------------|
| Identity | `id` (uuid), `name`, `job`, `description`, `created_at` |
| Runtime | `computer`: `local` \| `remote` \| `codex`; `cwd`; `model`; `mode` |
| Session | `session_id`, `session_ready`, `session_computer` |
| Status | `status`, `working` (derived), `last_error`, `pinned` |
| Routine | `routine` or `null` |
| **Tint** | Computed: `console/tint.py` / `bot/console/tint.py` — `sha256(name) → 20 even hues → #rrggbb`; steel `#8a8f98` for console / empty. Applied to lockup + name when selected (`paintIdentity`, `selectedTint`). |
| Messages | `messages[bot_id]: [{ role, text, streaming?, status?, tools? }]` capped |

**Multi-pal color = Apps host chrome** ([`GLANCE.md`](../GLANCE.md) / [`NORTH-STAR.md`](../NORTH-STAR.md)). **MUST NOT** bake pal colors / agent ids into kit.

### 3. Habitat / grove / scenery / motion

| Piece | Old | Monorepo |
|-------|-----|----------|
| 7 stages + props + registers | Old `src/lib/scene.ts` **`STAGE_SEED` / `EMOTION_SEED` / `ACTION_SEED`** dual tables; banner `src/components/banner.tsx` | **Already:** `kit/scene.json` + `console/src/lib/scene.ts` `registerFromKit()` — see [`HABITAT-PORT.md`](../HABITAT-PORT.md) |
| Bot grove strip | `bot/static/index.html` `.world-grove` / `paintTree` / `goPlace` / `CMD_STAGE` | **Already:** kit-hydrate `ZONES` via `/kit/scene.json` (no dual stage list) |
| Camera / speeds | Banner look-ahead / walk-run | Kit geometry + motion; `check-consumers` forbids dual seeds |

### 4. Faces / mascot

| Piece | Old | Carry essence |
|-------|-----|---------------|
| Frame table | `src/lib/mascot.ts` `FRAMES` / `MascotState` (comment said **Casque**) | Kit `mark.json` faces + `legacyFaceBridge`; console `mascot.ts` now kit-aligned (`sandboxing` not `sandbox`) |
| Bot inline FRAMES | `bot/static/index.html` — idle **on-ramp** + `hydrateMark` / `framesFromKit` from `/kit/mark.json`; host `sandbox`↔`sandboxing` alias only | **Lean:** no full glyph dual table; do not invent face ids |
| After-command mood | `afterCommand` / `intentFromCommand` | Host chrome mapping; kit owns face/emotion/action ids |

### 5. Garden / plants / growth

| Piece | Status |
|-------|--------|
| Kit `repoBranch` + growth **0..5** | SoT in `kit/scene.json` → `garden`; narrated in [`GARDEN.md`](../GARDEN.md) |
| Old React console | Prop kind in scene types (monorepo); no live multi-repo plant UI beyond habitat props |
| Bot grove trees | **Stage** silhouettes (one tree per stage), **not** `repoBranch` plants — do not confuse with garden |

Pal↔plant interaction (one pal on one plant, multi-pal color) is **design** in GLANCE — **not** shipped as concurrent sprites in old React console.

### 6. Messages, routines, tasks (now/todo/plan), gates, permissions

| Surface | Paths |
|---------|-------|
| now / todo / plan / gantt | `src/lib/mininja.ts` `cardFor`; `src/lib/blockers.ts` `BLOCKERS` + `schedule()`; `src/components/gantt.tsx` |
| Stream compounding | `src/lib/stream.ts` (`write` / `keep` / `sN`); plugins `turn` / `save` / `pgeon ask s1` |
| Plugins | `src/plugins/{pgeon,refine,compound,qa,turn,save,ralph,brief}/` |
| Bot durable console log | `bot/console/store.py` (`apply`, log cap 400) |
| Bot teammate messages | `bot/server.py` `append_message` / SSE `/api/events` |
| Auth gates (React) | `src/lib/auth/gates.tsx` `SignedIn` / `SignedOut` / `RedirectToSignIn` — optional Better Auth |
| Permission gates (teammates) | Bot `mode` + grok CLI flags (above) |
| Ralph gate | `.ralph/items.json` + `scripts/check.sh` (host-attach; personal state scrubbed from public) |

### 7. Auth, storage, IPC, server

| Piece | Old | Carry? |
|-------|-----|--------|
| Better Auth + PGLite/Neon | `src/lib/auth/*`, `migrations/0001_auth.sql`, `src/lib/db.ts` | Optional Apps infra — scrub preview secret (env-only). |
| Bot state JSON | `~/Library/Application Support/…` or `MININJA_DATA` | Keep env-driven paths; no hardcoded `/home/russ`. |
| SSE | `GET /api/events` | Keep for live teammate streaming. |
| Multiplayer P2P | `src/lib/multiplayer/p2p.ts` | Scaffold only — **low priority**; not pal product. |
| Grok PWA middleware | `server/middleware/grok-pwa.ts`, `scripts/grok-pwa-*` | **MUST NOT** (platform chrome). |

### 8. QA / tests that encode product intent

| Artifact | Intent locked |
|----------|---------------|
| Old `qa/feature-register.csv` + `src/plugins/qa/features.json` | F01–F41 terminal programs, offline/wake, pgeon/refine/turn/save/ralph/brief |
| Old `qa/e2e.mjs` | Theme, lockup, command chips, boot |
| Monorepo `qa/monorepo-feature-matrix.csv` | BOT-UI / BOT-TEAM / habitat / kit graph |
| `qa/tests/bot-ui-source.test.mjs` | Composer + grove + kit hydrate + no Casque + teammate affordances |
| `qa/tests/bot-team-source.test.mjs` | `/api/bots`, start/stop, SSE, no hardcoded secrets |
| `qa/tests/bot-api-smoke.test.mjs` | Live create/delete bot + HTML has composer/grove |
| `qa/simulations/` | Glance ranks ↔ kit posture (design lock) |

### 9. Brand / docs worth preserving

Already in monorepo root (keep as SoT narration — invent **no** kit constants):

- [`NORTH-STAR.md`](../NORTH-STAR.md) · [`GLANCE.md`](../GLANCE.md) · [`GARDEN.md`](../GARDEN.md) · [`SCENERY.md`](../SCENERY.md) · [`STYLEGUIDE.md`](../STYLEGUIDE.md) · [`PORTING.md`](../PORTING.md) · [`HABITAT-PORT.md`](../HABITAT-PORT.md) · [`BRAND.md`](../BRAND.md) / rules / trademark  
- Kit: `kit/mark.json`, `kit/scene.json`, `kit/check-consumers.mjs`  
- Presence roster craft (host copy only): `adapters/presence/`, `examples/presence/`

---

## ALREADY in monorepo

| Behavior | Paths |
|----------|-------|
| React terminal buddy + programs | `console/src/components/mininja.tsx`, `console/src/lib/mininja.ts`, `console/src/plugins/*` |
| Habitat strip from kit (no STAGE_SEED) | `console/src/lib/scene.ts` `registerFromKit`, `console/src/components/banner.tsx` |
| Scrubbed mascot (unnamed; `sandboxing`) | `console/src/lib/mascot.ts` |
| Bot launcher + teammates CRUD/tasks/stop/SSE | `bot/server.py`, `bot/static/index.html` |
| Name→tint | `bot/console/tint.py`, `bot/scripts/tint.py` |
| Kit-hydrate bot grove | `bot/static/index.html` `hydrateZones` / `zonesFromKit`; `/kit/` static serve |
| Habitat + scene/feel/do/go parity in bot engine | `bot/console/engine.py` (post-port fixes) |
| Auth stack (scrubbed preview secret path) | `console/src/lib/auth/*` |
| Brand + glance + garden docs | repo root `*.md` |
| QA matrix locking bot composer/grove/team | `qa/tests/bot-*.test.mjs`, `qa/monorepo-feature-matrix.csv` |

---

## GAP / still needed (prioritized)

| Pri | Gap | Evidence | Apps vs Kit |
|-----|-----|----------|-------------|
| **P0** | **Composer `@`-mention** — type `@Ada` (or `@all`) anytime; autocomplete roster | **Bot shipped** (`parseMention`, menu). **Console missing.** Old “not in bot” = **STALE**. | **Apps** — absorb into React. Kit: none. |
| **P0** | **Pull-off / retarget / rally-all** as first-class ops | **Bot shipped** (`stop`/`pull`, `retarget`, `rally_all`). **Console missing.** Old “only stop / no rally” = **STALE**. | **Apps** — absorb when console gains pals. Kit: none. |
| **P0** | **Unify composer surfaces** — React console is programs-only; bot has one-mouth teammate+programs | Split across `console/` vs `bot/static` — bot unified locally; **product still split** | **Apps** product absorb (see [`OCCAM-UNIX-APPS.md`](OCCAM-UNIX-APPS.md)). Kit: none. |
| **P1** | **Multi-pal color in habitat glass** — concurrent pals, color-distinguished | **Shipped (host chrome):** bot banner pal-chips + sticky rank + presence dots; console `Banner` tint/pals/sticky props; `console/src/lib/tint.ts` ↔ `bot/console/tint.py`. **MUST NOT** kit pal-color table. | **Apps** |
| **P1** | **Pal ↔ `repoBranch` plant binding** in UI | Design in GLANCE/GARDEN; kit has growth bricks; hosts don’t yet show multi-pal on plants | **Apps** visualization (**follow-up**). **Kit** already owns `repoBranch` / growth ids — do not invent new. |
| **P2** | Bot `FRAMES` dual (historical) | Idle on-ramp + kit hydrate; `sandbox` alias only | **Apps — lean cut this loop** ([`OCCAM-UNIX-APPS.md`](OCCAM-UNIX-APPS.md)). |
| **P2** | Loop assignment UX beyond raw routine minutes | Dialog fields exist; no “assign this Ralph loop to pal” | **Apps** (optional). Ralph items stay host files. |
| **P2** | Message log parity / shared stream across pals | Per-bot messages + separate console log | **Apps**. |
| **P3** | React auth polish / multiplayer P2P | Present as optional scaffolding | **Apps** — low; not glance hero. |

### Composer `@`-mention: exists in new console/bot?

| Surface | `@`-mention parser? | What exists |
|---------|---------------------|-------------|
| `console/` (React) | **No** | Single program prompt (`aria-label="command"`) |
| `bot/static` + `bot/server.py` | **Yes** — `parseMention` + autocomplete; sidebar = fallback | One mouth → `@pal` tasks / `@all` rally / `@console` programs / bare → selected |

---

## Apps vs Kit ownership (per gap)

| Concern | Kit | Apps |
|---------|-----|------|
| Face / stage / action / emotion / growth ids | **SoT** | Consume only |
| Pal tint / agent roster / @ routing / stop / rally | — | **Own** |
| Habitat banner / grove chrome / camera | Numbers in kit | Renderers in console/bot |
| Garden silhouette map | `garden.*` in kit | Place props / bind pals |
| Program cards (now/todo/plan/…) | — | Own (may share engine) |
| Digipet / harvest KPI fields | **Forbidden** | **Forbidden** |

---

## MUST NOT carry

From audit + product north star (Occam):

| Item | Why |
|------|-----|
| **Casque** (name / comments / tags) | Forbidden; mascot unnamed |
| **`STAGE_SEED` / `EMOTION_SEED` / `ACTION_SEED` dual tables** | Kit is SoT; `check-consumers` forbids |
| Digipet hunger / feeding / Farmville / harvest-type kit fields | North star + GLANCE refuse |
| `AGENTS.md`, `.claude/`, `.ralph/` personal loop state | Sandbox / operator private |
| `public/__grok/`, `scripts/grok-pwa-*`, `server/middleware/grok-pwa.ts` | Platform PWA chrome |
| Hardcoded `PREVIEW_CLIENT_SECRET`, `/home/russ/*`, private IPs, `devserver` as requirement | Security / privacy |
| Alice-archive runtime; force-push / history rewrite | Standing exclude |
| Retired console ghosts (`findLoop`, fake `status` box) | Feature register F17/F31 |
| Bot dated `seed/official/**` Mac absolute paths | Scrubbed; keep `seed/pages.txt` |
| Inventing kit pal-color / agent-id catalogs | GLANCE modular host layer |

---

## Pointers

- Pals / glance / multi-pal color rules: [`GLANCE.md`](../GLANCE.md)
- Habitat already-ported checklist: [`HABITAT-PORT.md`](../HABITAT-PORT.md)
- Prior scrub map: workspace `_audit-mininja-FINDINGS.md` (local audit; not shipped)

---

## Occam summary for Apps

Carry the **essence**:

1. One composer that can address **any pal** — **bot shipped**; React absorb is the remaining P0 (do not add a third mouth).  
2. **Stop / retarget / rally** as explicit ops — **bot shipped**; console still missing.  
3. **Tinted multi-pal** as host chrome + visual one-pal↔one-plant (viz still follow-up).  
4. Keep program shell + kit-hydrated habitat (no dual seeds / no invented face ids).  

Do **not** re-litigate kit constants, Casque, digipet, or dual scene seeds.

Apps twin audit: [`OCCAM-UNIX-APPS.md`](OCCAM-UNIX-APPS.md). Prefer [`seams/04-bot-host.md`](seams/04-bot-host.md) over any leftover “@ / rally not implemented” narration in this file.
