# examples/ — first face in ~60s

Compose adapters. No business logic. Mascot has no name.

| Path | Does |
|------|------|
| [`cli-banner.sh`](cli-banner.sh) | Print a face in your terminal |
| [`readme-badge.md`](readme-badge.md) | Copy-paste idle lockup for any README |
| [`remix/`](remix/) | Overlay one face / scene speeds without forking console |
| [`react/`](react/) | `<pre>` contract + React host wiring |
| [`presence/`](presence/) | Slots + Messaged chip + sidebar roster row |

```bash
# terminal face
./examples/cli-banner.sh              # idle (printf fallback if no Node)
./examples/cli-banner.sh allowed      # face + ANSI tone (Node)
./examples/cli-banner.sh allowed -p   # same face, plain (no ANSI)
./examples/cli-banner.sh allowed --facing left
./examples/cli-banner.sh --list       # face ids from kit/mark.json

# remix without forking console/
./examples/remix/print-face.mjs allowed
./examples/remix/print-face.mjs wink --facing left

# DOM contract (no React install)
./examples/react/preview.mjs
./examples/react/preview.mjs allowed --stage dock --action wave
./examples/react/preview.mjs idle --facing left

# presence (sway / pulse + chip) — see presence/
./examples/presence/preview.mjs
./examples/presence/preview.mjs --html > /tmp/mininja-presence.html
```

**Node vs no-Node:** idle always prints via `cli-banner.sh`. Moods, `--list`, `--facing`, ANSI, remix, and the React preview need Node on PATH. Scripts resolve the repo from their own path — run them from anywhere.

Presence: **mark** here → **faces** via adapters → scoot / scene later ([`PORTING.md`](../PORTING.md)).
