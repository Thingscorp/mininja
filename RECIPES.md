# Recipes — events → Mininja expressions

**Phase later — not required for first Mininja.**

First Mininja is the **terrarium** as **pal + habitat glass** only: Unicode mark (unnamed pal) inside stages / props / scene weather as scenery chrome. Recipes — IFTTT-style links, “weather from the outside world” — are a **later plate**. Keep this doc as design intent; do not treat it as a v1 hero surface.

Design only. Schema + intent for IFTTT-style links from notifications and events to Mininja faces, actions, stages, and mood chrome. **No runtime stubs in this doc.** Pal / mascot unnamed. Spell it **Mininja**.

> Quality / product metaphors only (“Apple of Terminal Buddies,” “terrarium for Devs,” “IFTTT-style,” Giga Pets × Pebble × IFTTT north star). **Not affiliated with Apple Inc., IFTTT Inc., Pebble Technology, or Bandai.** Full map: [`NORTH-STAR.md`](NORTH-STAR.md). Glance / rubber-duck: [`GLANCE.md`](GLANCE.md).

---

## 1. Why (later plate)

When this plate ships, Mininja stays the **Apple of Terminal Buddies** — obsessive craft, taste, purity of default — and the terrarium gains an optional outer layer: events from CI, Slack, calendar, OS notify can drive **pal posture** without turning the buddy into another dashboard.

| Later plate | Mininja |
|-------------|---------|
| **External events** | **Recipes** — normalized events land as matchers → expressions |
| **Pal reactions** | **Faces** — the output channel people love (error, asking, completed, blink…) |
| **Habitat** | **Stages** — nightwatch → rooftop strip the pal already lives in (see [SCENERY.md](SCENERY.md)) |
| **Garden** | **Growth** on `repoBranch` — ambient health, not interrupt chrome ([GARDEN.md](GARDEN.md)) |

People already love the faces. Recipes are how hosts *may* later push events into the glass: CI fails → error face; calendar in 5m → asking; Slack DM → evaluating; idle timeout → blink. The pal stays loveable because the reaction is still three lines of Unicode.

**Pack = what the duck notices.** Bridges emit lots; recipe packs the user chose **filter** down to the glance hierarchy. Kit stays few bricks. See [`GLANCE.md`](GLANCE.md).

v1 does not need this. Ship mark → faces → scoot → scene first.

---

## One system graph

Pal, habitat, garden, and (later) recipes are **one connected system** — not orphan seams. Demoting recipes from the v1 hero does **not** disconnect them from the bricks.

| Piece | What it is |
|-------|------------|
| **Pal** | Mark / faces — agent presence in the glass ([`kit/mark.json`](kit/mark.json)); still unnamed |
| **Habitat glass** | Stages / props / scene weather chrome — [`kit/scene.json`](kit/scene.json) |
| **Garden** | `repoBranch` prop + growth **0..5** — [GARDEN.md](GARDEN.md) |
| **Recipes** (later) | Normalized events → expressions that target those **same** bricks |

They share **one vocabulary**. Changing a face id, stage id, or growth field must stay **recipe-compatible** so a later runner can still target it. v1 ships pal + habitat (+ optional garden props) **without** a recipe runner; the seams stay open.

---

## Glance filtering (design intent)

Recipes are the **filter**, not a Zapier console in v1. The rubber-duck job: only surface what the developer most needs to notice.

```
  bridges emit lots  →  recipe packs filter  →  kit few bricks (face · stage · action · emotion · growth)
```

| Idea | Intent |
|------|--------|
| **User-chosen packs** | Install / enable packs that match what *this* desk cares about (CI on my branch, review asks, release wins, …) |
| **Everything else ignored** | Emitted events with no matching enabled recipe do not move the pal |
| **Glance ranks** | Packs should bias `then` shapes toward hierarchy ranks 1–6 ([`GLANCE.md`](GLANCE.md)) |
| **Not a second dashboard** | Matching stays local; no mandatory feed UI; posture is the signal |

This section is **design intent for pack authors and future runners** — not a new runner architecture in the terrarium v1 ship bar.

### Priority / sticky semantics (design intent — not a runner)

When multiple recipes could apply, hosts / runners **SHOULD** honor interrupt cost:

