# Remix kit (no console fork)

**Kit** = brick specs. **Adapters** = studs. Keep the studs; change the bricks.

```bash
# upstream face
../cli-banner.sh allowed

# remixed allowed eyes (◆◆) via overlay — still uses adapters/mark/from-kit
node ./print-face.mjs allowed
node ./print-face.mjs allowed --ansi
node ./print-face.mjs --list
node ./print-face.mjs --motion   # scene-overlay speeds vs upstream
```

| File | Role |
|------|------|
| [`mark-overlay.json`](mark-overlay.json) | Swap / add faces only |
| [`scene-overlay.json`](scene-overlay.json) | Swap motion speeds only |
| [`print-face.mjs`](print-face.mjs) | Merge overlay → adapters |

You do **not** copy `console/` to change a face or a walk speed. Merge overlay → pass the object into `adapters/mark/from-kit.mjs` (and your own motion code reading scene). Host merge for scene:

```js
const scene = {
  ...baseScene,
  motion: { ...baseScene.motion, ...overlay.motion },
};
```

Mascot has no name.
