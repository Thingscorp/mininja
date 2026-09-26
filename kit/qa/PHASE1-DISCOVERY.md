# Phase 1 — Kit feature discovery

| Field | Value |
|-------|-------|
| Date | 2026-09-25 (ET) |
| Branch | `feat/monorepo-public` |
| Tip after `git pull --ff-only` | `22075e9` (local tip; local +2 vs origin `449d43f`; kit SoT unchanged; `a31587a` ancestor) |
| System-graph ancestor | `a31587a` present |
| Matrix | [`kit/qa/kit-feature-matrix.csv`](kit-feature-matrix.csv) |
| Id review | [`kit/qa/ID-VOCAB-REVIEW-a31587a.md`](ID-VOCAB-REVIEW-a31587a.md) |
| Feature count | **29** |
| Kit JSON changed? | **No** |

---

## Ownership (Unix)

| Owns | Does not own |
|------|----------------|
| `kit/mark.json` + `kit/scene.json` (machine SoT) | Console UI screens / `register*` **implementation UX** (Mininja Apps) |
| Brand markdown that **narrates** kit numbers | App logic, runners, GitHub bridges |
| `kit/check-consumers.mjs` (consumer alignment gate) | Inventing constants in docs or adapters |

`registerEmotion` / `registerAction` / `registerStage` / `SceneIntent` appear in the matrix as **KIT-DEP-*** consumer contracts of kit exports — not kit-owned screens to "fix" in JSON.

---

## Coverage of kit surfaces

### Creature (`mark.json`)
- Identity / naming invariants (unnamed mascot; never Casque)
- 5×3 grid, codepoints, canonical + mirrored idle
- Clearspace / min size / monochrome + UI-only mood colors
- 15 faces
- Presence ladder mark → faces → scoot → scene

### Habitat glass (`scene.json`)
- Geometry (W=420, N=7, L=2940, α=0.42)
- Default scene, motion speeds/camera/step
- Weather enum (chrome only)
- Prop kinds (incl. `repoBranch`)
- 7 stages with stock props
- 16 emotions · 22 actions
- `legacyFaceBridge` · fallbacks

### Garden
- Growth 0..5 labels, silhouette map, propFields, no GitHub bridge

### Recipes (later plate — still in graph)
- Vocabulary seams only (`KIT-RECIPE-001`): face / action / stage / mood / growth
- No runner in kit; demotion ≠ disconnection

### Validation / versioning / deps
- `check-consumers` · sim-grid-habitat (kit-facing) · version fields
- Console registerFromKit contract · adapters · brand narration

---

## Out of scope (Apps / not kit SoT)

- Console banner React screens, command palette UX, auth, multiplayer, pigeon, blockers
- Bot Mac launcher / remote host wiring
- Recipe runner UI, webhook bridges, OS notify bridges (RECIPES roadmap B–D)
- Live GitHub growth overlays
- Any inventing of new face/stage/growth constants in this dispatch

Still **discovered** as dependencies: how console loads kit (`registerFromKit`, `LEGACY_INTENT`, propKind/`growth` types) and how adapters emit kit string ids.

---

## Id-vocabulary review results (TASK A)

Full write-up: [`ID-VOCAB-REVIEW-a31587a.md`](ID-VOCAB-REVIEW-a31587a.md).

| Seam | PASS/FAIL |
|------|-----------|
| Faces ↔ legacyFaceBridge | **PASS** |
| Emotions / actions | **PASS** (unbridged = expansion) |
| Stages | **PASS** |
| propKinds + repoBranch | **PASS** |
| Weather enums | **PASS** |
| garden.growth 0..5 | **PASS** |
| RECIPES then.growth language | **PASS** |
| TERMINAL-MOTION idle/blink stage=dock vs kit omit | **FAIL (doc only)** |

No kit orphans requiring JSON churn.

---

## check-consumers

```bash
node kit/check-consumers.mjs
```

**Result: PASS**

```text
kit/check-consumers OK — mark v1.6.0 · scene v1.6.1 · stageWidthPx=420 · walk=170 run=280 · stages=7 · console habitat aligned
```

---

## Defect stubs found in discovery

| ID | Severity | Summary | Suggested fix owner |
|----|----------|---------|---------------------|
| DEFECT-DOC-001 | low | `TERMINAL-MOTION.md` face bridge lists idle/blink stage=`dock`; kit `legacyFaceBridge` omits stage | Docs / Motion narrator — align table to kit (keep-current). **Do not** change kit unless CoS explicitly wants dock. |

Matrix rows `KIT-SCENE-009` and `KIT-DEP-003` reference Defect Count 1 for this stub.

---

## Gaps for Phase 2

1. Fill Test Cases stubs (execute `TC-KIT-*`, not just list).
2. Run `python3 scripts/sim-grid-habitat.py` and attach report digest.
3. Resolve DEFECT-DOC-001 (doc PR) if CoS agrees kit omission is canonical.
4. Optional: adapter/example golden snapshots for all 15 faces + unknown-face fallback.
5. Optional: document unbridged emotions as explicit "habitat-only / SceneIntent" in STYLEGUIDE or PORTING.
6. Apps Phase 1 (separate): console screen matrix — not this kit CSV.
7. When recipes plate schedules: schema fixture validation against live face/stage/action/growth ids.

---

## Standing rules honored

- Recipes later plate; system graph connected
- No PR #1 merge · no force-push · no invented kit constants · mascot unnamed
- Kit JSON held (no unrelated churn)
- Artifacts left **uncommitted** (local tip is 2 commits ahead of `origin/feat/monorepo-public` with unrelated adapter/docs commits; avoid pushing foreign work from this dispatch)
