# North star — Giga Pets × Pebble × IFTTT

Mininja’s product shape in one line:

> A **pal you care about** on a **tiny always-on face**, with **optional event recipes** that drive the same kit ids — never a second brand.

Quality / product metaphors only. **Not affiliated with** Bandai (Giga Pets / Tamagotchi-class toys), Pebble Technology, IFTTT Inc., or Apple Inc. Spell it **Mininja**. The mascot / pal has **no personal name** (never Casque); no he/him.

**Product parents** = Giga Pets × Pebble × IFTTT (this page). **Quality metaphor** = “the Apple of Terminal Buddies” ([`BRAND.md`](BRAND.md)) — craft standard, not a fourth parent and not affiliation.

**Glance story** (what a peek should tell a busy developer): [`GLANCE.md`](GLANCE.md).

---

## The three parents

| Parent | What we borrow | What we refuse |
|--------|----------------|----------------|
| **Giga Pets** | A creature / **pal** you care about — warmth via faces / presence you *feel* | Digipet hunger/feeding loops, Farmville dashboards, gacha chrome, naming the mascot |
| **Pebble Watch OS** | Constrained always-on face; layers grow on; companion host does heavy work | Replacing the face with a web app; inventing a second mark; requiring a phone |
| **IFTTT** | When *this* → then *that*, targeting shared kit ids | Building a full Zapier console as v1 hero; shipping recipes before the terrarium |

Together they describe **one connected system**. **v1 hero** = **pal + habitat glass** (creature + habitat strip). Recipes stay **later plate** on the same graph — demotion ≠ disconnection. Do **not** read the three parents as ship-first “creature + face + recipes.”

---

## Map onto Mininja

| Layer | Pebble / pet analogue | Mininja brick | Where it lives |
|-------|----------------------|---------------|----------------|
| Always-on face | Watchface | Idle 3-line Unicode lockup (**pal** face) | [`kit/mark.json`](kit/mark.json) · [`examples/`](examples/) |
| Eyes / compact expressions | Watchface complications | **Faces** — keys of `kit/mark.json` → `faces` (Thingscorp default: 15) | `kit/mark.json` · [`STYLEGUIDE.md`](STYLEGUIDE.md) |
| Habitat emotion catalog | (scene layer) | **Emotions** — `kit/scene.json` → `emotions[].id` (Thingscorp default: 16) | `kit/scene.json` · [`TERMINAL-MOTION.md`](TERMINAL-MOTION.md) |
| Face ↔ scene join | — | [`legacyFaceBridge`](kit/scene.json) maps each face → emotion / action / optional stage | **MUST** use the bridge; **MUST NOT** equate faces with emotions |
| Facing / lockup mirror | Watch orientation | Desired `facing` (`left` \| `right`); adapters mirror — **facing wins** | [`adapters/mark`](adapters/mark) · [`PORTING.md`](PORTING.md) |
| Presence / motion chrome | Simple watch animations | `data-motion` / `data-state` keyed by kit **action** ids | [`adapters/presence`](adapters/presence) · [`adapters/react`](adapters/react) |
| Locomotion speeds | — | Walk / run / patrol numbers | `kit/scene.json` → `motion` · [`TERMINAL-MOTION.md`](TERMINAL-MOTION.md) |
| Habitat glass | Watch “apps” / timeline chrome *(analogue only — habitat is scenery chrome, not a Pebble app runtime)* | Stages, props, scene weather | `kit/scene.json` · [`SCENERY.md`](SCENERY.md) |
| Garden (repos in habitat) | — *(not a digipet care loop)* | `repoBranch` props = repos in the environment; growth **0..5** silhouette vocab | [`GARDEN.md`](GARDEN.md) · `kit/scene.json` → `garden` |
| Recipes | IFTTT applets / Pebble timeline actions | When event → face / action / stage / emotion / growth (+ optional tone chrome) | [`RECIPES.md`](RECIPES.md) — **later plate** |
| Companion host | Phone *(fiction — Mininja needs no phone)* | Console / bot / any host port. **bot** = Mac launcher over `console/`, not a second UI brand | [`console/`](console/) · [`bot/`](bot/) · [`PORTING.md`](PORTING.md) |

Presence ladder (progressive disclosure — **mark-first on-ramp**, then climb):

```
mark → faces → scoot → scene
```

That is Pebble’s progressive disclosure in our dialect. Paste the idle lockup in ~60s as the **on-ramp only**.

