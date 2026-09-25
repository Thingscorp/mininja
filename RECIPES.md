# Recipes — events → Mininja expressions

Design only. Schema + intent for IFTTT-style links from notifications and events to Mininja faces, actions, stages, and mood chrome. **No runtime stubs in this doc.** Mascot unnamed. Spell it **Mininja**.

> Quality / product metaphors only (“Apple of Terminal Buddies,” “terrarium for devs,” “IFTTT-style”). **Not affiliated with Apple Inc. or IFTTT Inc.**

---

## 1. Why

Mininja wants to be the **Apple of Terminal Buddies** — obsessive craft, taste, purity of default — and a **terrarium for devs**: a small glass world you keep on the desk that reacts when the outside weather changes.

| Terrarium | Mininja |
|-----------|---------|
| **Weather into the glass** | **Recipes** — events from CI, Slack, calendar, OS notify land as normalized rain |
| **Creature reactions** | **Faces** — the output channel people love (error, asking, completed, blink…) |
| **Habitat** | **Stages** — nightwatch → rooftop strip the creature lives in |

People already love the faces. Recipes are how the world pushes weather into the glass without turning the buddy into another dashboard: CI fails → error face; calendar in 5m → asking; Slack DM → evaluating; idle timeout → blink. The creature stays loveable because the reaction is still three lines of Unicode.

---

## 2. Unix / Lego model (terrarium as Legos)

Recipes are **data plates** (weather scripts). Everything else is a brick or a stud. The terrarium is modular — swap weather, creature mood, or habitat without rebuilding the glass.

| Piece | Terrarium | Role |
|-------|-----------|------|
| **Bridges** | Sensors outside the glass | Emit **normalized events** (webhook, OS notification, CI hook, …). One job: absorb a host’s shape → emit the shared event JSON. |
| **Recipes** | Weather into the glass | Data plates: `when` matchers → `then` expressions. Forkable, remixable, no code required. |
| **Kit faces** | Creature reactions | Bricks from [`kit/mark.json`](kit/mark.json). |
| **Kit stages / actions / mood** | Habitat + motion | Bricks from [`kit/scene.json`](kit/scene.json). |
| **Adapters** | Glass / light | Render bricks (strings → ANSI / React / host). |
| **Console / bot** | Optional vivarium runners | Apply recipes and drive the buddy. Never the only place recipes can live. |

Russ’s law applies: pieces snap; rules are data; forking is encouraged. Shame only silent dual tables that drift beside kit.

```
  bridge ──► normalized event ──► recipe (weather) ──► face / stage (creature · habitat)
  (sensor)        (data)            (data plate)              (kit bricks → adapter)
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
when (matchers) → then (face and/or action and/or stage and/or mood chrome)
```

**Progressive.** Most recipes are **face-only**. Stage / action / mood are opt-in bricks for hosts that already climb the presence ladder.

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

`then` keys are all optional; at least one of `face` | `action` | `stage` | `mood` must be present. Unknown kit ids are runner warnings — never crash the buddy UI.

---

## 5. Example recipes

Markdown / JSON in fences — **not** shipped as package files in v0.

### CI fail → error face

```json
{
  "id": "ci-fail-error",
  "when": [
    { "field": "type", "op": "exact", "value": "ci.failed" }
  ],
  "then": { "face": "error" }
}
```

### Deploy ok → completed

```json
{
  "id": "deploy-ok-completed",
  "when": [
    { "field": "type", "op": "exact", "value": "deploy.ok" }
  ],
  "then": { "face": "completed" }
}
```

### Calendar in 5m → asking

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

### Slack DM → evaluating

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

### Idle timeout → idle / blink

```json
{
  "id": "idle-timeout-blink",
  "when": [
    { "field": "type", "op": "exact", "value": "idle.timeout" }
  ],
  "then": { "face": "blink" }
}
```

Hosts that treat blink as a transient overlay may fall back to `idle` after the blink window — runner detail, not recipe schema.

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

1. **Specificity wins** — more `when` clauses beats fewer; a matcher on a narrower field (`type` + `tags`) beats a broad one (`source` only). Runners may score = clause count + bonus for `exact` on `type`.
2. **Else last-write** — among equal specificity, the recipe loaded / declared later wins.
3. **Never block the buddy UI thread** — matching and apply are async / queued relative to render. A slow regex or bridge stall must not freeze faces, scoot, or scene.

Determinism for a given recipe list + event is a feature; live UI jank is not.

---

## 8. Privacy

- Recipes and bridges run **locally by default**.
- **No phoning home** — no central recipe telemetry, no mandatory cloud sync.
- **Secrets stay in bridge env** (tokens, webhook signing keys, Slack bot secrets). Recipe JSON must not embed credentials; matchers see only the normalized public fields the bridge chose to emit.

Optional later sync is opt-in and out of scope for v0.

---

## 9. Forking

Users remix recipes like Legos (and terrarium weather packs): copy a plate, change a face id, add a tag matcher, drop a stage / habitat. Publish **recipe packs** later (folders of JSON + a one-line README) — community, not a locked marketplace.

Kit faces / actions / stages remain the shared brick vocabulary so packs stay portable across adapters and hosts — same creature grammar, different weather.

---

## 10. Non-goals for v0

- Full IFTTT / Zapier product surface
- Cloud recipe marketplace or account graph
- Mobile app
- Code generation from recipes, visual workflow builders, or multi-step automations beyond one event → one expression

v0 is **schema + docs** so bridges and runners can grow without inventing competing shapes.

---

## 11. Roadmap

| Phase | Deliverable |
|-------|-------------|
| **A** | Schema + this doc (now) |
| **B** | Webhook bridge — HTTP POST → normalized event |
| **C** | OS notification bridge — desktop notify → normalized event |
| **D** | Console recipe runner UI — inspect matches, toggle plates, no UI-thread stalls |

Each phase stays Unix-small: one new job, kit unchanged unless a new face/action brick is deliberately added.

---

## See also

- Presence ladder: [`PORTING.md`](PORTING.md)
- Faces / moods: [`STYLEGUIDE.md`](STYLEGUIDE.md) · [`kit/mark.json`](kit/mark.json)
- Stages / motion: [`SCENERY.md`](SCENERY.md) · [`TERMINAL-MOTION.md`](TERMINAL-MOTION.md) · [`kit/scene.json`](kit/scene.json)
- Brand / metaphors (Apple · terrarium): [`BRAND.md`](BRAND.md) · [`TRADEMARK.md`](TRADEMARK.md)
