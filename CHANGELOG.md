# Changelog

Version history of the Mininja mark and this brand repository.

## Unreleased / next

- Docs: one connected **system graph** (creature · habitat · garden · later recipes) — recipe seams kept open; recipes remain a later plate, not v1 required ([RECIPES.md](RECIPES.md), [GARDEN.md](GARDEN.md), [BRAND.md](BRAND.md), [PORTING.md](PORTING.md))

## 1.6.0 — 2026-09-25

Garden schema (data only):

- `kit/scene.json` — propKind `repoBranch` + `garden.growth` 0..5 (repos as growing branches)
- [GARDEN.md](GARDEN.md) + [SCENERY.md](SCENERY.md) prop kit note
- No GitHub bridge; stock stages unchanged (overlay / fork to place branches)
- Kit + mark version **1.6.0**

## 1.5.0 — 2026-09-25

Public monorepo (Unix modules): `kit/` pure data SoT at **1.5.0** (mark.json + scene.json); `adapters/*` tiny filters; `examples/` compose only; optional `console/` and `bot/` each one program.

- Kit JSON version aligned to **1.5.0** with this monorepo release
- Presence ladder front-and-center in README + PORTING.md (mark → faces → scoot → scene)
- `console/` — cleaned web terminal buddy (no personal loops, no baked auth secrets, no stale mascot names)
- `bot/` — cleaned Mac launcher; remote host is env-only; no second React tree
- MIT `LICENSE` for code under adapters / examples / console / bot
- Root `.gitignore` for `.env`, `node_modules`, `.mininja`, etc.

## v1.4.0 — 2026-09-25

Portable kit (Occam layout):

- Added [kit/mark.json](kit/mark.json) and [kit/scene.json](kit/scene.json) as machine SoT
- Added [PORTING.md](PORTING.md) — presence ladder (mark → faces → scoot → scene)
- Added thin [adapters/](adapters/) (mark strings, ANSI, React sketch) and [examples/](examples/)

## v1.3.1 — 2026-09-25

Formalized scenery / motion math against mininja-console:

- Exact \(W=420\), \(N=7\), \(L=2940\), rest ratio \(\alpha=0.42\), \(c_i=x_i+176.4\)
- Exact prop tables (x,y,w,h), patrol span 274, speeds 170/280/26, ε=6, camera λ/κ
- Full emotion (16) and action (22) catalogs; 5-cell lockup facing rules
- Regenerated stage-strip and terminal-motion diagrams with formulas
- CONSTRUCTION cell metric (5×3, 1∶1 cells)

## v1.3.0 — 2026-09-25

Pulled terminal scenery and motion brand rules from [Thingscorp/mininja-console](https://github.com/Thingscorp/mininja-console):

- Added [SCENERY.md](SCENERY.md) — seven-stage strip (nightwatch → rooftop), weather, prop kit
- Added [TERMINAL-MOTION.md](TERMINAL-MOTION.md) — scene intent, walk/run/patrol, facing, reduced motion, command→place map
- Added [assets/visuals/stage-strip](assets/visuals/stage-strip.png) and [terminal-motion](assets/visuals/terminal-motion.png) diagrams
- Added console scenery banner reference still (`assets/visuals/console-scenery-banner.jpg`)
- BRAND-RULES and README link the new docs

## v1.2.0 — 2026-09-25

Brand repository expansion:

- Added [TRADEMARK.md](TRADEMARK.md) — ownership (Thingscorp LLC), first use in commerce since July 2026, ™ guidance, and explicit statement that no registration or pending application has been filed
- Added [BRAND-RULES.md](BRAND-RULES.md) — clearspace, minimum sizes, monochrome rule, backgrounds, don'ts
- Added [CONSTRUCTION.md](CONSTRUCTION.md) — character-by-character stacked Unicode construction (glyphs are the mark)
- Added [assets/](assets/) — monochrome SVG + 512px PNG for all 15 STYLEGUIDE expression states
- Added [assets/visuals/](assets/visuals/) — construction, clearspace, minimum-size, expression-sheet, don'ts, and monochrome-vs-mood diagrams
- README index of docs and visual assets

## v1.1.0 — 2026-09-25

- Style guide published ([STYLEGUIDE.md](STYLEGUIDE.md)) — construction rules, moods, and the 15 expression states

## v1.0.0 — 2026-07-19

- Canonical three-line Unicode block lockup established
- First use in commerce via russfranky-bot/mininja-cli README banner lockup and `examples/banner/banner.sh` (repository created 2026-07-19); continuous use as the Mininja brand identifier since July 2026
