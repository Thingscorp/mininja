# Glance — visual notifications for the desk companion

**Design only.** How a peek at Mininja should tell a busy developer what matters — without becoming another dashboard. Machine SoT remains [`kit/mark.json`](kit/mark.json) · [`kit/scene.json`](kit/scene.json). This page invents **no** kit constants.

Product parents and v1 ship bar: [`NORTH-STAR.md`](NORTH-STAR.md). Garden ambient: [`GARDEN.md`](GARDEN.md). Later filtering: [`RECIPES.md`](RECIPES.md).

---

## Job

Not “show more GitHub.”

Mininja is a **rubber duck on the desk** that also **glances** at the developer’s world so they don’t keep opening tabs. Text shouts; Mininja changes **posture** — face, stage, plant silhouette — for **peripheral awareness**. Bridging development into something a bit more pleasant is the point; the practice is reminiscent of talking to a rubber duck, with the duck quietly reflecting what most needs noticing.

**Pleasantness IS the product** when nothing’s wrong. Quiet warm idle is the default most of the day.

---

## Vocabulary: pals

| Term | Meaning |
|------|---------|
| **Pal** | Product noun for the agent creature in the glass — the presence doing work (human-driven buddy, coding agent, or automation actor). Still **unnamed** as a personal mascot name (**never Casque**; no he/him). |
| **Plant** | A `repoBranch` prop in habitat — repo / goal silhouette; growth **0..5**. |
| **Glance** | What a busy developer should learn from a peek without reading a feed. |

**v1 ship bar** = **pal + habitat strip** (same bar narrated elsewhere as creature + habitat — the pal *is* the creature presence). Mark-only remains the ~60s on-ramp, not complete v1.

### Pal ↔ plant (design)

- A **pal represents an agent**.
- Pals **interact with plants individually**, and that interaction is **visualized**: e.g. maintenance on a repo → **one pal** at / with **that** `repoBranch` plant.
- **Multiple pals** may appear; distinguish them by **different colors** so concurrent agents are not confusing.
- Color / multi-pal is a **modular host layer** (Unix optional plate — remixable). **MUST NOT** bake pal colors or agent ids into kit as a harvest-style table. Treat color like `moodColorsUiOnly` tones or host theme: chrome, not a second face catalog.
- Default visualization: **one pal on one plant** for a focused job. More pals = more concurrent agents, color-coded.

Recipes later may drive *which* pal is busy *where*; kit still only stores face / stage / action / emotion / growth bricks.

---

## Glance hierarchy (interrupt cost)

Everything else is filtered by **recipe packs** the user chose (later plate). Bridges emit lots; recipes filter; kit exposes few bricks.

| Rank | Need | Signal (posture) | Stickiness |
|-----:|------|------------------|------------|
| **1** | **Blocked now** | CI red on my branch, merge conflict, secrets / supply-chain deny, gate reject → faces like `error` / `denied`, stage `gate` | Sticky until clear |
| **2** | **Someone needs me** | Review requested, waiting on author → face `asking` (soft interrupt) | Soft sticky; stage often `desk`, not `gate` |
| **3** | **Something landed** | Merge / release / green after your work → `completed` / `allowed`, brief celebrate on `rooftop` | Wins **expire** — pulse, then settle to idle (don’t stay green forever) |
| **4** | **Busy on my behalf** | Agent sandbox / execute / eval, long CI → `sandboxing` / `executing` / `evaluating` on `workshop` / `desk` | Presence, not alarm |
| **5** | **Ambient repo / goal health** | Plants growth **0..5**; canopy ≈ goals met; stale weeds = quiet desaturate, not badges; multi-repo = plants + thin `cable`s | Peripheral only |
| **6** | **Quiet / offline** | `idle` / `blink` / `offline` + `dock` / `nightwatch` | Default most of the day |

Ids above are **examples from existing kit** (Thingscorp default). Narrators **MUST NOT** invent new face / stage / action / emotion / growth ids — re-read kit JSON.

### Sticky interrupt priority (design intent)

At most **one sticky interrupt** at a time:

```
blocked (1)  >  asking (2)  >  busy (4)
```

Wins (3) are brief and expire under quieter ranks. Ambient plants (5) never steal the sticky slot. Quiet (6) is the floor when nothing higher is active.

This is **host / recipe-pack intent**, not a new runner in v1.

---

## Three attention layers

| Layer | Question | Brick |
|-------|----------|-------|
| **Pal** (creature) | Do I need to look up? | `face` + `action` (focal) |
| **Habitat** | Where in the story? | `stage` + scene weather |
| **Garden** | How healthy are plants / goals? | `repoBranch` growth **0..5** (peripheral) |

Faces are focal. Plants are peripheral. Text is optional chrome — the **signal is posture**.

---

## Rubber-duck / anti-dashboard rules

1. **Default warm quiet** — pleasant idle is success, not empty UI.
2. **One sticky interrupt at a time** — blocked > asking > busy.
3. **Wins expire** — celebrate, then settle; don’t stay green forever.
4. **Plants peripheral; faces focal** — growth moves silhouettes, not a KPI panel.
5. **Text optional chrome** — signal is posture (face / stage / plant).
6. **KPIs only move growth via packs** — bridges + recipes name the goal; kit stores the integer ([`GARDEN.md`](GARDEN.md)).
7. **No second dashboard** — no harvest-type kit fields, no digipet care loop, no Farmville chrome.
8. **Pack = what the duck notices** — bridges emit; recipes filter; kit stays few bricks ([`RECIPES.md`](RECIPES.md)).

---

## Map onto kit seams (MUST)

| Glance need | Typical kit targets (examples) | Notes |
|-------------|--------------------------------|-------|
| Blocked | `face` `error`\|`denied`, `stage` `gate`, actions like `shakeHead` | Sticky until clear |
| Needs me | `face` `asking`, often `desk` | Soft sticky |
| Landed | `face` `completed`\|`allowed`, `stage` `rooftop`, `action` `celebrate` | Brief; expire to idle |
| Busy | `sandboxing`\|`executing`\|`evaluating`, `workshop`\|`desk` | Presence |
| Ambient health | `repoBranch` + `growth` 0..5; optional `cable` links | Multi-repo glance |
| Quiet | `idle`\|`blink`\|`offline`, `dock`\|`nightwatch` | Default floor |

Join face → scene via [`legacyFaceBridge`](kit/scene.json). **MUST NOT** equate faces with emotions. Tone / `then.mood` = chrome only.

Discovery mappings: [`qa/simulations/`](qa/simulations/) (scenario families ↔ ranks).

---

## See also

- North star (parents + v1 bar): [`NORTH-STAR.md`](NORTH-STAR.md)
- Garden / KPI / weeds: [`GARDEN.md`](GARDEN.md)
- Recipe filtering (later): [`RECIPES.md`](RECIPES.md)
- Stages that carry the story: [`SCENERY.md`](SCENERY.md)
- Brand voice: [`BRAND.md`](BRAND.md)
