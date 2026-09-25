# Remix kit (no console fork)

**Kit** = brick specs. **Adapters** = studs. Keep the studs; change the bricks.

```bash
# upstream face
../../examples/cli-banner.sh allowed

# remixed allowed eyes (◆◆) via overlay — still uses adapters/mark/from-kit
node ./print-face.mjs allowed
```

- [`mark-overlay.json`](mark-overlay.json) — swap faces only
- [`scene-overlay.json`](scene-overlay.json) — swap speeds only (host merges onto `kit/scene.json`)

You do **not** copy `console/` to change a face or a walk speed. Merge overlay → pass the object into `adapters/mark/from-kit.mjs` (and your own motion code reading scene). Mascot has no name.
