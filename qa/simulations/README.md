# Habitat / emote simulations (mock)

Mock scenarios that stress **visualization** of garden plants + **pal** emotes for common development events — discovery for the [glance hierarchy](../../GLANCE.md) (what a peek should tell a busy developer). Design discovery only — no adapter APIs, no console UI rewrites, no kit JSON invented here.

## How to run

```bash
# Validate every scenario against kit/mark.json + kit/scene.json
node qa/simulations/run-simulations.mjs

# Same + write REPORT.md (recommended mappings + open edge cases)
node qa/simulations/run-simulations.mjs --report
```

Exit **non-zero** if any `then.*` id, growth value, plant role, link kind, or required field is invalid.

Wired into monorepo QA via [`qa/tests/simulations-habitat.test.mjs`](../tests/simulations-habitat.test.mjs).

## Metaphor rules

| Rule | Detail |
|------|--------|
| Machine SoT | **Only** [`kit/mark.json`](../../kit/mark.json) + [`kit/scene.json`](../../kit/scene.json) |
| Seams | `face` · `stage` · `action` · `emotion` · `growth` |
| Chrome | `tone` (from `mark.moodColorsUiOnly`) — **no mood ids** in sims |
| Garden | `repoBranch` plants in habitat; growth integer **0..5** |
| Pal / creature | Unnamed mark (never Casque); no digipet hunger framing; pal = agent presence |
| v1 ship | Creature + habitat strip; mark-only = ~60s on-ramp |
| Recipes | Later plate — sims use recipe-compatible `then` shapes |
| Glance | Scenario families map to interrupt-cost ranks in [`GLANCE.md`](../../GLANCE.md) |

## Connection patterns (design-only)

Links live in scenario fixtures only. They are **not** written into `scene.json`. Prefer the existing kit propKind **`cable`** for a visible link between plants; other `kind` values are overlay semantics for hosts/design:

| `links[].kind` | Intent | Visual hint |
|----------------|--------|-------------|
| `cable` | Generic plant↔plant link (PR branch → root, etc.) | Draw kit `cable` between silhouettes |
| `dependency` | Package / lockfile dependency | Cable chrome + dependency role plant |
| `workspace` | Monorepo workspace / local workspace protocol | Cable under one canopy (or peer roots) |
| `remote` | Cross-repo / cross-org API or git remote | Longer / dashed host chrome (optional) |

Plant `role`: `root` · `leaf` · `dependency` · `fork` · `stale`.

## Weeds (design-only)

**Do not** invent weed kit constants or `propKinds`. Weeds are vocabulary in `weedsNote` strings:

- **Stale shoot** — abandoned branch beside a healthy canopy
- **Nutrient thieves** — conflicting shoots fighting the same trunk
- **Invasive dual-table fork** — diverged fork inventing parallel schemas
- **Blight** — supply-chain / secrets scare on a dependency shoot

Still rendered as ordinary `repoBranch` + growth (+ optional host opacity).

## Scenario shape

One JSON object per line in [`scenarios.jsonl`](scenarios.jsonl) (or files under `scenarios/*.json`):

```json
{
  "id": "ci-fail",
  "title": "CI failed",
  "context": "single-repo",
  "trigger": "CI workflow fails on a PR branch",
  "plants": [{ "label": "app", "growth": 3, "role": "root" }],
  "links": [],
  "then": {
    "face": "error",
    "emotion": "confused",
    "action": "shakeHead",
    "stage": "gate",
    "weather": "rain",
    "tone": "err"
  },
  "weedsNote": "optional design string",
  "edgeCase": "why this stresses viz",
  "expectedBehaviour": "what a host should show"
}
```

`context`: `mono` | `multi-repo` | `single-repo` | `polyrepo`.

`then.growthUpdates`: optional `[{ label, growth }]` — design overlay mirroring later-plate `then.growth { prop, value }` without mutating kit.


## Glance hierarchy ↔ scenario families

Ranks from [`GLANCE.md`](../../GLANCE.md). Families are folders of taste in [`REPORT.md`](REPORT.md) — not a runner.

| Rank | Need | Example families / ids |
|-----:|------|------------------------|
| 1 | Blocked now | `ci` (`ci-fail`), `merge-rebase`, `secrets-offline-cancel` (`secrets-leaked`), `dependency` (`dep-supply-chain-scare`), `agent-loops` (`agent-denied-gate`) |
| 2 | Someone needs me | `pr` (`pr-open`, `pr-review-requested`, `pr-changes-requested`) |
| 3 | Something landed | `pr` (`pr-merged`, `pr-approved`), `push-release` (`release-tag`), `ci` (`ci-pass`, `ci-pass-mono-matrix`), `agent-loops` (`agent-completed-rooftop`) |
| 4 | Busy on my behalf | `agent-loops` (`agent-sandboxing`, `agent-executing`, `agent-evaluating`), long CI / `push-main` |
| 5 | Ambient repo / goal health | `monorepo`, `polyrepo`, `seed`, `weeds`, growthUpdates-only overlays |
| 6 | Quiet / offline | `secrets-offline-cancel` (`offline-network`), `misc` (`empty-zero-plants`), `stages` (`stage-nightwatch-sleep`) |

Sticky design intent: blocked > asking > busy; wins expire; plants peripheral. Sims validate kit ids only — they do not implement sticky arbitration.

## Related

- Glance / rubber-duck: [`GLANCE.md`](../../GLANCE.md)
- Garden schema: [`GARDEN.md`](../../GARDEN.md)
- Recipe `then` shapes (later): [`RECIPES.md`](../../RECIPES.md)
- Scenery strip: [`SCENERY.md`](../../SCENERY.md)
