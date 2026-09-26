# Garden — repos as growing branches

**Data only.** Kit holds the schema; nothing here calls GitHub (or any host). Growth is authored overlay data in v1. When the [RECIPES.md](RECIPES.md) plate lands, hosts may map normalized events → `growth` (and optionally `face`) via the same recipe `then` shape — kit still has **no** GitHub bridge.

Glance role of plants vs pal interrupts: [`GLANCE.md`](GLANCE.md).

## Metaphor

Inside the terrarium **habitat glass**, a repository can appear as a **branch that grows**:

| Piece | Kit |
|-------|-----|
| Prop kind | `repoBranch` in [`kit/scene.json`](kit/scene.json) → `propKinds` |
| Growth | Integer **0..5** (`garden.growth`) |
| Placement | Same as other props: stage-local `{ kind, x, y, w?, h?, growth? }` |

**Pal** = the unnamed agent presence (mark / faces). Habitat = stages / props / scene weather. Garden branches are **props** — silhouette décor, not a second product surface. Plants are **peripheral**; the pal’s face is **focal** ([`GLANCE.md`](GLANCE.md) attention layers).

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

**Glance reading:** canopy ≈ goals met (whatever a pack scores); low / stale growth reads as quiet health debt — not a badge stack.

## Silhouette height (recommended)

Pure monotonic map in [`kit/scene.json`](kit/scene.json) → `garden.silhouetteHeightPx`:

\[
h(g) = h_0 + g \cdot \Delta h = 12 + 12g \quad (\mathrm{px}),\quad g \in \{0,1,2,3,4,5\}
\]

| \(g\) | \(h(g)\) |
|------:|--------:|
| 0 | 12 |
| 1 | 24 |
| 2 | 36 |
| 3 | 48 |
| 4 | 60 |
| 5 | 72 |

Hosts may fork \(h_0,\Delta h\). Authored prop `h` still wins when set; this formula is the default growth→height seam.

## Example overlay prop (not stock STAGE_SEED)

```json
{ "kind": "repoBranch", "x": 280, "y": 40, "w": 24, "h": 48, "growth": 3, "label": "mininja" }
```

Hosts map `growth` → silhouette height via `garden.silhouetteHeightPx` (or authored `h`). Kit never paints the mark fill from growth.

## Ambient glance (plants vs pal interrupts)

Garden is **rank 5** in the glance hierarchy — ambient repo / goal health. It answers “how healthy are my plants / goals?” without stealing the sticky interrupt slot.

| Concern | Who owns the glance |
|---------|---------------------|
| Blocked / needs me / landed / busy | **Pal** posture — face + action + stage ([`GLANCE.md`](GLANCE.md) ranks 1–4) |
| Quiet / offline | Pal floor — `idle` / `blink` / `offline` @ `dock` / `nightwatch` (rank 6) |
| Repo / goal health over time | **Plants** — growth 0..5 silhouettes (rank 5) |

**Anti-dashboard:** plants never become a KPI panel beside the terrarium. No badge chrome for “stale.” Prefer quiet desaturate / opacity host chrome on a still-`repoBranch` prop. Faces stay focal; text stays optional.

### Pal ↔ plant interaction (design)

- A **pal represents an agent** (human-driven buddy / coding agent / automation).
- Pals **interact with plants individually**, and that interaction is **visualized**: e.g. maintenance on a repo → **one pal** interacting with **that** labeled `repoBranch`.
- Default: **one pal on one plant** for a focused job. Multiple pals = concurrent agents, distinguished by **host color chrome** (modular layer — remixable; **not** a kit pal-color / agent-id table).
- Mark = the pal’s face lockup. Garden = plants. Recipes later may say which pal is busy where; kit still only stores face / stage / action / emotion / growth.

**MUST NOT** add kit constants for pal colors, agent ids, or “which plant the pal is touching.” Host overlays / scene placement own that visualization.

## Multi-repo plants + connections (design)

**Design only — no kit JSON.** Multiple `repoBranch` plants can share one habitat strip. How they *connect* is a host/design overlay for now; prefer the existing kit propKind **`cable`** when you need a visible link between plants.

