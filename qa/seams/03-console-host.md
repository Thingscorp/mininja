# Seams 03 — console/ host chrome inventory

**Audience:** Apps (console React) / Kit (mark+scene SoT).  
**Date:** 2026-09-26 (ET).  
**Branch:** `feat/monorepo-public` · repo `/workspace/mininja`.  
**Scope:** Mapping only — hydrate vs host-only. **No feature implementation. No commit.**

Companion: [`qa/OLD-CONSOLE-CARRYOVER.md`](../OLD-CONSOLE-CARRYOVER.md) · [`HABITAT-PORT.md`](../../HABITAT-PORT.md) · [`GLANCE.md`](../../GLANCE.md).

**Rule of thumb:** Kit owns **ids + numbers** (`kit/mark.json`, `kit/scene.json`). Console owns **layout, Linear chrome, program brain, pal tint/roster, permission/auth UI**. Anything that re-lists faces/stages/motion/typeface/growth beside kit is **dual/risk**.

---

## 1. UI surface inventory

| UI surface | State keys / files | Source | Notes |
|------------|-------------------|--------|-------|
| **Habitat banner strip** | `Banner` props: `scene`, `blink`, `reduce`, `ready`, `tint?`, `pals?`, `sticky?` · `console/src/components/banner.tsx` | **dual/risk** | Scene catalogs from kit; camera loop + HUD chrome host. `tint`/`pals`/`sticky` are host-owned API but **not wired** from `Mininja` today (always defaults). |
| **Live Scene object** | `emotion`, `action`, `stage`, `facing`, `line`, `intensity`, `holdMs` · React state in `mininja.tsx`; types/`DEFAULT_SCENE` in `lib/scene.ts` | **kit field** (ids) + **host-only** (runtime) | Defaults from `kit.defaultScene`. Runtime updates via `applyIntent` / boot / command map. |
| **Stage / emotion / action catalogs** | `registerFromKit()` → maps; `listStages` / `getEmotion` / … · `lib/scene.ts` ← `kit/scene.json` | **kit field** | No `STAGE_SEED` dual (gate: `kit/check-consumers.mjs`). Overlay via `register*`. |
| **Geometry** | `STAGE_WIDTH`, `ANCHOR_RATIO`, `worldWidth()`, `stageCenter()` · `lib/scene.ts` ← `kit.geometry` | **kit field** | Derived exports; check-consumers OX-APP-001. |
| **Locomotion walk/run** | `WALK_PX_PER_SEC`, `RUN_PX_PER_SEC` · scene exports; banner uses them | **kit field** | From `kit.motion`. |
| **Camera / patrol literals** | Banner: `viewW*0.32` / `0.52`, follow `5.2`, patrol `26` px/s, insets `56`/`90` · `banner.tsx` | **dual/risk** | Values **match** kit.motion today; check-consumers asserts literal equality. Banner does **not** import kit exports for camera/patrol (unlike walk/run) — drift if kit bumps and literals lag. |
| **Weather sky class** | `stage.weather` → `.weather-*` · kit stages + `styles.css` | **kit field** (enum) + **host-only** (CSS paint) | Habitat chrome only (HABITAT-PORT); not outside-weather bridges. |
| **Stage silhouettes + stock props** | `StageSilhouette`, `Prop` · `banner.tsx`; kinds in `StageProp` | **kit field** (layout) + **host-only** (CSS) | Stock stages have no `repoBranch`. `.prop-*` CSS for block…cable; **no `.prop-repoBranch`**. |
| **Garden / `repoBranch` / growth** | Type: `kind: "repoBranch"`, `growth?: 0..5` · `lib/scene.ts`; schema `kit.garden` | **kit field** (schema) · **host-only gap** (render) | Prop renderer ignores `growth` / `garden.silhouetteHeightPx`. No plant binding UI. P1 gap. |
| **Mascot lockup** | `composeLockup` · `lib/scene.ts`; `Mascot` · `mascot.tsx`; legacy `FRAMES` · `lib/mascot.ts` ← `legacyFaceBridge` | **kit field** | Eyes/tone/motion from kit emotions+actions; glyphs composed in host. Face ids bridged from kit. **Does not import `mark.json` faces lines** — compose path is scene-driven. |
| **Typeface (lockup)** | `@font-face` IBM Plex Mono 400/500/600 · `styles.css`; `kit.mark.typeface` | **dual/risk** | Host CSS stack matches `mark.typeface.cssStack` by convention; **no import/hydrate from mark.json**. |
| **Linear theme tokens** | `--color-bg/panel/hi/fg/muted/accent/ok/warn/err/steel…` · `styles.css` `@theme` | **host-only OK** | Linear-ish Apps chrome. Distinct from `mark.moodColorsUiOnly` (kit tone hex for mark/docs). Do not merge tables. |
| **Tone → CSS class** | `TONE` / `MOTION` maps in `mascot.tsx` | **host-only OK** (names) · **kit field** (tone/motion ids) | Maps kit tone/motion **ids** to host utility classes. |
| **Pal tint algo** | `tint(name)`, `STEEL` · `lib/tint.ts` ↔ `bot/console/tint.py` | **host-only OK** | MUST NOT enter kit. Banner `--pal-tint` CSS host. |
| **Pal chips / sticky rank** | `PalChrome`, `StickyRank` · `banner.tsx` + `.banner-pals` / `.banner-sticky` CSS | **host-only OK** | Props exist; **Mininja never passes** `tint`/`pals`/`sticky`. Bot static **does** paint chips + sticky. Console lag vs bot. |
| **Composer (programs)** | `input`, `lines`, `run()`, `START` chips · `mininja.tsx`; `cardFor` · `lib/mininja.ts` | **host-only OK** | Single unnamed buddy; `aria-label="command"`; no `@` parser; no roster. Programs-only. |
| **Command → SceneIntent map** | `COMMAND_INTENT` · `lib/scene.ts` | **host-only OK** (routing) · **dual/risk** if ids invent | Maps program verbs → kit emotion/action/stage ids. Keep ids ⊂ kit catalogs. |
| **Boot / blink / offline / reduce-motion** | `boot`, `blink`, `offline`, `reduce` · `mininja.tsx` | **host-only OK** | Window chrome / a11y. Offline forces kit ids `sleepy`/`sleep`/`nightwatch`. |
| **Message log + Out cards** | `Line` cmd/out · `mininja.tsx`; `Card` · `lib/mininja.ts` | **host-only OK** | Gantt / pickable rows host. |
| **Plugins program brain** | `PROGRAMS` · `plugins/index.ts`; stores: refine/pgeon/compound/turn/brief; stream `lib/stream.ts` | **host-only OK** | Session/in-memory. Ralph reads host files (scrubbed). QA loads JSON registers. |
| **Pigeon overlay** | `lib/pigeon.ts` + `pigeon.tsx`; refine flag HUD | **host-only OK** | Side chrome; pose from face id mapping. |
| **Auth / gates / login** | `lib/auth/*`, `gates.tsx`, `/login` | **host-only OK** | Product optional Better Auth; not kit. |
| **Window / layout / focus rings** | `h-dvh` shell, max-w-2xl column, Linear `:focus-visible` · `mininja.tsx` + `styles.css` | **host-only OK** | Explicit Linear chrome comment in CSS. |
| **Preview host bridge / P2P** | `preview-host-bridge*`, `lib/multiplayer/p2p.ts` | **host-only OK** (low pri) | Not glance hero; P2P “roster” ≠ pal roster. |
| **@-mention / roster / targeting** | — in `console/` | **missing (Apps)** | Bot has `parseMention`, mention menu, sidebar select. Console: none. |
| **Pull-off / retarget / rally-all** | — in `console/` | **missing (Apps)** | Bot: `pullOff`, `retargetLine`, `rallyAll`, server `retarget`/`retarget=True`. Console: none. |
| **Permission modes (draft/auto/free)** | — in `console/` | **host-only OK** (bot surface) | Teammate CLI posture lives on bot; console has no pal permission UI. |

