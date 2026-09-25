# adapters/mark

Pure string helpers over `kit/mark.json`.

```js
import { lockup, linesFor, listFaces } from "./lockup.mjs";

console.log(lockup("idle"));
console.log(linesFor("loadingLeft"));
console.log(listFaces());
```

No DOM. No dependencies beyond Node fs for loading the kit (bundle the JSON for browsers).
