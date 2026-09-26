# Porting Mininja

Ship the idle lockup in about a minute. Grow faces, scoot, or scene only when you need them.

**Kit** (`kit/mark.json`, `kit/scene.json`) is the source of truth. **Adapters** are tiny Unix filters over that data — compose them; do not grow them into apps. The brand name is **Mininja**; the mascot has **no personal name** and no he/him. Craft / Lego metaphors describe quality and modularity — not affiliation with Apple Inc.

Event recipes ([`RECIPES.md`](RECIPES.md)) are a later plate. Ports must keep face, stage, and action **ids** as kit strings so recipes can target them later — no parallel expression tables in adapters or hosts.

---

## First face (~60s)

Paste anywhere monospace is welcome:

```
▚████
██ ●●
▀▀▀▀▀
```

Or from a clone:

```bash
./examples/cli-banner.sh              # idle (printf fallback if Node is missing)
./examples/cli-banner.sh allowed      # face + ANSI tone (needs Node)
./examples/cli-banner.sh allowed -p   # same face, plain (no ANSI)
./examples/cli-banner.sh allowed --facing left
./examples/cli-banner.sh --list       # face ids from kit/mark.json
```

| Path | Role |
|------|------|
| [`examples/readme-badge.md`](examples/readme-badge.md) | Copy-paste idle for any README |
| [`examples/cli-banner.sh`](examples/cli-banner.sh) | Print a kit face in the terminal |
| [`examples/remix/`](examples/remix/) | Overlay faces / motion speeds without forking `console/` |
| [`examples/react/`](examples/react/) | DOM `<pre>` contract (no React install required to preview) |
| [`examples/presence/`](examples/presence/) | Slots + Messaged chip + sidebar roster (`data-motion` / `data-state`) |

Stop here unless you need faces in code.

---

## Mental model

```
kit/mark.json  ──►  adapters/mark   ──►  strings
                         │
                         ├── adapters/ansi      ──►  ANSI string   (Node)
                         ├── adapters/react     ──►  <pre>         (you pass lines)
                         └── adapters/presence  ──►  CSS / chip / roster (data-motion seams)
```

| Piece | You change | You keep |
|-------|------------|----------|
| [`kit/mark.json`](kit/mark.json) | faces, eyes, lines, tone ids | 5×3 grid; glyphs **are** the mark |
| [`kit/scene.json`](kit/scene.json) | motion speeds, stages, props, weather, actions | adapter contracts (in → out) |
| [`adapters/*`](adapters/) | rarely | one-job filters (mark · ansi · react · presence) |

Adapters never import `console/`. Examples only compose adapters. When you outgrow filters, [`console/`](console/) is the reference **scene** program; [`bot/`](bot/) is an optional Mac launcher — not a second brand source.

---

## Node vs browser

| Runtime | Load kit | Render strings | Color / present |
|---------|----------|----------------|-----------------|
| **Node** | [`adapters/mark/lockup.mjs`](adapters/mark/lockup.mjs) (reads disk) | `lockup` / `linesFor` | [`adapters/ansi/render.mjs`](adapters/ansi/render.mjs) |
| **Browser / bundler** | import [`kit/mark.json`](kit/mark.json) yourself | [`adapters/mark/from-kit.mjs`](adapters/mark/from-kit.mjs) (pure) | CSS `currentColor`, [`adapters/react`](adapters/react), and/or [`adapters/presence`](adapters/presence) |

Do **not** import `lockup.mjs` or `adapters/ansi/` in the browser — they use `node:fs`. Presence CSS + `attrs.mjs` are pure (no kit I/O) and safe in either runtime.

**Node** (paths relative to repo root):

```js
import { lockup, linesFor, hasFace, listFaces, mergeMark } from "./adapters/mark/lockup.mjs";
import { ansiLockup, hasTone } from "./adapters/ansi/render.mjs";

process.stdout.write(lockup("allowed") + "\n");
process.stdout.write(ansiLockup("executing") + "\n");
// ansiLockup("idle", { color: false, facing: "left" })
// hasTone(kit, "ok") — moodColorsUiOnly key check
// mergeMark({ faces: { wink: { eyes: ["¬", "●"], tone: "accent", mirrored: false } } })
```

**Browser / bundler:**

```js
import mark from "./kit/mark.json" with { type: "json" };
import { linesFor, lockup, hasFace, mergeMark } from "./adapters/mark/from-kit.mjs";
import { Mininja } from "./adapters/react/Mininja.tsx";
// optional presence chrome:
// import "./adapters/presence/presence.css";
// import { presenceAttrs } from "./adapters/presence/attrs.mjs";

const lines = linesFor(mark, "allowed"); // ["▚████", "██ ><", "▀▀▀▀▀"]
lockup(mark, "idle");                    // three lines joined by \n
// const remixed = mergeMark(mark, overlay); linesFor(remixed, "wink");

<Mininja lines={lines} face="allowed" action="search" motion="search" className="mininja-mark" />
```