---

## 2. Host-only OK (explicit)

Product / NORTH-STAR / GLANCE allow these to stay Apps chrome — **do not** push into kit:

1. **Linear layout & tokens** — page shell, panel/bg/hairline, focus rings (`styles.css` “Linear focus rings”), spacing, composer form chrome.
2. **Window / a11y chrome** — boot sequence, blink timers, `prefers-reduced-motion`, offline/wake gates, focus-on-ready.
3. **Program composer + cards** — `cardFor`, START chips, message log, gantt, blockers schedule, plugin stores, stream keep/peek.
4. **Pal identity chrome** — `tint.ts` / steel, `PalChrome` chips, sticky rank HUD, selected-pal paint (when wired).
5. **Auth & permission UI** — Better Auth gates/login; bot `mode` draft|auto|free (fail-closed posture).
6. **Command→intent routing tables** — `COMMAND_INTENT`, `afterCommand` face heuristics (consume kit ids only).
7. **Side ornaments** — pigeon poses, refine pill, preview-host bridge, multiplayer P2P scaffold.
8. **Prop/stage CSS paint** — `.prop-*`, `.stage-*`, weather gradients (numbers/ids still from kit).
9. **Teammate ops chrome** (when ported) — stop / retarget / rally buttons, mention autocomplete menu, sidebar roster (bot today).

