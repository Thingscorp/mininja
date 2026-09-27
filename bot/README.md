# Mininja Bot

Optional Mac launcher: Mininja console programs plus **named teammates** on a computer you choose.

This folder is a lean launcher. It does **not** ship a second React console — for the web buddy see [`../console`](../console). Brand SoT remains the repo root (`kit/`, adapters, examples).

## Status

The local HTTP UI (`static/` + `server.py`) is intentional launcher scaffolding, not a second React console. **Composer grammar SoT for the Mac launcher** (one mouth). The React [`../console`](../console) now **shares the same grammar** (`lib/mention.ts` + bot-api client) so product has one mouth for pals + programs — see Composer contract below. Do not invent a third divergent grammar.

## Composer contract (one mouth)

Product intent: type to **any pal anytime** without sidebar-first targeting. Sidebar remains a fallback for focus / tint.

| Input | Route |
|-------|--------|
| `@Ada do X` | Task to pal Ada (roster match, case-insensitive). No sidebar click required. |
| `@Ada @Bea do X` | **Fan-out** — same body to each named pal (parallel start). Cap `maxParallel` from host-config (default 4); refuse above that (no partial surprise). Empty body → multi-focus only. Unknown in the run → error (no silent skip). Mixed `@Ada @console` → single-mention on the first token. |
| `@all …` | **Rally-all** — emergency blast to every idle pal (`POST /api/rally`). Skips pals already working. |
| `@console now` | Console program engine |
| bare `now` / `todo` / … | Console programs **when** sidebar target is `console` |
| bare text with a pal selected | Task to that pal (legacy sidebar behavior) |
| `stop` / `pull` / `stop @Ada` | **Pull-off** mid-job (`POST /api/bots/:id/stop`) |
| `retarget @Bob remaining work` | **Retarget** — stop current focus (or selected) and assign to Bob (`POST /api/bots/:from/retarget`) |

Autocomplete: typing `@` opens a Linear-minimal roster dropdown under the composer (`@all`, pals, `@console`).

Guards: `maxParallel` (host-config, default 4); silent double-assign still refused (`already working`) unless `retarget: true` or the explicit `retarget` / retarget API. Permission modes `draft` / `auto` / `free` unchanged. Tint stays host-side (`console/tint.py`) — no kit pal-color tables.

React console shares this grammar (`console/src/lib/mention.ts`); teammate HTTP still terminates here. CORS enabled for console origins; Vite may proxy `/bot-api`.

## Quick start

```bash
cd bot
./mininja
```

Opens `http://127.0.0.1:8787/`.

```bash
./mininja cmd now       # one JSON card on stdout
./mininja tint Ada      # stable #rrggbb for a name
./mininja config        # host settings (file SoT)
./mininja check         # last line: ALL GATES PASS
```

Double-clickable app (optional):

```bash
./scripts/install-app.sh
```


## Config (host settings — CLI SoT)

Host settings live in a JSON file beside credentials — **not** a settings screen.

```text
$MININJA_DATA/host-config.json
# default: ~/Library/Application Support/MininjaBot/host-config.json
```

Schema: `{ "v": 1, …keys }`. Missing file → built-in defaults.

| Aspect | Key | Default | Notes |
|--------|-----|---------|-------|
| general | `defaultMode` | `auto` | `draft` / `auto` / `free` — used when spawn omits mode |
| habitat | `showPlants` | `true` | bool |
| habitat | `showSticky` | `true` | bool |
| composer | `maxParallel` | `4` | int, clamp 1–16 — `start_task` / rally / fan-out |
| appearance | `reducedMotion` | `false` | stock only; no provider themes |
| connection | *(env / console)* | — | bot URL is env/`VITE_BOT_URL`; `GET /api/host-config` may show `botListen` |
| keys | *(slots)* | — | `mininja config keys` lists credential **labels** only |
| cloud | *(env)* | — | `mininja config cloud` → MININJA_CLOUD_* set yes/no (hostname OK) |

```bash
./mininja config                 # list all
./mininja config get maxParallel
./mininja config set maxParallel 6
./mininja config set defaultMode draft
./mininja config unset maxParallel
./mininja config keys            # credential slot labels (no secrets)
./mininja config cloud           # remote env presence
./mininja config path
./mininja config --json          # machine-readable
```

