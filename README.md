# Mininja

```
▚████
██ ●●
▀▀▀▀▀
```

**Three lines of Unicode. That’s the whole brand.** Paste them into a README, print them from a shell, or grow them into faces, a scoot, and a terminal scene — only as far as you want. The mascot is warm and **unnamed**. Spell it **Mininja** (not “minija”).

Owned by [Thingscorp LLC](https://github.com/Thingscorp). The glyphs *are* the mark.

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

## Modules (Unix-small)

| Path | One job |
|------|---------|
| [`kit/`](kit/) | Glyphs + numbers (SoT). Nothing else. |
| [`adapters/`](adapters/) | Tiny filters: strings · ANSI · React. |
| [`examples/`](examples/) | Compose adapters. No business logic. |
| [`assets/`](assets/) | Monochrome SVG/PNG per face. |
| [`console/`](console/) | Optional terminal buddy (aligns to kit). |
| [`bot/`](bot/) | Optional Mac launcher — calls `../console`, never vendors a second UI. |

Root docs narrate. Numbers live in `kit/` — fork or overlay when you mean to.  
Brand law: [`STYLEGUIDE.md`](STYLEGUIDE.md) · [`CONSTRUCTION.md`](CONSTRUCTION.md) · [`BRAND-RULES.md`](BRAND-RULES.md) · [`TRADEMARK.md`](TRADEMARK.md) · [`SCENERY.md`](SCENERY.md) · [`TERMINAL-MOTION.md`](TERMINAL-MOTION.md).

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