| Priority | Glance rank | Sticky? |
|----------|-------------|---------|
| Highest | **1 Blocked** | Sticky until clear |
| High | **2 Someone needs me** | Soft sticky |
| Medium | **4 Busy on my behalf** | Presence while work runs |
| Pulse | **3 Something landed** | Brief; **wins expire** → settle to idle |
| Ambient | **5 Garden health** | Growth only; never steals sticky face slot alone |
| Floor | **6 Quiet / offline** | Default when nothing higher is active |

**One sticky interrupt at a time:** `blocked > asking > busy`. A win pulse must not permanently override a still-blocked gate. Ambient `then.growth` may apply alongside a quiet face without promoting the event to an interrupt.

Conflict rules in §7 (specificity / last-write) still apply *within* equal glance priority; glance priority is an additional design layer for pack taste — not a replacement matcher algebra.

### Hierarchy ranks → `then` shapes (examples)

Ids are **examples from existing kit** — re-read JSON; do not invent constants.

| Rank | Example `when` gist | Example `then` shape |
|-----:|---------------------|----------------------|
| 1 Blocked | `ci.failed` on my branch, merge conflict, secrets deny | `{ "face": "error" }` or `{ "face": "denied", "stage": "gate", "action": "shakeHead" }` |
| 2 Needs me | review requested, waiting on author | `{ "face": "asking", "stage": "desk" }` |
| 3 Landed | merge / release / green after my work | `{ "face": "completed", "stage": "rooftop", "action": "celebrate", "mood": { "tone": "ok" } }` — host **expires** to idle |
| 4 Busy | agent sandbox / execute / eval, long CI | `{ "face": "sandboxing", "stage": "workshop" }` / `executing` / `evaluating` @ `workshop`\|`desk` |
| 5 Ambient | goal / KPI tick, repo maturity | `{ "growth": { "prop": "mininja", "value": 4 } }` — optional face omit |
| 6 Quiet | idle timeout, offline | `{ "face": "blink" }` / `idle` / `offline` + `dock`\|`nightwatch` |

Pack authors: prefer **face-only** for soft ranks; add stage / action when the habitat story matters; use growth for ambient without shouting.

### Pals and recipes (design)

- A **pal** is the agent presence; recipes drive its posture via kit face / action / stage / emotion ids.
- Later, packs **may** express which pal is busy on which plant (maintenance → one pal ↔ one `repoBranch`). That binding is a **host modular layer** — color-distinguish multiple pals if needed.
- **MUST NOT** invent kit pal-color or agent-id constants for this. Optional pack metadata / host overlay only.

---

## 2. Unix / Lego model

Recipes are **data plates**. Everything else is a brick or a stud. Swap event → face mappings without rebuilding the glass.

| Piece | Role |
|-------|------|
| **Bridges** | Emit **normalized events** (webhook, OS notification, CI hook, …). One job: absorb a host’s shape → emit the shared event JSON. |
| **Recipes** | Data plates: `when` matchers → `then` expressions. Forkable, remixable, no code required. **Filter** for glance. |
| **Kit faces** | Pal reactions — bricks from [`kit/mark.json`](kit/mark.json). |
| **Kit stages / actions / mood** | Habitat + motion — bricks from [`kit/scene.json`](kit/scene.json). |
| **Garden (`repoBranch` + growth)** | Optional habitat props — same scene kit; see [GARDEN.md](GARDEN.md). |
| **Adapters** | Render bricks (strings → ANSI / React / host). |
| **Console / bot** | Optional runners. Never the only place recipes can live. |
| **Multi-pal color** (optional) | Host chrome plate — remixable; not kit SoT. |

Russ’s law applies: pieces snap; rules are data; forking is encouraged. Shame only silent dual tables that drift beside kit.

```
  bridge ──► normalized event ──► recipe ──► face / stage / growth (pal · habitat · garden)
  (sensor)        (data)         (data plate)              (kit bricks → adapter)
```

---

## 3. Normalized event shape (proposed)

Every bridge emits the same small JSON. Fields are optional except `source`, `type`, and `ts`. Keep it tiny — bridges normalize; recipes do not parse host-specific blobs.

```json
{
  "source": "github.actions",
  "type": "ci.failed",
  "title": "build failed on main",
  "body": "Typecheck exited 1",
  "url": "https://github.com/Thingscorp/mininja/actions/runs/1",
  "severity": "error",
  "ts": "2026-09-25T20:47:00Z",
  "tags": ["ci", "main"]
}
```

