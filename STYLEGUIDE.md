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
| accent | `#0ea5e9` | working / thinking |
| success | `#10b981` | positive outcome |
| warning | `#f59e0b` | needs attention |
| danger | `#ef4444` | blocked / failed |

Terminal contexts use tone names instead of hex: idle, accent, ok, warn, err, muted.

## 4. Expression table

| State | Eyes | Mood | Meaning | Motion |
|-------|------|------|---------|--------|
| idle | ●● | idle | ready | — |
| blink | ── | idle | blink (automatic, every 6–14s while idle) | — |
| evaluating | ◐◑ | accent | checking rules | pulse |
| allowed | >< | success | permitted | bounce |
| asking | ?? | warning | needs approval | — |
| denied | ┃┃ | danger | blocked | shake |
| sandboxing | ◇◇ | idle | contained | — |
| executing | ◣◢ | accent | focused | pulse |
| completed | ▴▴ | success | done | bounce |
| warning | ◆◆ | warning | caution | bounce |
| error | ×× | danger | failed | shake |
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

Expression tables ported from the canonical implementations:

- Thingscorp/Mininja — `apps/web/lib/mascot.ts`
- Thingscorp/mininja-console — `src/lib/mascot.ts`
