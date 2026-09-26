# Mininja Mark Construction

The Mininja mark **is** a stacked three-line Unicode lockup. The glyphs are the mark — not a redrawn cartoon face. The mascot has no name.

![Mark construction](assets/visuals/construction.png)

## Canonical stack (idle)

```
▚████
██ ●●
▀▀▀▀▀
```

Five columns × three rows on a monospace grid. Never rearrange the three lines. Never put text inside the lockup. Never stretch, skew, or rotate.

## Character-by-character

### Line 1 — mask / hood (5 cells)

| Col | Glyph | Code point | Notes |
|-----|-------|------------|-------|
| 1 | ▚ | U+259A | Quadrant upper left and lower right |
| 2 | █ | U+2588 | Full block |
| 3 | █ | U+2588 | Full block |
| 4 | █ | U+2588 | Full block |
| 5 | █ | U+2588 | Full block |

String: `▚████`

### Line 2 — eyes row (5 cells)

| Col | Glyph | Code point | Notes |
|-----|-------|------------|-------|
| 1 | █ | U+2588 | Full block (body) |
| 2 | █ | U+2588 | Full block (body) |
| 3 | ` ` | U+0020 | Space (gap before eyes) |
| 4–5 | *eyes* | *varies* | Two-character eye slot from STYLEGUIDE |

Idle string: `██ ●●` (eyes = ●● = U+25CF U+25CF)

Only the eye slot (columns 4–5) changes by expression state. Do not invent eyes outside the STYLEGUIDE table.

### Line 3 — chin (5 cells)

| Col | Glyph | Code point | Notes |
|-----|-------|------------|-------|
| 1–5 | ▀ | U+2580 | Upper half block × 5 |

String: `▀▀▀▀▀`

## Cell metric

| Quantity | Value |
|----------|------:|
| Columns | 5 |
| Rows | 3 |
| Cell aspect | 1∶1 in monospace (width = height per cell) |
| Line length | exactly 5 Unicode scalar values (one cell each) |
| Total cells | 15 |

Digital minimum height 24 px ⇒ minimum cell size \(24/3 = 8\) px. Clearspace = one row height = one cell = \(H/3\) where \(H\) is lockup height ([BRAND-RULES.md](BRAND-RULES.md)).

## Body rules

- Lines 1 and 3 are **static** across all states except `loadingLeft`.
- Line 2 body cells (columns 1–2) and the space (column 3) stay fixed except when mirroring for `loadingLeft`.
- Mood colors in STYLEGUIDE apply only in app UI; brand assets keep the stack monochrome.

## Mirrored stack (`loadingLeft`)

```
████▞
●● ██
▀▀▀▀▀
```

| Line | String | Notes |
|------|--------|-------|
| 1 | `████▞` | Four U+2588, then U+259E (▞) |
| 2 | `●● ██` | Eyes in columns 1–2, space, two U+2588 |
| 3 | `▀▀▀▀▀` | Same chin as canonical |

## Expression eyes (columns 4–5 of line 2, except loadingLeft)

See [STYLEGUIDE.md](STYLEGUIDE.md). Idle reference: ●●. States use the same three-line stack with only the eye glyphs (and the mirrored body for `loadingLeft`) substituted.

## Typeface

**IBM Plex Mono** (weights 400 / 500 / 600) is required for the 5×3 lockup. Cells stay square on a monospace grid. Production mark rendering must load this face — do not rely on system `ui-monospace` alone. Uncontrolled surfaces (README, OG, email, print) use the pre-rendered SVG/PNG assets baked with this face ([kit/mark.json](kit/mark.json) → `typeface`).

## Related

- [kit/mark.json](kit/mark.json) — machine SoT for grid, codepoints, faces, clearspace, min size
- [STYLEGUIDE.md](STYLEGUIDE.md) — expression table and moods
- [BRAND-RULES.md](BRAND-RULES.md) — clearspace, size, don'ts
- [assets/](assets/) — monochrome SVG/PNG exports of each state as this glyph stack