| Pattern | Plants | Link kind (sim fixtures) | Glance note |
|---------|--------|--------------------------|-------------|
| Monorepo canopy | One `root` + package `leaf` plants | `workspace` | One git root; leaves under canopy — ambient health of the workspace |
| Polyrepo peers | Several `root` plants | `cable` / `workspace` | No single canopy — hub cables optional; keep cables **thin** so faces stay focal |
| Dependency | `dependency` role plant | `dependency` | Lockfile / package edge; blight → pal interrupt (denied @ gate), plant stays silhouette |
| Cross-org API | Two roots (provider/consumer) | `remote` | Labels may include `org/repo`; interrupt still on the pal, not a second strip |
| PR branch | `leaf` → `root` | `cable` | Tear down or wilt leaf on merge; win celebrate expires on the pal |

**Multi-repo glance:** plants + thin cables sketch topology at the edge of vision. A blocked CI still flips the **pal** to gate — not a red badge on every leaf.

Discovery fixtures + edge cases: [`qa/simulations/`](qa/simulations/) (`scenarios.jsonl`, `run-simulations.mjs`). Sims must not invent new `propKinds` for links.

## Weeds (design)

**Design vocabulary only.** Do **not** add weed constants or weed `propKinds` to kit. A weed is still a `repoBranch` (often `role: stale` or a threatened `dependency`) plus optional host chrome (opacity, desaturate). Copy for notes:

| Term | Meaning | Glance |
|------|---------|--------|
| Stale shoot | Abandoned branch beside a healthy canopy | Quiet desaturate — not a badge |
| Nutrient thieves | Conflicting shoots fighting the same trunk | Ambient tension; escalate to pal only if pack says blocked |
| Invasive dual-table fork | Diverged fork inventing parallel schemas/tables | Design smell; host may warn |
| Blight | Supply-chain scare / secrets leak on a shoot | Usually **rank 1** on the pal (`denied` @ `gate`); plant chrome secondary |

See [`qa/simulations/README.md`](qa/simulations/README.md) and scenarios with `weedsNote`.

## Goals / KPIs (design — no kit fields)

**One visual channel.** A plant looks bountiful when its `growth` is high. Kit does **not** encode what that plant is scoring (fiat, users, uptime, …).

| Layer | Owns |
|-------|------|
| Kit | `repoBranch` + growth **0..5** silhouette only |
| Bridge | Normalize metric/events the user cares about |
| Recipe pack (later) | `when` → `then.growth` on a labeled plant |
| Host chrome | Optional opacity / color; multi-pal color; **never** a second dashboard |

Different plants may score different goals by swapping packs — same brick, different sensors. **Do not** add harvest-type / KPI-kind constants to kit. **Do not** treat garden as a digipet care loop or a second dashboard.

**KPI harvest rule:** KPIs only move growth via packs. Canopy = “goals met” for whatever that pack named — not a fixed harvest taxonomy in kit. Occam: one silhouette channel; remix packs.

## Brand rules / bridge note

- Mascot / **pal unnamed** (never Casque); no he/him.
- No silent dual growth tables beside kit.
- Scene weather remains strip chrome ([SCENERY.md](SCENERY.md)); garden growth is a **prop field**, not weather.
- Recipes / external automation stay a later plate ([RECIPES.md](RECIPES.md)). When that plate lands, hosts may map events → `growth` (and optionally `face`) with the same recipe `then` shape — **kit still has no GitHub bridge**; live stats remain a host overlay.
- Garden growth is a future recipe expression target alongside face / stage / action / mood — not weather, not mark fill. Same system graph as pal + habitat; demotion ≠ disconnection.
- Glance hierarchy and anti-dashboard rules: [`GLANCE.md`](GLANCE.md).

Machine SoT: [`kit/scene.json`](kit/scene.json) → `garden` + `propKinds`. Scenery geometry: [SCENERY.md](SCENERY.md). One system graph: [RECIPES.md](RECIPES.md). North star: [NORTH-STAR.md](NORTH-STAR.md).