`from-kit` takes `(kit, face, facing?)`. `lockup.mjs` is the same API with kit already loaded — `(face, facing?)`. Both return **strings** (or `string[3]` for `linesFor`). Unknown face ids fall back to `idle`; use `hasFace` at the host edge when you want a hard error. `mergeMark` is the supported overlay helper — prefer it over hand-rolled face spreads.

React is presentational only: you pass `lines`; `face` / `stage` / `action` / `motion` are kit id **strings** for hints and recipe seams (`data-face`, `data-stage`, `data-action`, `data-motion`, `data-state`). Prefer kit **action** ids for `motion` (e.g. `idle`, `search`) — do not invent a parallel expression union. When `motion` is omitted, React falls back to `action` for both `data-motion` and `data-state`.

---

## Presence ladder: mark → faces → scoot → scene

Each step is a thinner-to-thicker filter. Pipe only as far as you need.

```
kit/mark.json
      │
      ▼
①  mark     paste / examples/          idle lockup (strings)
      │
      ▼
②  faces    adapters/mark              face → strings
      │
      ├── adapters/ansi                 strings → ANSI tones
      ├── adapters/react                strings → <pre>
      └── adapters/presence             CSS sway/pulse + chip pills
            │
            ▼
③  scoot    host motion                facing + scoot (you own it)
      │
      ▼
④  scene    console/                   full stage strip (one program)
```

| | Layer | Filter | What you ship |
|-:|-------|--------|---------------|
| 1 | **mark** | paste / [`examples/`](examples/) | Idle 3-line lockup |
| 2 | **faces** | [`adapters/mark`](adapters/mark) → optional [`ansi`](adapters/ansi) / [`react`](adapters/react) / [`presence`](adapters/presence) | Moods / eyes / working-slot chrome |
| 3 | **scoot** | react + host animation | Facing + motion |
| 4 | **scene** | [`console/`](console/) | Stage strip + weather + props |

Do **not** drag scene into a favicon. Do **not** replace glyphs with a redrawn mascot — the Unicode stack **is** the mark.

### Presence direction (working slots + pills + roster)

[`adapters/presence`](adapters/presence) is thin chrome — **not** a motion engine and **not** a second face table:

| Piece | Job |
|-------|-----|
| `presence.css` | Slot + sway/pulse keyed by `data-motion` / `data-state`; Messaged chip; sidebar roster row |
| `mark-chip.svg` | `currentColor` silhouette (16×16 chip · 24×24 row via CSS) |
| `attrs.mjs` | Pure `presenceAttrs` / `chipCopy` / `rosterCopy` helpers |

Motion vocabulary is kit **action** ids (`kit/scene.json` → `actions[].id`): `idle`, `search`, `think`, `wait`, … CSS currently animates a subset (`idle`/`blink` static; `search`/`wait`/`read` sway; `think`/`scan`/`type` pulse). Labels (`Idle`, `Searching`, `Messaged`, peer, agent) stay **host copy**. `--fg` / `--bg` tint the slot and chip; roster rows also use `--badge`.

Grok Bot’s working-slot / sidebar pattern is **inspiration, not a dependency** — do not vendor its path geometry. Runnable proof: [`examples/presence/`](examples/presence/) (idle + search slots, Messaged chip, sidebar roster row).

---

## Fork & remix

Rules are **data** and meant to be modified. Forking is encouraged. Adapters are the studs; kit JSON is the brick specs. Do not rewrite `console/` to change a face or a walk speed.

**Happy path — overlay without forking kit or console:**

1. Keep upstream `kit/` as the base.
2. Merge a local overlay after load — use `mergeMark(base, overlay)` from [`adapters/mark/from-kit.mjs`](adapters/mark/from-kit.mjs) (Node convenience: `mergeMark(overlay)` on [`lockup.mjs`](adapters/mark/lockup.mjs) merges onto the default kit). For scene speeds, shallow-merge `motion` (see [`examples/remix/print-face.mjs`](examples/remix/print-face.mjs)).
3. Pass the merged mark into `from-kit` helpers (and your host motion code for scene numbers).
4. Leave adapter signatures alone — face → strings → ANSI / `<pre>` / presence attrs.
5. Name the overlay or fork in the host README so others know which ruleset they are on.

