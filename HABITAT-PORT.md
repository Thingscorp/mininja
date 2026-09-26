# Habitat port note (first pass)

Diff source: `Thingscorp/mininja-console` prior habitat suite (`da272c1`)  
Target: `Thingscorp/mininja@feat/monorepo-public` (`console/` + `kit/`)

Scope (this pass): **stages / props / register\* / banner camera**.  
Out of scope: recipe / IFTTT / outside-weather bridges (`RECIPES.md`). Stage `weather` enums are **habitat chrome** only (sky class on the strip).

## Gap list

| Piece | Prior suite | Monorepo | Result |
|-------|-------------|----------|--------|
| 7 stages (`nightwatch`→`rooftop`) + stock props | `scene.ts` STAGE_SEED (historical) | `kit/scene.json` stages + `registerFromKit()` (no dual seed) | **Present** — kit is SoT; console seeds from kit |
| Weather enums (`clear`/`haze`/`night`/`sparks`/`scan`/`rain`) | StageDef + CSS | kit `weather` + stage weather + `.weather-*` CSS | **Already present** |
| `registerEmotion` / `registerAction` / `registerStage` (+ get/has/list/catalog) | `scene.ts` | same | **Already present** |
| `SceneIntent` / `applyIntent` / `composeLockup` | `scene.ts` | same | **Already present** |
| Banner camera (look-ahead 0.32/0.52, follow λ=5.2, walk/run 170/280, patrol) | `banner.tsx` | animation + reduce-motion snap must use kit `cameraLookAheadRight/Left` only (no legacy `0.35` dual); `check-consumers` enforces every `viewW*<n>` | **Present** — kit ratios; gate catches drift |
| Prop kind CSS (`block`…`cable`) | `styles.css` | identical | **Already present** |
| Brand scrub (mascot unnamed; never personal name) | prior suite wording | Mininja + `sandboxing` rename | **Done earlier on branch** |
| Command→scene maps / legacy face bridge | in console `COMMAND_INTENT` | console yes; kit has `legacyFaceBridge` only | **Deferred** (not habitat chrome) |
| Recipe / outside-weather → expression | n/a | `RECIPES.md` design-only | **Out of scope** |
| Bot Python engine | n/a | not duplicated | **Skipped (Occam)** |

## SoT

- Numbers/ids: [`kit/scene.json`](kit/scene.json) (live `version` field — currently **1.6.1**; do not hardcode a second version in this note).
- Runtime registry + banner: [`console/src/lib/scene.ts`](console/src/lib/scene.ts) (`registerFromKit`), [`console/src/components/banner.tsx`](console/src/components/banner.tsx).
- Alignment gate: `node kit/check-consumers.mjs` (+ `console` `npm run kit:align`). Forbids `STAGE_SEED` / `EMOTION_SEED` / `ACTION_SEED` dual tables.

## Extensibility

New habitat bricks snap via `registerStage` / `registerEmotion` / `registerAction`, or a kit fork / local scene overlay — not by rewriting the banner renderer.