Server reads `maxParallel` / `defaultMode` live from the file (constant `MAX_PARALLEL = 4` is fallback only). Read-only HTTP: `GET /api/host-config`. Writes stay CLI-only. See [`../qa/SETTINGS.md`](../qa/SETTINGS.md).

## Programs

`now` `todo` `plan` `brief` `look` `pgeon` `refine` `turn` `save` `compound` `qa` `ralph` `help` `offline` `wake` `clear`

A program returns a card. Last stream text feeds the next program (`save`, `turn`, `pgeon ask s1`).

## Teammates

Create a teammate with a name, job, standing instructions, and a computer:

| computer | where it runs |
|----------|----------------|
| `local`  | this Mac |
| `remote` | SSH host from `MININJA_CLOUD_HOST` |
| `codex`  | ChatGPT Codex CLI on this Mac |

Remote is **opt-in**. Set environment variables — nothing private is hardcoded:

```bash
export MININJA_CLOUD_HOST=your-ssh-host
export MININJA_REMOTE_HOME=/home/you          # optional
export MININJA_REMOTE_GROK=/home/you/.grok/bin/grok
export MININJA_REMOTE_ROOT=/home/you/mininja-cloud
```

## LLM keys (per pal)

Product seam (Russ, 2026-09-26): **each pal can bind an LLM / provider key independently**. Operators **MAY** give every pal its own key, or point several pals at **one shared** key. The whole assign → use → change → unshare flow **MUST** be conductible and editable in the host (this bot / later console absorb) — not a one-shot env only.

| Rule | Intent |
|------|--------|
| Per-pal bind | Roster entry references a credential slot id — not a raw key in git |
| Share or split | Many pals → one slot, or 1:1 — operator choice, revisable anytime |
| No kit secrets | Keys never live in [`../kit`](../kit) or recipe JSON ([`../RECIPES.md`](../RECIPES.md)) |
| Apps owns UI | Linear-quality assign / use / change / unshare in the bot Edit dialog |

### Storage (host-only)

```text
$MININJA_DATA/credentials.json
# default: ~/Library/Application Support/MininjaBot/credentials.json
```

Schema (no secrets in git):

| Field | Meaning |
|-------|---------|
| `slots[id].label` | Operator-facing name (`claude`, `shared-xai`) |
| `slots[id].kind` | `env` (preferred) or `local` (masked paste, host file only) |
| `slots[id].env` | Env var to resolve, e.g. `ANTHROPIC_API_KEY` |
| `slots[id].provider` | `anthropic` · `openai` · `xai` · `other` |
| `slots[id].secret` | Optional; **only** for `kind=local`; never returned by API |
| `bots[].credential_id` | Binding on the roster entry (many pals may share one slot) |

Public APIs return metadata only (`has_secret`, label, env, provider, `bound_pal_ids`). Raw values never appear in `/api/state` or SSE.

| Verb | How |
|------|-----|
| **Assign** | Edit pal → pick slot (or **new** env/local) → save (`PATCH /api/bots/:id` with `credential_id`) |
| **Use** | Local run resolves slot → injects env for the subprocess; UI shows `using slot X for pal Y` |
| **Change** | Edit → pick another slot → save |
| **Unshare** | Edit → **unshare** / `credential_id: null`, or delete the slot (`DELETE /api/credentials/:id` clears all bindings) |

Endpoints: `GET/POST /api/credentials`, `PATCH/DELETE /api/credentials/:id`, `GET/POST /api/bots/:id/credential`. Local runs **fail closed** when unbound.

Host chrome stays stock Mininja tokens (no LLM-provider brand tints). Custom colors later = user-driven, not Apps inventing provider palettes.

## State

Runtime state lives in the platform application-support directory:

```text
~/Library/Application Support/MininjaBot/
```

(Override with `MININJA_DATA` if you need a custom location.)

## Layout

```
bot/
  mininja           # dispatcher
  server.py         # local HTTP + SSE
  console/          # Python program engine (not the React app)
  static/           # UI (IBM Plex Mono under static/fonts/OFL.txt)
  scripts/          # cmd, tint, config, seed, check, install-app
  seed/pages.txt    # public docs catalog (snapshots not vendored)
```

