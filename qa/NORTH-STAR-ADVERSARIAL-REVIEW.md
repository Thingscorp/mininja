# NORTH-STAR adversarial review

| Field | Value |
|-------|-------|
| Date | 2026-09-26 ~10:05–10:10 EDT |
| Branch | `feat/monorepo-public` |
| Tip reviewed | `8af1eb7` (`docs(brand): north star — Giga Pets × Pebble × IFTTT`) |
| Machine SoT | `kit/mark.json` **1.6.0** · `kit/scene.json` **1.6.1** |
| Kit JSON mutated? | **No** |
| PR #1 merged? | **No** |
| Lenses merged | Kit self-review · Ports · Apps · CoS · Russ corrections |

Docs stress-tested: `NORTH-STAR.md` (primary), `BRAND.md`, `PORTING.md`, `README.md`, `RECIPES.md`; cross-checked vs `kit/*`, `GARDEN.md`, `SCENERY.md`, `STYLEGUIDE.md`, `TERMINAL-MOTION.md`, `TRADEMARK.md`.

---

## Summary counts (pre-harden @ 8af1eb7)

| Severity | Count | Notes |
|----------|------:|-------|
| **FAIL** | **6** | All addressed in harden patches (no kit churn) |
| **WARN** | **9** | Clear WARNs patched; rest → OPEN or left as acceptable |
| **NIT** | **4** | Optional; not all applied |
| **OPEN** | **4** | Product / design questions for Russ / CoS |

Post-harden target: **0 open FAIL** in NORTH-STAR / PORTING / BRAND for the items below.

---

## FAIL findings

### NS-FAIL-001 — Elevated “mood” as kit id seam
| | |
|--|--|
| **Severity** | FAIL |
| **Sources** | Ports · Apps · CoS · kit self-review |
| **Evidence** | @ 8af1eb7 NORTH-STAR: “Face, stage, action, **mood**, and growth **ids**”; recipes map “face / action / stage / **mood** / growth”. Kit has no mood id namespace — only `emotions[].id` + `moodColorsUiOnly` tones. RECIPES `then.mood` = tone chrome. |
| **Fix applied** | Recipe seams = **face · stage · action · emotion · growth**. **MUST NOT** invent “mood ids.” Tone/`then.mood` documented as chrome only. Mirrored in PORTING + BRAND. |

### NS-FAIL-002 — Motion/scoot/facing collapsed to `scene.json`
| | |
|--|--|
| **Severity** | FAIL |
| **Sources** | Ports |
| **Evidence** | Map row: “Scoot / facing / speeds” → `kit/scene.json` · TERMINAL-MOTION only. Facing wins lives in `adapters/mark`; presence chrome keys **action** ids on `data-motion`/`data-state`; `scene.motion` = speeds. |
| **Fix applied** | Split map into facing/lockup · presence chrome · locomotion speeds + “Three meanings of motion” table. Pointer to `adapters/presence`. |

### NS-FAIL-003 — Mood/eyes → Faces(15) collapse
| | |
|--|--|
| **Severity** | FAIL |
| **Sources** | CoS · Apps |
| **Evidence** | “Mood / eyes \| … \| Faces (15)” equated watchface mood with compact faces and hardcoded 15. faces (mark, 15) ≠ emotions (scene, 16) ≠ actions (22). Join = `legacyFaceBridge`. |
| **Fix applied** | Separate rows: Faces (kit keys; default count narrated) · Emotions · Face↔scene join via `legacyFaceBridge`. **MUST NOT** equate faces with emotions. |

### NS-FAIL-004 — “Creature + face + recipes” as three-parents closer
| | |
|--|--|
| **Severity** | FAIL |
| **Sources** | CoS |
| **Evidence** | @ 8af1eb7: “Together they are one baby: **creature + face + recipes on one system graph**.” Reads as ship-first recipes. |
| **Fix applied** | Closer = one connected system; **v1 hero = creature + habitat glass**; recipes later plate. Explicit anti-read of “creature + face + recipes” as ship-first. |

