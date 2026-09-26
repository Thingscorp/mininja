# examples/presence — simple presence + chip

Prove the working-slot pattern with **kit action ids** as motion seams, plus a Messaged-style pill. No React required. No third-party mark paths.

## ~60s

```bash
./examples/presence/preview.mjs
./examples/presence/preview.mjs --html > /tmp/mininja-presence.html   # open in a browser
./examples/presence/preview.mjs --list-actions
./examples/presence/preview.mjs --peer "very-long-peer-name-here" --fg "#FF6700"
```

You should see:

1. **Idle** slot — status label + static mark (`data-motion="idle"`)
2. **Searching** slot — status label + sway (`data-motion="search"`, kit action `search`)
3. **Messaged** chip — 16×16 first-party silhouette, `--fg` tint, truncated peer name
4. **Sidebar roster row** — 24×24 mark (`data-state="search"`), green status badge, truncated agent name, options on hover

```bash
./examples/presence/preview.mjs --agent "very-long-agent-display-name" --row-fg "#E11D48"
```

Labels (`Idle`, `Searching`, `Messaged`, peer, agent) are **host copy**. Face / stage / action / motion stay kit strings.

## Wire in a React host

```tsx
import { Mininja } from "../../adapters/react";
import { linesFor } from "../../adapters/mark/from-kit.mjs";
import mark from "../../kit/mark.json" with { type: "json" };
import "../../adapters/presence/presence.css";

<Mininja
  className="mininja-mark"
  lines={linesFor(mark, "evaluating")}
  face="evaluating"
  stage="archives"
  action="search"
  motion="search"
/>
```

`motion` (or `action` alone) emits `data-motion` + `data-state` for [`adapters/presence/presence.css`](../../adapters/presence/presence.css).

## Why these ids?

| Host feeling | Kit seam |
|--------------|----------|
| idle / resting | action `idle` |
| searching / busy | action `search` (sway + fx search in scene; sidebar `data-state`) |
| thinking | action `think` |

There is **no** parallel `orbit` / `searching` table in this adapter. If kit needs named presence layers beyond actions, that is a Kit plate — document the gap, do not invent a second face catalog here.

Inspiration (not dependency): Grok Bot working-slot `data-state` + `--fg` / `--bg` chips.
