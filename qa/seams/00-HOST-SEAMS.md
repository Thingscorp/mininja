# Host seams checklist — kit vs adapters vs console/bot

**Audience:** Apps · Kit · Ports · Russ  
**Date:** 2026-09-26 (ET)  
**Branch:** `feat/monorepo-public`  
**Scope:** Canonical ownership map. No kit JSON edits. No feature impl.

---

## 1. Purpose

**Cartridge metaphor:** `kit/mark.json` + `kit/scene.json` are the SoT cartridge; hosts (console/bot) are the player. Adapters are thin filters that turn kit ids into strings / ANSI / React / CSS. Hosts consume kit bricks (faces · emotions · actions · stages · growth · motion numbers) and own product chrome (composer · tint · roster · ops). Never dual-table beside the cartridge — the retro-engine modularity lesson applied.

---

## 2. Ownership table

| Concern | Kit | Ports (adapters) | Apps console | Apps bot | Host-chrome-ok |
|---------|-----|------------------|--------------|----------|----------------|
| Face / emotion / action / stage / growth / weather / propKinds ids | **SoT** | Emit face/stage/action/motion chrome only | Consume via `registerFromKit` | Consume via `hydrateMark` / `hydrateZones` | — |
| Glyph lockup lines | SoT (`faces.*`, idle stacks) | **`from-kit` / `lockup`** primary | Habitat: `composeLockup` (scene-driven); static faces → from-kit | Hydrate FRAMES from kit (P2 debt) | — |
| Geometry + motion speeds | SoT (`geometry.*`, `motion.*`) | — | Import / match kit numbers | Grove uses kit stages | — |
| Typeface (IBM Plex Mono) | SoT `mark.typeface` | React/presence assume stack | CSS must match | Static fonts must match | Load fonts |
| Pal tint / roster labels | **Forbidden** | Presence `--fg` / chip hooks only | `tint.ts` + Banner props (unwired) | **Shipped** live chips/dots | **Yes — required** |
| @-mention / stop / retarget / rally | — | — | **Missing** | **Shipped** | **Yes** |
| Unify composer (one mouth) | — | — | Programs-only | One mouth shipped | **Yes** (product absorb) |
| Permission modes / routines / credentials | — | — | — | **Shipped** | **Yes** |
| Linear tokens / layout / auth UI | — | — | Own | Own (CSS vars) | **Yes** |
| Habitat camera / walk cycle / grove paint | Numbers in kit | — | Banner renderer | Grove renderer | Renderers OK |
| CMD_STAGE / COMMAND_INTENT | Stage ids only | — | Host map | Host map | Routing OK if ids ⊂ kit |

---

## 3. Must stay kit-addressable

Closed list — hosts set/get these; never invent parallel catalogs:

| Brick | Kit home | Count / range |
|-------|----------|---------------|
| **Faces** | `mark.json` → `faces.*` | 15: idle blink evaluating allowed asking denied sandboxing executing completed warning error cancelled offline loadingRight loadingLeft |
| **Emotions** | `scene.json` → `emotions[].id` | 16 — **face ≠ emotion**; join via `legacyFaceBridge` |
| **Actions** | `scene.json` → `actions[].id` | 22 (pose/motion/fx derived, not separate catalogs) |
| **Stages** | `scene.json` → `stages[].id` | 7: nightwatch dock desk workshop archives gate rooftop |
| **Weather** | `scene.json` → `weather[]` | clear haze night sparks scan rain — habitat sky; **not** recipe `then.*` |
| **Prop kinds** | `scene.json` → `propKinds[]` | 10 incl. `repoBranch` |
| **Growth** | `scene.json` → `garden.growth` | integer **0..5** (seed→canopy) |
| **Typeface** | `mark.json` → `typeface` | IBM Plex Mono 400/500/600 |
| **Motion speeds / geometry** | `scene.json` → `motion.*` / `geometry.*` | **MUST-match** when on Thingscorp kit: `stageWidthPx=420`, `stageCount=7`, `worldWidthPx=2940`, `anchorRatio=0.42`, walk 170 / run 280 px/s, etc. |
| **legacyFaceBridge** | `scene.json` | Face → emotion/action/stage/facing; omitted stage = keep-current |