---

## 3. Must stay kit-addressable (explicit)

Hosts **consume**; do not fork catalogs or invent parallel ids:

| Brick | Kit home | Console consumer |
|-------|----------|------------------|
| **Faces** (15) + codepoints / idle lines | `kit/mark.json` `faces`, `canonicalIdle`, `mirroredIdle` | Via `legacyFaceBridge` → scene intents → `composeLockup`; mascot `MascotState` keys must track mark faces (`sandboxing` not `sandbox`) |
| **Emotions / actions / stages** | `kit/scene.json` catalogs | `registerFromKit` only |
| **Motion constants** | `kit.motion` (walk/run/patrol/camera/follow/step/dt) | Walk/run exported; camera/patrol still literal-matched — prefer future exports |
| **Geometry** | `kit.geometry` | `STAGE_WIDTH`, `ANCHOR_RATIO`, world width |
| **Typeface** | `kit/mark.json` `typeface` | CSS must remain IBM Plex Mono for lockup; ideally hydrate stack from kit |
| **Growth schema** | `kit.garden` (`repoBranch`, growth 0..5, silhouetteHeightPx) | Types already; renderer + pal↔plant UI must use these ids/numbers — invent none |
| **Weather / propKinds enums** | `kit.weather`, `kit.propKinds` | Closed set in `StageProp` |
| **Default scene + fallbacks + legacyFaceBridge** | kit | `DEFAULT_SCENE`, unknown emotion/action fallbacks |

**Forbidden in kit / dual seeds:** pal color tables, agent ids, digipet/harvest KPIs, `STAGE_SEED`/`EMOTION_SEED`/`ACTION_SEED`, Casque naming.

---

## 4. Drift vs `qa/OLD-CONSOLE-CARRYOVER.md` P0/P1

Carryover dated 2026-09-26; **bot has moved ahead** of that GAP table. Console has **not**.

