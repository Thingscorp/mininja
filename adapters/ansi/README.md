# adapters/ansi

```js
import { ansiLockup } from "./render.mjs";
console.log(ansiLockup("executing"));
console.log(ansiLockup("idle", { color: false }));
```

Respects monochrome brand when `color: false`. Mood ANSI codes are optional chrome.
