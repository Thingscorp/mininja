#!/usr/bin/env bash
# 60s path: print a Mininja face (Node for moods; idle works without).
set -euo pipefail
ROOT="$(cd "${BASH_SOURCE[0]%/*}/.." && pwd)"
FACE="${1:-idle}"

idle_printf() {
  printf '%s\n' '▚████' '██ ●●' '▀▀▀▀▀'
}

usage() {
  cat <<'H'
Usage: ./examples/cli-banner.sh [face|--list|--help]

  (no args)   idle lockup
  FACE        mood from kit/mark.json (needs Node)
  --list      face ids
  --help      this text

Idle always works. Other faces need Node on PATH.
H
}

case "$FACE" in
  -h|--help|help)
    usage
    exit 0
    ;;
  --list|list|-l)
    if ! command -v node >/dev/null 2>&1; then
      echo "list needs Node (kit/mark.json faces)." >&2
      exit 1
    fi
    node --input-type=module -e "
import { listFaces } from '${ROOT}/adapters/mark/lockup.mjs';
process.stdout.write(listFaces().join('\n') + '\n');
"
    exit 0
    ;;
esac

if ! command -v node >/dev/null 2>&1; then
  if [[ "$FACE" != "idle" ]]; then
    echo "Node not found; printing idle. Install Node for face '$FACE'." >&2
  fi
  idle_printf
  exit 0
fi

node --input-type=module -e "
import { listFaces } from '${ROOT}/adapters/mark/lockup.mjs';
import { ansiLockup } from '${ROOT}/adapters/ansi/render.mjs';
const face = process.argv[1];
const known = listFaces();
if (!known.includes(face)) {
  console.error('unknown face: ' + face);
  console.error('try: ' + known.join(', '));
  process.exit(1);
}
process.stdout.write(ansiLockup(face) + '\n');
" "$FACE"
