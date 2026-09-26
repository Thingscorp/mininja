# CoS id-vocabulary review vs system-graph tip

| Field | Value |
|-------|-------|
| Review date | 2026-09-25 (ET) |
| Branch | `feat/monorepo-public` |
| Tip SHA | `22075e9` (`fix(adapters): mark/ansi craft — facing wins, deep mergeMark`; includes a31587a; kit JSON unchanged vs origin `449d43f`) |
| System-graph baseline | `a31587a` (`docs: one system graph — recipe seams kept open`) — **ancestor of tip: YES** |
| Kit versions | `mark.json` **1.6.0** · `scene.json` **1.6.1** |
| Kit JSON mutated? | **No** |
| PR #1 merged? | **No** |

Docs checked (system-graph set + narrators): `RECIPES.md`, `GARDEN.md`, `BRAND.md`, `PORTING.md`, `CHANGELOG.md`, plus seam narrators `SCENERY.md`, `STYLEGUIDE.md`, `TERMINAL-MOTION.md`, `kit/README.md`.

Machine SoT: `kit/mark.json`, `kit/scene.json`.

---

## Summary

| Seam | Result | Notes |
|------|--------|-------|
| Faces ↔ `legacyFaceBridge` | **PASS** | 15↔15 key parity; all bridge emotion/action/stage targets resolve |
| Emotions / actions catalogs | **PASS** | 16 emotions · 22 actions; unbridged ids are habitat expansion, not orphans |
| Stages | **PASS** | 7 ids nightwatch→rooftop; geometry consistent |
| `propKinds` (incl. `repoBranch`) | **PASS** | Closed set of 10; `repoBranch` unused in stock stages by design |
| Weather enums | **PASS** | 6 ids; stock stage weather ⊂ enum; `rain` overlay-only (documented) |
| `garden.growth` 0..5 | **PASS** | Steps/labels match `GARDEN.md`; silhouette \(h(g)=12+12g\) |
| RECIPES `then.growth` design language | **PASS** | Design-only; targets garden prop field; ≠ weather ≠ mark fill |
| Recipe example face/stage/action ids | **PASS** | All cited ids resolve in kit |
| Doc ↔ kit idle/blink stage | **FAIL (doc)** | See DEFECT-DOC-001 — prefer doc fix; kit untouched |

**Overall CoS seam health:** connected system graph intact. Recipes remain later plate; demotion ≠ disconnection. No kit orphan requiring JSON churn.

---

## 1. Faces + `legacyFaceBridge`

**Kit faces (15):**  
`idle`, `blink`, `evaluating`, `allowed`, `asking`, `denied`, `sandboxing`, `executing`, `completed`, `warning`, `error`, `cancelled`, `offline`, `loadingRight`, `loadingLeft`

| Check | Result |
|-------|--------|
| Face keys == bridge keys | **PASS** (no orphans either way) |
| Bridge emotions ∈ `emotions[].id` | **PASS** |
| Bridge actions ∈ `actions[].id` | **PASS** |
| Bridge stages ∈ `stages[].id` | **PASS** (when stage present) |
| STYLEGUIDE expression table ids == faces | **PASS** |

`asking` / `loading*` omit stage in kit (keep-current / facing-only) — matches progressive face-first model and RECIPES face-only default.

---

## 2. Emotions / actions

| Catalog | Count | Result |
|---------|------:|--------|
| Emotions | 16 | **PASS** vs CHANGELOG v1.3.1 claim |
| Actions | 22 | **PASS** vs CHANGELOG v1.3.1 claim |

**Emotions never referenced by `legacyFaceBridge`:** `alert`, `relieved`, `sad`, `startled`  
→ **Not orphans.** Habitat / SceneIntent vocabulary beyond the 15-face compact map. Recipe-compatible if runners later target `emotion` (current RECIPES `then` emphasizes `face`).

**Actions never referenced by bridge:** `carry`, `climb`, `crouch`, `jump`, `read`, `run`, `scan`, `search`, `wave`  
→ **Not orphans.** Locomotion / presence / command maps use them (`TERMINAL-MOTION`, `adapters/presence`).

**Tone note:** face tones ⊂ `moodColorsUiOnly` (`idle|accent|ok|warn|err`). Scene emotions also use `muted` (documented in STYLEGUIDE as host/scene tone). Not a kit orphan.

---

## 3. Stages

| id | weather | In bridge? |
|----|---------|------------|
| nightwatch | night | yes (offline) |
| dock | haze | yes (cancelled); defaultScene |
| desk | clear | yes (evaluating, allowed) |
| workshop | sparks | yes (sandboxing, executing) |
| archives | scan | **no** — habitat for look/pgeon (command map) |
| gate | haze | yes (denied, warning, error) |
| rooftop | clear | yes (completed) |

