# Mininja Bot

Optional Mac launcher: Mininja console programs plus **named teammates** on a computer you choose.

This folder is a lean launcher. It does **not** ship a second React console — for the web buddy see [`../console`](../console). Brand SoT remains the repo root (`kit/`, adapters, examples).

## Status

The local HTTP UI (`static/` + `server.py`) is intentional launcher scaffolding, not a second React console. **Multi-pal composer lives here** (one mouth). The React [`../console`](../console) stays the program shell until a later absorb — see Composer contract below.

## Composer contract (one mouth)

Product intent: type to **any pal anytime** without sidebar-first targeting. Sidebar remains a fallback for focus / tint.

| Input | Route |
|-------|--------|
| `@Ada do X` | Task to pal Ada (roster match, case-insensitive). No sidebar click required. |
| `@all …` | **Rally-all** — emergency blast to every idle pal (`POST /api/rally`). Skips pals already working. |
| `@console now` | Console program engine |
| bare `now` / `todo` / … | Console programs **when** sidebar target is `console` |
| bare text with a pal selected | Task to that pal (legacy sidebar behavior) |
| `stop` / `pull` / `stop @Ada` | **Pull-off** mid-job (`POST /api/bots/:id/stop`) |
| `retarget @Bob remaining work` | **Retarget** — stop current focus (or selected) and assign to Bob (`POST /api/bots/:from/retarget`) |

Autocomplete: typing `@` opens a Linear-minimal roster dropdown under the composer (`@all`, pals, `@console`).

Guards: `MAX_PARALLEL` (4); silent double-assign still refused (`already working`) unless `retarget: true` or the explicit `retarget` / retarget API. Permission modes `draft` / `auto` / `free` unchanged. Tint stays host-side (`console/tint.py`) — no kit pal-color tables.

## Quick start

```bash
cd bot
./mininja
```

Opens `http://127.0.0.1:8787/`.

```bash
./mininja cmd now       # one JSON card on stdout
./mininja tint Ada      # stable #rrggbb for a name
./mininja check         # last line: ALL GATES PASS
```

Double-clickable app (optional):

```bash
./scripts/install-app.sh
```

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
  scripts/          # cmd, tint, seed, check, install-app
  seed/pages.txt    # public docs catalog (snapshots not vendored)
```

