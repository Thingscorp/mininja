# examples/ — first face in ~60s

Compose adapters. No business logic. Mascot has no name.

| Path | Does |
|------|------|
| [`cli-banner.sh`](cli-banner.sh) | Print a face in your terminal |
| [`readme-badge.md`](readme-badge.md) | Copy-paste idle lockup for any README |
| [`remix/`](remix/) | Overlay one face / scene speeds without forking console |
| [`react/`](react/) | `<pre>` contract + React host wiring |
| [`presence/`](presence/) | Working slots (idle + search) + Messaged chip |

```bash
./examples/cli-banner.sh              # idle (printf fallback if no Node)
./examples/cli-banner.sh allowed      # face + ANSI tone (Node)
./examples/cli-banner.sh allowed -p   # same face, plain (no ANSI)
./examples/cli-banner.sh allowed --facing left
./examples/cli-banner.sh --list       # face ids from kit/mark.json

cd examples/remix && node ./print-face.mjs allowed   # ◆◆ overlay eyes
node ./print-face.mjs wink                           # eyes-only; from-kit derives lines
node ./print-face.mjs --motion                       # scene-overlay speeds vs upstream

./examples/react/preview.mjs          # DOM contract (no React install)
./examples/react/preview.mjs allowed --stage dock --action wave

./examples/presence/preview.mjs              # idle + search + chip
./examples/presence/preview.mjs --html > /tmp/mininja-presence.html
./examples/presence/preview.mjs --list-actions
```

**Node vs no-Node:** idle always prints via `cli-banner.sh`. Moods, `--list`, `--facing`, ANSI, remix, React preview, and presence preview need Node on PATH.

Presence ladder: **mark** here → **faces** via adapters → scoot / scene later ([`PORTING.md`](../PORTING.md)). Kit is SoT; motion seams are kit action ids on `data-motion` / `data-state`.
