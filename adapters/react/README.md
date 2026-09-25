# adapters/react

Presentational only. You supply the strings.

| in | out |
|----|-----|
| `lines` (+ face/facing hints) | `<pre>` mark |

```tsx
import { Mininja } from "./Mininja";
import { linesFor } from "../mark/lockup.mjs";

<Mininja lines={linesFor("idle")} face="idle" />
```

Host owns scoot / patrol (level 3) and `prefers-reduced-motion`. No kit I/O. No `console/` imports.
