# North star — Giga Pets × Pebble × IFTTT

Mininja’s product shape in one line:

> A **creature you care about** on a **tiny always-on face**, with **optional event recipes** that drive the same kit ids — never a second brand.

Quality / product metaphors only. **Not affiliated with** Bandai (Giga Pets / Tamagotchi-class toys), Pebble Technology, IFTTT Inc., or Apple Inc. Spell it **Mininja**. The mascot has **no personal name**.

---

## The three parents

| Parent | What we borrow | What we refuse |
|--------|----------------|----------------|
| **Giga Pets** | A living creature with mood, care, and growth you *feel* | Farmville dashboards, gacha chrome, naming the mascot |
| **Pebble Watch OS** | Constrained always-on face; apps layer on; companion does heavy work | Replacing the face with a web app; inventing a second mark |
| **IFTTT** | When *this* → then *that*, targeting shared ids | Building a full Zapier console as v1 hero |

Together they are one baby: **creature + face + recipes on one system graph**.

---

## Map onto Mininja

| Layer | Pebble / pet analogue | Mininja brick | Where it lives |
|-------|----------------------|---------------|----------------|
| Always-on face | Watchface | Idle 3-line Unicode lockup | [`kit/mark.json`](kit/mark.json) · [`examples/`](examples/) |
| Mood / eyes | Watchface complications | Faces (15) | `kit/mark.json` · [`STYLEGUIDE.md`](STYLEGUIDE.md) |
| Motion | Simple animations | Scoot / facing / speeds | [`kit/scene.json`](kit/scene.json) · [`TERMINAL-MOTION.md`](TERMINAL-MOTION.md) |
| Habitat glass | Watch “apps” / timeline chrome | Stages, props, scene weather | `kit/scene.json` · [`SCENERY.md`](SCENERY.md) |
| Growth | Pet care / leveling | Garden `repoBranch` growth 0..5 | [`GARDEN.md`](GARDEN.md) |
| Recipes | IFTTT applets / Pebble timeline actions | When event → face / action / stage / mood / growth | [`RECIPES.md`](RECIPES.md) — **later plate** |
| Companion host | Phone | Console / bot / any host port | [`console/`](console/) · [`bot/`](bot/) · [`PORTING.md`](PORTING.md) |

Presence ladder (ship the thinnest layer that fits):

```
mark → faces → scoot → scene
```

That is Pebble’s progressive disclosure in our dialect. Paste the idle lockup in ~60s; grow only when you need it.

---

## One system graph (demotion ≠ disconnection)

Recipes stay **later plate** for the v1 hero (creature + habitat glass). They still talk to the same bricks:

```
mark / faces  ↔  habitat (stages · props · scene weather)
      ↕                      ↕
 garden growth  ↔  RECIPES (when → then)
```

Do **not** orphan seams. Face, stage, action, mood, and growth **ids** stay kit strings so a future recipe can target them. Silent dual tables beside kit are shame; forks and overlays are encouraged.

---

## Design rules this north star implies

1. **Glyphs are the mark** — no redrawn substitute as SoT ([`CONSTRUCTION.md`](CONSTRUCTION.md)).
2. **Constraint is the craft** — Pebble-small surfaces; Linear-level restraint for any UI chrome.
3. **Care without clutter** — Giga Pets warmth (mood, growth) without turning the buddy into another status dashboard.
4. **kit = data** — Unix-small adapters filter JSON; they do not become apps ([`adapters/`](adapters/)).
5. **Recipes plug in, they don’t rewrite** — IFTTT-style links drive kit ids; they do not invent parallel emotion catalogs.
6. **Companion does the heavy lift** — console/bot/host; the face stays portable.

---

## v1 hero vs later plate

| Ship first | Hold for later |
|------------|----------------|
| Creature (Unicode mark, unnamed) | Recipe runner / webhook bridges |
| Habitat glass (stages · props · scene weather) | Full IFTTT / Zapier product surface |
| Presence ladder ports (mark → faces → scoot → scene) | Live GitHub growth overlays as default |
| Garden vocabulary in kit (growth 0..5) | Outside-world “weather” as hero |

Later plate still belongs on this page’s graph. Demoting recipes from the README hero is not cutting the IFTTT parent out of the baby.

---

## How to use this doc

- **Pitch / onboarding** — start here, then [`BRAND.md`](BRAND.md) for positioning pillars.
- **Porting** — [`PORTING.md`](PORTING.md) for the 60s face and ladder; keep ids recipe-compatible.
- **Scene / care** — [`SCENERY.md`](SCENERY.md) · [`GARDEN.md`](GARDEN.md) · [`TERMINAL-MOTION.md`](TERMINAL-MOTION.md).
- **Automation design** — [`RECIPES.md`](RECIPES.md) when the later plate is scheduled.
- **Machine SoT** — [`kit/`](kit/) only; narrators never invent constants.

If a decision fights this north star (bloat the face, dual-table emotions, hero the recipe runner before the terrarium), stop and re-read the three parents.
