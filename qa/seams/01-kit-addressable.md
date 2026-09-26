# Kit addressable seams — host / recipe inventory

| Field | Value |
|-------|-------|
| Audience | Apps (console+bot) · Ports · Kit maintainers |
| Date | 2026-09-26 (ET) |
| Branch | `feat/monorepo-public` @ `8a4860d` (tip may move; re-read live JSON) |
| Kit versions | `mark.json` **1.6.3** · `scene.json` **1.6.1** |
| Scope | Mapping only — **no kit JSON edits** |
| Product context | [`qa/OLD-CONSOLE-CARRYOVER.md`](../OLD-CONSOLE-CARRYOVER.md) P0/P1 |
| Prior vocab check | [`kit/qa/ID-VOCAB-REVIEW-a31587a.md`](../../kit/qa/ID-VOCAB-REVIEW-a31587a.md) |

**Rule:** Root markdown narrates; kit JSON is SoT. Hosts/recipes target ids below without inventing parallel catalogs.

---

## 1. Addressable IDs

Every id a host or recipe can set/get without inventing new vocabulary. Cite path → field.

### 1.1 Mark faces (`kit/mark.json` → `faces.*`)

Compact **15**-face presence map (STYLEGUIDE / CONSTRUCTION). Recipe `then.face` targets these.

| Face id | Eyes | Tone | Face motion | Mirrored |
|---------|------|------|-------------|----------|
| `idle` | ●● | idle | — | no |
| `blink` | ── | idle | — | no |
| `evaluating` | ◐◑ | accent | pulse | no |
| `allowed` | >< | ok | bounce | no |
| `asking` | ?? | warn | — | no |
| `denied` | ┃┃ | err | shake | no |
| `sandboxing` | ◇◇ | idle | — | no |
| `executing` | ◣◢ | accent | pulse | no |
| `completed` | ▴▴ | ok | bounce | no |
| `warning` | ▲△ | warn | bounce | no |
| `error` | ×× | err | shake | no |
| `cancelled` | ◦◦ | idle | — | no |
| `offline` | ‒‒ | idle | — | no |
| `loadingRight` | ●● | accent | pulse | no |
| `loadingLeft` | ●● | accent | pulse | **yes** |

**Also addressable on mark:**

| Path | Values / notes |
|------|----------------|
| `kit/mark.json` → `moodColorsUiOnly.*` | Tone keys: `idle`, `accent`, `ok`, `warn`, `err` (+ hex for UI). Recipe `then.mood.tone` chrome. |
| `kit/mark.json` → `typeface.family` / `weights` / `cssStack` | IBM Plex Mono · 400/500/600 (sealed — see §2) |
| `kit/mark.json` → `grid.*` | 5×3 · cellAspect `1:1` · totalCells 15 (sealed) |
| `kit/mark.json` → `codepoints.*` | hoodCornerRightFacing, hoodCornerLeftFacing, fullBlock, upperHalfBlock, space |
| `kit/mark.json` → `canonicalIdle` / `mirroredIdle` | Glyph stacks (not recipe targets; renderer bases) |
| `kit/mark.json` → `presenceLadder[].id` | `mark-only` → `face-states` → `scoot-facing` → `scene-strip` |
| `kit/mark.json` → `forbiddenNames` | `["Casque"]` (sealed) |
| Face field `motion` (on face records) | Closed set used by faces: `pulse` \| `bounce` \| `shake` \| `null` |

### 1.2 Scene emotions (`kit/scene.json` → `emotions[].id`)

Habitat / `SceneIntent.emotion` vocabulary — **16** ids. Do **not** equate with faces.

| Emotion id | Tone | Motion (if any) |
|------------|------|-----------------|
| `idle` | idle | — |
| `curious` | accent | — |
| `focused` | accent | pulse |
| `happy` | ok | bounce |
| `proud` | ok | bounce |
| `mischievous` | accent | — |
| `worried` | warn | sway |
| `confused` | warn | — |
| `startled` | err | shake |
| `embarrassed` | **muted** | — |
| `frustrated` | err | shake |
| `determined` | accent | pulse |
| `relieved` | ok | — |
| `sleepy` | muted | — |
| `alert` | accent | pulse |
| `sad` | muted | — |