**Face ≠ emotion.** Unbridged emotions (`alert`, `relieved`, `sad`, `startled`) remain habitat-/SceneIntent-OK. Never merge catalogs.

**Sealed (never override silently):** 5×3 grid · cellAspect 1:1 · monochrome brand · forbiddenNames `Casque` · no digipet/harvest KPI · no pal-color tables in kit · unknown stage = keep-current · weather ≠ growth.

---

## 4. Host-chrome OK

Product ops that **must not** enter kit (or adapter catalogs):

- Pal **tint** (`sha256(name)` → hue) — `tint.ts` / `tint.py` / `--pal-tint`
- Composer **targeting** — sidebar select + `@`-mention grammar
- **@-mention** (+ `@all` / `@console`) + autocomplete roster
- **Stop / pull-off / retarget / rally-all** (explicit; never silent double-assign)
- **Permission modes** `draft` \| `auto` \| `free`
- **Linear tokens** / layout / focus rings / window chrome
- **Roster labels** / sticky interrupt ranks / chip copy
- **Routines** / MAX_PARALLEL / SSE teammate stream
- **Credentials UI** / computers (local|remote|codex)
- Auto-blink timer · warning flash · `muted` scene tone paint · CMD_STAGE routing

**Explicit:** no kit pal-color tables. Ever. Multi-pal color = Apps host chrome only ([`GLANCE.md`](../../GLANCE.md)).

---

## 5. Adapter rule

> Hosts **never redraw** the lockup. Call `adapters/mark` (`from-kit` in browser, `lockup.mjs` on Node) → present via `adapters/react` and/or `adapters/presence` (or `adapters/ansi` on CLI).

- **Facing:** glyph mirror via mark filter (`linesFor(..., facing)`); `data-facing` is hint only — never CSS `scaleX(-1)` as the sole mirror.
- **Ids stay strings** from kit. No parallel expression unions in host TS beyond thin edge aliases (`sandbox`→`sandboxing`).
- **Habitat nuance:** console `composeLockup` (bridge + emotion eyes + action pose/feet) is a **good pattern** for the side-scroller. Static / face-id lockups (chip, roster, CLI, terminal buddy) still go through **from-kit**. Do not invent STAGE/EMOTION/ACTION seed tables.
- **Ports reconcile:** aligned — adapters do not own habitat strip / garden growth / `data-emotion` today.

---

## 6. P0/P1 crosswalk (carry-over)

Prefer [`04-bot-host.md`](04-bot-host.md) over stale rows in [`OLD-CONSOLE-CARRYOVER.md`](../OLD-CONSOLE-CARRYOVER.md) for bot @/stop/retarget/rally.

| Item | Status (bot / console) | Seam | Next action |
|------|------------------------|------|-------------|
| Composer **@-mention** (+ `@all`) | Bot **shipped** · Console **missing** | **host** | Port `parseMention` + roster menu into React composer. Carry-over “not implemented” = **STALE** for bot. |
| **Pull-off / retarget / rally-all** | Bot **shipped** · Console **missing** | **host** | Absorb bot APIs (`stop` / `retarget` / `rally`) when console gains pals. Carry-over “only stop” = **STALE** for bot. |
| **Unify composer** (one mouth) | Bot one mouth · Console programs-only · **product still split** | **host** | Absorb bot routing into React **or** keep bot as multi-pal home. Do not add a third mouth. |
| **Multi-pal color** in habitat | Bot **live** chips/sticky · Console Banner props + `tint.ts` **unwired** | **host** | Wire `tint`/`pals`/`sticky` from Mininja; MUST NOT kit pal table. |
| **Pal ↔ repoBranch** growth viz | Kit schema ready · **neither host** renders growth silhouettes / pal-on-plant | kit schema · **host** viz | Host CSS + `h(g)` from `garden.silhouetteHeightPx`; overlay binding metadata — no new kit ids. |
| **Permission modes** draft\|auto\|free | Bot **shipped** · Console N/A | **host** | Keep fail-closed; expose when console gains teammate spawn. |
| **Roster + tint** | Bot **shipped** · Console lag | **host** | Console: pass live roster into Banner. |
| Converge **FRAMES / composeLockup** onto from-kit (static faces) | Bot inline FRAMES + hydrate (P2 debt: loadingLeft/cancelled/offline reliability) · Console composeLockup habitat-OK | **adapter** + host | Static faces → from-kit; keep composeLockup for habitat; delete FRAMES drift; alias `sandbox` at edge only — **don’t invent kit keys**. |
| Recipe `then.emotion` / facing / intensity | Kit bricks exist; RECIPES face-first | **kit** design · host runner | Prefer face → bridge; opt-in later — no new ids. |