**v1 product ship bar (Russ, 2026-09-26):** a complete v1 **MUST** include **pal + habitat strip** (stages / props / scene weather from kit). Same bar as “creature + habitat strip” — the pal *is* the creature presence. Mark-only is **not** a complete v1 ship — it is how a stranger starts. **MUST NOT** bloat the face or skip to a recipe runner before the terrarium ships.

### Three meanings of “motion” (do not collapse)

| Sense | Meaning | SoT |
|-------|---------|-----|
| **Facing / lockup** | Left/right body + eyes layout | `adapters/mark` (facing wins) |
| **Presence chrome** | Sway / pulse / chip keyed by **action** id strings | `adapters/presence` · React `data-motion` / `data-state` |
| **Locomotion speeds** | Walk / run / patrol px/s and related numbers | `kit/scene.json` → `motion` |

---

## Glance / rubber-duck / visual notifications

Deep dive: [`GLANCE.md`](GLANCE.md). Summarized here so the north star stays the system map.

### Job

Not “show more GitHub.” A **rubber duck on the desk** that also glances at the developer’s world so they don’t keep opening tabs. Text shouts; Mininja changes **posture** (face, stage, plant silhouette) for peripheral awareness. Bridging to make development a bit more pleasant — reminiscent of the rubber-duck-on-the-desk practice. **Pleasantness IS the product** when nothing’s wrong.

### Pal (product noun)

| | |
|--|--|
| **Pal** | The agent creature in the glass — presence doing work (human-driven buddy / coding agent / automation). **Unnamed** personally (never Casque; no he/him). |
| **Mark** | The pal’s face lockup (`kit/mark.json`). |
| **Multi-pal** | Optional host modular layer: several pals, **color-distinguished**; one pal ↔ one plant for a focused job. **MUST NOT** invent kit pal-color / agent-id harvest tables. |

### Glance hierarchy (interrupt cost)

| Rank | Need | Posture gist |
|-----:|------|--------------|
| 1 | **Blocked now** | `error` / `denied` @ `gate` — sticky until clear |
| 2 | **Someone needs me** | `asking` — soft sticky; often `desk`, not gate |
| 3 | **Something landed** | `completed` / `allowed` @ `rooftop` — brief celebrate, **wins expire** |
| 4 | **Busy on my behalf** | `sandboxing` / `executing` / `evaluating` @ `workshop` / `desk` — presence, not alarm |
| 5 | **Ambient repo / goal health** | Plants growth 0..5; weeds = quiet desaturate; multi-repo = plants + thin cables |
| 6 | **Quiet / offline** | `idle` / `blink` / `offline` + `dock` / `nightwatch` — default most of the day |

Everything else filtered by recipe packs the user chose. Bridges emit lots; recipes filter; kit few bricks. Sticky priority: **blocked > asking > busy**. Full anti-dashboard rules: [`GLANCE.md`](GLANCE.md).

### Three attention layers

| Layer | Question | Brick |
|-------|----------|-------|
| **Pal** | Do I need to look up? | face + action |
| **Habitat** | Where in the story? | stage + weather |
| **Garden** | How healthy are plants / goals? | `repoBranch` growth |

Cross-links: [`GARDEN.md`](GARDEN.md) (ambient) · [`RECIPES.md`](RECIPES.md) (filtering) · [`qa/simulations/`](qa/simulations/) (scenario ↔ rank) · [`SCENERY.md`](SCENERY.md) (stages that carry the story).

---

## One system graph (demotion ≠ disconnection)

Recipes stay **later plate** for the v1 hero (pal + habitat glass). They still talk to the same bricks:

```
mark / faces (pal)  ↔  habitat (stages · props · scene weather)
      ↕                      ↕
 garden growth  ↔  RECIPES (when → then)   [later plate]
```

`legacyFaceBridge` joins compact faces to scene emotion / action / stage. Scene emotions beyond the bridge (`alert`, `relieved`, `sad`, `startled`) are habitat / SceneIntent expansion — **not** orphans and **not** a second face table.

### Recipe-compatible id seams (MUST)

Ports and hosts **MUST** pass these as kit id **strings** (adapters pass through; they do not invent catalogs):

| Id kind | Lives in |
|---------|----------|
| **face** | `kit/mark.json` → `faces` keys |
| **stage** | `kit/scene.json` → `stages[].id` |
| **action** | `kit/scene.json` → `actions[].id` |
| **emotion** | `kit/scene.json` → `emotions[].id` |
| **growth** | integer **0..5** on `repoBranch` / `garden.growth` |

