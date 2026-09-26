# Occam + Unix audit (Kit lane)

**Date:** 2026-09-26 (ET)  
**Branch:** `feat/monorepo-public`  
**Mandate:** smallest sufficient SoT; modular composable pieces; no try-hard sprawl.  
**Bar:** Unix (one job; text/data interface; compose; silence; economy) × Occam (no entity without necessity; one vocabulary; demotion ≠ disconnection ≠ duplicate).

Machine SoT remains [`kit/mark.json`](../kit/mark.json) · [`kit/scene.json`](../kit/scene.json). This audit invents **no** kit constants.

Standing rule text: [`NORTH-STAR.md`](../NORTH-STAR.md) (Occam + Unix section) · [`STYLEGUIDE.md`](../STYLEGUIDE.md) (checklist twin).

---

## Verdict snapshot

| Bucket | Count (this pass) | Notes |
|--------|------------------:|-------|
| **MUST FIX** (Kit-owned) | 0 open | Remediated below in same tip |
| **WAIVE** | several | Formal narrations / intentional mirrors |
| **ALREADY LEAN** | several | Dual-seed gates, registerFromKit, who-it’s-for |
| **Apps / Ports (file only)** | open | Literals + type unions — not Kit UI work |

---

## MUST FIX → remediated this tip

| ID | Finding | Fix |
|----|---------|-----|
| **OX-001** | Glance hierarchy (ranks 1–6) + attention layers + pal vocab pasted in full in `NORTH-STAR.md` **and** `GLANCE.md` (third map in `qa/simulations/README.md`) | **NORTH-STAR** thinned to pointer + one-line sticky map. Canonical = `GLANCE.md`. Sims map stays (scenario ↔ rank; already points at GLANCE). |
| **OX-002** | `GARDEN.md` re-pasted glance rank ownership table + full pal↔plant bullets already in `GLANCE.md` | **GARDEN** ambient section thinned to rank-5 pointer + garden-local anti-dashboard note. |
| **OX-003** | Occam + Unix lived as oral mandate only — no standing checklist in brand/north-star | Added lean **Occam + Unix** section to `NORTH-STAR.md` + checklist twin in `STYLEGUIDE.md`; design rule #10. |
| **OX-004** | STYLEGUIDE headed “Moods” while north star forbids “mood ids” — vocabulary drift risk | Renamed section/columns to **Tone** / `moodColorsUiOnly`; expression table Tone column. |

---

## WAIVE (honest keep)

| ID | Item | Why waive |
|----|------|-----------|
| **OX-W01** | `SCENERY.md` stage / prop / weather tables | Formal geometry narration of `kit/scene.json`. Shame = silent **code** dual tables, not brand docs that cite kit. Already says kit is SoT. |
| **OX-W02** | `TERMINAL-MOTION.md` locomotion constant tables | Same: formal laws narrating `scene.motion`. Cross-gated by `kit/check-consumers.mjs` when console present. |
| **OX-W03** | `STYLEGUIDE.md` expression table (15 faces) | Single human-readable face sheet; `CONSTRUCTION.md` / `BRAND-RULES.md` point here. Do **not** paste again into NORTH-STAR/GLANCE. |
| **OX-W04** | `GARDEN.md` growth 0..5 + silhouette height tables | Only growth catalog in markdown; explicitly “copied from kit.” |
| **OX-W05** | Presence ladder in `README.md` (short) + `PORTING.md` (deep) | Two surfaces on purpose: on-ramp vs porting manual. NORTH-STAR now points at PORTING instead of a third ASCII paste. |
| **OX-W06** | Idle lockup pasted in README / BRAND-RULES / CONSTRUCTION / STYLEGUIDE / PORTING | The mark *is* three lines — repetition is the product, not sprawl. |
| **OX-W07** | `qa/simulations/README.md` rank ↔ family table | Mapping layer over GLANCE ranks, not a second posture catalog. |
| **OX-W08** | `RECIPES.md` length (~386 lines) | Later plate by design; keeps recipe-compatible seams without shipping a runner. Demotion ≠ delete the design doc. Thin later if it grows parallel catalogs. |
| **OX-W09** | Pal one-liners in BRAND / RECIPES / GARDEN | Short restatements + pointer — not full hierarchy paste. |

---

## ALREADY LEAN

