# Settings — CLI is SoT

Host settings for Mininja (modes, habitat toggles, composer fan-out cap, appearance) are **CLI + file**, not a settings screen.

| Piece | Where |
|-------|--------|
| SoT file | `$MININJA_DATA/host-config.json` (beside `credentials.json`) |
| CLI | `bot/mininja config` → `bot/scripts/config.py` |
| Library | `bot/console/host_config.py` |
| HTTP (read-only) | `GET /api/host-config` |
| Writes | CLI only (`set` / `unset` / `reset`) |

## Why no UI yet

Russ pivot: stop settings **screen** work; ship Unix filters first. A React `/settings` or localStorage settings UI is **out of scope** for this tip — do not ship half-done chrome. UI later if ever, reading the same file / API.

## Cheat sheet

```bash
cd bot
./mininja config
./mininja config get maxParallel
./mininja config set maxParallel 6
./mininja config set defaultMode draft
./mininja config unset showPlants
./mininja config keys
./mininja config cloud
./mininja config path
```

Credential **secrets** stay in `credentials.json` / env — `config keys` prints ids/labels only.

Cloud remote identity stays env (`MININJA_CLOUD_*`); `config cloud` shows presence, not secret values (hostname OK).

## What the server honors live

- `maxParallel` — `start_task`, `rally_all`, fan-out refuse (constant `MAX_PARALLEL = 4` is fallback only)
- `defaultMode` — `new_bot` when payload omits `mode`

Habitat / appearance keys are stored for host chrome; wiring into UI is optional later.
