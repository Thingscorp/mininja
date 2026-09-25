# kit/ — one job: hold the numbers

This directory is the DNA of the mark: glyphs and scene math, nothing else. Root markdown narrates; it does not invent parallel numbers.

| File | Holds |
|------|--------|
| [mark.json](mark.json) | Grid, codepoints, 15 faces, clearspace, min size |
| [scene.json](scene.json) | Geometry, stages, props, motion speeds, emotions, actions |

## Brand voice (kit)

Default kit is the loveable, integrated set — craft, taste, purity of default in small Unicode pieces. Same bricks are **premium Legos**: remixable. Full positioning: [../BRAND.md](../BRAND.md).

## Russ's law (Legos)

Mininja + environments are **modular Legos**. Pieces — **mark**, **faces**, **motion**, **stages**, **props**, **weather** — snap via this JSON + adapters. Rules are **data** and meant to be modified. Forking is encouraged; do not rewrite `console/` to change a brick. Brand name is **Mininja**; the mascot has **no personal name** and no he/him.

| Piece | Lives in | Snap point |
|-------|----------|------------|
| Mark / faces | `mark.json` | Glyph grid + face ids |
| Motion | `scene.json` → `motion` | Speeds, step periods, camera |
| Stages | `scene.json` → `stages` | Strip rooms |
| Props / weather | `scene.json` | Decor on a stage |
| Emotions / actions | `scene.json` | Scene vocabulary |

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

## Remix in 60s

```bash
# kit/scene.json → motion.walkPxPerSec  (170 → 220)
# kit/mark.json  → faces.wink = { "eyes": ["¬","●"], "tone": "accent", "motion": null, "mirrored": false }
./examples/cli-banner.sh wink
# or: examples/remix/ (overlay without forking kit)
```

## Invariants

- Brand name is **Mininja**. Mascot has **no name** and no he/him (never Casque).
- No secrets in this tree.
- Presence ladder (**mark → faces → scoot → scene**): [../PORTING.md](../PORTING.md).
