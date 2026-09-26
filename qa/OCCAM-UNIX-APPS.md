# Occam + Unix audit (Apps lane — console/ + bot/)

**Date:** 2026-09-26 (ET)  
**Branch:** `feat/monorepo-public`  
**Mandate:** same bar as kit twin ([`OCCAM-UNIX-AUDIT.md`](OCCAM-UNIX-AUDIT.md)); applied to `console/` + `bot/`.  
**Bar:** Unix (one job; text/data interface; compose; silence; economy) × Occam (no entity without necessity; one vocabulary; demotion ≠ disconnection ≠ duplicate).  
**Cartridge:** `kit/mark.json` + `kit/scene.json` = SoT; hosts = player; adapters = filters. Dual tables = shame. Linear.app quality / Occam UI.

No kit JSON edits. No invented face / emotion / stage / growth ids. No second React console under `bot/`. No kit pal-color tables.

Standing maps: [`seams/00-HOST-SEAMS.md`](seams/00-HOST-SEAMS.md) · [`03-console-host.md`](seams/03-console-host.md) · [`04-bot-host.md`](seams/04-bot-host.md) · [`OLD-CONSOLE-CARRYOVER.md`](OLD-CONSOLE-CARRYOVER.md) (bot `@`/rally rows corrected this tip).

---

## Verdict snapshot

| Bucket | Count (this pass) | Notes |
|--------|------------------:|-------|
| **MUST FIX** (Apps, this tip) | 4 remediated | FRAMES lean; stale `@`/rally docs; Hubzz chrome lies; this audit |
| **DEFER** | 4 open | Composer absorb; Banner tint wire; pal↔plant viz; camera import style |
| **WAIVE** | several | Host routing maps; intentional Linear vs moodColors; type mirrors |
| **ALREADY LEAN** | several | registerFromKit; engine kit hydrate; zones hydrate; provider theme killed |
| **Ports / Kit (file only)** | — | Adapters stay filters; no Apps UI there |

---

## MUST FIX → remediated this tip

| ID | Finding | Evidence | Fix |
|----|---------|----------|-----|
| **OX-APP-101** | Bot `FRAMES` silent dual table — full glyph catalog + wrong `loadingLeft` (mirrored body not in seed) beside kit; `framesFromKit` merged seed leftovers | `bot/static/index.html` ~L756–793 (pre-cut); kit `faces.loadingLeft` = `████▞` / `●● ██` | **Lean:** idle **on-ramp only**; `framesFromKit` returns **hydrate-only** catalog (+ `sandbox`↔`sandboxing` host alias). No invented face ids. |
| **OX-APP-201** | `OLD-CONSOLE-CARRYOVER.md` claimed `@`-mention / rally **not implemented**; seams 03/04 already marked that **STALE** for bot | Carry-over L58, L78–79, L187–188, L197–202, Occam summary L251 | Updated carry-over to bot **shipped** / console **missing**; pointer to seams 04 + this audit. |
| **OX-APP-202** | Dead Hubzz / `#0E0F12` / “purple accent” chrome lies after Linear kill | `qa/monorepo-feature-matrix.csv` CON-ROUTE-004/005, CON-UI-002; `bot/console/qa-features.json` same rows; test assert label “Hubzz tokens” | Aligned to Linear `#08090a` / `#5e6ad2` / `bg-bg`… (matches `console/src/plugins/qa/features.json` + live CSS). Provider brand theme already gated absent (`paintProviderTheme` asserts). |
| **OX-APP-203** | Apps Occam trail lived only as oral / kit twin | — | This file. NORTH-STAR + STYLEGUIDE Occam pointers now cite kit **and** Apps twins. |

---

## DEFER (next loops — do not absorb product this tip)

| ID | Item | Why defer | Concrete next cut |
|----|------|-----------|-------------------|
| **OX-APP-D01** | **Unify composer** — port bot one-mouth `@` / stop / retarget / rally into React console | Product absorb; non-trivial UI + API surface | See **Next-loop cut** below |
| **OX-APP-D02** | Console `Banner` `tint` / `pals` / `sticky` **unwired** from `Mininja` | Half-shipped API; needs roster source console does not have yet | Wire when roster exists; props already in `banner.tsx` L27–47; call site `mininja.tsx` L188 passes none |
| **OX-APP-D03** | Pal ↔ `repoBranch` growth silhouette viz | Kit schema ready; neither host paints `garden.silhouetteHeightPx` / pal-on-plant | Host CSS + overlay binding; no new kit ids ([`GARDEN.md`](../GARDEN.md)) |
| **OX-APP-D04** | Banner camera/patrol **literals** (`viewW*0.32/0.52`, `26` px/s) vs importing `kit.motion` exports | Values match today (`check-consumers`); import style drift risk | Prefer export imports when touching banner next |

---

## WAIVE (honest keep)

