#!/bin/sh
# Orchestrate fetch then diff. Writes seed/official/<date>/ and diff.txt.
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
SEED="$ROOT/seed/official"
mkdir -p "$SEED"

prev=""
if [ -f "$SEED/LATEST" ]; then
  prev="$(tr -d '[:space:]' < "$SEED/LATEST")"
fi

stamp="$(python3 "$ROOT/scripts/seed.py")"
stamp="$(printf '%s' "$stamp" | tr -d '[:space:]')"
[ -n "$stamp" ] || { echo "seed: empty stamp" >&2; exit 1; }
[ -d "$SEED/$stamp" ] || { echo "seed: missing $SEED/$stamp" >&2; exit 1; }

if [ -z "$prev" ] || [ "$prev" = "$stamp" ]; then
  prev="$(ls -1 "$SEED" | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' | grep -v "^$stamp$" | tail -n 1 || true)"
fi

if [ -n "$prev" ] && [ -d "$SEED/$prev" ]; then
  python3 "$ROOT/scripts/seed-diff.py" "$SEED/$prev" "$SEED/$stamp" > "$SEED/diff.txt"
else
  python3 "$ROOT/scripts/seed-diff.py" "$SEED/$stamp" > "$SEED/diff.txt"
fi

printf '%s\n' "$stamp" > "$SEED/LATEST"

# never copy official marks into the UI
if [ -d "$ROOT/static/seed" ]; then
  echo "seed: static/seed must not exist" >&2
  exit 1
fi

echo "$stamp"
