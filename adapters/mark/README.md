# adapters/mark

Face → strings. One job.

| Entry | Runtime | Notes |
|-------|---------|-------|
| [`from-kit.mjs`](from-kit.mjs) | any | Pure. You pass `kit/mark.json` (or `mergeMark` result). |
| [`lockup.mjs`](lockup.mjs) | **Node** | Loads `kit/mark.json` via `node:fs`. |

| in | out |
|----|-----|
| face (+ facing) | 3-line string / `string[3]` |

**Node**

```js
import { lockup, linesFor, listFaces, hasFace, mergeMark } from "./lockup.mjs";

lockup("idle");              // "▚████\n██ ●●\n▀▀▀▀▀"
linesFor("allowed");         // ["▚████", "██ ><", "▀▀▀▀▀"]
lockup("idle", "left");      // mirrored body
lockup("loadingLeft");       // stored left-facing glyphs
lockup("loadingLeft", "right"); // facing wins → right-facing body
listFaces();                 // face ids from kit
hasFace("allowed");          // true
mergeMark({ faces: { wink: { eyes: ["¬", "●"], tone: "accent", mirrored: false } } });
```

**Browser / bundler** (no `node:fs`)

```js
import mark from "../../kit/mark.json" with { type: "json" };
import { lockup, linesFor, hasFace, mergeMark } from "./from-kit.mjs";

lockup(mark, "idle");
linesFor(mark, "allowed");
const remixed = mergeMark(mark, overlay);
```

Unknown face ids fall back to `idle` (filter contract). Validate with `hasFace` at the host edge when you want a hard error.

**Facing** is the desired output orientation. `faces.*.mirrored` records how the stored glyphs (or eyes-derive base) are oriented — facing always wins (mirror / un-mirror as needed). Eyes are anatomical `[e_L, e_R]` (same as console `composeLockup`).

**Overlays** use `mergeMark` (deep-merges face records; shallow-merges `moodColorsUiOnly`). Omit `lines` and supply only `eyes` (+ `mirrored`) to derive the 5×3 lockup from `canonicalIdle` / `mirroredIdle`. Patching `eyes` on an existing face without `lines` drops inherited lines so derive runs.

No DOM. No ANSI. No React. No `console/` imports. Face ids are kit SoT — no parallel expression tables. Mascot has no name.
