# adapters/mark

Face → strings. One job.

| Entry | Runtime | Notes |
|-------|---------|-------|
| [`from-kit.mjs`](from-kit.mjs) | any | Pure. You pass `kit/mark.json`. |
| [`lockup.mjs`](lockup.mjs) | **Node** | Loads `kit/mark.json` via `node:fs`. |

| in | out |
|----|-----|
| face (+ facing) | 3-line string / `string[3]` |

Node:

```js
import { lockup, linesFor, listFaces } from "./lockup.mjs";

lockup("idle");              // "▚████\n██ ●●\n▀▀▀▀▀"
linesFor("allowed");         // ["▚████", "██ ><", "▀▀▀▀▀"]
lockup("idle", "left");      // mirrored body
listFaces();                 // face ids
```

Browser / bundler (no `node:fs`):

```js
import mark from "../../kit/mark.json" with { type: "json" };
import { lockup, linesFor } from "./from-kit.mjs";

lockup(mark, "idle");
linesFor(mark, "allowed");
```

No DOM. No ANSI. No React. No `console/` imports.
