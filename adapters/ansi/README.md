# adapters/ansi

Colorize mark only. **Node** (default kit via `lockup.mjs`). Tone ids are kit SoT — `faces[].tone` ∈ `moodColorsUiOnly`. No parallel face→tone map.

| in | out |
|----|-----|
| face (+ color?) | ANSI string (or plain if `color: false`) |
| kit + face | same, via `ansiLockupFromKit` (remix overlays) |
| `lines` + tone | colorized string via `colorize` |

```js
import { ansiLockup, ansiLockupFromKit, colorize, toneForFace } from "./render.mjs";
import { linesFor } from "../mark/lockup.mjs";

ansiLockup("executing");
ansiLockup("idle", { color: false });
colorize(linesFor("allowed"), "ok");
// remix: ansiLockupFromKit(mergedKit, "allowed")
```

Monochrome when `color: false`. Mood ANSI is optional chrome for kit tone ids. No `console/` imports.

Browsers: render with `adapters/mark/from-kit.mjs` + CSS (`currentColor`) — skip this filter.