### NS-FAIL-005 — “Baby” / baby-creature framing
| | |
|--|--|
| **Severity** | FAIL |
| **Sources** | Russ |
| **Evidence** | “one baby”, “out of the baby”, “ship-first baby” in NORTH-STAR lineage. |
| **Fix applied** | **MUST** language: never “baby” framing. Scrubbed from NORTH-STAR; linked brand docs checked clean. |

### NS-FAIL-006 — Garden as pet care / leveling / hunger
| | |
|--|--|
| **Severity** | FAIL |
| **Sources** | Russ · CoS WARN elevated |
| **Evidence** | Map: “Growth \| Pet care / leveling \| Garden repoBranch growth”. Implies digipet care loop. GARDEN.md: `repoBranch` = repos-as-growing-branches in habitat; data-only; no hunger. |
| **Fix applied** | Garden row = `repoBranch` props = repos in the environment; growth 0..5 silhouette vocab. Giga Pets borrow = creature warmth via faces/presence; refuse digipet hunger/feeding loops. Design rule retitled **Warmth without clutter**. |

---

## WARN findings

### NS-WARN-001 — Pebble “Companion host \| Phone”
| | |
|--|--|
| **Severity** | WARN |
| **Evidence** | Implies phone-required. Mininja companion = console/bot/host; bot = launcher over console. |
| **Fix applied** | Phone marked fiction; no phone required; bot = Mac launcher over `console/`. |

### NS-WARN-002 — Habitat ≠ Pebble apps runtime
| | |
|--|--|
| **Severity** | WARN |
| **Evidence** | “Watch apps / timeline chrome” analogue could read as Pebble app runtime. |
| **Fix applied** | Analogue-only note: habitat is scenery chrome, not a Pebble app runtime. |

### NS-WARN-003 — Apple vs Giga×Pebble×IFTTT role blur
| | |
|--|--|
| **Severity** | WARN |
| **Evidence** | BRAND leads Apple; NORTH-STAR leads three parents; README mixes. |
| **Fix applied** | NORTH-STAR + BRAND + PORTING: product parents vs quality metaphor split stated. |

### NS-WARN-004 — Habitat hero vs mark-first ambiguity
| | |
|--|--|
| **Severity** | WARN |
| **Evidence** | v1 = creature + habitat glass could let ports skip mark-first ladder. |
| **Fix applied** | Presence ladder marked **mark-first**; BRAND “do not ship recipes-first.” |

### NS-WARN-005 — Hardcoded Faces (15) without kit pointer
| | |
|--|--|
| **Severity** | WARN |
| **Evidence** | Bare “Faces (15)” drifts if kit grows. |
| **Fix applied** | “keys of kit/mark.json → faces (Thingscorp default: 15)” + “always re-read JSON.” |

### NS-WARN-006 — Missing MUST/MUST NOT for ports/Apps
| | |
|--|--|
| **Severity** | WARN |
| **Evidence** | Soft numbered design rules; hedges blocked SoT use. |
| **Fix applied** | MUST/MUST NOT on seams, dual tables, v1 hero, mascot name, glyphs, recipe catalogs. |

### NS-WARN-007 — Adapters pass-through / presence under-specified in NORTH-STAR
| | |
|--|--|
| **Severity** | WARN |
| **Sources** | Ports |
| **Fix applied** | Seams table + adapters pass strings through; presence map row + how-to pointer. |

### NS-WARN-008 — Geometry optional for mark-only ports
| | |
|--|--|
| **Severity** | WARN |
| **Sources** | CoS |
| **Fix applied** | Geometry optional for mark-only; upstream scene ports MUST match kit geometry. |

### NS-WARN-009 — TRADEMARK.md / README superscript omit Giga·Pebble·IFTTT
| | |
|--|--|
| **Severity** | WARN |
| **Evidence** | NORTH-STAR disclaims all four; TRADEMARK + README<sup> only Apple. |
| **Fix** | **Not patched** this pass (scope = NORTH-STAR narration + PORTING/BRAND seams). → OPEN-003 if CoS wants TRADEMARK expansion. |

---

## NIT findings (optional)

