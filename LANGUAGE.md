# Mininja as a language

**Mininja is a small language for terminal habitat** — a creature and its glass world, spoken in kit ids and evaluated by adapters and hosts. The pieces were designed as vocabulary, grammar, and runtimes from the start; this page names that structure.

Brand: **Mininja** (Thingscorp). The mascot is **unnamed** — never Casque, never he/him. Quality metaphors (“Apple of Terminal Buddies,” “IFTTT-style”) are metaphors only — **not affiliated** with Apple Inc. or IFTTT Inc.

## Why a language

You design a language when you need a **shared vocabulary**, **well-formed composition**, and **portable programs** across hosts — not a pile of unrelated assets. Mininja needs the same things: face and stage ids that mean the same thing in every adapter; a presence order that stays coherent when you ship only the mark; forks that stay dialects instead of silent forks of truth. Kit ids are the words. Adapters and hosts are the evaluators. Recipes (later) are programs over that same vocabulary.

## Design principles

1. **Kit is the standard library and source of truth.** Numbers and ids live in [`kit/mark.json`](kit/mark.json) and [`kit/scene.json`](kit/scene.json). Console hydrates from kit — no parallel seed tables beside kit in the same tree.
2. **The thinnest well-formed program wins.** Ship mark alone, or mark → faces → scoot → scene — stop when the host has enough. Do not invent thicker surfaces that redraw the mark.
3. **Ids are portable addresses.** Face, stage, action, prop, and weather ids travel across adapters and hosts. Inventing parallel expression ids breaks later recipes and ports.
4. **Geometry is grammar, not decoration.** Grid lock \(W=420\), \(N=7\), \(L=2940\), \(\alpha=0.42\); walk **170** / run **280**. Match the Thingscorp default when you mean to stay aligned; replace on purpose when you fork, and document it.
5. **Dialects are named forks.** Overlays and kit forks are encouraged. Divergent speeds, stages, or faces are fine when named as *your* dialect. Shame only **silent dual constant tables** that claim to be kit while drifting.
6. **Fixed rules, easy mods.** Grammar and SoT ids stay stable; presentation (faces, speeds, scenery, overlays) remixes freely — like structure vs stylesheet.
7. **Recipes later = programs on the same vocabulary.** Demotion ≠ disconnection. A later recipe runner must still address the same brick ids.

## Fixed rules, easy mods

Think how **HTML** holds document structure while **CSS** restyles presentation without rewriting the markup. Mininja uses the same separation so **modifications stay easy** while **rules stay fixed**. (Analogy only — there is no HTML/CSS parser here.)

| Layer | Role | What belongs here |
|-------|------|-------------------|
| **Fixed rules** (“HTML” / structure / grammar) | Invariants | Presence ladder order; kit as SoT ids; grid lock \(W=420\), \(N=7\), \(L=2940\), \(\alpha=0.42\); Unicode mark *is* the mark (not redrawn); unnamed mascot; no silent dual constant tables |
| **Easy mods** (“CSS” / cascade / overlays) | Presentation you remix | Face skins; motion numbers via kit fork or [`examples/remix/`](examples/remix/) overlays; stage / prop / weather chrome; garden growth values; adapter and host rendering |
| **Programs** (later, “JS” targeting the DOM) | Behaviors on structural ids | [RECIPES.md](RECIPES.md) — events → expressions that address the **same** kit ids |

Fork a dialect when you change fixed rules on purpose — and **name** it. Change presentation freely: overlays and kit forks of faces, speeds, and scenery are the happy path. Do not quietly rewrite grammar while claiming to be stock kit.

## Vocabulary

Hosts **evaluate** kit ids into glyphs, motion, and scene — the lexicon is data; rendering is the host’s job.

| Language idea | Mininja piece |
|---------------|---------------|
| **Lexicon** | Unicode mark glyphs; face ids — [`kit/mark.json`](kit/mark.json) |
| **Nouns** | Stages, props, scene weather; garden `repoBranch` + growth 0..5 — [`kit/scene.json`](kit/scene.json), [GARDEN.md](GARDEN.md) |
| **Verbs** | Actions and motion constants — walk / run / patrol — [TERMINAL-MOTION.md](TERMINAL-MOTION.md) |
| **Grammar** | Presence ladder **mark → faces → scoot → scene**; geometry lock above |
| **Standard library** | Kit JSON — SoT for ids and numbers |
| **Runtimes** | Adapters (`mark` / `ansi` / `react`) + console / bot hosts |
| **Programs** (later) | [RECIPES.md](RECIPES.md) — events → expressions on the **same** ids |
| **Dialects** | Kit overlays, remix examples — [PORTING.md](PORTING.md), [`examples/remix/`](examples/remix/) |

## Well-formed programs

Composition order is the presence ladder. Each layer adds meaning; thinner layers remain valid programs.

| Order | Layer | What it adds |
|------:|-------|--------------|
| 1 | **mark** | Idle three-line lockup — the thinnest complete utterance |
| 2 | **faces** | Mood / eye ids from the lexicon |
| 3 | **scoot** | Facing + motion verbs |
| 4 | **scene** | Full habitat strip — stages, props, scene weather |

**Ill-formed** (not a Mininja program): inventing parallel face/stage ids beside kit; silent dual constant tables that drift from kit; redrawing the Unicode mark as a substitute lockup.

## v1 surface vs later plate

The v1 language surface is **creature + habitat glass** only:

- **Creature** — the Unicode mark and its faces
- **Habitat glass** — stages, props, scene weather (scenery chrome)

Recipes are a **later plate** of programs — behaviors that target the same structural ids (like scripts addressing a DOM). They stay in the [system graph](RECIPES.md#one-system-graph). Do not invent expression ids a later runner cannot address.

## Dialects / forks

Pieces snap like Legos: kit JSON is brick specs; adapters are studs. Forking and overlays are how you speak a dialect ([PORTING.md](PORTING.md), [`examples/remix/`](examples/remix/)). Document divergence in the host README so others know which ruleset they are on. Upstream geometry cited in [SCENERY.md](SCENERY.md) and [TERMINAL-MOTION.md](TERMINAL-MOTION.md) is the Thingscorp default — match when aligned; replace when forking on purpose.

## See also

[BRAND.md](BRAND.md) · [PORTING.md](PORTING.md) · [RECIPES.md](RECIPES.md) · [SCENERY.md](SCENERY.md) · [TERMINAL-MOTION.md](TERMINAL-MOTION.md) · [GARDEN.md](GARDEN.md) · [CONSTRUCTION.md](CONSTRUCTION.md)
