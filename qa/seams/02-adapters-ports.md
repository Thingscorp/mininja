# Host seams — adapters / ports inventory

**Audience:** Apps (console+bot hosts) / Kit / Ports.  
**Date:** 2026-09-26 (ET).  
**Scope:** Mapping only — how `adapters/` + `examples/` turn kit JSON into strings / ANSI / React / CLI / CSS. **No kit edits. No commits.**  
**Inputs:** `adapters/**`, `examples/**`, [`qa/OLD-CONSOLE-CARRYOVER.md`](../OLD-CONSOLE-CARRYOVER.md), [`PORTING.md`](../../PORTING.md).

Product vocabulary: **kit** = `mark.json` + `scene.json`. **Adapters** = one-job Unix filters. **Hosts** = `console/`, `bot/`, stranger ports. Mascot has **no name**.

---

## Mental model (studs vs bricks)

```
kit/mark.json  ──►  adapters/mark   ──►  string[3] / lockup string
                         │
                         ├── adapters/ansi      ──►  ANSI string          (Node)
                         ├── adapters/react     ──►  <pre> DOM            (you pass lines)
                         └── adapters/presence  ──►  CSS / chip / roster  (data-* seams)

kit/scene.json ──►  (no scene→string adapter today)
                   hosts read stages/actions/motion themselves;
                   presence only *keys* on action id strings
```

| Layer | Owns | Does not own |
|-------|------|--------------|
| **Kit** | Face / stage / action / emotion / growth ids; glyphs; geometry; motion speeds | Pal tint, composer, roster labels, ANSI codes |
| **Adapters** | face→lines, lines→ANSI, lines→`<pre>`, CSS hooks on kit ids | Habitat camera, scoot/patrol, programs, teammate CRUD |
| **Hosts (console/bot)** | Composer, multi-pal, tint, banner/grove chrome, program cards | Parallel face/stage tables; redrawing lockup glyphs by hand |

---

## 1. Adapter inventory

| Name | Kit inputs (files / fields) | Output kind | Host should use? | Known dual-path risks |
|------|----------------------------|-------------|------------------|------------------------|
| **`adapters/mark/from-kit.mjs`** | `kit/mark.json`: `faces.*` (`eyes`, `lines`, `mirrored`, `tone`), `canonicalIdle`, `mirroredIdle`; overlays via `mergeMark` | `string[3]` / joined lockup; `listFaces` / `hasFace` | **YES — primary.** Pure; browser + Node. Facing always wins over stored `mirrored`. | Console `composeLockup` (scene emotion+action+feet) and bot inline `FRAMES` / `framesFromKit` reimplement glyph assembly. Drift on facing, eyes-only faces, unknown→idle. |
| **`adapters/mark/lockup.mjs`** | Same, loaded via `node:fs` from repo `kit/mark.json` | Same as from-kit (Node convenience) | **YES for CLI / scripts.** **NO in browser** (`node:fs`). | Importing lockup into bundler → broken / accidental dual kit path. |
| **`adapters/ansi/render.mjs`** | `faces.*.tone` ∈ `moodColorsUiOnly` keys; lines via from-kit / default kit | ANSI-colored multi-line string (or plain if `color:false`) | **YES for terminal hosts.** **NO in browser** — use CSS `currentColor` + mood hex from kit. | Host inventing a second face→ANSI map; ignoring `moodColorsUiOnly` order/keys. Fork moods without host colorize → silent idle chrome. |
| **`adapters/react` (`Mininja`)** | *No kit I/O.* Props: `lines` (required) + string ids `face` / `stage` / `action` / `motion` / `facing` / `reducedMotion` | Monospace `<pre role="img" aria-label="Mininja mark">` + `data-*` | **YES for React hosts** that already have lines from from-kit. | Host mirroring glyphs in React (`facing` prop does **not** transform lines). Parallel expression enums instead of kit id strings. Importing lockup/ansi into client bundle. |
| **`adapters/presence/attrs.mjs`** | *No kit I/O.* Same id seams as React (`face`, `stage`, `action`, `motion`, `facing`, `reducedMotion`) | Attr map / HTML attr string; `chipCopy` / `rosterCopy` (host labels) | **YES** for non-React HTML / SSR / bot static. | Inventing presence enum (`orbit`, `searching`) instead of kit `actions[].id`. |
| **`adapters/presence/presence.css`** | Keys `data-motion` / `data-state` on subset of kit action ids (`idle`, `blink`, `search`, `wait`, `read`, `think`, `scan`, `type`, …) | Sway / pulse animations; slot / chip / roster chrome; `--fg` / `--bg` tint hooks | **YES** for working-slot / chip / sidebar mark chrome. Optional for full habitat banner. | CSS-only motion table diverging from `scene.actions`; host walk/patrol in CSS instead of scene camera. |
| **`adapters/presence/mark-chip.svg`** | Idle silhouette (first-party 5×3 → SVG); tint `currentColor` | 16×16 / 24×24 chip mark | **YES** for Messaged chip + roster avatar. Not a full face catalog. | Third-party mark copies; baking pal colors into the SVG. |