**Unbridged by `legacyFaceBridge` (still recipe-/SceneIntent-addressable):** `alert`, `relieved`, `sad`, `startled`.

**Tone note:** emotion tones include host/scene `muted` (not in `moodColorsUiOnly`). STYLEGUIDE: `muted` is host-only chrome beside the five kit UI tones.

### 1.3 Scene actions (`kit/scene.json` → `actions[].id`)

**22** action ids. Presence CSS / React `data-motion` SHOULD prefer these (PORTING.md).

| Action id | motion | pose | fx |
|-----------|--------|------|-----|
| `idle` | none | stand | none |
| `blink` | none | stand | none |
| `walk` | bob | stand | none |
| `run` | bob | stand | none |
| `think` | pulse | stand | think |
| `scan` | pulse | stand | scan |
| `type` | pulse | lean | type |
| `read` | sway | stand | none |
| `point` | none | lean | none |
| `wave` | bounce | stand | wave |
| `jump` | hop | jump | spark |
| `crouch` | none | crouch | none |
| `lookBack` | sway | stand | none |
| `celebrate` | bounce | jump | spark |
| `shakeHead` | shake | stand | none |
| `nod` | bob | stand | none |
| `search` | sway | lean | search |
| `wait` | sway | stand | none |
| `sleep` | none | crouch | sleep |
| `carry` | bob | lean | none |
| `peek` | none | crouch | search |
| `climb` | hop | jump | none |

**Derived closed sets (not separate catalogs — owned by actions):**

| Field | Closed values |
|-------|----------------|
| `actions[].pose` | `stand` \| `lean` \| `crouch` \| `jump` |
| `actions[].motion` | `none` \| `bob` \| `bounce` \| `hop` \| `pulse` \| `shake` \| `sway` |
| `actions[].fx` | `none` \| `think` \| `scan` \| `type` \| `wave` \| `spark` \| `search` \| `sleep` |

### 1.4 Stages (`kit/scene.json` → `stages[].id`)

**7** strip rooms (index 0..6). Geometry: `stageWidthPx=420`, `worldWidthPx=2940`, `anchorRatio=0.42`.

| Index | Stage id | Default weather | Hint |
|------:|----------|-----------------|------|
| 0 | `nightwatch` | night | sleep / offline |
| 1 | `dock` | haze | home bay (**defaultScene.stage**) |
| 2 | `desk` | clear | status, plan, brief |
| 3 | `workshop` | sparks | ralph, execute, refine |
| 4 | `archives` | scan | look, pgeon, memory |
| 5 | `gate` | haze | ask, deny, unknown |
| 6 | `rooftop` | clear | completed / proud |

Stock `stages[].props[]` place décor with `kind` ∈ `propKinds` + `{x,y,w,h}`. `repoBranch` is **absent from stock** by design (overlay/fork).

### 1.5 Weather (`kit/scene.json` → `weather[]`)

Closed enum (habitat chrome / sky class — **not** garden growth, **not** recipe weather-from-outside):

`clear` · `haze` · `night` · `sparks` · `scan` · `rain`

(`rain` is enum-valid; unused by stock stages — overlay-only.)

### 1.6 Prop kinds (`kit/scene.json` → `propKinds[]`)

Closed set of **10**:

`block` · `shelf` · `lamp` · `crate` · `screen` · `antenna` · `moon` · `barrier` · `cable` · `repoBranch`

### 1.7 Garden growth (`kit/scene.json` → `garden`)

| Path | Addressable |
|------|-------------|
| `garden.propKind` | `repoBranch` |
| `garden.growth.min`..`max` | integer **0..5** inclusive |
| `garden.growth.default` | `0` (omit field → default) |
| `garden.growth.steps[].level` / `label` | 0 seed · 1 sprout · 2 sapling · 3 young · 4 branching · 5 canopy |
| `garden.silhouetteHeightPx` | `h(g)=12+12g` px (recommended; hosts may fork) |
| `garden.propFields` | required `kind,x,y` · optional `w,h,growth,label` |
| `garden.bridge.github` | `false` (kit never calls GitHub) |

Recipe design (`RECIPES.md`): `then.growth` = `N` or `{ "prop": "<label>", "value": N }`.

