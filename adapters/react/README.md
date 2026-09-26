# adapters/react

Presentational `<pre>` for the Mininja mark. **You supply the strings.** Peer: React 18+.

No kit I/O. No motion engine (CSS presence is opt-in via [`adapters/presence`](../presence)). No `console/` imports. Face / stage / action stay **kit id strings** (recipe-compatible seams) — do not invent a parallel expression enum in the host.

## ~60s in a host

```tsx
import mark from "../../kit/mark.json" with { type: "json" };
import { linesFor } from "../mark/from-kit.mjs";
import { Mininja } from "./index";

<Mininja lines={linesFor(mark, "idle")} face="idle" />
```

Level-1 paste (no kit import):

```tsx
<Mininja lines={["▚████", "██ ●●", "▀▀▀▀▀"]} face="idle" />
```

See the DOM contract without installing React:

```bash
./examples/react/preview.mjs
./examples/react/preview.mjs allowed --stage dock --action wave
```

## Props

| Prop | Type | Role |
|------|------|------|
| `lines` | `MarkLines` (`[string, string, string]`) | **Required.** Rows from from-kit / lockup / paste. |
| `face` | `string` | Kit face id (`kit/mark.json`). `data-face` hint only. Default `idle`. |
| `stage` | `string` | Kit stage id (`kit/scene.json` stages.*.id). `data-stage` when set. |
| `action` | `string` | Kit action id (`kit/scene.json` actions.*.id). `data-action` when set. |
| `motion` | `string` | Kit action id (or future presence id). `data-motion` + `data-state` when set; if omitted, falls back to `action`. String seam — not an expression union. |
| `facing` | `"left" \| "right"` | `data-facing` hint. Does **not** mirror glyphs — pass mirrored `lines`. |
| `reducedMotion` | `boolean` | Host must honor — no walk/patrol when true. |
| `className` / `style` | — | Pass-through onto `<pre>`. |
| `ref` | `HTMLPreElement` | Forwarded to `<pre>`. |

## Recipe seam

Ids stay strings — kit is SoT:

```tsx
<Mininja
  lines={linesFor(mark, "allowed")}
  face="allowed"
  stage="dock"
  action="wave"
  motion="wave"
/>
```

Presence CSS ([`adapters/presence`](../presence)): pass `motion` (or just `action`) and `className="mininja-mark"` — sway/pulse keys on `data-motion` / `data-state`. Labels stay host copy.

Facing left (mirror in mark filter, then present):

```tsx
<Mininja
  lines={linesFor(mark, "idle", "left")}
  face="idle"
  facing="left"
/>
```

## Browser rule

Do **not** import `../mark/lockup.mjs` or `../ansi/` here — they use `node:fs`. Use `kit/mark.json` + `from-kit.mjs`, or paste lines.

## A11y / host duties

- Alt / accessible name is always **Mininja mark** (`role="img"` + `aria-label`). Mascot has no personal name.
- Host owns scoot / patrol (level 3) and `prefers-reduced-motion` (wire to `reducedMotion`).
- CSS hooks: `[data-face]`, `[data-stage]`, `[data-action]`, `[data-motion]`, `[data-state]`, `[data-facing]`, `[data-reduced-motion="true"]`.
- Simple presence animations + Messaged-style chip: [`adapters/presence`](../presence).
