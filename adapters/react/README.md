# adapters/react

Presentational only. You supply the strings. Works in browsers. Peer: React 18+.

`face` / optional `stage` / `action` are **kit id strings** (recipe-compatible seams). Do not invent a parallel expression enum in the host.

| Prop | Type | Role |
|------|------|------|
| `lines` | `[string, string, string]` | **Required.** Mark rows from from-kit / lockup / paste. |
| `face` | `string` | Kit face id (`kit/mark.json`). Hint / `data-face` only. |
| `stage` | `string` | Kit stage id (`kit/scene.json` stages.*.id). `data-stage` seam. |
| `action` | `string` | Kit action id (`kit/scene.json` actions.*.id). `data-action` seam. |
| `facing` | `"left" \| "right"` | `data-facing` hint. |
| `reducedMotion` | `boolean` | Host must honor — no walk/patrol when true. |
| `className` / `style` | — | Pass-through. |

Do **not** import `../mark/lockup.mjs` in the browser — it uses `node:fs`. Use kit JSON + pure mark, or paste lines:

```tsx
import mark from "../../kit/mark.json" with { type: "json" };
import { linesFor } from "../mark/from-kit.mjs";
import { Mininja } from "./Mininja";

<Mininja lines={linesFor(mark, "idle")} face="idle" />
```

Level-1 literals (no kit import):

```tsx
<Mininja lines={["▚████", "██ ●●", "▀▀▀▀▀"]} face="idle" />
```

Recipe seam example (ids stay strings — kit SoT):

```tsx
<Mininja
  lines={linesFor(mark, "allowed")}
  face="allowed"
  stage="dock"
  action="wave"
/>
```

Host owns scoot / patrol (level 3) and `prefers-reduced-motion`. No kit I/O in this filter. No `console/` imports. Alt text is always **Mininja mark**.
