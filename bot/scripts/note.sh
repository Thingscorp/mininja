#!/bin/sh
# Append one dated row to the ledger. Never rewrites.
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
file="$ROOT/.mininja/progress.md"
[ -f "$file" ] || { echo "note: missing $file" >&2; exit 1; }
msg="$*"
[ -n "$msg" ] || { echo "usage: mininja note <text>" >&2; exit 2; }
printf -- '- %s — %s\n' "$(date +%F)" "$msg" >> "$file"
