# Garden — repos as growing branches

**Data only.** Kit holds the schema; nothing here calls GitHub (or any host). Growth is authored overlay data in v1. When the [RECIPES.md](RECIPES.md) plate lands, hosts may map normalized events → `growth` (and optionally `face`) via the same recipe `then` shape — kit still has **no** GitHub bridge.

## Metaphor

Inside the terrarium **habitat glass**, a repository can appear as a **branch that grows**:

| Piece | Kit |
|-------|-----|
| Prop kind | `repoBranch` in [`kit/scene.json`](kit/scene.json) → `propKinds` |
| Growth | Integer **0..5** (`garden.growth`) |
| Placement | Same as other props: stage-local `{ kind, x, y, w?, h?, growth? }` |

Creature = mark. Habitat = stages / props / scene weather. Garden branches are **props** — silhouette décor, not a second product surface.

## Growth scale (SoT)

Copied from `kit/scene.json` → `garden.growth` (do not invent parallel tables):

| Level | Label | Hint |
|------:|-------|------|
| 0 | seed | just planted / empty repo |
| 1 | sprout | first commits |
| 2 | sapling | small active tree |
| 3 | young | steady growth |
| 4 | branching | many branches / forks |
| 5 | canopy | mature repo presence |

Omit `growth` → use `garden.growth.default` (0).

## Example overlay prop (not stock STAGE_SEED)

```json
{ "kind": "repoBranch", "x": 280, "y": 40, "w": 24, "h": 48, "growth": 3, "label": "mininja" }
```

Hosts map `growth` → silhouette height / branch count. Kit never paints the mark fill from growth.

## Brand rules / bridge note

- Mascot **unnamed** (never Casque); no he/him.
- No silent dual growth tables beside kit.
- Scene weather remains strip chrome ([SCENERY.md](SCENERY.md)); garden growth is a **prop field**, not weather.
- Recipes / external automation stay a later plate ([RECIPES.md](RECIPES.md)). When that plate lands, hosts may map events → `growth` (and optionally `face`) with the same recipe `then` shape — **kit still has no GitHub bridge**; live stats remain a host overlay.
- Garden growth is a future recipe expression target alongside face / stage / action / mood — not weather, not mark fill. Same system graph as creature + habitat; demotion ≠ disconnection.

Machine SoT: [`kit/scene.json`](kit/scene.json) → `garden` + `propKinds`. Scenery geometry: [SCENERY.md](SCENERY.md). One system graph: [RECIPES.md](RECIPES.md).