### 1.8 Scene state / intent fields (`kit/scene.json` → `defaultScene` + TERMINAL-MOTION)

Concrete **Scene** fields a runner can set:

| Field | Closed / type | Default |
|-------|---------------|---------|
| `emotion` | ∈ emotions | `idle` |
| `action` | ∈ actions | `idle` |
| `stage` | ∈ stages | `dock` |
| `facing` | `left` \| `right` | `right` |
| `line` | string | `""` |
| `intensity` | `0` \| `1` \| `2` | `1` (≥2 ⇒ run speed) |
| `holdMs` | number | `0` |

**Fallbacks** (`kit/scene.json` → `fallbacks`):

| Unknown | Resolve to |
|---------|------------|
| emotion | `curious` |
| action | `wait` |
| stage | **keep-current** (never teleport) |

### 1.9 Legacy face → scene bridge (`kit/scene.json` → `legacyFaceBridge.*`)

Join compact faces → habitat without inventing a second map. Omitted `stage` = keep-current.

| Face | emotion | action | stage / facing |
|------|---------|--------|----------------|
| `idle` | idle | idle | — |
| `blink` | idle | blink | — |
| `evaluating` | focused | think | desk |
| `loadingRight` | focused | walk | facing right |
| `loadingLeft` | focused | walk | facing left |
| `allowed` | happy | nod | desk |
| `asking` | curious | wait | — |
| `denied` | frustrated | shakeHead | gate |
| `sandboxing` | mischievous | peek | workshop |
| `executing` | determined | type | workshop |
| `completed` | proud | celebrate | rooftop |
| `warning` | worried | point | gate |
| `error` | confused | shakeHead | gate |
| `cancelled` | embarrassed | lookBack | dock |
| `offline` | sleepy | sleep | nightwatch |

### 1.10 Motion / geometry numbers (`kit/scene.json` → `motion.*` / `geometry.*`)

Not “ids,” but **host-addressable constants** (must not dual-table):

| Path | Thingscorp default |
|------|-------------------:|
| `geometry.stageWidthPx` | 420 |
| `geometry.stageCount` | 7 |
| `geometry.worldWidthPx` | 2940 |
| `geometry.anchorRatio` | 0.42 |
| `geometry.restOffsetPx` | 176.4 |
| `motion.walkPxPerSec` | 170 |
| `motion.runPxPerSec` | 280 |
| `motion.patrolPxPerSec` | 26 |
| `motion.arriveEpsilonPx` | 6 |
| `motion.patrolInsetLeftPx` / `RightPx` / `patrolSpanPx` | 56 / 90 / 274 |
| `motion.cameraLookAheadRight` / `Left` | 0.32 / 0.52 |
| `motion.cameraFollowRatePerSec` | 5.2 |
| `motion.stepPeriodMovingSec` / `IdleSec` | 0.16 / 0.28 |
| `motion.dtClampSec` | 0.05 |
| `motion.adjacentStageWalkSec` / `RunSec` / `fullPatrolSec` | ≈2.4706 / 1.5 / ≈10.538 |

Gate: `node kit/check-consumers.mjs`.

### 1.11 Pure documentation (not recipe-/host-addressable catalogs)

These docs **narrate** kit; they must not be treated as parallel SoT tables:

| Doc | Role |
|-----|------|
| `CONSTRUCTION.md` | Glyph grid construction; points at mark.json |
| `STYLEGUIDE.md` | Expression table narration; host blink/warning flash guidance |
| `HABITAT-PORT.md` | Port checklist; registerFromKit |
| `GARDEN.md` | Growth metaphor; weeds/KPI **design-only** (no weed propKinds) |
| `TERMINAL-MOTION.md` | Locomotion laws; command→stage map (host chrome) |
| `PORTING.md` | Presence ladder; adapter contracts |
| `GLANCE.md` | Glance ranks; pals; anti-dashboard — **no new kit constants** |
| `RECIPES.md` | Later-plate `when`/`then` design |
| `SCENERY.md` / `BRAND*.md` | Scenery/brand narration |
| `kit/README.md` | Kit charter + override paths |
| `kit/qa/*` | Tests / vocab reviews |