| ID | Item | Why waive |
|----|------|-----------|
| **OX-APP-W01** | `COMMAND_INTENT` / `CMD_STAGE` host routing tables | Host chrome OK; ids ⊂ kit stages/emotions/actions. Not silent catalogs. |
| **OX-APP-W02** | Linear `--color-*` vs kit `moodColorsUiOnly` | Intentional dual: Apps chrome ≠ mark tone hex. Do not bake Linear into kit. |
| **OX-APP-W03** | Console `MascotState` / `Weather` / `PropKind` / `Tone` closed unions | Type mirrors of kit enums (kit OX-APP-003/004). Runtime via bridge / registerFromKit. Churn only if kit-align breaks. |
| **OX-APP-W04** | Console `mascot.ts` `FRAMES` built via `composeLockup` / `legacyFaceBridge` | Not a glyph dual table — already lean (kit OX-A04). |
| **OX-APP-W05** | Habitat `composeLockup` (scene-driven eyes/pose) vs adapter `from-kit` for static chips | Seams adapter rule: habitat compose OK; static faces → from-kit. |
| **OX-APP-W06** | Bot `#composer` + console programs mouth (product split) | Two mouths until absorb — **do not** add a third. Documented in READMEs. |
| **OX-APP-W07** | Stage tree ink CSS (`--color-git-*`) | Host paint over kit stage ids; not a stage catalog. |
| **OX-APP-W08** | Typeface hardcoded IBM Plex in host CSS | Matches `mark.typeface` by convention; hydrate optional later. |

---

## ALREADY LEAN

| ID | Evidence |
|----|----------|
| **OX-APP-A01** | Console `registerFromKit()` — no `STAGE_SEED` / `EMOTION_SEED` / `ACTION_SEED` (`kit/check-consumers.mjs`, `console/scripts/kit-align.mjs`). |
| **OX-APP-A02** | Geometry / walk-run from `kit.geometry` / `kit.motion` (OX-APP-001/002 remediated in kit pass). |
| **OX-APP-A03** | Bot grove `hydrateZones` / `zonesFromKit` from `/kit/scene.json`; empty until success. |
| **OX-APP-A04** | Bot `engine.py` `KIT_STAGES` / emotions / actions from `kit/scene.json`. |
| **OX-APP-A05** | Provider brand theme **killed** — QA forbids `paintProviderTheme` / `#de7356` / `data-llm-provider`. |
| **OX-APP-A06** | Tint host-only (`console/src/lib/tint.ts` ↔ `bot/console/tint.py`); no kit pal-color table. |
| **OX-APP-A07** | Bot one-mouth composer shipped (`parseMention`, rally, retarget, pull-off). |
| **OX-APP-A08** | No vendored React under `bot/` (static HTML + Python only). |

---

## Discovery inventory (smells scanned)

| Smell | Status |
|-------|--------|
| Silent dual stage/emotion/action seeds | **Clean** (console + bot) |
| Host redraw lockup glyphs inventing ids | **Remediated** bot FRAMES; console composeLockup OK |
| Dead dual-path FRAMES seed vs kit overwrite | **Remediated** hydrate-only |
| Third composer mouth | **Absent** — two mouths documented; absorb deferred |
| Doc lies vs seams (`@`/rally) | **Remediated** carry-over |
| Provider-theme / Hubzz leftovers | Theme **already lean**; Hubzz **doc lies fixed** |
| Paste sprawl / unused CSS tokens | Linear tokens in use; no dead Hubzz CSS found in hosts |
| Type unions forked from kit | **WAIVE** — note only |
| Kit catalog duplication in host | **Clean** after FRAMES lean |

---

## Next-loop cut — composer absorb (bot → console)

**Goal:** one mouth in React that can `@pal` / `@all` / `@console` / programs; stop / pull / retarget / rally; sidebar select = fallback. **Do not** vendor React under `bot/`.

| Concern | Bot SoT (copy from) | Console land (today → target) |
|---------|---------------------|-------------------------------|
| Mention parse + kinds | `bot/static/index.html` `parseMention` ~L1067 | New `console/src/lib/mention.ts` (pure) |
| Autocomplete roster UI | `mentionQuery` / `rosterSuggestions` / `paintMentionMenu` / `#mentionMenu` | Composer dropdown under input in `mininja.tsx` |
| One-mouth router | `runLine` ~L1416 | Extend `run()` in `mininja.tsx` — branch before `cardFor` |
| Pull-off | `pullOff` + `POST …/stop` | Client + button when roster exists |
| Retarget | `retargetLine` + `POST …/retarget` | Same |
| Rally-all | `rallyLine` + `POST /api/rally` | Same |
| Teammate API host | `bot/server.py` `start_task` / `stop_bot` / `retarget_task` / `rally_all` | Either proxy to bot server **or** shared backend — product call |
| Roster / tint chips | `paintPalHabitat` / `stickyInterrupt` | Pass `tint`/`pals`/`sticky` into `Banner` (`banner.tsx` props ready); `lib/tint.ts` |
| Contract copy | `bot/README.md` § Composer contract | Mirror in `console/README.md` after absorb; keep bot as Mac launcher |

**Guards to preserve:** `MAX_PARALLEL=4`; no silent double-assign; rally skips working; retarget explicit; modes fail-closed.

**Out of this absorb:** pal↔`repoBranch` viz (D03); kit edits; second mouth.

---

## Checks run after Apps touch

```bash
node kit/check-consumers.mjs
node console/scripts/kit-align.mjs
node qa/tests/run-tests.mjs
```

---

## Still open (Apps)

1. **OX-APP-D01** composer absorb (P0 product).  
2. **OX-APP-D02** Banner multi-pal wire.  
3. **OX-APP-D03** pal↔plant growth viz.  
4. **OX-APP-D04** banner camera import hygiene.  
5. Keep type unions kit-align green (no drive-by churn).

**Exit feel:** acting cool without trying — hosts play the cartridge; no silent dual tables; docs match seams; next cut is one mouth, not more chrome.
