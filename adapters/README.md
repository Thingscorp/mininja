# Adapters

Tiny Unix filters over `kit/`. Compose; do not grow into apps.

```
kit/mark.json
      │
      ▼
 adapters/mark      → strings   (from-kit: any runtime; lockup.mjs: Node)
      │
      ├── adapters/ansi   → colorize   (Node)
      └── adapters/react  → present    (browser-safe; you pass lines)
```

| Filter | Role | Runtime |
|--------|------|---------|
| [mark](mark) | face → strings | `from-kit.mjs` any · `lockup.mjs` Node |
| [ansi](ansi) | face/lines → ANSI | Node |
| [react](react) | lines → `<pre>` | any (no kit I/O) |

No `console/` imports. Brand law: [../PORTING.md](../PORTING.md).
