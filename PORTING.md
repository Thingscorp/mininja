# Porting Mininja

Copy three lines. Graduate when you want more. The mascot has no name.

Machine data: [`kit/mark.json`](kit/mark.json) · [`kit/scene.json`](kit/scene.json).

## The invitation (level 1)

Paste this anywhere monospace is welcome:

```
▚████
██ ●●
▀▀▀▀▀
```

Or from a clone:

```bash
./examples/cli-banner.sh
./examples/cli-banner.sh allowed
```

README paste: [`examples/readme-badge.md`](examples/readme-badge.md). Stop here unless you need faces.


## Legos in your environment

Mininja is built to snap into *your* world. Treat kit JSON as **modifiable rules**, not a glass case.

- **Pieces:** mark / faces, motion, stages, props, emotions, actions — each can ship alone or together.
- **Override:** fork `kit/` for a full custom SoT, or keep upstream kit and apply a **local scene overlay** (merge selected keys after load).
- **Forking is encouraged.** Name your fork or overlay in the host README so others know which ruleset they are on.
- Do not shame divergent speeds, stages, or faces. Do shame silent dual tables that claim to be kit while drifting.

Upstream geometry cited below is the Thingscorp default kit — match it when you intend to stay aligned; replace it on purpose when you fork.

## Presence ladder = progressive filters

Each level is a thinner-to-thicker filter. Pipe only as far as you need:

```
kit/mark.json
      │
      ▼
①  paste / examples/          idle lockup (strings)
      │
      ▼
②  adapters/mark              face → strings
      │
      ├── adapters/ansi       strings → ANSI tones
      └── adapters/react      strings → <pre>
            │
            ▼
③  host motion                facing + scoot (you own it)
      │
      ▼
④  console/                   full scene strip (one program)
```

| Level | Filter | What you ship |
|------:|--------|---------------|
| 1 | paste / [`examples/`](examples/) | Idle 3-line lockup |
| 2 | [`adapters/mark`](adapters/mark) → optional [`ansi`](adapters/ansi) / [`react`](adapters/react) | Faces |
| 3 | react + host animation | Facing + scoot |
| 4 | [`console/`](console/) | Stage strip + weather + props |

Do **not** drag level 4 into a favicon. Do **not** replace glyphs with a redrawn mascot — the Unicode stack **is** the mark.

## Level 2 — one filter

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
- No personal name in HUD, alt text, package titles, or filenames.

## Port checklist

1. Pull lines from `kit/mark.json` (or the mark adapter) — do not hand-type eyes.
2. Pick a presence level; note it in the host app README.
3. Keep alt text **Mininja mark** (never a character name).
4. If you add motion, honor reduced-motion and [`TERMINAL-MOTION.md`](TERMINAL-MOTION.md).
5. If you stay on upstream Thingscorp kit, scene geometry must match [`kit/scene.json`](kit/scene.json) (`stageWidthPx=420`, `anchorRatio=0.42`, seven stages). If you fork or overlay, document the new numbers as *your* SoT.

## Adapter map

| Filter | Path | Levels |
|--------|------|--------|
| Strings | [`adapters/mark`](adapters/mark) | 1–2 |
| Colorize | [`adapters/ansi`](adapters/ansi) | 1–2 |
| Present | [`adapters/react`](adapters/react) | 1–3 |

When you outgrow filters, [`console/`](console/) is the reference level-4 program. [`bot/`](bot/) is an optional Mac launcher — not a second brand source.
