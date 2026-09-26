# Remix kit (no console fork)

**Kit** = brick specs. **Adapters** = studs. Keep the studs; change the bricks.

```bash
# from repo root — upstream face
./examples/cli-banner.sh allowed

# remixed allowed eyes (◆◆) via overlay — adapters/mark mergeMark + from-kit
cd examples/remix
./print-face.mjs allowed
./print-face.mjs allowed --ansi
./print-face.mjs allowed --facing left
./print-face.mjs wink                 # eyes-only overlay; from-kit derives lines
./print-face.mjs --list
./print-face.mjs --motion             # scene-overlay speeds vs upstream
```

| File | Role |
|------|------|
| [`mark-overlay.json`](mark-overlay.json) | Swap / add faces only |
| [`scene-overlay.json`](scene-overlay.json) | Swap motion speeds only |
| [`print-face.mjs`](print-face.mjs) | Merge overlay → adapters |

You do **not** copy `console/` to change a face or a walk speed. Merge overlay → pass the object into `adapters/mark/from-kit.mjs` (and your own motion code reading scene).

```js
import { mergeMark, linesFor } from "../../adapters/mark/from-kit.mjs";

const kit = mergeMark(baseMark, overlay);
linesFor(kit, "wink");
```

Scene speeds (host merge — same shape as this demo):

```js
const scene = {
  ...baseScene,
  motion: { ...baseScene.motion, ...overlay.motion },
};
```

Default face for `./print-face.mjs` is **allowed** so the overlay is visible on first run. Mascot has no name. Eyes-only overlay faces (no `lines`) are fine — from-kit derives the 5×3 lockup.