Overlays may omit `lines` and supply only `eyes` (+ optional `mirrored`); `from-kit` derives the 5×3 lockup from `canonicalIdle` / `mirroredIdle`.

### Remix in 60s

```bash
# A) overlay only (no kit fork) — works today:
cd examples/remix
node ./print-face.mjs allowed          # ◆◆ eyes via mark-overlay.json
node ./print-face.mjs wink             # eyes-only face; from-kit derives lines
node ./print-face.mjs allowed --ansi   # same overlay + adapters/ansi
node ./print-face.mjs --list           # face ids after merge
node ./print-face.mjs --motion         # scene-overlay speeds vs upstream

# B) fork kit — add a complete face (or eyes-only), then:
#    kit/mark.json → faces.wink = {
#      "eyes": ["¬","●"], "tone": "accent", "motion": null, "mirrored": false
#    }
#    ./examples/cli-banner.sh wink
```

Worked overlays: [`examples/remix/`](examples/remix/) (`mark-overlay.json`, `scene-overlay.json`, `print-face.mjs`).

Do not shame divergent speeds, stages, or faces. Do shame **silent dual tables** that claim to be kit while drifting. Upstream geometry below is the Thingscorp default — match it when you intend to stay aligned; replace it on purpose when you fork.

---

## Invariants (every port)

- 5 columns × 3 rows; each line exactly 5 cells after render.
- Monochrome mark; mood hex is **UI chrome only** (`moodColorsUiOnly`).
- Clearspace ≥ one row height (H/3).
- Digital min height 24 px (8 px cells); terminal min 3 rows.
- `prefers-reduced-motion`: snap only — no walk, run, or patrol. Presence CSS also honors `data-reduced-motion="true"`.
- No personal name (and no he/him) in HUD, alt text, package titles, or filenames.
- Alt text is always **Mininja mark**.

---

## Recipe-compatible seams

Face, stage, and action **ids** stay kit SoT. Motion / presence states reuse the **same** action id strings so a later RECIPES plate can target them — no parallel expression tables in adapters or hosts.

| Id kind | Lives in | Shape |
|---------|----------|-------|
| face | `kit/mark.json` → `faces` | object keys (`idle`, `allowed`, …) |
| stage | `kit/scene.json` → `stages[].id` | array of stage records |
| action | `kit/scene.json` → `actions[].id` | array of action records |
| motion / presence | same as action (for now) | string id on `data-motion` + `data-state` |

Adapters pass ids through and render from kit. React exposes `data-face` / `data-stage` / `data-action` / `data-motion` / `data-state`. [`adapters/presence`](adapters/presence) keys simple CSS (sway / pulse), a Messaged-style chip, and a sidebar roster row on those attrs + `--fg` / `--bg` / `--badge`.

**Port rule:** leave recipe-compatible motion seams (string ids). Map host feelings onto kit actions (`searching`-like → `search`, idle → `idle`). If kit lacks an id you need (`orbit`, layered SVG states, …), document the gap for Kit; do not invent a second face table.

Recipes remain a later plate in the system graph (creature + habitat + garden).

---

## Port checklist

1. Pull lines from `kit/mark.json` (or the mark adapter) — do not hand-type eyes in production hosts.
2. Pick a presence layer (mark / faces / scoot / scene); note it in the host app README.
3. Keep alt text **Mininja mark** (never a character name).
4. If you add motion / presence, use kit action id strings on `data-motion` (see [`adapters/presence`](adapters/presence)); honor reduced-motion and [`TERMINAL-MOTION.md`](TERMINAL-MOTION.md).
5. If you stay on upstream Thingscorp kit, scene geometry must match [`kit/scene.json`](kit/scene.json) → `geometry` (`stageWidthPx=420`, `anchorRatio=0.42`, `stageCount=7`). If you fork or overlay, document the new numbers as *your* SoT.
6. Verify consumers still match kit when `console/` is present: `node kit/check-consumers.mjs`.

---

## Adapter map

| Filter | Path | Layers | Runtime |
|--------|------|--------|---------|
| Strings | [`adapters/mark`](adapters/mark) | 1–2 | `from-kit.mjs` any · `lockup.mjs` Node |
| Colorize | [`adapters/ansi`](adapters/ansi) | 1–2 | Node |
| Present | [`adapters/react`](adapters/react) | 1–3 | any (no kit I/O) |
| Presence CSS / chip / roster | [`adapters/presence`](adapters/presence) | 2–3 | any (no kit I/O) |

Brand law and deeper plates: [`BRAND.md`](BRAND.md) · [`STYLEGUIDE.md`](STYLEGUIDE.md) · [`CONSTRUCTION.md`](CONSTRUCTION.md) · [`RECIPES.md`](RECIPES.md).
