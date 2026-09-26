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
./examples/remix/print-face.mjs allowed          # ◆◆ overlay eyes
./examples/remix/print-face.mjs wink --facing left
./examples/remix/print-face.mjs --motion         # scene-overlay speeds vs upstream

# DOM contract (no React install)
./examples/react/preview.mjs
./examples/react/preview.mjs allowed --stage dock --action wave
./examples/react/preview.mjs idle --facing left

# presence — slots + Messaged chip + sidebar roster
./examples/presence/preview.mjs
./examples/presence/preview.mjs --html > /tmp/mininja-presence.html
./examples/presence/preview.mjs --list-actions
```

**Node vs no-Node:** idle always prints via `cli-banner.sh`. Moods, `--list`, `--facing`, ANSI, remix, React preview, and presence preview need Node on PATH. Scripts resolve the repo from their own path — run them from anywhere.

Presence ladder: **mark** here → **faces** via adapters → scoot / scene later ([`PORTING.md`](../PORTING.md)). Kit is SoT; motion seams are kit action ids on `data-motion` / `data-state`.
