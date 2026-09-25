# Scenery

Canonical terminal world for the Mininja mark in console / buddy surfaces. Sourced from the scene suite in [Thingscorp/mininja-console](https://github.com/Thingscorp/mininja-console) (`src/lib/scene.ts`, banner renderer). The mascot has no name.

The mark lives in a **side-scrolling strip of stages**. Programs and operators move him with a scene intent (`emotion`, `action`, `stage`, optional `line` / `facing` / `intensity`). Unknown ids fall back (curious / wait / dock) without breaking the renderer.

## Strip geometry

| Constant | Value |
|----------|------:|
| Stage width | 420 px |
| Stage count | 7 |
| World width | 2940 px (7 × 420) |
| Default home | `dock` (facing right) |

Stages are laid left → right in this order. The camera follows the actor; the HUD names the stage currently underfoot.

![Stage strip](assets/visuals/stage-strip.png)

## Stages

| id | Label | Weather | Role |
|----|-------|---------|------|
| `nightwatch` | night watch | night | Sleep / offline |
| `dock` | dock | haze | Home bay — default resting place |
| `desk` | desk | clear | Status, plan, brief |
| `workshop` | workshop | sparks | Execute, refine, ongoing agent work |
| `archives` | archives | scan | Look / inspect / memory |
| `gate` | gate | haze | Ask, deny, unknown |
| `rooftop` | rooftop | clear | Completed / proud |

### Props (silhouette kit)

Allowed prop kinds (monospace-friendly blocks in the banner):

`block` · `shelf` · `lamp` · `crate` · `screen` · `antenna` · `moon` · `barrier` · `cable`

| Stage | Stock props (sketch) |
|-------|----------------------|
| nightwatch | moon, antenna, low block |
| dock | stacked crates, cable run, screen |
| desk | screen, lamp, block, crate |
| workshop | workbench block, antenna, crate, lamp |
| archives | four shelves + crate |
| gate | barrier flanked by two lamps |
| rooftop | stepped blocks + antenna |

New stages register with `registerStage` — same prop vocabulary, no renderer rewrite.

## Weather

Weather is **stage atmosphere**, not a recolor of the mark. The lockup stays monochrome; sky / haze / scan lines / rain sit behind him.

| Weather | Use |
|---------|-----|
| `clear` | Day / default |
| `haze` | Soft dock / gate air |
| `night` | Offline / sleep |
| `sparks` | Workshop heat |
| `scan` | Archives read |
| `rain` | Optional weather overlay (reduced-motion: static) |

## Brand rules for scenery

1. **One continuous strip** — do not teleport the camera without walking the actor (unless `prefers-reduced-motion`).
2. **Stages mean jobs** — desk = status/plan; workshop = build/run; archives = inspect; gate = deny/unknown; rooftop = done; nightwatch = offline; dock = home.
3. **Props stay silhouette** — dark blocks on the banner ground; no photographic scenery behind the Unicode lockup.
4. **Weather never paints the eyes** — mood tones in app UI follow STYLEGUIDE.md; the mark fill stays single-color.
5. **No named mascot in stage copy** — HUD and lines talk about places and work, not a character name.

Movement and facing rules: [TERMINAL-MOTION.md](TERMINAL-MOTION.md).
