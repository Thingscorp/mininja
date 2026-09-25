#!/usr/bin/env bash
# 60s path: print a face in the terminal (Node).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FACE="${1:-idle}"
node --input-type=module -e "
import { ansiLockup } from '${ROOT}/adapters/ansi/render.mjs';
process.stdout.write(ansiLockup(process.argv[1]) + '\n');
" "$FACE"
