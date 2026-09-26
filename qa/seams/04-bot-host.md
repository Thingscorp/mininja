# Seams map 04 — bot host (Mac launcher + static UI + server)

**Audience:** Apps (console absorb) / Kit (SoT only) / QA.  
**Date:** 2026-09-26 (ET).  
**Branch tip mapped:** `feat/monorepo-public` · `bot/`  
**Profile rule:** `bot/` = Mac launcher (+ static UI + Python server). **NO** vendored second React console.  
**Scope:** Mapping only. No kit edits. No commit.  
**Upstream inventory:** [`../OLD-CONSOLE-CARRYOVER.md`](../OLD-CONSOLE-CARRYOVER.md) — note: that doc’s “@ / rally not implemented” rows are **stale** vs current monorepo `bot/` (P0 surfaces landed here; see §4).

Product vocabulary: **pals** = agent creatures. Habitat = glance / rubber-duck strip. Kit = `mark.json` + `scene.json`. Host chrome = Apps tint / roster / composer routing.

---

## Layout (what “bot” is)

```
bot/
  mininja / grokbot     # CLI dispatcher
  server.py             # ThreadingHTTPServer · REST + SSE · kit static · teammate runs
  static/index.html     # Single-file launcher UI (NO React / NO package.json)
  static/fonts/         # IBM Plex Mono 400/500/600 + OFL.txt
  console/              # Python program engine (store/engine/tint/credentials) — NOT ../console React
  cloud.py              # Opt-in remote SSH computer
  scripts/              # cmd, tint, seed, check, install-app
  seed/pages.txt        # Public docs catalog
```

Serve roots: `STATIC = bot/static`, `KIT_DIR = repo/kit` via `GET /kit/*`.

---

## 1. Surface / API inventory

