#!/usr/bin/env bash
# 60s path: print a Mininja face. Idle works without Node; moods need Node.
# Run from anywhere — resolves the repo root from this script.
set -euo pipefail
ROOT="$(cd "${BASH_SOURCE[0]%/*}/.." && pwd)"
FACE="idle"
COLOR=1
FACING="right"

idle_printf() {
  printf '%s\n' '▚████' '██ ●●' '▀▀▀▀▀'
}

usage() {
  cat <<'H'
Usage: ./examples/cli-banner.sh [face] [options]

  (no args)     idle lockup (ANSI tone if Node is on PATH)
  FACE          mood from kit/mark.json (needs Node)
  --list        face ids from kit
  --plain, -p   no ANSI color
  --facing DIR  left | right (default: right)
  --help        this text

Idle always works (printf fallback if Node is missing).
Other faces / facing need Node on PATH.

Examples:
  ./examples/cli-banner.sh
  ./examples/cli-banner.sh allowed
  ./examples/cli-banner.sh allowed -p
  ./examples/cli-banner.sh allowed --facing left
  ./examples/cli-banner.sh --list
H
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help|help)
      usage
      exit 0
      ;;
    --list|list|-l)
      if ! command -v node >/dev/null 2>&1; then
        echo "cli-banner: --list needs Node (reads kit/mark.json faces)." >&2
        exit 1
      fi
      node --input-type=module -e "
import { listFaces } from '${ROOT}/adapters/mark/lockup.mjs';
process.stdout.write(listFaces().join('\n') + '\n');
"
      exit 0
      ;;
    --plain|-p)
      COLOR=0
      shift
      ;;
    --facing)
      if [[ $# -lt 2 ]]; then
        echo "cli-banner: --facing requires left or right" >&2
        exit 1
      fi
      FACING="$2"
      if [[ "$FACING" != "left" && "$FACING" != "right" ]]; then
        echo "cli-banner: facing must be left or right (got: ${FACING})" >&2
        exit 1
      fi
      shift 2
      ;;
    -*)
      echo "cli-banner: unknown option: $1 (try --help)" >&2
      exit 1
      ;;
    *)
      FACE="$1"
      shift
      ;;
  esac
done

if ! command -v node >/dev/null 2>&1; then
  if [[ "$FACE" != "idle" || "$FACING" != "right" ]]; then
    echo "cli-banner: Node not found — printing idle (right). Install Node for faces / facing." >&2
  fi
  idle_printf
  exit 0
fi

node --input-type=module -e "
import { hasFace, listFaces } from '${ROOT}/adapters/mark/lockup.mjs';
import { ansiLockup } from '${ROOT}/adapters/ansi/render.mjs';
const face = process.argv[1];
const color = process.argv[2] === '1';
const facing = process.argv[3];
if (!hasFace(face)) {
  console.error('cli-banner: unknown face: ' + face);
  console.error('try: ' + listFaces().join(', '));
  console.error('(or: ./examples/cli-banner.sh --list)');
  process.exit(1);
}
process.stdout.write(ansiLockup(face, { color, facing }) + '\n');
" "$FACE" "$COLOR" "$FACING"
