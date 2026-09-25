# Adapters

Tiny Unix filters over `kit/`. Compose; do not grow into apps.

```
kit/mark.json
      │
      ▼
 adapters/mark      → strings
      │
      ├── adapters/ansi   → colorize
      └── adapters/react  → present
```

| Filter | Role |
|--------|------|
| [mark](mark) | face → strings |
| [ansi](ansi) | strings → ANSI |
| [react](react) | strings → `<pre>` |

No `console/` imports. Brand law: [../PORTING.md](../PORTING.md).
