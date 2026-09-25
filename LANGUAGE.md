# Mininja as a language

Mininja is a **small language for terminal habitat**: a creature and its glass world, spoken in kit ids and rendered by adapters. Treat the brand pieces like a programming language — not as metaphor garnish, but as the way the system is structured.

Brand: **Mininja** (Thingscorp). The mascot is **unnamed** — never Casque, never he/him. Quality metaphors (“Apple of Terminal Buddies,” “IFTTT-style”) are metaphors only — **not affiliated** with Apple Inc. or IFTTT Inc.

## Vocabulary map

| Language idea | Mininja piece |
|---------------|---------------|
| **Lexicon / atoms** | Unicode mark glyphs; face ids in [`kit/mark.json`](kit/mark.json) |
| **Types / nouns** | Stages, props, scene weather; garden `repoBranch` + growth 0..5 ([`kit/scene.json`](kit/scene.json), [GARDEN.md](GARDEN.md)) |
| **Verbs** | Actions and motion constants — walk / run / patrol ([TERMINAL-MOTION.md](TERMINAL-MOTION.md)) |
| **Grammar / well-formed programs** | Presence ladder **mark → faces → scoot → scene**; geometry lock \(W=420\), \(N=7\), \(L=2940\), \(\alpha=0.42\) |
| **Standard library** | Kit JSON — the source of truth |
| **FFI / runtimes** | Adapters (`mark` / `ansi` / `react`) + console / bot hosts |
| **Macros / scripts** (later) | [RECIPES.md](RECIPES.md) — events → expressions on the **same** ids |
| **Fork / dialects** | Kit overlays, remix examples — encouraged; shame only **silent dual tables** |

## v1 surface

The v1 **language surface** is creature + habitat glass only:

- **Creature** — the Unicode mark and its faces
- **Habitat glass** — stages, props, scene weather (scenery chrome)

Recipes are a **later plate**. Demotion ≠ disconnection: they stay in the [system graph](RECIPES.md#one-system-graph) and target the same vocabulary. Do not invent parallel expression ids that a later recipe runner cannot address.

## Source of truth

- **Kit is SoT.** Numbers and ids live in [`kit/mark.json`](kit/mark.json) and [`kit/scene.json`](kit/scene.json).
- **Console hydrates from kit.** No parallel `STAGE_SEED` (or emotion/action seed tables) beside kit in the same tree.
- **Grid math is locked** for the Thingscorp default kit — see `scripts/sim-grid-habitat.py` and kit **1.6.1**. Match when you mean to stay aligned; replace on purpose when you fork, and document it.

## Legos

Pieces snap. Adapters are studs; kit JSON is brick specs. Forking and overlays are encouraged ([PORTING.md](PORTING.md), [`examples/remix/`](examples/remix/)). Divergent speeds, stages, or faces are fine when named as *your* dialect. Shame only silent dual constant tables that claim to be kit while drifting.

## See also

[BRAND.md](BRAND.md) · [PORTING.md](PORTING.md) · [RECIPES.md](RECIPES.md) · [SCENERY.md](SCENERY.md) · [TERMINAL-MOTION.md](TERMINAL-MOTION.md) · [GARDEN.md](GARDEN.md)
