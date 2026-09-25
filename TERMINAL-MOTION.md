# Terminal motion

How the Mininja mark is **allowed to move** in terminal / console surfaces. Sourced from [Thingscorp/mininja-console](https://github.com/Thingscorp/mininja-console) (`src/lib/scene.ts`, `src/components/banner.tsx`). Treat these as brand rules for any buddy UI that walks the mark through scenery.

The mascot has no name.

![Terminal motion](assets/visuals/terminal-motion.png)

## Scene intent

Drivers (commands, cards, AI) emit a **SceneIntent**:

```
{ emotion?, action?, stage?, facing?, line?, intensity?, holdMs? }
```

Resolved scene always has concrete `emotion`, `action`, `stage`, `facing`, `line`, `intensity`, `holdMs`.

| Field | Rule |
|-------|------|
| Unknown emotion | → `curious` |
| Unknown action | → `wait` |
| Unknown stage | keep current (do not jump to a fake place) |
| Stage change without facing | face **toward** the new stage (right if destination x is greater) |
| Default scene | idle · idle · dock · facing right |

Registry helpers: `registerEmotion` / `registerAction` / `registerStage`. Catalog is enumerable (`scene` command in console).

## Facing and lockup

- Facing is `left` or `right`.
- Hood mirrors: right uses `▚████` …; left uses `████▞` … (same rule as STYLEGUIDE.md `loadingLeft`).
- Eye pair swaps order when facing left.
- Feet may step while walking (`▀▀ ▀▀` / `▀ ▀▀▀`); crouch shortens the chin row; jump keeps the hood tall.

Body geometry otherwise matches [CONSTRUCTION.md](CONSTRUCTION.md). Eyes still come from emotion (or blink/sleep overrides).

## Locomotion (banner)

| Mode | When | Speed | Notes |
|------|------|------:|-------|
| Walk | Traveling to a stage, intensity 0–1 | 170 px/s | Faces direction of travel |
| Run | Traveling, intensity ≥ 2 | 280 px/s | Same facing rule |
| Arrive | Within 6 px of stage center | — | Snap to center; restore scene action |
| Patrol | Ready, action `idle`, empty `line` | 26 px/s | Bounce inside stage: `[x+56, x+width−90]` |
| Reduced motion | `prefers-reduced-motion: reduce` | — | Instant place + facing; **no** scoot/patrol/walk anim |

While traveling, the live action shown is forced to `walk` or `run` even if the intent still says something else.

### Camera

- Look-ahead: ~32% of view width when facing right, ~52% when facing left.
- Camera eases toward the target (`1 − exp(−dt × 5.2)`).
- Clamped to `[0, worldWidth − viewWidth]`.

### Offline

- Offline / sleep → stage `nightwatch`, emotion sleepy, action sleep.
- Wake / online → stage `dock`, emotion alert, action wave.

## Command → place map

Canonical console mapping (extend in product code; keep meanings stable for brand):

| Command family | Stage | Typical action |
|----------------|-------|----------------|
| help, clear, wake | dock | wave / idle |
| now, overview, todo, plan, brief, turn, save | desk | read / point / carry |
| refine, compound, qa, ralph | workshop | type / scan |
| look, api, web, postgres, pgeon | archives | scan / search |
| unknown, freeze/pause, bad feel/do/go | gate | shakeHead / point |
| completed / default success | rooftop | celebrate |
| offline, sleep | nightwatch | sleep |

Operator verbs in console:

- `go <stage>` — walk there (determined / walk)
- `feel <emotion>` — change face without forcing a new stage
- `do <action>` — change action in place
- `scene` — list the suite

## Expression bridge

STYLEGUIDE.md’s fifteen face states still map into the scene suite (legacy bridge). Prefer emotion+action+stage for new work; keep the face table for static brand sheets.

| Face (STYLEGUIDE.md) | Scene sketch |
|-------------------|--------------|
| idle / blink | idle + idle/blink @ dock |
| evaluating | focused + think @ desk |
| loadingRight / loadingLeft | focused + walk, facing matches |
| allowed | happy + nod @ desk |
| asking | curious + wait |
| denied | frustrated + shakeHead @ gate |
| sandboxing | mischievous + peek @ workshop |
| executing | determined + type @ workshop |
| completed | proud + celebrate @ rooftop |
| warning | worried + point @ gate |
| error | confused + shakeHead @ gate |
| cancelled | embarrassed + lookBack @ dock |
| offline | sleepy + sleep @ nightwatch |

## Don’ts

- Don’t fly, warp, or pop between distant stages when motion is enabled.
- Don’t patrol while a line is showing or while evaluating input.
- Don’t ignore reduced-motion — jump cut is required.
- Don’t invent stages outside the registered strip for marketing stills without documenting them here.
- Don’t put a personal name on the walker in HUD, lines, or docs.

Scenery inventory: [SCENERY.md](SCENERY.md).
