# Mininja mark assets

Monochrome exports of the Mininja stacked Unicode lockup. The glyphs **are** the mark — each file is the three-line character stack from [../CONSTRUCTION.md](../CONSTRUCTION.md) and [../STYLEGUIDE.md](../STYLEGUIDE.md), not a redrawn cartoon.

Fill: `#0f172a` (single-color). Mood hex values in STYLEGUIDE apply only in app UI, not these brand assets.

## Expression states (15)

| State | File stem | Eyes / notes |
|-------|-----------|--------------|
| idle | `mininja-idle` | ●● |
| blink | `mininja-blink` | ── |
| evaluating | `mininja-evaluating` | ◐◑ |
| allowed | `mininja-allowed` | >< |
| asking | `mininja-asking` | ?? |
| denied | `mininja-denied` | ┃┃ |
| sandboxing | `mininja-sandboxing` | ◇◇ |
| executing | `mininja-executing` | ◣◢ |
| completed | `mininja-completed` | ▴▴ |
| warning | `mininja-warning` | ◆◆ |
| error | `mininja-error` | ×× |
| cancelled | `mininja-cancelled` | ◦◦ |
| offline | `mininja-offline` | ‒‒ |
| loadingRight | `mininja-loadingRight` | ●● |
| loadingLeft | `mininja-loadingLeft` | ●● + mirrored body |

Each state has `.svg` (monospace grid) and `.png` (512×512, transparent).

## Visual guides

See [visuals/](visuals/) for construction, clearspace, minimum size, expression sheet, don’ts, and monochrome-vs-mood diagrams.
