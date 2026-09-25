#!/usr/bin/env bash
# Level 1–2: print Mininja in a terminal (requires Node).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
node --input-type=module -e "
import { ansiLockup } from '${ROOT}/adapters/ansi/render.mjs';
const face = process.argv[1] || 'idle';
console.log(ansiLockup(face));
console.log('mininja — Thingscorp LLC');
" "${1:-idle}"
