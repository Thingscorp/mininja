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

Overlays may omit `lines` and supply only `eyes` (+ `mirrored`); the filter derives the 5×3 lockup from `canonicalIdle` / `mirroredIdle`.

No DOM. No ANSI. No React. No `console/` imports.