| Pri | Carryover claim | Actual monorepo (this map) | Console drift |
|-----|-----------------|----------------------------|---------------|
| **P0** | `@`-mention not implemented anywhere | **Bot shipped:** `parseMention`, mention menu, `@Name` / `@all` / `@console`, autocomplete · `bot/static/index.html` | **Console still none** — programs composer only |
| **P0** | Pull-off / retarget / rally-all missing (only stop + refuse) | **Bot shipped:** `pullOff`, `retarget` API + `retarget @Name`, `rallyAll` / `@all`, `start_task(..., retarget=)` · `bot/server.py` | **Console still none** |
| **P0** | Unify composer — React programs vs bot teammate | **Still split** — bot unified mouth (`#task` + mention); console `aria-label="command"` programs-only | **Primary remaining P0 for console/** |
| **P1** | Multi-pal color — “shipped host chrome” on Banner props + tint.ts | Tint algo + Banner props + CSS **present**; bot paints chips/sticky/presence | **Console Banner props unwired** from `Mininja` — API without data = half-shipped |
| **P1** | Pal ↔ `repoBranch` plant binding | Kit garden SoT yes; **neither host** renders growth silhouettes / one-pal-on-plant | **Console:** type accepts `repoBranch`+growth; **no CSS class, Prop ignores growth, no overlay UI** |

Other carryover “ALREADY” items that **hold** for console: kit-hydrate habitat (`registerFromKit`), scrubbed mascot/`sandboxing`, program plugins, auth stack, no STAGE_SEED.

---

## 5. Concrete seams (Apps work — mapping only)

### 5.1 `@`-mention

| Seam | Owner | Console today | Port shape (no impl here) |
|------|-------|---------------|---------------------------|
| Roster source | Apps | None | Host pal list (bot `state.bots` analog); never kit |
| Syntax | Apps | None | Mirror bot: leading `@Name` / `@all` / `@console`; autocomplete menu |
| Routing | Apps | `run()` → `cardFor` only | Branch: mention → task/program target; bare verb → programs |
| Kit | — | — | **None** |

### 5.2 Pull-off / retarget / rally-all

| Seam | Owner | Console today | Port shape |
|------|-------|---------------|------------|
| Pull-off | Apps | None | Explicit stop mid-job (bot `POST …/stop`) |
| Retarget | Apps | None | Explicit reassign; refuse silent double-assign unless `retarget` |
| Rally-all | Apps | None | Blast body to idle pals; skip busy (bot `rallyLine`) |
| Kit | — | — | **None** — ops are host |

### 5.3 Unify composer

| Seam | Owner | Console today | Port shape |
|------|-------|---------------|------------|
| One mouth | Apps | Programs input only | Single field: `@pal` tasks **or** program verbs; sidebar select = fallback (bot copy: “one mouth · @pal anytime”) |
| Surface split | Apps | `console/` vs `bot/static` | Product call: bring bot targeting into React **or** keep bot as teammate shell and thin console — carryover still flags unify as P0 |

### 5.4 Multi-pal color

| Seam | Owner | Console today | Port shape |
|------|-------|---------------|------------|
| Tint | Apps | `lib/tint.ts` ready | Feed `tint(name)` into `Banner tint=` / per-chip `--pal-tint` |
| Concurrent chips | Apps | Props+CSS ready; **unwired** | Pass `pals: PalChrome[]` from host roster; sticky from glance rank |
| Kit | — | — | **MUST NOT** add pal-color table |

### 5.5 Pal ↔ `repoBranch`

| Seam | Owner | Console today | Port shape |
|------|-------|---------------|------------|
| Growth brick | **Kit** | Typed on `StageProp`; unused in stock stages | Keep `kit.garden` ids/numbers |
| Silhouette render | Apps | No `.prop-repoBranch`; `Prop` ignores `growth` | Host CSS + `h(g)=h0+g*dh` from `garden.silhouetteHeightPx` |
| Binding viz | Apps | None | One tinted pal at one plant (GLANCE); overlay props, not new kit fields |

---

## 6. Dual/risk watchlist (console)

1. Banner camera/patrol **literals** vs `kit.motion` exports (check-consumers mitigates value drift, not import style).
2. **Typeface** hardcoded in CSS vs `mark.typeface` (match today; no single hydrate).
3. **moodColorsUiOnly** (kit) vs Linear `--color-*` (host) — intentional dual; document, don’t “fix” by baking Linear into kit.
4. **`COMMAND_INTENT`** host map — safe while ids ⊂ kit; risk if new verbs invent stages/emotions.
5. **Banner pal API unwired** — looks shipped in carryover; runtime still single anonymous actor.
6. **Garden type without renderer** — schema addressable, UI silent.
7. Carryover GAP table **stale on bot P0** — update narrators when closing console seams.

---

## Pointers

- Kit SoT: `kit/mark.json` (v1.6.3) · `kit/scene.json` (v1.6.1) · `kit/check-consumers.mjs`
- Console habitat: `console/src/lib/scene.ts`, `console/src/components/banner.tsx`, `console/src/components/mininja.tsx`
- Host tint: `console/src/lib/tint.ts`
- Bot reference (shipped targeting): `bot/static/index.html`, `bot/server.py`