**Host-only (explicitly not kit):** auto-blink timer 6–14s; warning eye flash ▲▲/△△; command→stage maps; `COMMAND_INTENT`; pal tint; @-mention; permission modes; agent roster.

---

## 2. Sealed constraints

Hosts **MUST NOT** override these (fork kit on purpose if you diverge; never silent dual):

| Constraint | Source | Rule |
|------------|--------|------|
| **5×3 grid** | `mark.json` → `grid` · CONSTRUCTION | columns=5, rows=3, totalCells=15; never rearrange three lines |
| **Cell aspect 1:1** | `grid.cellAspect` | Square monospace cells; no stretch/skew/rotate |
| **Glyphs ARE the mark** | CONSTRUCTION / BRAND-RULES | No redrawn cartoon; eye slot only (cols 4–5) changes (except mirror) |
| **Monochrome brand assets** | `mark.monochrome` · BRAND-RULES | SVG/PNG/docs monochrome; mood hex = UI only |
| **IBM Plex Mono** | `mark.typeface` | Family + weights 400/500/600 required for production lockup |
| **Mascot unnamed** | `mascotNamed: false` | No personal name; no he/him |
| **forbiddenNames** | `["Casque"]` | Never Casque in product/copy/code |
| **No digipet / harvest KPI kit fields** | GLANCE / GARDEN / NORTH-STAR | Growth is silhouette integer only |
| **No pal-color / agent-id kit tables** | GLANCE / OLD-CONSOLE-CARRYOVER | Multi-pal color = Apps host chrome |
| **No GitHub bridge in kit** | `garden.bridge.github: false` | Growth authored or host overlay |
| **No STAGE_SEED / EMOTION_SEED / ACTION_SEED** | HABITAT-PORT · check-consumers | Console must `registerFromKit()` |
| **Unknown stage = keep-current** | `fallbacks.unknownStage` | Never invent teleport stage |
| **Weather ≠ growth** | GARDEN / HABITAT-PORT | Stage weather is strip sky; growth is prop field |
| **Reduced motion** | TERMINAL-MOTION | Jump cut only; no walk/run/patrol |

Clearspace / min size (brand, not usually recipe-set): one row height clearspace; digital min height 24px; min cell 8px; terminal ≥3 rows.

---

## 3. Gaps (Apps P0 carry-over vs kit exposure)

From [`qa/OLD-CONSOLE-CARRYOVER.md`](../OLD-CONSOLE-CARRYOVER.md). Ownership tag: **kit-should-own** | **host-chrome-ok** | **gap-needs-design**.

| # | Behavior Apps needs | Kit today | Classification | Notes |
|---|---------------------|-----------|----------------|-------|
| G1 | **Composer @-mention** (`@Ada` / `@all`) | No agent/roster ids in kit | **host-chrome-ok** | P0 product; targeting is Apps. Kit must not gain agent catalogs. |
| G2 | **Pull-off / retarget / rally-all** | No ops vocabulary in kit | **host-chrome-ok** | `stop_bot` exists in Apps; rally = Apps gap. |
| G3 | **Unify composer** (programs ↔ teammate tasks) | N/A | **host-chrome-ok** | Split console vs bot UI. |
| G4 | **Permission modes** `draft` \| `auto` \| `free` | Not in kit | **host-chrome-ok** | Fail-closed posture is product, not mark/scene. |
| G5 | **Pal tint / multi-pal color** | Explicitly forbidden in kit | **host-chrome-ok** | `tint.py` / CSS `--pal-tint`; MUST NOT kit table. |
| G6 | **Pal ↔ `repoBranch` plant binding** | Kit has `repoBranch` + growth 0..5 | **gap-needs-design** (Apps viz) | Kit bricks exist; concurrent pal-on-plant UI not shipped. Binding metadata = host/pack, not new kit ids. |
| G7 | **Recipe `then.emotion`** as first-class | Emotions catalog exists; RECIPES emphasizes `face` | **gap-needs-design** | Runner may accept `emotion` later; prefer face-first; join via bridge. |
| G8 | **Recipe `then.facing` / `intensity` / `holdMs`** | In defaultScene / SceneIntent; not in RECIPES `then` examples | **gap-needs-design** | Scene runner already has them; recipe plate may opt-in later — do not invent new ids. |
| G9 | **Tone `muted`** for scene chrome | Emotions use `muted`; mark `moodColorsUiOnly` has 5 keys only | **host-chrome-ok** | Documented host/scene tone; do not add `muted` to mark mood table unless intentional kit change. |
| G10 | **Glance sticky priority runner** | Design in GLANCE/RECIPES only | **gap-needs-design** | Host/pack intent; not a kit JSON field. |
| G11 | **Bot inline FRAMES / `sandbox` alias** | Kit face is `sandboxing` | **host-chrome-ok** | Apps hydrate from kit; alias map is host debt (P2 carry-over). |
| G12 | **Command→stage map** | Narrated TERMINAL-MOTION; not kit enum | **host-chrome-ok** | `COMMAND_INTENT` lives in console; kit owns stage ids only. |
| G13 | **Routines / MAX_PARALLEL / SSE** | N/A | **host-chrome-ok** | Bot runtime. |
| G14 | **Auth / storage / Better Auth** | N/A | **host-chrome-ok** | Apps infra. |
| G15 | **Pal color tables in kit** (temptation) | Forbidden | **kit-should-own** = **refuse** | If someone proposes kit pal hues → reject; keep host chrome. |
| G16 | **Weed / harvest / KPI-kind propKinds** | Design-only in GARDEN; still `repoBranch` | **kit-should-own** = **refuse** | No new weed propKinds. |

