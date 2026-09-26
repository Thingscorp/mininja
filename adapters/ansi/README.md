# adapters/ansi

Colorize mark only. **Node** (default kit via `lockup.mjs`). Tone ids are kit SoT — `faces.*.tone` ∈ `moodColorsUiOnly`. No parallel face→tone map.

| in | out |
|----|-----|
| face (+ color?) | ANSI string (or plain if `color: false`) |
| kit + face | same, via `ansiLockupFromKit` (remix overlays) |
| `lines` + tone | colorized string via `colorize` |

```js
import {
  ansiLockup,
  ansiLockupFromKit,
  colorize,
  toneForFace,
  hasTone,
  listTones,
} from "./render.mjs";
import { linesFor, kit } from "../mark/lockup.mjs";

ansiLockup("executing");
ansiLockup("idle", { color: false });
ansiLockup("idle", { facing: "left" });
ansiLockup("loadingLeft", { facing: "right" }); // facing wins (via mark)
colorize(linesFor("allowed"), toneForFace(kit, "allowed"));
hasTone(kit, "ok");   // true — moodColorsUiOnly key
listTones(kit);       // idle · accent · ok · warn · err (kit order)
// remix: ansiLockupFromKit(mergedKit, "allowed")
```

Monochrome when `color: false`. Mood ANSI is optional chrome for the five upstream tone ids (`idle` · `accent` · `ok` · `warn` · `err`). Forks that add mood keys get idle chrome unless the host colorizes itself. No `console/` imports.

**Browsers:** render with `adapters/mark/from-kit.mjs` + CSS (`currentColor`) — skip this filter.
