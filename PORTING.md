# Porting Mininja

Copy three lines. Graduate when you want more. The mascot has no name and no he/him.

Craft bar: inevitable defaults, clean contracts, zero footguns — remixable like Legos; optionally a **terrarium for Devs** (creature + habitat glass from kit). Event recipes ([`RECIPES.md`](RECIPES.md)) are a later plate. (Taste standard, not a company claim.)

Machine data: [`kit/mark.json`](kit/mark.json) · [`kit/scene.json`](kit/scene.json).

## The invitation (mark)

Paste this anywhere monospace is welcome:

```
▚████
██ ●●
▀▀▀▀▀
```

Or from a clone:

```bash
./examples/cli-banner.sh            # idle (works without Node)
./examples/cli-banner.sh allowed    # faces need Node
./examples/cli-banner.sh --list
```

README paste: [`examples/readme-badge.md`](examples/readme-badge.md). Kit overlay without forking console: [`examples/remix/`](examples/remix/). Stop here unless you need faces.


## Russ's law (Legos)

Mininja + environments are **modular Legos**. Adapters are the **studs**; kit JSON is the **brick specs**. Rules are **data** (`kit/`) and meant to be modified. Forking is encouraged. Brand name is **Mininja**; the mascot has **no personal name** and no he/him.

Pieces: **mark**, **faces**, **motion**, **stages**, **props**, **weather**.

| Piece | You change | You keep |
|-------|------------|----------|
| [`kit/mark.json`](kit/mark.json) | faces, eyes, lines | 5×3 grid; glyphs are the mark |
| [`kit/scene.json`](kit/scene.json) | speeds, stages, props, weather | adapter contracts (in → out) |
| [`adapters/*`](adapters/) | rarely | one-job filters |

**Happy path — remix without rewriting `console/`:**

1. Copy `kit/` *or* keep upstream kit and merge a **local overlay** after load.
2. Pass the merged object into [`adapters/mark/from-kit.mjs`](adapters/mark/from-kit.mjs) (browsers) or your host motion code (scene numbers).
3. Leave adapter signatures alone — face → strings → ANSI / `<pre>`.
4. Name the overlay or fork in the host README so others know which ruleset they are on.

### Remix in 60s

```bash
# A) fork kit — change walk speed or add a face
#    kit/scene.json → "walkPxPerSec": 220          # was 170
#    kit/mark.json  → faces.wink = { "eyes": ["¬","●"], "tone": "accent", "motion": null, "mirrored": false }
./examples/cli-banner.sh wink

# B) overlay only (no kit fork) — same adapters:
cd examples/remix && node ./print-face.mjs allowed
# scene speeds: merge scene-overlay.json onto kit/scene.json in the host
```

Worked overlays: [`examples/remix/`](examples/remix/).

Do not shame divergent speeds, stages, or faces. Do shame silent dual tables that claim to be kit while drifting.

Upstream geometry cited below is the Thingscorp default kit — match it when you intend to stay aligned; replace it on purpose when you fork.

## Presence ladder: mark → faces → scoot → scene

Each step is a thinner-to-thicker filter. Pipe only as far as you need:

```
kit/mark.json
      │
      ▼
①  mark     paste / examples/          idle lockup (strings)
      │
      ▼
②  faces    adapters/mark              face → strings
      │
      ├── adapters/ansi                 strings → ANSI tones
      └── adapters/react                strings → <pre>
            │
            ▼
③  scoot    host motion                facing + scoot (you own it)
      │
      ▼
④  scene    console/                   full stage strip (one program)
```

| | Layer | Filter | What you ship |
|-:|-------|--------|---------------|
| 1 | **mark** | paste / [`examples/`](examples/) | Idle 3-line lockup |
| 2 | **faces** | [`adapters/mark`](adapters/mark) → optional [`ansi`](adapters/ansi) / [`react`](adapters/react) | Moods / eyes |
| 3 | **scoot** | react + host animation | Facing + motion |
| 4 | **scene** | [`console/`](console/) | Stage strip + weather + props |

Do **not** drag scene into a favicon. Do **not** replace glyphs with a redrawn mascot — the Unicode stack **is** the mark.

## Faces — one filter

**Node** (loads kit from disk):

```js
import { lockup } from "./adapters/mark/lockup.mjs";
process.stdout.write(lockup("allowed") + "\n");
```

```js
import { ansiLockup } from "./adapters/ansi/render.mjs";
process.stdout.write(ansiLockup("executing") + "\n");
```

**Browser** — do not import `lockup.mjs` or `ansi/` (`node:fs`). Pass kit JSON into the pure mark filter, then present:

```js
import mark from "./kit/mark.json" with { type: "json" };
import { linesFor } from "./adapters/mark/from-kit.mjs";
// linesFor(mark, "allowed") → adapters/react <Mininja lines={...} />
```

`lockup()` / `ansiLockup()` return **strings** (already joined). Adapters never import `console/`. Examples only compose adapters.

## Invariants (every port)

- 5 columns × 3 rows; each line exactly 5 cells after render.
- Monochrome mark; mood hex is **UI chrome only**.
- Clearspace ≥ one row height (H/3).
- Digital min height 24 px (8 px cells); terminal min 3 rows.
- `prefers-reduced-motion`: snap only — no walk, run, or patrol.
- No personal name (and no he/him) in HUD, alt text, package titles, or filenames.

## Port checklist

1. Pull lines from `kit/mark.json` (or the mark adapter) — do not hand-type eyes.
2. Pick a presence layer (mark / faces / scoot / scene); note it in the host app README.
3. Keep alt text **Mininja mark** (never a character name).
4. If you add motion, honor reduced-motion and [`TERMINAL-MOTION.md`](TERMINAL-MOTION.md).
5. If you stay on upstream Thingscorp kit, scene geometry must match [`kit/scene.json`](kit/scene.json) (`stageWidthPx=420`, `anchorRatio=0.42`, seven stages). If you fork or overlay, document the new numbers as *your* SoT.


## Recipe-compatible seams

Face, stage, and action **ids** stay kit SoT (`kit/mark.json`, `kit/scene.json`) so a later [`RECIPES.md`](RECIPES.md) plate can target them. Adapters must not grow parallel expression tables — pass ids through, render from kit. Recipes remain a later plate in the system graph (creature + habitat + garden).

## Adapter map

| Filter | Path | Layers |
|--------|------|--------|
| Strings | [`adapters/mark`](adapters/mark) | 1–2 |
| Colorize | [`adapters/ansi`](adapters/ansi) | 1–2 |
| Present | [`adapters/react`](adapters/react) | 1–3 |

When you outgrow filters, [`console/`](console/) is the reference **scene** program. [`bot/`](bot/) is an optional Mac launcher — not a second brand source.
