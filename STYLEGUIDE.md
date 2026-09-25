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
- Only the eyes on line 2 change, plus the mood color in rendered contexts.
- The sole exception is the `loadingLeft` state, which mirrors the body.
- Eye glyphs must come from the expression table below. Do not invent new eyes.

## 3. Moods

Rendered contexts color the mascot by mood:

| Mood | Hex | Meaning |
|------|-----|---------|
| idle | `#334155` | neutral / at rest |
| accent | `#6366f1` | working / thinking |
| ok | `#22c55e` | positive outcome |
| warn | `#eab308` | needs attention |
| err | `#ef4444` | blocked / failed |

These five keys and hex values are [`kit/mark.json`](kit/mark.json) → `moodColorsUiOnly` (Thingscorp default kit). A kit fork or local overlay may replace them; do not keep a second mood table in brand docs. Terminal contexts use the same tone names (plus optional host-only `muted`) instead of hex.

## 4. Expression table

| State | Eyes | Mood | Meaning | Motion |
|-------|------|------|---------|--------|
| idle | ●● | idle | ready | — |
| blink | ── | idle | blink (automatic, every 6–14s while idle) | — |
| evaluating | ◐◑ | accent | checking rules | pulse |
| allowed | >< | ok | permitted | bounce |
| asking | ?? | warn | needs approval | — |
| denied | ┃┃ | err | blocked | shake |
| sandboxing | ◇◇ | idle | contained | — |
| executing | ◣◢ | accent | focused | pulse |
| completed | ▴▴ | ok | done | bounce |
| warning | ◆◆ | warn | caution | bounce |
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
- `blink` fires automatically every 6–14 seconds while idle; never trigger it manually as a response.
- Match the state to what the system is actually doing (e.g. `evaluating` while checking rules, `asking` when blocked on approval, `error` on failure).
- Do not use the mark's expressions to convey anything outside this table.

## Sources

Machine source of truth: [`kit/mark.json`](kit/mark.json) (faces, tones, glyphs) and [`kit/scene.json`](kit/scene.json) (scene vocabulary). This guide narrates those numbers; it does not invent a second table.

Historical note: early ports lived in Thingscorp/Mininja `apps/web/lib/mascot.ts` and Thingscorp/mininja-console `src/lib/mascot.ts`. Those hosts must stay aligned to kit — they are not live SoT.
