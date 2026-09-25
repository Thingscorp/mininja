#!/usr/bin/env bash
# Gate. Last stdout line on success is ALL GATES PASS.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
FAIL=0

ok() { printf 'OK  %s\n' "$1"; }
bad() {
  printf 'XX  %s\n' "$1" >&2
  if [ -n "${2:-}" ]; then
    printf '%s\n' "$2" >&2
  fi
  FAIL=1
}

assert_json_title() {
  local file="$1" want="$2"
  python3 - "$file" "$want" <<'PY'
import json, sys
path, want = sys.argv[1], sys.argv[2]
raw = open(path).read()
if raw.count("\n") != 1 or not raw.endswith("\n"):
    raise SystemExit("stdout must be one JSON line")
card = json.loads(raw)
if card.get("title") != want:
    raise SystemExit(f"title {card.get('title')!r} != {want!r}")
PY
}

DATA="$(mktemp -d)"
export MININJA_DATA="$DATA"
cleanup() { rm -rf "$DATA"; }
trap cleanup EXIT

# --- compile ---
if python3 -m py_compile server.py cloud.py console/engine.py console/paths.py console/store.py console/tint.py \
    scripts/cmd.py scripts/cmd-smoke.py scripts/store-lock.py scripts/seed.py scripts/seed-diff.py scripts/sidecar.py scripts/tint.py; then
  ok "py_compile"
else
  bad "py_compile"
fi

# --- server uses shared paths ---
if grep -q 'from console.paths import' server.py && grep -q 'from console.store import' server.py; then
  ok "server-on-store"
else
  bad "server-on-store" "server.py must import console.paths and console.store"
fi
if grep -q 'ALIASES' server.py; then
  ok "server-aliases"
else
  bad "server-aliases" "UI command list must include engine aliases"
fi
if grep -q 'name_tint' server.py; then
  ok "server-tint"
else
  bad "server-tint" "public_state must attach tint from console.tint"
fi

# --- brand ---
if grep -Eiq 'grok' static/index.html; then
  bad "brand-html" "static/index.html still contains grok"
else
  ok "brand-html"
fi
if [ -e static/logo-grok.svg ]; then
  bad "brand-asset" "static/logo-grok.svg must not exist"
else
  ok "brand-asset"
fi
if [ -d static/seed ]; then
  bad "brand-seed-bleed" "official seed must not live under static/"
else
  ok "brand-seed-bleed"
fi

# --- host-attach stays blocked ---
if grep -R --include='*.py' -n 'mininja_capture' . >"$DATA/host.txt" 2>/dev/null; then
  bad "host-attach" "$(cat "$DATA/host.txt")"
else
  ok "host-attach-absent"
fi

if grep -q 'exec .*mininja' grokbot; then
  ok "compat-stub"
else
  bad "compat-stub" "grokbot must exec mininja"
fi

# --- cmd filter ---

if ! ./mininja cmd now >"$DATA/now.json" 2>"$DATA/now.err"; then
  bad "cmd-now" "$(cat "$DATA/now.err")"
elif [ -s "$DATA/now.err" ]; then
  bad "cmd-now-silence" "$(cat "$DATA/now.err")"
elif ! assert_json_title "$DATA/now.json" now; then
  bad "cmd-now-json" "$(cat "$DATA/now.json")"
else
  ok "cmd-now"
fi

if ./mininja cmd not-a-program >"$DATA/unk.json" 2>"$DATA/unk.err"; then
  bad "cmd-unknown-exit" "unknown program exited 0"
else
  if [ ! -s "$DATA/unk.err" ]; then
    bad "cmd-unknown-stderr" "unknown program must fail loudly"
  elif ! python3 -c 'import json,sys; json.load(open(sys.argv[1]))' "$DATA/unk.json"; then
    bad "cmd-unknown-json"
  else
    ok "cmd-unknown"
  fi
fi