**MUST NOT** say or invent “mood ids.” Kit has **emotion** ids and **`moodColorsUiOnly` tones** (`idle` \| `accent` \| `ok` \| `warn` \| `err`). RECIPES `then.mood` (when used) is **tone chrome only** — not an id namespace beside face / stage / action / emotion / growth.

**MUST NOT** invent kit constants for pal colors, agent ids, weed propKinds, or harvest KPI kinds — those are host / pack / design layers ([`GLANCE.md`](GLANCE.md) · [`GARDEN.md`](GARDEN.md)).

Silent dual tables beside kit are shame; forks and overlays are encouraged. Geometry (`stageWidthPx`, `stageCount`, …) is optional for mark-only ports; full scene ports that stay on upstream Thingscorp kit **MUST** match `kit/scene.json` → `geometry` (see [`PORTING.md`](PORTING.md)).

---

## Design rules this north star implies

1. **Glyphs are the mark** — **MUST NOT** ship a redrawn substitute as SoT ([`CONSTRUCTION.md`](CONSTRUCTION.md)).
2. **Constraint is the craft** — Pebble-small surfaces; Linear-level restraint for any UI chrome.
3. **Warmth without clutter** — Giga Pets–class pal warmth (faces / presence) without digipet care loops or another status dashboard. Garden growth is **repo** silhouette vocab in habitat (`repoBranch`), not pet leveling.
4. **kit = data** — Unix-small adapters filter JSON; they do **not** become apps ([`adapters/`](adapters/)).
5. **Recipes plug in, they don’t rewrite** — IFTTT-style links drive kit **ids** above; they **MUST NOT** invent parallel face / emotion catalogs.
6. **Companion does the heavy lift** — console / bot / host; the face stays portable. No phone required.
7. **v1 ship = pal + habitat strip** — mark-only is the 60s on-ramp only. **MUST NOT** call mark-only “v1 done,” or hero the recipe runner / webhook bridges / full IFTTT/Zapier surface before the terrarium.
8. **Mascot / pal unnamed** — **MUST NOT** use Casque or any personal name; no he/him.
9. **Glance over feeds** — posture for peripheral awareness; one sticky interrupt; wins expire; plants peripheral ([`GLANCE.md`](GLANCE.md)).

---

## v1 hero vs later plate

| Complete v1 ship | On-ramp only / later plate |
|------------------|----------------------------|
| **Pal + habitat strip** together (unnamed mark inside stages · props · scene weather) | Mark-only paste (~60s) — on-ramp, **not** complete v1 |
| Presence ladder climbed at least through **scene** for the product surface | Recipe runner / webhook bridges |
| Garden vocabulary in kit (`repoBranch` growth 0..5) kept open | Full IFTTT / Zapier product surface; live GitHub growth overlays as default; outside-world “weather” as hero |
| Glanceable quiet default (posture when needed) | Multi-pal color packs / agent-id catalogs as kit SoT |

Later plate still belongs on this page’s graph. Demoting recipes from the README hero does not cut the IFTTT parent out of the system — and does **not** make recipes part of the v1 hero. Mark-only ports remain welcome as the 60s start; calling them “v1 done” is a FAIL against this north star.

---

## How to use this doc

- **Pitch / onboarding** — start here, then [`BRAND.md`](BRAND.md) for quality pillars (“Apple of Terminal Buddies”) vs this page’s product parents.
- **Glance / rubber-duck** — [`GLANCE.md`](GLANCE.md) for hierarchy, attention layers, anti-dashboard rules, pals.
- **Porting** — [`PORTING.md`](PORTING.md) for the 60s face and ladder; keep recipe-compatible id seams; see [`adapters/presence`](adapters/presence) for motion chrome.
- **Scene / habitat / garden** — [`SCENERY.md`](SCENERY.md) · [`GARDEN.md`](GARDEN.md) · [`TERMINAL-MOTION.md`](TERMINAL-MOTION.md).
- **Automation design** — [`RECIPES.md`](RECIPES.md) when the later plate is scheduled.
- **Machine SoT** — [`kit/mark.json`](kit/mark.json) · [`kit/scene.json`](kit/scene.json) **only**; narrators never invent constants. Counts above narrate the Thingscorp default kit — always re-read JSON.

If a decision fights this north star (bloat the face, dual-table emotions, hero the recipe runner before the terrarium, equate faces with emotions, turn garden into a KPI dashboard), stop and re-read the three parents — then [`GLANCE.md`](GLANCE.md).