**Summary:** Almost all P0 composer/teammate gaps are **host-chrome-ok**. Kit already exposes the glance bricks (face · stage · action · emotion · growth). Remaining kit-adjacent work is **design** (recipe `then` opt-ins, pal↔plant viz) — not new face/stage catalogs.

---

## 4. Anti-dual-table risks

Places console/bot/adapters might invent parallel tables beside kit:

| Risk | Where it shows up | Mitigation |
|------|-------------------|------------|
| **STAGE_SEED / EMOTION_SEED / ACTION_SEED** | Old console pattern; forbidden in monorepo `scene.ts` | `check-consumers` + `console/scripts/kit-align.mjs` |
| **Hardcoded walk/run/camera literals** | `banner.tsx` legacy `0.35` look-ahead | Gate: derive `WALK/RUN_PX_PER_SEC`, kit camera ratios only |
| **Inline FRAMES glyph table** | `bot/static/index.html` FRAMES; `console/src/lib/mascot.ts` FRAMES | Hydrate from `mark.json`; bridge for scene; delete drift |
| **`sandbox` vs `sandboxing`** | Bot engine alias / old FRAMES key | Normalize to kit `sandboxing`; alias only at host edge |
| **Casque name revival** | Comments, tags, copy | `forbiddenNames` + check-consumers Casque scan |
| **Parallel eye/glyph tables in docs** | STYLEGUIDE/CONSTRUCTION drift from mark.json | Docs narrate; CoS vocab review |
| **Pal-color catalog in kit** | Temptation for multi-pal | GLANCE: host chrome only |
| **Weed / KPI propKinds** | GARDEN design vocab leaking into JSON | Keep design-only; still `repoBranch` |
| **Garden growth dual scale** | Host invents 0..10 or named stages | Use `garden.growth` 0..5 only |
| **Equating face ids ≡ emotion ids** | Hosts conflating `error` face with `confused` emotion | Use `legacyFaceBridge`; never merge catalogs |
| **Inventing `data-motion` union ≠ actions** | Presence CSS / React | PORTING: motion vocabulary = action ids |
| **COMMAND_INTENT as second SoT** | Console maps | OK as host chrome if stage/emotion/action ids resolve in kit |
| **Recipe packs embedding new face ids** | Future packs | Runner warns on unknown; packs must cite kit |
| **Scene weather used as growth** | Confusing `sparks` with canopy | Separate channels (GARDEN) |
| **Bot grove trees ≠ repoBranch** | Stage silhouettes vs garden plants | Do not confuse; garden is overlay props |

---

## 5. Recommended kit seam API

Minimal “kit bricks” a recipe runner / habitat host should **get/set**. Aligns with `SceneIntent` + recipe `then` + garden.

### 5.1 Set (write posture)

