# adapters/ansi

Colorize mark only. Pipes `adapters/mark` → ANSI.

| in | out |
|----|-----|
| face (+ color?) | ANSI string (or plain if `color: false`) |
| `lines` + tone | colorized string via `colorize` |

```js
import { ansiLockup, colorize } from "./render.mjs";
import { linesFor } from "../mark/lockup.mjs";

ansiLockup("executing");
ansiLockup("idle", { color: false });
colorize(linesFor("allowed"), "ok");
```

Monochrome when `color: false`. Mood codes are optional chrome. No `console/` imports.
