# examples/ — first face in ~60s

Compose adapters. No business logic. Mascot has no name.

| Path | Does |
|------|------|
| [`cli-banner.sh`](cli-banner.sh) | Print a face in your terminal |
| [`readme-badge.md`](readme-badge.md) | Copy-paste idle lockup for any README |
| [`remix/`](remix/) | Overlay one face / scene speeds without forking console |

```bash
./examples/cli-banner.sh              # idle (printf fallback if no Node)
./examples/cli-banner.sh allowed      # face + ANSI tone (Node)
./examples/cli-banner.sh allowed -p   # same face, plain (no ANSI)
./examples/cli-banner.sh allowed --facing left
./examples/cli-banner.sh --list       # face ids from kit/mark.json
```

**Node vs no-Node:** idle always prints. Moods, `--list`, `--facing`, and ANSI need Node on PATH.

Presence: **mark** here → **faces** via adapters → scoot / scene later ([`PORTING.md`](../PORTING.md)).