| Field | Intent |
|-------|--------|
| `source` | Where it came from (`github.actions`, `slack`, `calendar`, `os.notify`, …) |
| `type` | Stable verb-ish id (`ci.failed`, `deploy.ok`, `calendar.soon`, `slack.dm`, `idle.timeout`) |
| `title` / `body` | Human text for matchers and optional chrome |
| `url` | Deep link if the host has one |
| `severity` | `info` \| `warning` \| `error` (extend later if needed) |
| `ts` | ISO-8601 time the event happened |
| `tags` | Free short labels for pack authors |

---

## 4. Recipe shape

```
when (matchers) → then (face and/or action and/or stage and/or mood chrome and/or growth)
```

**Progressive.** Most recipes are **face-only**. Stage / action / mood / growth are opt-in bricks for hosts that already climb the presence ladder (garden growth = later target on `repoBranch` props).

```json
{
  "id": "ci-fail-error",
  "when": [
    { "field": "type", "op": "exact", "value": "ci.failed" }
  ],
  "then": {
    "face": "error"
  }
}
```

Richer (still data):

```json
{
  "id": "deploy-ok-rooftop",
  "when": [
    { "field": "type", "op": "exact", "value": "deploy.ok" }
  ],
  "then": {
    "face": "completed",
    "stage": "rooftop",
    "action": "celebrate",
    "mood": { "tone": "ok" }
  }
}
```

`then` keys are all optional; at least one of `face` | `action` | `stage` | `mood` | `growth` must be present. Unknown kit ids are runner warnings — never crash the buddy UI.

**Garden growth (future expression target).** Progressive: face-only remains the default. Hosts that already place `repoBranch` props may later allow `then` to set growth alongside face / stage / action / mood — **not** scene weather, **not** mark fill.

Two progressive shapes (design only; host-interpreted):

```json
"then": {
  "face": "completed",
  "growth": { "prop": "mininja", "value": 4 }
}
```

```json
"then": { "growth": 3 }
```

| Shape | Intent |
|-------|--------|
| `{ "growth": N }` | Integer **0..5**; host applies to a default / sole `repoBranch`, or its own overlay rule |
| `{ "growth": { "prop": "…", "value": N } }` | Named / labeled `repoBranch` (match `label` or host id) → set that prop's growth |

Growth targets the garden prop field in [GARDEN.md](GARDEN.md) / `kit/scene.json` → `garden`. It never paints the mark and never becomes weather chrome.

**KPI meaning stays outside kit.** A canopy plant can mean “goals met” for whatever metric a pack cares about (revenue, users, …). Bridges + recipe packs name the goal; kit only stores the integer. One plant ≠ one fixed harvest type. Occam: remix packs, do not invent parallel growth vocabularies.

---

## 5. Example recipes

Markdown / JSON in fences — **not** shipped as package files in v0.

### CI fail → error face (rank 1)

```json
{
  "id": "ci-fail-error",
  "when": [
    { "field": "type", "op": "exact", "value": "ci.failed" }
  ],
  "then": { "face": "error" }
}
```

### Deploy ok → completed (rank 3 — expire)

```json
{
  "id": "deploy-ok-completed",
  "when": [
    { "field": "type", "op": "exact", "value": "deploy.ok" }
  ],
  "then": { "face": "completed" }
}
```

### Calendar in 5m → asking (rank 2)

```json
{
  "id": "calendar-soon-asking",
  "when": [
    { "field": "type", "op": "exact", "value": "calendar.soon" },
    { "field": "tags", "op": "tag_in", "value": "in-5m" }
  ],
  "then": { "face": "asking" }
}
```

### Slack DM → evaluating (rank 4-ish / soft busy)

```json
{
  "id": "slack-dm-evaluating",
  "when": [
    { "field": "source", "op": "exact", "value": "slack" },
    { "field": "type", "op": "exact", "value": "slack.dm" }
  ],
  "then": { "face": "evaluating" }
}
```

### Idle timeout → idle / blink (rank 6)

```json
{
  "id": "idle-timeout-blink",
  "when": [
    { "field": "type", "op": "exact", "value": "idle.timeout" }
  ],
  "then": { "face": "blink" }
}
```

Hosts that treat blink as a transient overlay may fall back to `idle` after the blink window — runner detail, not recipe schema. Win faces (`completed`, brief `allowed` celebrate) **SHOULD** expire the same way.