---

## 7. Anti-dual-table checklist

**Do**

- Load catalogs via `registerFromKit()` / `GET /kit/*.json` hydrate.
- Call `from-kit` / `lockup` for static face lines; use `legacyFaceBridge` for face→scene.
- Keep `COMMAND_INTENT` / `CMD_STAGE` as host routing with ids ⊂ kit.
- Tint pals in Apps; paint Linear tokens in host CSS.
- Match Thingscorp kit geometry/motion numbers (or import exports).
- Gate with `node kit/check-consumers.mjs`.

**Don’t**

- Invent `STAGE_SEED` / `EMOTION_SEED` / `ACTION_SEED` / parallel FRAMES catalogs.
- Equate face ids with emotion ids.
- Put pal-color / agent-id / digipet / weed-KPI tables in kit.
- Bake Linear `--color-*` into `moodColorsUiOnly` (or vice versa).
- Put `muted` into mark mood table (host/scene chrome only).
- Use weather as growth; confuse grove trees with `repoBranch` plants.
- Mirror facing only in CSS; browser-import `lockup.mjs` / ansi.
- Add recipe `then.weather` or pack-local face ids without kit cite.
- Vendor a second React app under `bot/`.

---

## 8. Recommended recipe brick API (minimal)

**Recipe `then.*` (Kit-locked):** `face` \| `action` \| `stage` \| `mood` (tone ∈ idle\|accent\|ok\|warn\|err) \| `growth` (0..5 or `{prop,value}`).  
Not weather. Not mark fill. Not tint/ops.

| Op | Bricks |
|----|--------|
| **set** | `face`, `emotion` (optional later), `action`, `stage`, `facing`, `intensity`, `holdMs`, `line`, `mood.tone`, `growth` |
| **get** | `listFaces`/`hasFace`, `listEmotions`, `listActions`, `listStages`, `getFace`/`getEmotion`/`getAction`/`getStage`, `intentFromLegacy(face)`, `applyIntent(current, intent)`, `growthHeight(g)`, motion/geometry snapshot |
| **resolve** | If `face` set → apply `legacyFaceBridge`, then overlay explicit emotion/action/stage/facing. Unknown → kit `fallbacks` (warn, don’t crash). |

**Never via kit set/get:** tint, roster, @-mention, stop/rally/retarget, permission modes, credentials, weed/KPI kinds, auto-blink timers.

---

## 9. Source map

| Doc | Role |
|-----|------|
| [`01-kit-addressable.md`](01-kit-addressable.md) | Closed kit id inventory + sealed constraints |
| [`01-kit-peer-reconcile.md`](01-kit-peer-reconcile.md) | Kit peer — **aligned** (muted host/scene; then.*; geometry MUST-match) |
| [`02-adapters-ports.md`](02-adapters-ports.md) | Adapter inventory + host rule |
| [`02-ports-peer-reconcile.md`](02-ports-peer-reconcile.md) | Ports peer — **aligned** (no blocking disagreements) |
| [`03-console-host.md`](03-console-host.md) | React console hydrate vs host-only |
| [`04-bot-host.md`](04-bot-host.md) | Bot launcher surfaces; prefer over stale carry-over @/rally rows |
| [`../OLD-CONSOLE-CARRYOVER.md`](../OLD-CONSOLE-CARRYOVER.md) | Historical P0/P1 inventory — bot @/stop/retarget/rally claims may be **STALE** |

Machine SoT: `kit/mark.json` · `kit/scene.json` · gate `node kit/check-consumers.mjs`.