| ID | Note | Applied? |
|----|------|----------|
| NS-NIT-001 | README mark section omits U+259E left-facing codepoint | No |
| NS-NIT-002 | Linear-level restraint lacks Linear Inc. metaphor disclaimer | No (quality metaphor only; low risk) |
| NS-NIT-003 | RECIPES.md still says “Kit stages / actions / mood” from scene.json | Partial — NORTH-STAR/PORTING corrected; RECIPES design doc left (tone chrome already defined there) |
| NS-NIT-004 | “Scene / care” how-to link wording | Yes → “Scene / habitat / garden” |

---

## PASS (keep)

| Check | Result |
|-------|--------|
| Faces count 15 vs `mark.faces` | PASS (narrated as default) |
| Emotions 16 · Actions 22 · Stages 7 | PASS vs kit |
| `legacyFaceBridge` 15↔15 key parity | PASS |
| Unbridged emotions `alert,relieved,sad,startled` = expansion not orphans | PASS (STYLEGUIDE + NORTH-STAR) |
| growth 0..5 · `repoBranch` · no GitHub bridge in kit | PASS |
| Recipe example face/stage/action ids resolve | PASS |
| demotion ≠ disconnection stated | PASS (strengthened) |
| Unix data-only kit / adapters not apps | PASS |
| Mascot unnamed / never Casque | PASS (MUST) |
| Spell Mininja | PASS |
| Recipes later plate / not v1 hero | PASS (strengthened) |
| Affiliation disclaimer Bandai·Pebble·IFTTT·Apple on NORTH-STAR | PASS |
| No PR #1 merge | PASS (docs-only on feat branch) |

---

## Patches applied (this harden)

| File | Change |
|------|--------|
| `NORTH-STAR.md` | Full harden: parents closer, map split (faces≠emotions, motion×3, garden=repoBranch, phone fiction), MUST seams, no baby, no mood ids, no digipet care loop, product vs quality split |
| `PORTING.md` | Intro + recipe-compatible seams table (face·stage·action·emotion·growth; tone chrome; motion×3; geometry optional) |
| `BRAND.md` | Product parents vs quality metaphor; v1 mark-first / no recipes-first; bot launcher; Casque; recipe seams bullet |
| `qa/NORTH-STAR-ADVERSARIAL-REVIEW.md` | This file |

**Not changed:** `kit/*.json`, console UI, adapter APIs, RECIPES schema invention, GARDEN weed constants.

---

## OPEN questions (Russ / CoS)

### OPEN-001 — Garden “weeds” metaphor (design-only)
Russ exploring weeds on `repoBranch` plants (not digipet framing): stale shoots, nutrient thieves (CI/deps), invasive dual-table forks, blight. **Design-only unless Russ says put in GARDEN/NORTH-STAR.** Harden pass invents **no** weed constants / enums / ids. Confirm whether weeds become narrated vocabulary, kit data later, or stay whiteboard.

### OPEN-002 — Should RECIPES `then` gain first-class `emotion` examples?
Seams now list emotion. RECIPES examples remain face-first; `then.mood` = tone chrome. Confirm whether design examples should show `then.emotion` and deprecate mood-as-seeming-id in RECIPES prose.

### OPEN-003 — Expand TRADEMARK.md / README<sup> to Giga·Pebble·IFTTT?
NORTH-STAR already disclaims. Mirror in TRADEMARK + README footer?

### OPEN-004 — Presence ladder vs “v1 = creature + habitat glass”
Mark-first ladder + habitat-glass hero are both stated. Confirm product emphasis for Apps: is a mark-only port a complete v1 ship, or must v1 include scene strip?

---

## Decision rules for agents (post-harden)

1. Machine SoT = kit JSON only; docs narrate.
2. Recipe id seams = face · stage · action · emotion · growth; tone/mood = chrome.
3. faces ≠ emotions; join via `legacyFaceBridge`.
4. v1 hero = creature + habitat glass; recipes later; demotion ≠ disconnection.
5. No baby framing; no digipet care/hunger/leveling for garden.
6. Garden growth = `repoBranch` repos-in-habitat silhouette vocab (GARDEN.md).
7. No phone required; bot ≠ second UI brand.
8. Do not invent weed constants until Russ confirms OPEN-001.
