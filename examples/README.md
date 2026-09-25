# examples/ — 60-second crush

Compose adapters. No business logic.

| Path | Does |
|------|------|
| [`cli-banner.sh`](cli-banner.sh) | Print a face in your terminal |
| [`readme-badge.md`](readme-badge.md) | Copy-paste idle lockup for any README |
| [`remix/`](remix/) | Overlay one face / scene bits without forking console |

```bash
./examples/cli-banner.sh           # idle (printf fallback if no Node)
./examples/cli-banner.sh allowed   # face + ANSI tone (Node)
./examples/cli-banner.sh --list    # face ids from kit/mark.json
```

Presence: **mark** here → **faces** via adapters → scoot / scene later ([`PORTING.md`](../PORTING.md)).
