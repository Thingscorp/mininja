# Mininja Mascot Style Guide

The official style guide for the Mininja mascot, the official mascot of Thingscorp LLC.

## 1. The mark

The canonical Mininja lockup:

```
▚████
██ ●●
▀▀▀▀▀
```

A ninja face rendered in Unicode block-drawing characters:

- U+259A (▚) quadrant upper left and lower right
- U+2588 (█) full block
- U+25CF (●) black circle
- U+2580 (▀) upper half block

The mascot has no name.

## 2. Construction rules

- The body (lines 1 and 3) is static across all states.
- Only the eyes on line 2 change, plus the tone color in rendered contexts.
- The sole exception is the `loadingLeft` state, which mirrors the body.
- Eye glyphs must come from the expression table below. Do not invent new eyes.

## 3. Tones (`moodColorsUiOnly`)

Rendered contexts color the mascot by **tone** (UI chrome — not a face/emotion id namespace):

| Tone | Hex | Meaning |
|------|-----|---------|
| idle | `#334155` | neutral / at rest |
| accent | `#6366f1` | working / thinking |
| ok | `#22c55e` | positive outcome |
| warn | `#eab308` | needs attention |
| err | `#ef4444` | blocked / failed |

These five keys and hex values are [`kit/mark.json`](kit/mark.json) → `moodColorsUiOnly` (Thingscorp default kit). A kit fork or local overlay may replace them; do not keep a second tone table in brand docs. Terminal contexts use the same tone names (plus optional host-only `muted`) instead of hex.

## 4. Expression table

| State | Eyes | Tone | Meaning | Motion |
|-------|------|------|---------|--------|
| idle | ●● | idle | ready | — |
| blink | ── | idle | blink face (glyphs/tone in kit) | — |
| evaluating | ◐◑ | accent | checking rules | pulse |
| allowed | >< | ok | permitted | bounce |
| asking | ?? | warn | needs approval | — |
| denied | ┃┃ | err | blocked | shake |
| sandboxing | ◇◇ | idle | contained | — |
| executing | ◣◢ | accent | focused | pulse |
| completed | ▴▴ | ok | done | bounce |
| warning | ▲△ | warn | caution | bounce |
| error | ×× | err | failed | shake |
| cancelled | ◦◦ | idle | interrupted | — |
| offline | ‒‒ | idle | sleeping | — |
| loadingRight | ●● | accent | loading | pulse |
| loadingLeft | ●● (mirrored body) | accent | loading | pulse |

The `loadingLeft` frame mirrors the body:

```
████▞
●● ██
▀▀▀▀▀
```

## 5. Usage

- Use `idle` as the default resting state.
- `blink` glyphs and tone live in [`kit/mark.json`](kit/mark.json). Auto-blink every **6–14s** while idle is **host guidance only** (not a kit constant) — choose your timer, or skip auto-blink; never fire `blink` manually as a response face.
- `warning` glyphs live in [`kit/mark.json`](kit/mark.json) as **▲△** (solid left, outline right) for the still mark. While the face is `warning`, hosts **MAY flash** both eyes together between **▲▲** (both solid) and **△△** (both outline) on a timer — in sync, never left/right taking turns. **Host guidance only** (not a kit motion / not a new face id).
- Match the state to what the system is actually doing (e.g. `evaluating` while checking rules, `asking` when blocked on approval, `error` on failure).
- Do not use the mark's expressions to convey anything outside this table.

## Occam + Unix (standing bar)

Same bar as [`NORTH-STAR.md`](NORTH-STAR.md): one job per piece; kit JSON is the interface; compose adapters; silence over sprawl; no entity without necessity.

| Check | Pass when |
|-------|-----------|
| Dual table | Numbers live in `kit/` only; docs **narrate** or **point**, they don’t fork |
| Vocabulary | face · stage · action · emotion · growth · tone — not invented “mood ids” |
| Paste | Hierarchy / catalog appears once canonically; elsewhere = short pointer |
| Scope | Digipet / dashboard / acquisition / pal-color kit tables stay out |
| Lane | Console/bot UI = Apps; adapter craft = Ports; this guide = brand narration of kit |

Full audit: [`qa/OCCAM-UNIX-AUDIT.md`](qa/OCCAM-UNIX-AUDIT.md) (kit) · [`qa/OCCAM-UNIX-APPS.md`](qa/OCCAM-UNIX-APPS.md) (Apps).

## Sources

Machine source of truth: [`kit/mark.json`](kit/mark.json) (faces, tones, glyphs) and [`kit/scene.json`](kit/scene.json) (scene vocabulary). This guide narrates those numbers; it does not invent a second table.

Historical note: early ports lived in Thingscorp/Mininja `apps/web/lib/mascot.ts` and Thingscorp/mininja-console `src/lib/mascot.ts`. Those hosts must stay aligned to kit — they are not live SoT.

## Scene emotions beyond the compact face map

[`kit/scene.json`](kit/scene.json) catalogs **16** emotions. The compact **15**-face [`legacyFaceBridge`](kit/scene.json) reaches twelve of them. Four — `alert`, `relieved`, `sad`, `startled` — are habitat / SceneIntent expansion, not orphans and not a missing bridge row. They stay recipe-compatible if a later plate targets `then.emotion` (today’s [`RECIPES.md`](RECIPES.md) examples emphasize `face`). Do not invent new emotion ids here or in hosts.
