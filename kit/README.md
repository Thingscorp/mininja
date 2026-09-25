# kit/ — one job: hold the numbers

**Do one thing.** This directory is the only machine source of truth for glyphs and scene math. Nothing else lives here. Root markdown narrates; it does not invent.

| File | Holds |
|------|--------|
| [mark.json](mark.json) | Grid, codepoints, 15 faces, clearspace, min size |
| [scene.json](scene.json) | Geometry, stages, props, motion speeds, emotions, actions |

## Consumers must read, not fork

`console/`, `adapters/*`, and any port **load these JSON files** (or call a thin adapter that does). Do not copy `walkPxPerSec` / `runPxPerSec` / stage widths / eye glyphs into a second constant table. If a host still inlines a literal, it must match kit — verify with:

```bash
node kit/check-consumers.mjs
```

(When `console/` is present, that check asserts scene width, anchor, and walk/run speeds against kit. It never invents values.)

## Invariants

- Mascot has **no name**. Never use the stale label Casque.
- No secrets in this tree.
- Presence ladder / ports: [../PORTING.md](../PORTING.md).
