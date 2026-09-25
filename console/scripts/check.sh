#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== typecheck =="
npm run typecheck

echo "== unit =="
npm test

echo "ALL GATES PASS"