### Examples (compose adapters — not second SoT)

| Example | Uses | Proves |
|---------|------|--------|
| `examples/cli-banner.sh` | mark/lockup + ansi | Terminal face; idle printf fallback without Node |
| `examples/readme-badge.md` | paste idle glyphs | Level-0 mark, no install |
| `examples/remix/print-face.mjs` | `mergeMark` + from-kit + ansi; scene motion merge demo | Overlay faces/speeds **without** forking `console/` |
| `examples/react/preview.mjs` | from-kit → same `<pre>` contract as `Mininja` | DOM seam without React install |
| `examples/presence/preview.mjs` | from-kit + presenceAttrs + CSS + chip SVG; lists `scene.actions` | Slots + chip + roster; motion = kit action ids |

### Font / mark assumptions (all adapters)

| Assumption | Source | Host duty |
|------------|--------|-----------|
| **5×3 cell grid**; glyphs **are** the mark | `kit/mark.json` `grid` / `canonicalIdle` | Do not rescale to freeform ASCII art |
| **IBM Plex Mono** (500) production stack | `kit.typeface.cssStack`; React default style; presence examples | Load Plex for production mark; README/email may use pre-rendered assets |
| **Monochrome mark**; mood hex is UI chrome only | `monochrome: true`, `moodColorsUiOnly` | Tint via CSS/`--fg`/ANSI — do not recolor cells inside lines |
| **Facing** desired orientation wins | from-kit `linesFor(..., facing)` | Mirror in mark filter **before** React; `data-facing` is hint only |
| **Aria name** = `"Mininja mark"` | React + presenceAttrs | Never a character name / Casque |
| **Unknown face → idle** | from-kit filter contract | Use `hasFace` at host edge for hard errors |
| **Motion seams** = kit `actions[].id` strings | scene + presence CSS | No parallel presence catalog in adapters |

---

## 2. Occam: adapters vs console/bot chrome

### Belongs in **adapters** (keep thin)

- Face id → three lockup lines (eyes / lines / facing-wins).
- Optional ANSI tone chrome for the five `moodColorsUiOnly` keys.
- Presentational `<pre>` with recipe-compatible `data-*` seams.
- Presence CSS keyed on kit action ids; chip / roster **silhouette** + attr helpers.
- Overlay merge (`mergeMark`) so strangers remix bricks without forking hosts.

### Belongs in **console / bot chrome** (hosts)

| Concern | Why not adapters |
|---------|------------------|
| **Composer** (programs + teammate tasks, future `@`) | Product routing; no kit surface |
| **Multi-pal roster / select / stop / rally** | Apps chrome; tint from name hash |
| **Pal tint** (`sha256(name)` → hue) | MUST NOT enter kit or adapters |
| **Habitat banner / grove / camera / walk-run feet** | Scene program: `composeLockup` / bot grove paint — geometry+motion from kit, **renderer** in host |
| **Program cards** (now/todo/plan/brief/…) | Engine / plugins |
| **SSE, auth, routines, permission modes** | Server / Apps infra |
| **Status / chip / peer labels** (`Idle`, `Messaged`, agent names) | Host copy — presence only truncates |
| **Scoot / patrol / reduced-motion policy** | Host owns level-3 motion; adapters only expose the flag |

### Occam rule of thumb

> If it turns **kit ids → mark pixels/strings**, it is an adapter.  
> If it turns **user intent → which pal / which program / which camera**, it is host chrome.  
> Do not grow adapters into apps; do not reimplement mark filters inside hosts.

---

## 3. Gaps vs OLD-CONSOLE-CARRYOVER P0

Carry-over P0 cluster: **composer `@`-mention**, **pull-off / retarget / rally-all**, **unify composer surfaces**, plus habitat/multi-pal context from the same doc.

