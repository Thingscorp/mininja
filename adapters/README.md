# Adapters

Tiny Unix filters over `kit/`. One job each. Compose; do not grow into apps.

```
kit/mark.json
      │
      ▼
 adapters/mark      → strings   (from-kit: any runtime · lockup.mjs: Node)
      │
      ├── adapters/ansi   → colorize   (Node)
      └── adapters/react  → present    (browser-safe; you pass lines)
```

| Filter | Role | Runtime |
|--------|------|---------|
| [mark](mark) | face → strings | `from-kit.mjs` any · `lockup.mjs` Node |
| [ansi](ansi) | face / lines → ANSI | Node |
| [react](react) | lines → `<pre>` | any (no kit I/O) |

**Node vs browser**

| Need | Use |
|------|-----|
| CLI / scripts | `adapters/mark/lockup.mjs`, `adapters/ansi/render.mjs` |
| Bundler / browser | `kit/mark.json` + `adapters/mark/from-kit.mjs` → `adapters/react` |

Do not import `lockup.mjs` or `ansi/` in the browser — they touch `node:fs`.

No `console/` imports. Brand law: [../PORTING.md](../PORTING.md).

Ids (`face`, stage, action) are kit SoT — recipe-compatible seams. No parallel expression tables.