| Surface / API | Behavior | Source | Evidence path |
|---------------|----------|--------|---------------|
| **One-mouth composer** `#task` / `#taskForm` / `runLine()` | Enter send; Shift+Enter newline; empty no-op. Routes: `@pal` task, `@all` rally, `@console` programs, bare programs when `selected==="console"`, bare text → selected pal, `stop`/`pull`, `retarget @Name …` | **host** | `bot/static/index.html` (`runLine`, `#composer`, placeholder `@Ada · @all · now · todo · or a task`); `bot/README.md` Composer contract |
| **@-mention parser** `parseMention` | Leading `@token` → `{kind: all\|console\|pal\|unknown}`; roster match case-insensitive exact then prefix | **host** (product gap closed in monorepo bot) | `bot/static/index.html` `parseMention` ~L1079 |
| **@ autocomplete** `mentionMenu` | Typing `@` opens Linear-minimal roster: `@all`, pals (tint on name), `@console`; arrows + Enter/mousedown apply | **host** | `bot/static/index.html` `mentionQuery` / `rosterSuggestions` / `paintMentionMenu` |
| **Sidebar select (fallback)** `#bots` | `selected = "console" \| botId`; paints tint + routes bare composer text; **not** required for `@` | **host** | `bot/static/index.html` `renderBots`, `selected` |
| **POST `/api/bots/:id/tasks`** | `{ text, retarget? }` → `start_task`; refuse silent double-assign (`already working`) unless `retarget=true` | **host** | `bot/server.py` `start_task`, `do_POST` tasks |
| **POST `/api/bots/:id/stop`** | Pull-off mid-job: SIGTERM process group / `cloud.stop_run` | **host** | `bot/server.py` `stop_bot`; UI `#stopBot` + composer `stop`/`pull` / `pullOff` |
| **POST `/api/bots/:id/retarget`** | `{ to, text }` → stop `from`, assign to `to` (explicit; never silent) | **host** | `bot/server.py` `retarget_task`; UI `retargetLine` / composer `retarget @Name …` |
| **POST `/api/rally`** (alias `/api/bots/rally`) | Emergency blast same prompt to every **idle** pal; skips working; caps `MAX_PARALLEL=4` | **host** | `bot/server.py` `rally_all`; UI `#rallyAll` + `@all …` → `rallyLine` |
| **MAX_PARALLEL = 4** | Concurrent run cap across local/cloud runs | **host** | `bot/server.py` L37, `start_task` / `rally_all` |
| **Permission modes** `draft` \| `auto` \| `free` | CLI flags: draft → `--tools` read-only set; auto → `--permission-mode auto`; free → `--always-approve` (+ deny `rm -rf`) | **host** | `bot/server.py` `build_cmd` / `new_bot` / `patch_bot`; dialog `#fMode` |
| **Routines** | `{ enabled, interval_minutes, prompt, last_run_at }` · `scheduler_loop` fires `start_task` | **host** | `bot/server.py` `scheduler_loop`; dialog `#fRoutine` / `#fRoutinePrompt` |
| **Roster CRUD** | `POST /api/bots`, `PATCH/DELETE /api/bots/:id`; fields name/job/description/computer/cwd/model/mode/routine/credential_id/pinned | **host** | `bot/server.py` `new_bot` / `patch_bot` / `delete_bot`; `#dlg` form |
| **Computers** `local` \| `remote` \| `codex` | Local grok / SSH cloud / Codex CLI | **host** | `bot/server.py` `infer_computer` / runners; `#fComputer` |
| **Per-pal LLM credentials** | Host `credentials.json`; assign/share/change/unshare; fail-closed local when unbound; secrets never in kit/API | **host** | `bot/console/credentials.py`; `/api/credentials*`; `/api/bots/:id/credential`; dialog cred chrome |
| **GET `/api/state`** | bots (+ `tint`, `working`, scrubbed `credential`), messages, credentials meta, health, console snapshot, commands | **host** | `bot/server.py` `public_state` |
| **GET `/api/events` SSE** | Live teammate deltas / state / console; hello + ping | **host** | `bot/server.py` `_sse` / `emit` |
| **POST `/api/cmd`** + **GET `/api/console`** | Program engine cards (`now`/`todo`/…) via Python `console.store` | **host** (engine share, not React) | `bot/server.py` `run_console`; `bot/console/engine.py` + `store.py` |
| **Name → tint** | `sha256(name) → 20 even hues → #rrggbb`; steel `#8a8f98` for console/empty | **host chrome** (MUST NOT kit) | `bot/console/tint.py`; mirrored `console/src/lib/tint.ts`; applied `public_state` + UI `--pal-tint` |
| **Habitat banner pals** | `.pal-chip` / `.pal-dot` / `--pal-tint` / sticky interrupt ranks (blocked > asking > busy) | **host chrome** | `bot/static/index.html` `paintPalHabitat` / `stickyInterrupt`; React parity props on `console/.../banner.tsx` |
| **Grove / world-tape** | ASCII trees per **kit stage**; `hydrateZones` from `/kit/scene.json`; host-only `CMD_STAGE` cmd→stage map | **kit** stages + **host** renderer / cmd map | `bot/static/index.html` `zonesFromKit` / `paintTree` / `goPlace` / `CMD_STAGE`; `server.py` `_kit` |
| **Faces / FRAMES** | Fallback inline FRAMES; `hydrateMark` overwrites from `/kit/mark.json`; legacy `sandbox`↔`sandboxing` bridge | **kit** faces + **host** bridge | `bot/static/index.html` `FRAMES` / `hydrateMark` / `framesFromKit` |
| **Fonts** | Local IBM Plex Mono 400/500/600 `@font-face` → `/fonts/*.ttf` | **host** (static asset) | `bot/static/fonts/` + `OFL.txt`; CSS in `index.html` L12–31 |
| **Kit hydrate HTTP** | `GET /kit/scene.json`, `/kit/mark.json` (path-traversal safe) | **kit** SoT served by host | `bot/server.py` `_kit`; `KIT_DIR = ROOT.parent / "kit"` |
| **Mac launcher chrome** | `./mininja` opens `127.0.0.1:8787`; optional `install-app.sh`; state under `~/Library/Application Support/MininjaBot` or `MININJA_DATA` | **host** | `bot/mininja`, `bot/README.md`, `bot/console/paths.py` |
| **QA locks** | Source + smoke assert @/rally/retarget/stop, kit hydrate, no dual seeds, tint CLI | **host** QA | `qa/tests/bot-ui-source.test.mjs`, `bot-team-source.test.mjs`, `bot-api-smoke.test.mjs`; matrix BOT-UI-001 / BOT-TEAM-002 |

---

## 2. What bot already ships that React `console/` lacks

| Capability | Bot | React console (`console/`) |
|------------|-----|----------------------------|
| Multi-pal roster + CRUD | Yes — sidebar + dialog | No — single unnamed buddy |
| One-mouth `@` / `@all` composer | Yes — parser + autocomplete | No — programs-only prompt |
| Stop / pull-off | Yes — API + button + composer verbs | N/A (no teammate runs) |
| Retarget (explicit) | Yes — API + `retarget @Name` | No |
| Rally-all | Yes — API + button + `@all` | No |
| Permission modes draft/auto/free | Yes | No (no CLI teammate spawn) |
| Routines (interval assign) | Yes — scheduler thread | No |
| Per-pal credential bind | Yes | No |
| Computers local/remote/codex | Yes | No |
| Teammate SSE message stream | Yes | Console has its own stream/plugins, not multi-pal |
| Host tint on habitat chips / presence dots | Yes (live from roster) | Banner **props** exist (`tint`/`pals`/`sticky`) but no live multi-pal roster wiring |
| Program shell (`now`/`todo`/…) | Python twin in `bot/console/` | Canonical React + plugins |

**Bottom line:** multi-pal ops live in **bot**. React console remains the richer **program** shell until an absorb. Do not pretend console already has teammate targeting.

---

## 3. What must NOT be duplicated as a second console