| ID | Evidence |
|----|----------|
| **OX-A01** | Kit JSON: single `faces` / `emotions` / `actions` / `stages` / `garden` — no parallel catalogs inside kit. |
| **OX-A02** | Console habitat: `registerFromKit()` from `kit/scene.json`; `STAGE_SEED` / `EMOTION_SEED` / `ACTION_SEED` forbidden (`kit/check-consumers.mjs`, `console/scripts/kit-align.mjs`). |
| **OX-A03** | `HABITAT-PORT.md` already corrected (no dual STAGE_SEED claim; live scene version). |
| **OX-A04** | `mascot.ts` `FRAMES` builds via `legacyFaceBridge` / `composeLockup` — not a glyph dual table. |
| **OX-A05** | Bot `engine.py` loads `KIT_STAGES` / emotions / actions from `kit/scene.json`. |
| **OX-A06** | Who-it’s-for = visual learners; **no acquisition pitch** (`NORTH-STAR.md`). |
| **OX-A07** | Scope refuse already explicit: digipet / Farmville / mood ids / pal-color kit tables / Casque. |
| **OX-A08** | `kit/README.md` Unix-small: hold the numbers; root MD narrates. |

---

## Apps / Ports ownership (file only — do not implement UI here)

| ID | Finding | Owner |
|----|---------|-------|
| **OX-APP-001** | `console/src/lib/scene.ts` hardcodes `STAGE_WIDTH = 420` and `0.42` with runtime assert vs kit | **Apps** — acceptable bootstrap if assert + `check-consumers` stay green; ideal future = derive from kit import only. |
| **OX-APP-002** | `console/src/components/banner.tsx` inlines walk/run `280` / `170` | **Apps** — gated by check-consumers; same ideal = read `kit.motion`. |
| **OX-APP-003** | TypeScript closed unions in `scene.ts` (`Weather`, `PropKind`, `Tone`, motion/pose/fx) mirror kit enums | **Apps** — drift risk if kit adds a kind; keep kit-align / consumers green. |
| **OX-APP-004** | `MascotState` union lists 15 face ids in `mascot.ts` | **Apps** — type mirror of mark faces; runtime goes through bridge. |
| **OX-APP-005** | Console/bot UI (composer, grove, multi-pal chrome, sticky arbitration) | **Apps** — kit stays data; design intent in GLANCE / OLD-CONSOLE-CARRYOVER. |
| **OX-PORT-001** | Adapter surface already Unix-small; do not grow into apps | **Ports** — compose filters only. |

---

## Scope creep scan (docs)

| Smell | Status |
|-------|--------|
| Dashboard / digipet / Farmville / acquisition pitch | Refused in NORTH-STAR / GLANCE / BRAND — clean |
| Mood ids as seam beside emotion | Corrected historically; STYLEGUIDE tone rename reinforces |
| Pal-color / agent-id / weed propKind / harvest KPI in kit | Explicit MUST NOT — clean |
| Recipes as v1 hero | Later plate — graph kept (demotion ≠ disconnection) |
| Invented face/stage ids in narrators | Sims + docs re-read kit; run-simulations validates |

---

## Measurable lean-up (this tip)

| Doc | Before → after (lines, approx) | What left |
|-----|-------------------------------:|-----------|
| `NORTH-STAR.md` | 189 → ~164 | Full glance/pal/ladder paste → pointers |
| `GARDEN.md` | 137 → ~122 | Ambient rank + pal↔plant paste → pointer |
| `STYLEGUIDE.md` | 88 → ~102 | + Occam checklist; tone vocab (net +rules, −ambiguity) |
| `qa/OCCAM-UNIX-AUDIT.md` | new | Honest inventory |

No new kit constants. No Apps UI edits.

---

## Checks to run after Kit-adjacent doc touch

```bash
node kit/check-consumers.mjs
node kit/qa/run-tests.mjs   # if present / CI path
node qa/tests/run-tests.mjs # monorepo docs + sims as wired
```

---

## Still open (not Kit)

1. Apps: derive STAGE_WIDTH / banner speeds from kit (OX-APP-001/002).  
2. Apps: sticky interrupt arbitration + multi-pal color chrome (design in GLANCE; UI in console/bot).  
3. Ports: keep adapters one-job; no second expression catalogs.  
4. Optional later: RECIPES thin-pass if parallel example catalogs appear.

**Exit feel:** acting cool without trying — one SoT, short pointers, formal narrations only where geometry/laws need them.
