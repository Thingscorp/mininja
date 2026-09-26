# Adapters

Tiny Unix filters over `kit/`. One job each. Compose; do not grow into apps.

Stranger path (~60s): [`../examples/`](../examples/). Paste or print a face first; graduate here when you need code.

```
kit/mark.json
      │
      ▼
 adapters/mark      → strings   (from-kit: any runtime · lockup.mjs: Node)
      │
      ├── adapters/ansi      → colorize          (Node)
      ├── adapters/react     → present           (browser-safe; you pass lines)
      └── adapters/presence  → CSS / chip / roster (data-motion / data-state seams)
```

| Filter | Role | Runtime |
|--------|------|---------|
| [mark](mark) | face → strings | `from-kit.mjs` any · `lockup.mjs` Node |
| [ansi](ansi) | face / lines → ANSI | Node |
| [react](react) | lines → `<pre>` | any (no kit I/O) |
| [presence](presence) | CSS + chip + roster + `presenceAttrs` | any (no kit I/O) |

**Node vs browser**

| Need | Use |
|------|-----|
| CLI / scripts | `adapters/mark/lockup.mjs`, `adapters/ansi/render.mjs` |
| Bundler / browser | `kit/mark.json` + `adapters/mark/from-kit.mjs` → `adapters/react` and/or `adapters/presence` |
| Working-slot / chip / roster | `adapters/presence/presence.css` + `attrs.mjs` (pure; either runtime) |

Do not import `lockup.mjs` or `ansi/` in the browser — they touch `node:fs`.

**Recipe seams.** Ids (`face`, `stage`, `action`, `motion`) are kit SoT. Motion / presence reuse **action** id strings on `data-motion` + `data-state` — no parallel expression tables. React and `presenceAttrs` both emit that pair when you pass `motion` (or fall back to `action`).

No `console/` imports. Brand law: [../PORTING.md](../PORTING.md). Mascot has no name.
