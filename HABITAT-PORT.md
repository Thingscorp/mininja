# Habitat port note (first pass)

Diff source: `Thingscorp/mininja-console@feat/casque-scene-suite` (`da272c1`)  
Target: `Thingscorp/mininja@feat/monorepo-public` (`console/` + `kit/`)

Scope (this pass): **stages / props / register\* / banner camera**.  
Out of scope: recipe / IFTTT / outside-weather bridges (`RECIPES.md`). Stage `weather` enums are **habitat chrome** only (sky class on the strip).

## Gap list

| Piece | Casque suite | Monorepo | Result |
|-------|--------------|----------|--------|
| 7 stages (`nightwatch`→`rooftop`) + stock props | `scene.ts` STAGE_SEED | `kit/scene.json` stages + `console` STAGE_SEED | **Already present** — byte parity on id/weather/hint/props |
| Weather enums (`clear`/`haze`/`night`/`sparks`/`scan`/`rain`) | StageDef + CSS | kit `weather` + stage weather + `.weather-*` CSS | **Already present** |
| `registerEmotion` / `registerAction` / `registerStage` (+ get/has/list/catalog) | `scene.ts` | same | **Already present** |
| `SceneIntent` / `applyIntent` / `composeLockup` | `scene.ts` | same | **Already present** |
| Banner camera (look-ahead 0.32/0.52, follow λ=5.2, walk/run 170/280, patrol) | `banner.tsx` | identical | **Already present** |
| Prop kind CSS (`block`…`cable`) | `styles.css` | identical | **Already present** |
| Brand scrub (no Casque name; mascot unnamed) | Casque wording | Mininja + `sandboxing` rename | **Done earlier on branch** |
| Command→scene maps / legacy face bridge | in console `COMMAND_INTENT` | console yes; kit has `legacyFaceBridge` only | **Deferred** (not habitat chrome) |
| Recipe / outside-weather → expression | n/a | `RECIPES.md` design-only | **Out of scope** |
| Bot Python engine | n/a | not duplicated | **Skipped (Occam)** |

## SoT

- Numbers/ids: [`kit/scene.json`](kit/scene.json) (v1.5.0 — no bump; data unchanged).
- Runtime registry + banner: [`console/src/lib/scene.ts`](console/src/lib/scene.ts), [`console/src/components/banner.tsx`](console/src/components/banner.tsx).
- Alignment gate: `node kit/check-consumers.mjs` (+ `console` `npm run kit:align`).

## Extensibility

New habitat bricks snap via `registerStage` / `registerEmotion` / `registerAction`, or a kit fork / local scene overlay — not by rewriting the banner renderer.