| P0 / related gap | Adapters that **help** | Adapters that **don’t** | Notes |
|------------------|------------------------|-------------------------|-------|
| **Composer `@`-mention / unify composer** | — | All four packages | Pure Apps product. No kit/adapter seam for targeting. |
| **Pull-off / retarget / rally-all** | — | All | Bot `stop` + refuse double-assign today; adapters irrelevant. |
| **Multi-pal color in habitat / sidebar** | **presence** (`--fg` tint, roster row, chip) — chrome hooks only | mark / ansi / react (except React can sit *inside* a tinted slot) | Tint algorithm stays host (`tint.py` / `tint.ts`). **MUST NOT** bake pal colors into kit or mark-chip.svg. |
| **Habitat strip / grove / stages** | mark (face lines for mascot cell); presence (optional slot sway on action ids); react (present lines + `data-stage`/`data-action`) | ansi (terminal only); no scene→banner adapter | Habitat **already** kit-hydrated in console `registerFromKit` + bot `hydrateZones`. Adapters do **not** replace banner/grove renderers. |
| **Faces / lockup correctness** | **mark** (SoT path); ansi for CLI; react/presence for DOM | — | Carry-over P2: bot inline `FRAMES` + legacy `sandbox` — **should** converge on from-kit / hydrate, not grow FRAMES. |
| **Presence / working-slot craft** | **presence** + react `motion`/`action` | mark/ansi alone | Maps host feelings → kit action ids (`search`, `think`, …). No `@` help. |

**Summary:** Adapters close the **mark / presence presentation** half of habitat identity. They do **nothing** for the composer / targeting / rally P0s — those stay Apps-only per carry-over ownership table.

---

## 4. Recommended host rule

### Rule

> **Hosts never redraw the lockup; they call `adapters/mark` (from-kit in browser, lockup.mjs on Node), then present via `adapters/react` and/or `adapters/presence` (or `adapters/ansi` on CLI).**

### Operational checklist

1. **Load kit** — import / fetch `kit/mark.json` (browser) or use `lockup.mjs` (Node). Optional: `mergeMark(base, overlay)` for local remixes (`examples/remix` pattern).
2. **Resolve lines** — `linesFor(kit, face, facing)` / `lockup(...)`. Facing left/right decided here — not in CSS, not in React.
3. **Present**
   - React → `<Mininja lines={...} face stage action motion facing reducedMotion />` + optional `className="mininja-mark"` + `presence.css`.
   - Static HTML / bot → `<pre>` attrs from `presenceAttrs` + same CSS, or paint lines into existing `#mascot` **from kit hydrate**, not a hand-maintained glyph table.
   - CLI → `ansiLockup` / `ansiLockupFromKit`.
4. **Ids stay strings** — `face` / `stage` / `action` / `motion` / `data-state` are kit SoT. No parallel expression unions in host TypeScript beyond thin aliases.
5. **Chrome stays host** — composer, tint, roster labels, stop/rally, habitat camera, program cards.

### Explicit anti-patterns (dual-path)

| Anti-pattern | Prefer |
|--------------|--------|
| Hand-editing three-line glyphs in `bot/static` `FRAMES` (except ephemeral hydrate fallback) | `framesFromKit` → eventually replace seed with from-kit semantics (facing-wins, eyes-derive) |
| Console `mascot.ts` `FRAMES` as a second face catalog for new ports | New ports: from-kit only; console may keep `composeLockup` for **scene feet/pose** (habitat), but static face tables should not fork |
| `facing` flipped only via CSS `scaleX(-1)` | Mirror in from-kit, set `data-facing` as hint |
| Browser import of `lockup.mjs` / `ansi/render.mjs` | from-kit + CSS |
| New motion ids in `presence.css` without kit `actions[]` | Ask Kit; map host feeling → existing action id |

### Habitat nuance (do not over-collapse)

Console **`composeLockup(scene, tick, blink)`** is not a drop-in for from-kit: it composes **emotion eyes + action pose/feet + walk cycle** for the side-scroller banner. That remains **host scene chrome** consuming kit catalogs. The rule above covers the **static / face-id lockup** (terminal buddy, chip, roster, CLI, README). Habitat hosts still must not invent STAGE/EMOTION/ACTION seed tables — kit is SoT; they may keep a scene composer that **reads** kit.

---

## Pointers

- Carry-over P0 / ownership: [`qa/OLD-CONSOLE-CARRYOVER.md`](../OLD-CONSOLE-CARRYOVER.md)
- Stranger on-ramp: [`PORTING.md`](../../PORTING.md), [`examples/`](../../examples/)
- Adapter index: [`adapters/README.md`](../../adapters/README.md)
- Habitat already-ported: [`HABITAT-PORT.md`](../../HABITAT-PORT.md)

---

## Occam one-liner

**Call mark → ansi|react|presence; hosts own composer, pals, and habitat camera — never a second face table.**
