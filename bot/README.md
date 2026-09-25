# Mininja Bot

Optional Mac launcher: Mininja console programs plus **named teammates** on a computer you choose.

This folder is a lean launcher. It does **not** ship a second React console — for the web buddy see [`../console`](../console). Brand SoT remains the repo root (`kit/`, adapters, examples).

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

(Override with `MININJA_BOT_DATA` if you need a custom location.)

## Layout

```
bot/
  mininja           # dispatcher
  server.py         # local HTTP + SSE
  console/          # Python program engine (not the React app)
  static/           # UI
  scripts/          # cmd, tint, seed, check, install-app
  seed/pages.txt    # public docs catalog (snapshots not vendored)
```

## Local HTTP UI

The local HTTP UI (`static/` + `server.py`, served at `http://127.0.0.1:8787/` via `./mininja`) is **intentional for now**. Whether it stays, moves, or is replaced is a product call deferred — do not strip it in scrub or cleanup passes.
