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
```

That is enough for a favicon, a README badge, a slide corner. Stop here unless you need faces.

## Presence ladder

| Level | What you ship | Typical surfaces |
|------:|---------------|------------------|
| 1 | Idle 3-line lockup, monochrome | Favicon, README badge, print, slide corner |
| 2 | Faces from `mark.json` / STYLEGUIDE | Status chips, CLI spinners, emoji packs |
| 3 | Facing + optional scoot / patrol | App headers, lightweight consoles |
| 4 | Full stage strip + weather + props | Living terminal buddy ([`console/`](console/)) |

Do **not** drag level 4 into a favicon. Do **not** replace glyphs with a redrawn mascot — the Unicode stack **is** the mark.

## Level 2 — faces in one import

```js
import { lockup } from "./adapters/mark/lockup.mjs";
console.log(lockup("allowed").join("\n"));
```

ANSI tones: [`adapters/ansi`](adapters/ansi). React sketch: [`adapters/react`](adapters/react).

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
5. Scene geometry must match [`kit/scene.json`](kit/scene.json) (`stageWidthPx=420`, `anchorRatio=0.42`, seven stages).

## Adapter map

| Adapter | Path | Levels |
|---------|------|--------|
| Mark strings | [`adapters/mark`](adapters/mark) | 1–2 |
| ANSI / CLI | [`adapters/ansi`](adapters/ansi) | 1–2 |
| React sketch | [`adapters/react`](adapters/react) | 1–3 |

When you outgrow sketches, [`console/`](console/) is the reference level-4 surface. [`bot/`](bot/) is an optional Mac launcher that talks to teammates — not a second brand source.