| Brick | Type | Kit path | Recipe `then` today |
|-------|------|----------|---------------------|
| `face` | enum(15) | `mark.faces.*` | **yes** (primary) |
| `emotion` | enum(16) | `scene.emotions[].id` | optional later (prefer face → bridge) |
| `action` | enum(22) | `scene.actions[].id` | **yes** |
| `stage` | enum(7) | `scene.stages[].id` | **yes** |
| `facing` | `left`\|`right` | `defaultScene.facing` | SceneIntent; recipe opt-in later |
| `intensity` | 0\|1\|2 | `defaultScene.intensity` | SceneIntent; recipe opt-in later |
| `holdMs` | number | `defaultScene.holdMs` | SceneIntent |
| `line` | string | `defaultScene.line` | SceneIntent (patrol gate) |
| `mood.tone` | idle\|accent\|ok\|warn\|err | `moodColorsUiOnly` | **yes** (`then.mood`) |
| `growth` | 0..5 or `{prop,value}` | `garden.growth` | **yes** (design) |
| `weather` | enum(6) | `weather[]` / stage.weather | Host scenery chrome (not recipe hero) |
| `prop.kind` | enum(10) | `propKinds` | Overlay placement |

**Resolution order (recommended):** if `face` set → apply `legacyFaceBridge` then overlay any explicit `emotion`/`action`/`stage`/`facing`. Unknown ids → kit `fallbacks` (warn, don’t crash).

### 5.2 Get (read catalogs / resolve)

| Getter | Returns |
|--------|---------|
| `listFaces()` / `hasFace(id)` | mark face keys |
| `listEmotions()` / `hasEmotion` | scene emotions |
| `listActions()` / `hasAction` | scene actions |
| `listStages()` / `hasStage` | scene stages |
| `getFace(id)` | eyes, tone, motion, lines, mirrored |
| `getEmotion` / `getAction` / `getStage` | defs + fallbacks |
| `intentFromLegacy(face)` | SceneIntent from bridge |
| `applyIntent(current, intent)` | concrete Scene |
| `growthHeight(g)` | `12 + 12*g` from silhouette formula |
| `motion` / `geometry` snapshot | speeds, widths (read-only numbers) |

Reference implementation: `console/src/lib/scene.ts` (`registerFromKit`, `SceneIntent`, `LEGACY_INTENT`). Adapters: `adapters/mark` for face→strings.

### 5.3 Explicit non-bricks (never expose as kit set/get)

- Pal / agent id, name, tint, roster  
- Permission mode, stop/rally ops, @-mention syntax  
- LLM keys, auth, routines, MAX_PARALLEL  
- Weed kinds, harvest KPI kinds, digipet meters  
- Auto-blink period, warning flash timer (host guidance)

---

## 6. Quick reference — closed enums

```
faces (15):     idle blink evaluating allowed asking denied sandboxing executing
                completed warning error cancelled offline loadingRight loadingLeft

emotions (16):  idle curious focused happy proud mischievous worried confused
                startled embarrassed frustrated determined relieved sleepy alert sad

actions (22):   idle blink walk run think scan type read point wave jump crouch
                lookBack celebrate shakeHead nod search wait sleep carry peek climb

stages (7):     nightwatch dock desk workshop archives gate rooftop

weather (6):    clear haze night sparks scan rain

propKinds (10): block shelf lamp crate screen antenna moon barrier cable repoBranch

growth:         0..5  (seed sprout sapling young branching canopy)

facing:         left | right
intensity:      0 | 1 | 2
tones (mark):   idle accent ok warn err
tone (+scene):  muted   ← host/scene only
poses:          stand lean crouch jump
```

---

## 7. Pointers

- Machine SoT: [`kit/mark.json`](../../kit/mark.json) · [`kit/scene.json`](../../kit/scene.json)
- Gate: `node kit/check-consumers.mjs`
- Carry-over P0/P1: [`qa/OLD-CONSOLE-CARRYOVER.md`](../OLD-CONSOLE-CARRYOVER.md)
- Glance / pals: [`GLANCE.md`](../../GLANCE.md)
- Recipes (later): [`RECIPES.md`](../../RECIPES.md)
- Habitat port: [`HABITAT-PORT.md`](../../HABITAT-PORT.md)
