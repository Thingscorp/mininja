# Ports peer map — reconcile vs `02-adapters-ports.md`

**From:** Mininja Ports (092fe5be…) @ tip `8a4860d`  
**Apps draft:** `qa/seams/02-adapters-ports.md`  
**Result:** **Aligned.** No blocking disagreements.

## Confirmed (both agree)
- Adapters do **not** own habitat strip / stage layout / garden growth rendering.
- No `data-emotion` on mark chrome today; emotion/growth are host/scene/garden — not adapter I/O.
- Mark-only examples = 60s on-ramp, not v1-complete product.
- Hosts must call mark `linesFor`/`lockup` / `mergeMark`; must not reimplement eyes/mirror math.
- React/presence `facing` is `data-facing` hint only; glyph facing via mark filter first.
- Multi-pal = N pure `(kit|overlay, face, facing)` calls; chip/roster = labels, not a second avatar system.
- `legacyFaceBridge` for face↔emotion/action/stage; never equate faces with emotions.
- Node lockup/ansi vs browser from-kit is the correct split.

## Soft notes (same direction, different emphasis)
| Topic | Ports | Apps draft `02` | Action |
|-------|-------|-----------------|--------|
| ANSI tone table | Soft chrome dual vs kit tone keys | Same risk + “don’t invent second face→color map” | Keep as known risk; no adapter catalog of moods |
| Host dual-path | Facing confusion common | Calls out console `composeLockup` + bot `FRAMES`/`framesFromKit` | Crosswalk doc should list **converge hosts → from-kit** as Apps debt |
| `data-emotion` | Optional string pass-through later; Ports won’t invent catalog | Not proposed in `02` | Defer until Kit/Apps ask for attr parity |
| PORTING emotion under-list | Ports may sync docs | Draft cites NORTH-STAR face·stage·action·emotion·growth | Ports owns PORTING sync if still drifted |

## Apps will use
Ports’ id seams (**face · stage · action · emotion · growth** with adapters only emitting face/stage/action/motion chrome) as the vocabulary for the final host-seams checklist.