`archives` unbridged = **PASS** (demotion ≠ disconnection; still in strip + SCENERY + command→stage map).

---

## 4. `propKinds` (incl. `repoBranch`)

Kit: `block`, `shelf`, `lamp`, `crate`, `screen`, `antenna`, `moon`, `barrier`, `cable`, `repoBranch`

| Check | Result |
|-------|--------|
| Stock props ⊂ `propKinds` | **PASS** |
| `repoBranch` in `propKinds` + `garden.propKind` | **PASS** |
| `repoBranch` placed in stock `stages[].props` | **Absent by design** (GARDEN/SCENERY: overlay/fork) — **PASS** |
| SCENERY lists same closed set | **PASS** |

---

## 5. Weather enums

Kit: `clear`, `haze`, `night`, `sparks`, `scan`, `rain`

| Check | Result |
|-------|--------|
| Every `stages[].weather` ∈ enum | **PASS** |
| `rain` unused in stock | **PASS** — SCENERY: “none in stock; optional overlay” |
| Weather ≠ recipes “outside world” | **PASS** — BRAND/RECIPES/SCENERY language aligned |

---

## 6. `garden.growth` 0..5

| Level | Label | Doc (`GARDEN.md`) |
|------:|-------|-------------------|
| 0 | seed | match |
| 1 | sprout | match |
| 2 | sapling | match |
| 3 | young | match |
| 4 | branching | match |
| 5 | canopy | match |

| Check | Result |
|-------|--------|
| min/max/default/type | **PASS** (0 / 5 / 0 / integer) |
| `silhouetteHeightPx` \(h=12+12g\) | **PASS** (1.6.1; h(3)=48) |
| `bridge.github === false` | **PASS** |

---

## 7. RECIPES `then.growth` (design-only language)

| Claim | Kit / stance | Result |
|-------|--------------|--------|
| `then.growth` integer 0..5 | `garden.growth` | **PASS** |
| `then.growth: { prop, value }` | host-interpreted label on `repoBranch` | **PASS** (design; not kit runtime) |
| Growth ≠ scene weather ≠ mark fill | explicit in RECIPES + GARDEN | **PASS** |
| Example `then.face` ids (`error`, `completed`, `asking`, `evaluating`, `blink`) | ⊂ faces | **PASS** |
| Example `stage: rooftop`, `action: celebrate` | ⊂ kit | **PASS** |
| Recipes later plate / not v1 hero | BRAND + RECIPES + CHANGELOG | **PASS** |
| Demotion ≠ disconnection / one system graph | a31587a tip docs | **PASS** |

No recipe runner or recipe JSON package under `kit/` — correct for v1.

---

## Orphans / drifts

### Orphaned kit ids
**None** requiring JSON deletion or add. Unbridged emotions/actions/stages/`repoBranch`/`rain` are intentional open seams.

### Doc claims not in kit
1. **DEFECT-DOC-001 (low):** `TERMINAL-MOTION.md` STYLEGUIDE face bridge table lists **idle / blink → stage `dock`**. Kit `legacyFaceBridge.idle` / `.blink` **omit** `stage` (keep-current). Prefer updating the doc row to `—` / keep-current; **do not** add dock to kit solely to match prose (would change progressive semantics).
2. No other system-graph doc claim of a face/stage/growth id missing from kit.

### Kit ids undocumented in graph docs
- Full emotion/action catalogs live primarily in `kit/scene.json` + `TERMINAL-MOTION` / CHANGELOG counts — acceptable.
- Unbridged emotions (`alert`, `relieved`, `sad`, `startled`) are not named in RECIPES examples — **acceptable** (face-first recipes); optional Phase 2 doc cross-link if CoS wants explicit “habitat-only emotion” note.
- `repoBranch` + growth fully covered in GARDEN / SCENERY / RECIPES graph section.

### Recipe-compatible vocabulary risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| Host invents parallel face/motion unions | medium | PORTING + adapters: use kit string ids; `check-consumers` |
| Renaming stage/face ids without recipe note | medium | Standing rule: keep recipe-compatible vocabulary |
| Treating scene `weather` as recipe outside-weather | low | Docs already separate chrome vs later plate |
| Idle/blink doc stage=dock drift | low | DEFECT-DOC-001 |
| `muted` tone in emotions vs five moodColorsUiOnly | info | STYLEGUIDE already explains |

---

## check-consumers

```text
kit/check-consumers OK — mark v1.6.0 · scene v1.6.1 · stageWidthPx=420 · walk=170 run=280 · stages=7 · console habitat aligned
```

**PASS** at tip `22075e9`.

---

## Disposition

- Kit JSON: **untouched**
- Defects: document-only stub DEFECT-DOC-001
- CoS ask to preserve seams: **satisfied** without inventing constants
