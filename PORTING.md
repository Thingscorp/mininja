# Porting Mininja

How to put the mark (and optionally the buddy) on any surface without breaking brand rules. Machine data: [`kit/mark.json`](kit/mark.json), [`kit/scene.json`](kit/scene.json). The mascot has no name.

## Presence ladder

Use the **thinnest** layer that fits the job:

| Level | What you ship | Typical surfaces |
|------:|---------------|------------------|
| 1 | Idle 3-line lockup, monochrome | Favicon, README badge, print, slide corner |
| 2 | STYLEGUIDE / `mark.json` faces | Status chips, CLI spinners, Slack/Discord emoji |
| 3 | Facing + optional scoot/patrol | App headers, lightweight consoles |
| 4 | Full 7-stage strip + weather + props | Living terminal buddy (mininja-console) |

Do **not** drag level 4 into a favicon. Do **not** replace glyphs with a redrawn mascot for “premium” surfaces — the Unicode stack **is** the mark.

## Invariants (every port)

- 5 columns × 3 rows; each line exactly 5 cells after render.
- Monochrome mark; mood hex values are **UI chrome only**.
- Clearspace ≥ one row height (\(H/3\)).
- Digital min height 24 px (8 px cells); terminal min 3 rows.
- `prefers-reduced-motion`: snap only — no walk, run, or patrol.
- No personal name in HUD, alt text, package titles, or filenames.

## Adapter map

| Adapter | Path | Levels | Notes |
|---------|------|--------|-------|
| Mark strings | [`adapters/mark`](adapters/mark) | 1–2 | Pure functions; any runtime |
| ANSI / CLI | [`adapters/ansi`](adapters/ansi) | 1–2 | Optional tone colors for terminals |
| React sketch | [`adapters/react`](adapters/react) | 1–3 | `<Mininja face />` + optional facing |

Examples: [`examples/`](examples/).

## Port checklist

1. Pull lines from `kit/mark.json` (or the mark adapter) — do not hand-type eyes.
2. Pick a presence level; document it in the host app README.
3. If you need motion, read speeds and ε from `kit/scene.json.motion` — do not invent constants.
4. If you need stages, use the seven ids in `scene.json` — do not rename.
5. Verify reduced-motion path.
6. Grep for forbidden names before ship.

## Suggested package shape (when you publish)

```
@thingscorp/mininja
  /mark     → lockup helpers + faces
  /scene    → geometry + motion constants
  /react    → optional React bindings
  /ansi     → optional terminal helpers
```

Subpath exports keep level-1 consumers free of scene weight.

## What not to port

- Photographic scenery behind the lockup
- Recolored eyes independent of the face/mood system
- Extra stages in marketing stills without updating `kit/scene.json` + SCENERY.md
- A second “cute” mascot redraw used as the brand mark
