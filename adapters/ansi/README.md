# adapters/ansi

Colorize mark only. **Node** (imports `adapters/mark/lockup.mjs` → `node:fs`).

| in | out |
|----|-----|
| face (+ color?) | ANSI string (or plain if `color: false`) |
| `lines` + tone | colorized string via `colorize` |

```js
import { ansiLockup, colorize } from "./render.mjs";
import { linesFor } from "../mark/lockup.mjs";

ansiLockup("executing");                 // face → ANSI (loads kit)
ansiLockup("idle", { color: false });
colorize(linesFor("allowed"), "ok");     // strings → ANSI
```

Monochrome when `color: false`. Mood codes are optional chrome. No `console/` imports.

Browsers: render lines with `adapters/mark/from-kit.mjs`, then style with CSS (`currentColor`) — skip this filter.