printf 'not json' > "$DATA/console.json"
if ./mininja cmd help >"$DATA/corrupt.out" 2>"$DATA/corrupt.err"; then
  bad "cmd-corrupt" "corrupt console.json must not succeed"
else
  ok "cmd-corrupt"
fi
rm -f "$DATA/console.json"

if ! ./mininja cmd brief >"$DATA/brief.json" 2>"$DATA/brief.err"; then
  bad "cmd-brief" "$(cat "$DATA/brief.err")"
elif ! ./mininja cmd save >"$DATA/save.json" 2>"$DATA/save.err"; then
  bad "cmd-save" "$(cat "$DATA/save.err")"
else
  if python3 - "$DATA/save.json" <<'PY'
import json, sys
card = json.loads(open(sys.argv[1]).read())
tag = str(card.get("tag") or "")
if card.get("title") != "save" or not tag.startswith("s"):
    raise SystemExit(f"save did not keep stream: {card}")
PY
  then
    ok "cmd-compose"
  else
    bad "cmd-compose" "$(cat "$DATA/save.json")"
  fi
fi

if ./mininja cmd >/dev/null 2>"$DATA/usage.err"; then
  bad "cmd-usage" "missing program must exit non-zero"
else
  ok "cmd-usage"
fi

printf '[]\n' > "$DATA/console.json"
if ./mininja cmd now >/dev/null 2>"$DATA/arr.err"; then
  bad "cmd-array" "JSON array console.json must fail"
else
  ok "cmd-array"
fi
rm -f "$DATA/console.json"

if printf 'now\n' | ./mininja cmd - >"$DATA/dash.json" 2>"$DATA/dash.err"; then
  if [ -s "$DATA/dash.err" ]; then
    bad "cmd-stdin-silence" "$(cat "$DATA/dash.err")"
  elif ! assert_json_title "$DATA/dash.json" now; then
    bad "cmd-stdin-json" "$(cat "$DATA/dash.json")"
  else
    ok "cmd-stdin"
  fi
else
  bad "cmd-stdin" "$(cat "$DATA/dash.err")"
fi

if python3 scripts/cmd-smoke.py >"$DATA/smoke.out" 2>"$DATA/smoke.err"; then
  ok "cmd-smoke"
else
  bad "cmd-smoke" "$(cat "$DATA/smoke.err")"
fi

mkdir -p "$DATA/lock"
if MININJA_DATA="$DATA/lock" python3 scripts/store-lock.py >"$DATA/lock.out" 2>"$DATA/lock.err"; then
  ok "store-lock"
else
  bad "store-lock" "$(cat "$DATA/lock.err")"
fi

if ./mininja nope >/dev/null 2>"$DATA/nope.err"; then
  bad "dispatcher" "unknown subcommand exited 0"
else
  ok "dispatcher"
fi

# --- name tint ---
if python3 - <<'PY'
from console.tint import STEEL, tint
if tint("") != STEEL or tint("  ") != STEEL:
    raise SystemExit("empty name must be steel")
if tint("Piper") != tint("piper"):
    raise SystemExit("tint is case-sensitive")
names = ["Piper", "Scout", "Cloud", "WSL", "Codex"]
cols = [tint(n) for n in names]
if any(len(c) != 7 or not c.startswith("#") for c in cols):
    raise SystemExit(f"bad hex {cols}")
if len(set(cols)) != len(names):
    raise SystemExit(f"roster collision {list(zip(names, cols))}")
PY
then
  ok "tint-roster"
else
  bad "tint-roster"
fi
if ! ./mininja tint Piper >"$DATA/tint.out" 2>"$DATA/tint.err"; then
  bad "tint-cmd" "$(cat "$DATA/tint.err")"
elif [ -s "$DATA/tint.err" ]; then
  bad "tint-silence" "$(cat "$DATA/tint.err")"
elif ! grep -Eq '^#[0-9a-f]{6}$' "$DATA/tint.out"; then
  bad "tint-hex" "$(cat "$DATA/tint.out")"
else
  ok "tint-cmd"
