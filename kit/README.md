# kit/ — one job: hold the numbers

This directory is the DNA of the mark: glyphs and scene math, nothing else. Root markdown narrates; it does not invent parallel numbers.

| File | Holds |
|------|--------|
| [mark.json](mark.json) | Grid, codepoints, 15 faces, clearspace, min size |
| [scene.json](scene.json) | Geometry, stages, props, motion speeds, emotions, actions |

## Brand voice (kit)

Default kit is the loveable, integrated set — craft and taste in small Unicode pieces (*Apple of terminal buddies* as a quality metaphor only; **not** Apple Inc. affiliation or endorsement). Those same pieces are **premium Legos**: remixable. Environments fork or overlay without shame.

## Legos: pieces that snap

Mininja + an environment is **modular Legos**. The pieces are meant to click together and to be swapped:

| Piece | Lives in | Snap point |
|-------|----------|------------|
| Mark / faces | `mark.json` | Glyph grid + face ids |
| Motion | `scene.json` → `motion` | Speeds, step periods, camera |
| Stages | `scene.json` → `stages` | Strip rooms |
| Props / weather | `scene.json` | Decor on a stage |
| Emotions / actions | `scene.json` | Scene vocabulary |

Rules live in this JSON **and are meant to be modified**. Forking is encouraged.

## How to override (no shame)

Pick the thinnest override that fits:

1. **Kit fork** — copy `kit/` (or the whole repo), change `mark.json` / `scene.json`, ship your environment’s rules as its SoT.
2. **Local scene overlay** — keep upstream kit as the base; merge or replace selected keys (stages, props, speeds, a face) in a host-local overlay file your loader applies after reading kit.
3. **Presence slice** — port only mark faces (or only idle) and leave scene pieces on the shelf.

Document which path you took in the host README. Never leave a **silent second constant table** beside kit in the same tree (copy-pasted `walkPxPerSec` / stage widths / eye glyphs that drift). If a host still inlines a literal for bootstrap, it must match the kit it claims — verify with:

```bash
node kit/check-consumers.mjs
```

(When `console/` is present, that check asserts scene width, anchor, and walk/run speeds against kit. It never invents values.)

## Invariants

- Mascot has **no name** (not “he”, not Casque, not any personal name).
- No secrets in this tree.
- Presence ladder (**mark → faces → scoot → scene**): [../PORTING.md](../PORTING.md).
