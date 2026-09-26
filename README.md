# Mininja

```
▚████
██ ●●
▀▀▀▀▀
```

**The Apple of Terminal Buddies** — and a **terrarium for Devs**: glass box on the desk (console/bot), **pal** = the Unicode mark (unnamed agent presence), habitat glass = stages / props / scene weather as scenery chrome. Remix the terrarium like Lego.

**Three lines of Unicode. That’s the whole brand.** Paste them, print them, or grow faces → scoot → scene only as far as you want. Kit = data. Unix-small. Spell it **Mininja** (not “minija”).

Owned by [Thingscorp LLC](https://github.com/Thingscorp). The glyphs *are* the mark.  
Positioning: [`BRAND.md`](BRAND.md) · north star: [`NORTH-STAR.md`](NORTH-STAR.md) (Giga Pets × Pebble × IFTTT) · glance / rubber-duck: [`GLANCE.md`](GLANCE.md).

A peek should tell a busy developer what matters — posture, not another dashboard. **v1 ship** = pal + habitat strip; recipes later filter what the duck notices.

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
| 2 | **faces** | Moods / eyes / working-slot chrome | [`adapters/mark`](adapters/mark), [`adapters/ansi`](adapters/ansi), [`adapters/presence`](adapters/presence), [`assets/`](assets/) |
| 3 | **scoot** | Facing + motion | [`adapters/react`](adapters/react), [`adapters/presence`](adapters/presence), [`PORTING.md`](PORTING.md) |
| 4 | **scene** | Full stage strip | [`console/`](console/) (optional) |

Invitation, remix Legos, invariants: **[`PORTING.md`](PORTING.md)**.

---

## Russ's law (Legos)

Mininja + environments are **modular Legos**. Pieces — **mark**, **faces**, **motion**, **stages**, **props**, **scene weather** — snap via [`kit/`](kit/) JSON + [`adapters/`](adapters/). Rules are **data** and meant to be modified. Forking is encouraged; remix without rewriting [`console/`](console/). Brand name is **Mininja**; the mascot has **no personal name** and no he/him.

### Remix in 60s

```bash
# overlay (no kit fork) — works today:
cd examples/remix && node ./print-face.mjs allowed   # ◆◆ eyes
node ./print-face.mjs wink                           # eyes-only; from-kit derives lines
node ./print-face.mjs --motion                       # scene speeds vs upstream
# fork kit when you mean to — see PORTING.md
```

---

## Modules (Unix-small)

| Path | One job |
|------|---------|
| [`kit/`](kit/) | Glyphs + numbers (SoT). Nothing else. |
| [`adapters/`](adapters/) | Tiny filters: strings · ANSI · React · presence. |
| [`examples/`](examples/) | Compose adapters. No business logic. |
| [`assets/`](assets/) | Monochrome SVG/PNG per face. |
| [`console/`](console/) | Optional terminal buddy (aligns to kit). |
| [`bot/`](bot/) | Optional Mac launcher — calls `../console`, never vendors a second UI. |

Root docs narrate. Numbers live in `kit/` — **fork or overlay when you mean to** (Lego law). Shame only **silent dual constant tables** that drift beside kit in the same tree.  
Brand law: [`BRAND.md`](BRAND.md) · [`STYLEGUIDE.md`](STYLEGUIDE.md) · [`CONSTRUCTION.md`](CONSTRUCTION.md) · [`BRAND-RULES.md`](BRAND-RULES.md) · [`TRADEMARK.md`](TRADEMARK.md) · [`SCENERY.md`](SCENERY.md) · [`GARDEN.md`](GARDEN.md) · [`TERMINAL-MOTION.md`](TERMINAL-MOTION.md) · [`GLANCE.md`](GLANCE.md).

Later plate (not first Mininja): [`RECIPES.md`](RECIPES.md).

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


---

## License

Mark and brand docs: [`TRADEMARK.md`](TRADEMARK.md) (first use, ™ / ® rules).  
Code under `adapters/`, `examples/`, `console/`, and `bot/` is MIT — [`LICENSE`](LICENSE).

<sup>“The Apple of Terminal Buddies” and “terrarium for Devs” are quality metaphors only — not affiliated with Apple Inc.</sup>