fi
lockups=$(grep -c 'id="mascot"' static/index.html || true)
if [ "$lockups" -eq 1 ] && grep -q 'id="banner"' static/index.html && grep -q '>MININJA<' static/index.html \
   && ! grep -q 'class="stage"' static/index.html \
   && ! grep -q 'lockup mini' static/index.html \
   && ! grep -q 'guyHtml' static/index.html; then
  ok "tint-ui"
else
  bad "tint-ui" "grove banner + one lockup; MININJA wordmark; none in the feed"
fi

# --- seed-diff is a pure filter ---
A="$DATA/snap-a"
B="$DATA/snap-b"
mkdir -p "$A" "$B"
printf 'alpha\n' > "$A/overview.md"
printf 'beta\n' > "$B/overview.md"
printf 'new\n' > "$B/mobile.md"
printf '{"stamp":"old"}\n' > "$A/manifest.json"
printf '{"stamp":"new"}\n' > "$B/manifest.json"
if ! python3 scripts/seed-diff.py "$A" "$B" >"$DATA/diff.out"; then
  bad "seed-diff"
else
  if grep -q '^changed: 1$' "$DATA/diff.out" && grep -q '^added: 1$' "$DATA/diff.out" && grep -q 'mobile.md' "$DATA/diff.out"; then
    ok "seed-diff"
  else
    bad "seed-diff-content" "$(cat "$DATA/diff.out")"
  fi
fi

mkdir -p "$DATA/same-a" "$DATA/same-b"
printf 'x\n' > "$DATA/same-a/a.md"
cp "$DATA/same-a/a.md" "$DATA/same-b/a.md"
if python3 scripts/seed-diff.py "$DATA/same-a" "$DATA/same-b" | grep -q '^unchanged: 1$'; then
  ok "seed-diff-identical"
else
  bad "seed-diff-identical"
fi
if python3 scripts/seed-diff.py "$DATA/missing" "$DATA/same-b" >/dev/null 2>"$DATA/miss.err"; then
  bad "seed-diff-missing" "missing dir must fail"
else
  ok "seed-diff-missing"
fi

# --- official snapshot artifacts ---
if [ ! -f seed/official/LATEST ] || [ ! -f seed/official/diff.txt ]; then
  bad "seed-artifacts" "run ./mininja seed"
else
  stamp="$(tr -d '[:space:]' < seed/official/LATEST)"
  if [ ! -d "seed/official/$stamp" ] || [ ! -f "seed/official/$stamp/manifest.json" ]; then
    bad "seed-snapshot" "missing seed/official/$stamp/manifest.json"
  else
    if python3 - "$stamp" <<'PY'
import json, sys
from pathlib import Path
stamp = sys.argv[1]
root = Path("seed/official") / stamp
man = json.loads((root / "manifest.json").read_text())
ok = [p for p in man.get("pages") or [] if p.get("status") == "ok"]
if len(ok) < 1:
    raise SystemExit("manifest has no ok pages")
for page in ok:
    path = root / page["file"]
    if not path.is_file() or path.stat().st_size != page["bytes"]:
        raise SystemExit(f"missing or size mismatch {path}")
diff = Path("seed/official/diff.txt").read_text()
if "official seed" not in diff:
    raise SystemExit("diff.txt missing header")
PY
    then
      ok "seed-artifacts"
    else
      bad "seed-snapshot-verify"
    fi
  fi
fi

# --- ledger ---
if [ ! -f .mininja/progress.md ]; then
  bad "ledger-missing"
elif ! grep -qE '^- 20[0-9]{2}-' .mininja/progress.md; then
  bad "ledger-rows" "progress.md has no dated rows"
else
  ok "ledger"
fi

if [ ! -f .mininja/GOAL.md ]; then
  bad "goal-lock"
else
  ok "goal-lock"
fi

if [ "$FAIL" -ne 0 ]; then
  echo "GATES FAILED" >&2
  exit 1
fi
echo "ALL GATES PASS"
