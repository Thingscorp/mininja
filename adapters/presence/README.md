# adapters/presence

Thin presence chrome over kit id seams. **CSS + attrs + chip / roster silhouettes.** No motion engine. No expression table. No third-party mark paths.

Grok Bot’s working-slot (`data-state` + `--fg` / `--bg`) is **inspiration** — this filter stays first-party Unicode / simple SVG.

## Pieces

| File | Job |
|------|-----|
| [`presence.css`](presence.css) | Slot + sway/pulse; Messaged chip; sidebar roster row |
| [`mark-chip.svg`](mark-chip.svg) | `currentColor` silhouette (16×16 chip · 24×24 row via CSS) |
| [`attrs.mjs`](attrs.mjs) | Pure `presenceAttrs` / `chipCopy` / `rosterCopy` |

Motion ids are **kit action strings** (`kit/scene.json` → `actions[].id`): `idle`, `search`, `think`, … Hosts may pass the same string as React `motion` / `action`.

## Working slot (~60s)

```html
<link rel="stylesheet" href="adapters/presence/presence.css" />

<div class="mininja-slot" style="--fg:#0f172a;--bg:#e2e8f0">
  <span class="mininja-slot__status">Idle</span>
  <pre class="mininja-mark" data-motion="idle" data-state="idle"
       role="img" aria-label="Mininja mark"
       style="margin:0;font:500 12px/1 'IBM Plex Mono',ui-monospace,monospace;white-space:pre">▚████
██ ●●
▀▀▀▀▀</pre>
</div>

<div class="mininja-slot" style="--fg:#0369a1;--bg:#e0f2fe">
  <span class="mininja-slot__status">Searching</span>
  <pre class="mininja-mark" data-motion="search" data-state="search"
       role="img" aria-label="Mininja mark"
       style="margin:0;font:500 12px/1 'IBM Plex Mono',ui-monospace,monospace;white-space:pre">▚████
██ ◐◑
▀▀▀▀▀</pre>
</div>
```

Status text is **host copy**. Prefer kit face lines from `adapters/mark` in real hosts.

## Messaged-style chip

```html
<button type="button" class="mininja-chip" style="--fg:#FF6700">
  <span class="mininja-chip__mark" aria-hidden="true">
    <!-- inline or <img src="adapters/presence/mark-chip.svg"> -->
  </span>
  <span class="mininja-chip__label">Messaged</span>
  <span class="mininja-chip__peer">alex-from-design</span>
</button>
```

## Sidebar roster row

```html
<a class="mininja-row" href="#agent" style="--fg:#E11D48;--badge:#22c55e" aria-label="ports-presence-agent">
  <span class="mininja-row__avatar">
    <span class="mininja-row__mark" data-motion="search" data-state="search" aria-hidden="true">
      <!-- 24×24 mark-chip.svg -->
    </span>
    <span class="mininja-row__badge" title="online"></span>
  </span>
  <span class="mininja-row__name">ports-presence-agent</span>
  <button type="button" class="mininja-row__more" aria-label="Options">···</button>
</a>
```

~36px tall, full width. Mark tints with `--fg`. Green `--badge` sits bottom-right. Name truncates; hover fades a mask and reveals options. Host feeling *searching* → kit action id `search` on `data-state`.

See [`examples/presence/`](../../examples/presence/) for a runnable Node preview (no React).

## Recipe seams

| Attr | Kit SoT |
|------|---------|
| `data-face` | `kit/mark.json` faces.* |
| `data-stage` | `kit/scene.json` stages[].id |
| `data-action` / `data-motion` / `data-state` | Prefer `actions[].id` |

Do **not** invent a parallel presence enum in the host. If you need new motion ids (`orbit`, …), ask Kit — do not fork a second table here.

`prefers-reduced-motion: reduce` (and `data-reduced-motion="true"`) snaps animations off.

## Kit gap (for Kit agent)

Scene actions already cover busy/searching-like motion (`search`, `think`, `scan`, `wait`). There is **no** separate `orbit` / layered SVG presence catalog in kit. Ports map host feelings onto action ids. If layered mark states are needed later, add them in kit — do not grow a second expression table in this adapter.
