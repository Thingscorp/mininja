# examples/react — present the mark

Wire [`adapters/react`](../../adapters/react) after you can print a face. Peer: React 18+ in the **host** (this folder does not ship React).

## ~60s without React

See the exact `<pre>` contract the component emits:

```bash
./examples/react/preview.mjs
./examples/react/preview.mjs allowed --stage dock --action wave
./examples/react/preview.mjs evaluating --motion search --action search
./examples/react/preview.mjs idle --facing left
./examples/react/preview.mjs --list
```

`--motion` maps to `data-motion` + `data-state` (falls back to `--action` when omitted) — same seam as `Mininja`’s `motion` prop.

## In a React host

```tsx
import mark from "../../kit/mark.json" with { type: "json" };
import { linesFor } from "../../adapters/mark/from-kit.mjs";
import { Mininja } from "../../adapters/react";

export function Face() {
  return (
    <Mininja
      lines={linesFor(mark, "allowed")}
      face="allowed"
      stage="dock"
      action="wave"
    />
  );
}
```

Facing left: mirror in the mark filter, then present.

```tsx
<Mininja
  lines={linesFor(mark, "idle", "left")}
  face="idle"
  facing="left"
/>
```

Do not import `adapters/mark/lockup.mjs` or `adapters/ansi/` in the browser — they use `node:fs`.

Host owns scoot / patrol and `prefers-reduced-motion` → `reducedMotion`. Alt text is always **Mininja mark**.

Presence sway/pulse + Messaged chip: [`../presence/`](../presence/) · [`adapters/presence`](../../adapters/presence).