---

## 6. Matchers (keep tiny)

| `op` | Meaning |
|------|---------|
| `exact` | Field equals value (string compare) |
| `contains` | Field string contains value |
| `regex` | Field matches value as RE (runner-defined flavor; keep simple) |
| `severity_gte` | Severity at least value (`info` < `warning` < `error`) |
| `tag_in` | `tags` array includes value |

All `when` clauses in one recipe are **AND**. OR = two recipes. No nested boolean trees in v0.

```json
{ "field": "severity", "op": "severity_gte", "value": "warning" }
```

```json
{ "field": "title", "op": "contains", "value": "TIMEOUT" }
```

```json
{ "field": "body", "op": "regex", "value": "(?i)\\bfail(ed|ure)?\\b" }
```

---

## 7. Conflict rules

When several recipes match one event:

1. **Glance sticky priority** (design) — blocked > asking > busy; wins expire; ambient growth does not alone own the face. See § Glance filtering.
2. **Specificity wins** — more `when` clauses beats fewer; a matcher on a narrower field (`type` + `tags`) beats a broad one (`source` only). Runners may score = clause count + bonus for `exact` on `type`.
3. **Else last-write** — among equal specificity (and equal glance priority), the recipe loaded / declared later wins.
4. **Never block the buddy UI thread** — matching and apply are async / queued relative to render. A slow regex or bridge stall must not freeze faces, scoot, or scene.

Determinism for a given recipe list + event is a feature; live UI jank is not.

---

## 8. Privacy

- Recipes and bridges run **locally by default**.
- **No phoning home** — no central recipe telemetry, no mandatory cloud sync.
- **Secrets stay in bridge env** (tokens, webhook signing keys, Slack bot secrets). Recipe JSON must not embed credentials; matchers see only the normalized public fields the bridge chose to emit.

Optional later sync is opt-in and out of scope for v0.

---

## 9. Forking

Users remix recipes like Legos: copy a plate, change a face id, add a tag matcher, drop a stage. Publish **recipe packs** later (folders of JSON + a one-line README) — community, not a locked marketplace.

Kit faces / actions / stages / garden growth remain the shared brick vocabulary so packs stay portable across adapters and hosts. Pack taste owns glance filtering — which ranks this desk notices.

Multi-pal color packs, if any, stay **host / chrome** forks — not silent dual face tables in kit.

---

## 10. Non-goals for v0

- Full IFTTT / Zapier product surface
- Cloud recipe marketplace or account graph
- Mobile app
- Code generation from recipes, visual workflow builders, or multi-step automations beyond one event → one expression
- Shipping recipes as a first-Mininja hero feature (this plate is deferred)
- Kit constants for pal colors, agent ids, weed propKinds, or harvest KPI kinds

v0 is **schema + docs** so bridges and runners can grow without inventing competing shapes — when the plate is pulled.

---

## 11. Roadmap

| Phase | Deliverable |
|-------|-------------|
| **A** | Schema + this doc (design only; not first Mininja) |
| **B** | Webhook bridge — HTTP POST → normalized event |
| **C** | OS notification bridge — desktop notify → normalized event |
| **D** | Console recipe runner UI — inspect matches, toggle plates, no UI-thread stalls |

Each phase stays Unix-small: one new job, kit unchanged unless a new face/action brick is deliberately added.

---

## See also

- Glance / rubber-duck / hierarchy: [`GLANCE.md`](GLANCE.md)
- North star / v1 bar: [`NORTH-STAR.md`](NORTH-STAR.md)
- Presence ladder: [`PORTING.md`](PORTING.md)
- Faces / moods: [`STYLEGUIDE.md`](STYLEGUIDE.md) · [`kit/mark.json`](kit/mark.json)
- Stages / motion: [`SCENERY.md`](SCENERY.md) · [`TERMINAL-MOTION.md`](TERMINAL-MOTION.md) · [`kit/scene.json`](kit/scene.json)
- Garden (`repoBranch` + growth): [`GARDEN.md`](GARDEN.md)
- Brand / metaphors (Apple · terrarium): [`BRAND.md`](BRAND.md) · [`TRADEMARK.md`](TRADEMARK.md)
- Sim families ↔ ranks: [`qa/simulations/README.md`](qa/simulations/README.md)
