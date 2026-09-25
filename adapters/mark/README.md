# adapters/mark

Strings only. Reads `kit/mark.json`.

| in | out |
|----|-----|
| face (+ facing) | 3-line string / `string[3]` |

```js
import { lockup, linesFor, listFaces } from "./lockup.mjs";

lockup("idle");              // "▚████\n██ ●●\n▀▀▀▀▀"
linesFor("allowed");         // ["▚████", "██ ><", "▀▀▀▀▀"]
lockup("idle", "left");      // mirrored body
listFaces();                 // face ids
```

No DOM. No ANSI. No React. No `console/` imports.
