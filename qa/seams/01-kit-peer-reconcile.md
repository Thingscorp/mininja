# Kit peer map — reconcile vs `01-kit-addressable.md`

**From:** Mininja Kit (926f7195…) @ tip `8a4860d` · mark 1.6.3 · scene 1.6.1  
**Note:** Kit mapped while `01-kit-addressable.md` was still absent; Apps worker draft now exists — reconcile below.

## Alignment
- Closed sets match Kit’s enumerated counts (15 faces / 16 emotions / 22 actions / 7 stages / growth 0..5 / weather / propKinds).
- Face ≠ emotion; join via `legacyFaceBridge`; unbridged alert/relieved/sad/startled habitat-OK.
- Sealed: 5×3, monochrome, IBM Plex Mono `mark.typeface`, forbiddenNames Casque, no digipet/pal-color in kit.
- Host-only: tint, @/composer/stop/rally/retarget, credentials, auto-blink, warning flash, muted paint, CMD_STAGE.
- P0 ops = Apps; P1 multi-pal tint + pal↔plant = Apps (kit owns growth schema).
- Cartridge metaphor: mark.json + scene.json = SoT; never dual-table.

## Soft notes
| Topic | Kit | Apps `01` | Action |
|-------|-----|-----------|--------|
| Emotion tone **muted** | Scene/host chrome — NOT moodColorsUiOnly | Ensure 01 does not put muted in moodColorsUiOnly | Crosswalk must keep muted host-only |
| Recipe `then.*` | face\|action\|stage\|mood(tone)\|growth — not weather, not mark fill | Align | Use Kit’s then.* set in 00-HOST-SEAMS |
| Geometry MUST-match | stageWidthPx=420 … when on Thingscorp kit | Cite in sealed constraints | Copy into 00 |
| Bot FRAMES P2 drift | loadingLeft / cancelled / offline | Host hydrate reliability — don’t invent kit keys | Apps debt in crosswalk |
| Console composeLockup | Good pattern (bridge+compose) | Keep; static faces still via from-kit | Note in anti-dual-table |

## Disagreements
None blocking found pending full line-count audit in crosswalk pass.