| Forbidden | Why | Evidence / rule |
|-----------|-----|-----------------|
| Vendoring a second React app under `bot/` | Profile: bot = Mac launcher + static UI only | `bot/README.md` L5–9; no `package.json` / `.tsx` under `bot/` |
| Dual `STAGE_SEED` / `EMOTION_SEED` / `ACTION_SEED` in bot HTML | Kit is SoT; `check-consumers` forbids | Grove hydrates `kit/scene.json`; host keeps only `CMD_STAGE` routing |
| Kit pal-color / agent-id tables | Multi-pal color = Apps host chrome | `GLANCE.md` / carry-over; tint in `bot/console/tint.py` only |
| Casque name / tags | Forbidden mascot naming | Kit `forbiddenNames`; QA features |
| Digipet / harvest KPI kit fields | North star refuse | Carry-over MUST NOT |
| Secrets / provider brand tints in kit or public API | Credentials host-only; stock Mininja chrome | `bot/README.md` LLM keys; `credentials.py` |
| Treating bot grove trees as `repoBranch` garden plants | Stage silhouettes ≠ garden growth | Carry-over §5 / `GARDEN.md` |
| Re-implementing React program plugins inside bot static | Engine already shared via Python `bot/console/`; absorb later | Architecture map |

Static `index.html` **is** the intentional launcher UI — keep it lean. Absorb path = bring bot seams into `console/`, not clone React into `bot/`.

---

## 4. Seams for P0 carry-over (status on this tip)

Carry-over P0 list vs **current** `bot/`:

| P0 seam | Status in `bot/` | Absorb note for React console |
|---------|------------------|-------------------------------|
| **@-mention (+ `@all`)** | **Shipped** — `parseMention`, autocomplete, `@all`→rally, `@console`→programs | Port parser + roster dropdown into React composer; keep same token grammar |
| **Pull-off / stop** | **Shipped** — `stop_bot`, `#stopBot`, composer `stop`/`pull [@Name]` | Expose as first-class op when console gains pals |
| **Retarget** | **Shipped** — `retarget_task` + composer `retarget @Name …` + `tasks?retarget` | Never silent mid-flight reassign; refuse `already working` unless explicit |
| **Rally-all** | **Shipped** — `rally_all` + `#rallyAll` + `@all` | Skip busy pals; respect `MAX_PARALLEL` |
| **Unify composer mouths** | **Shipped inside bot** (one mouth). **Still split product-wide:** React = programs-only; bot = programs + pals | Product call: absorb bot routing into React (or keep bot as multi-pal home). Do **not** add a third mouth |

**Still open (product, not bot-local):** React console has no `@` / roster / stop / rally. Unifying mouths = Apps absorb work, not a kit change.

**Guards to preserve on absorb:** `MAX_PARALLEL=4`; no silent double-assign; rally skips working; retarget explicit; modes fail-closed draft tools list.

---

## 5. Host-chrome OK vs kit-addressable

| Concern | Kit-addressable? | Host chrome OK? | Notes |
|---------|------------------|-----------------|-------|
| Face / stage / action / emotion / growth ids | **Yes — SoT** | Consume only | `hydrateMark` / `hydrateZones` |
| Stage geometry, garden bricks, presence ladder ids | **Yes** | Render | Grove uses kit stage ids; presence ranks are host labels over kit posture |
| Pal tint / `#rrggbb` tables | **No** | **Yes — required** | `tint.py` / `--pal-tint` / chips / dots / selected lockup |
| Agent roster / `@` routing / stop / rally / retarget | **No** | **Yes** | Entire teammate composer contract |
| Permission modes / routines / credentials | **No** | **Yes** | Fail-closed host policy |
| `CMD_STAGE` cmd→stage map | **No** (ids must match kit stages) | **Yes** | Host routing parity with console `COMMAND_INTENT` |
| IBM Plex Mono / CSS tokens / Linear density | **No** | **Yes** | Static fonts + CSS vars |
| Legacy face alias `sandbox` | Kit key = `sandboxing` | Host bridge OK | Do not invent glyphs; bridge only |
| Provider brand colors (OpenAI green, etc.) | **No** | **No** (stock Mininja only) | README: custom colors later = user-driven |

**Standing memory:** multi-pal color = **host chrome only**. No kit pal-color tables. Ever.

---

## 6. Kit hydration checklist (bot)

| Asset | How loaded | Fallback |
|-------|------------|----------|
| `kit/scene.json` | `GET /kit/scene.json` → `zonesFromKit` → `ZONES` / `paintGrove` | Warn; empty grove until success |
| `kit/mark.json` | `GET /kit/mark.json` → `framesFromKit` overwrites `FRAMES` | Inline FRAMES seed (includes `sandboxing` + legacy `sandbox`) |
| Dual stage lists | **Absent** — no `STAGE_SEED` in bot HTML | — |

---

## 7. Occam pointer for Apps absorb

1. Treat **bot** as the SoT for multi-pal composer grammar (`@` / `@all` / stop / pull / retarget / rally) and teammate APIs.  
2. Treat **React console** as SoT for program plugins / stream compounding until mouths unify.  
3. Keep tint + roster chrome in Apps; keep faces/stages in kit.  
4. Do not vendor React under `bot/`. Do not invent kit pal colors.

