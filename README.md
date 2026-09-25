# Mininja

```
▚████
██ ●●
▀▀▀▀▀
```

**The Apple of Terminal Buddies** — and a **terrarium for devs**: obsessive craft in a self-contained living habitat on the desk or in the terminal. **Recipes = weather into the glass; faces = creature reactions; stages = habitat.** Creature = the warm **unnamed** mark; glass = scenery; outside weather via IFTTT-style [`RECIPES.md`](RECIPES.md). Lego remix stays open — fork kit, overlay a scene, restock the tank.

**Three lines of Unicode. That’s the whole brand.** Paste them, print them, or grow faces → scoot → scene only as far as you want. Kit = data. Unix-small. Spell it **Mininja** (not “minija”).

Owned by [Thingscorp LLC](https://github.com/Thingscorp). The glyphs *are* the mark.  
Positioning: [`BRAND.md`](BRAND.md).

---

## Start in 60 seconds

```bash
git clone https://github.com/Thingscorp/mininja.git
cd mininja
./examples/cli-banner.sh          # idle face
./examples/cli-banner.sh allowed  # another mood (needs Node)
./examples/cli-banner.sh --list   # all faces
```

No clone? Paste the idle lockup from [`examples/readme-badge.md`](examples/readme-badge.md).  
Want a custom face without forking console? [`examples/remix/`](examples/remix/).  
Machine SoT: [`kit/mark.json`](kit/mark.json) · [`kit/scene.json`](kit/scene.json).

---

## Presence ladder

**mark → faces → scoot → scene.** Ship the thinnest layer that fits.

| | Layer | What you ship | Start here |
|-:|-------|---------------|------------|
| 1 | **mark** | Idle 3-line lockup | [`examples/`](examples/), [`kit/mark.json`](kit/mark.json) |
| 2 | **faces** | Moods / eyes | [`adapters/mark`](adapters/mark), [`adapters/ansi`](adapters/ansi), [`assets/`](assets/) |
| 3 | **scoot** | Facing + motion | [`adapters/react`](adapters/react), [`PORTING.md`](PORTING.md) |
| 4 | **scene** | Full stage strip | [`console/`](console/) (optional) |

Invitation, remix Legos, invariants: **[`PORTING.md`](PORTING.md)**.

---

## Russ's law (Legos)

Mininja + environments are **modular Legos**. Pieces — **mark**, **faces**, **motion**, **stages**, **props**, **weather** — snap via [`kit/`](kit/) JSON + [`adapters/`](adapters/). Rules are **data** and meant to be modified. Forking is encouraged; remix without rewriting [`console/`](console/). Brand name is **Mininja**; the mascot has **no personal name** and no he/him.

### Remix in 60s

```bash
# fork kit, then either:
#   kit/scene.json → motion.walkPxPerSec  (170 → 220)
#   kit/mark.json  → faces.wink = { "eyes": ["¬","●"], "tone": "accent", "motion": null, "mirrored": false }
./examples/cli-banner.sh wink
# overlay (no kit fork): examples/remix/
```

---

## Modules (Unix-small)

| Path | One job |
|------|---------|
| [`kit/`](kit/) | Glyphs + numbers (SoT). Nothing else. |
| [`adapters/`](adapters/) | Tiny filters: strings · ANSI · React. |
| [`examples/`](examples/) | Compose adapters. No business logic. |
| [`assets/`](assets/) | Monochrome SVG/PNG per face. |
| [`console/`](console/) | Optional terminal buddy (aligns to kit). |
| [`bot/`](bot/) | Optional Mac launcher — calls `../console`, never vendors a second UI. |

Root docs narrate. Numbers live in `kit/` — **fork or overlay when you mean to** (Lego law). Shame only **silent dual constant tables** that drift beside kit in the same tree.  
Brand law: [`BRAND.md`](BRAND.md) · [`STYLEGUIDE.md`](STYLEGUIDE.md) · [`CONSTRUCTION.md`](CONSTRUCTION.md) · [`BRAND-RULES.md`](BRAND-RULES.md) · [`TRADEMARK.md`](TRADEMARK.md) · [`SCENERY.md`](SCENERY.md) · [`TERMINAL-MOTION.md`](TERMINAL-MOTION.md) · [`RECIPES.md`](RECIPES.md).

---

## The mark

```
▚████
██ ●●
▀▀▀▀▀
```

Five columns × three rows (U+259A, U+2588, U+25CF, U+2580). No redrawn “premium” substitute — the stack *is* the mark.

![Expression sheet](assets/visuals/expression-sheet.png)

---

## Optional deeper layers

**Console** — browser terminal buddy (programs → cards, scenery, plugins):

```bash
cd console && npm install && npm run dev
```

**Bot** — Mac launcher; teammates on local / remote / Codex. Points at this repo’s console; no second React tree:

```bash
cd bot && ./mininja
```

Details: [`console/README.md`](console/README.md) · [`bot/README.md`](bot/README.md).

Glimpse in the wild: https://github.com/user-attachments/assets/76965444-03ec-45f8-9dd7-a37f9d35fb0f

---

## License

Mark and brand docs: [`TRADEMARK.md`](TRADEMARK.md) (first use, ™ / ® rules).  
Code under `adapters/`, `examples/`, `console/`, and `bot/` is MIT — [`LICENSE`](LICENSE).

<sup>“The Apple of Terminal Buddies” and “terrarium for devs” are quality metaphors only — not affiliated with Apple Inc. or IFTTT Inc.</sup>
