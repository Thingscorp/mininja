# adapters/react

Sketch only — not a published package. Pass `lines` from the mark adapter or `kit/mark.json`.

```tsx
import { Mininja } from "./Mininja";
import { linesFor } from "../mark/lockup.mjs";

<Mininja face="idle" lines={linesFor("idle")} />
```

Level 3 (scoot): animate `facing` / position in the host; read speeds from `kit/scene.json`. Honor `prefers-reduced-motion`.
