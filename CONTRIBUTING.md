# Contributing

Thanks for contributing to the Mininja brand record.

## The ground rules

- **The machine kit is the source of truth.** Edit `kit/mark.json` or `kit/scene.json`
  first, then update the markdown docs that narrate the same numbers. Never
  hand-type glyphs, eye pairs, stage ids, or motion constants — pull them from
  the kit (see [PORTING.md](PORTING.md)'s port checklist).
- **The mascot has no name.** Never add a personal name to HUD copy, alt text,
  package titles, or filenames. Alt text stays "Mininja mark".
- **Don't invent brand law.** Clearspace, minimum sizes, the monochrome rule,
  and the don'ts live in [BRAND-RULES.md](BRAND-RULES.md) — propose changes
  against that document, not around it.
- Keep exports consistent: a new expression state ships as SVG **and** PNG in
  `assets/`, a row in `assets/README.md`, and a face entry in `kit/mark.json`.

## How to contribute

1. Open an issue or PR describing the change (new face, port fix, doc
   correction).
2. Keep the diff minimal and scoped to one change.
3. Reference the doc or kit value your change follows.

## License

Contributions are licensed under the same [MIT](LICENSE) terms as the repo.
