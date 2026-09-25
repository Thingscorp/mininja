# adapters/react

Presentational only. You supply the strings. Works in browsers.

`face` / optional `stage` / `action` are **kit id strings** (recipe-compatible seams). Do not invent a parallel expression enum in the host.

| in | out |
|----|-----|
| `lines` (+ face/facing hints) | `<pre>` mark |

Do **not** import `../mark/lockup.mjs` in the browser — it uses `node:fs`. Use kit JSON + pure mark, or paste lines:

```tsx
import mark from "../../kit/mark.json" with { type: "json" };
import { linesFor } from "../mark/from-kit.mjs";
import { Mininja } from "./Mininja";

<Mininja lines={linesFor(mark, "idle")} face="idle" />
```

Or level-1 literals (no kit import):

```tsx
<Mininja lines={["▚████", "██ ●●", "▀▀▀▀▀"]} face="idle" />
```

Host owns scoot / patrol (level 3) and `prefers-reduced-motion`. No kit I/O in this filter. No `console/` imports.
