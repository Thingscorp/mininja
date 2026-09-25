"""Optional remote runner for Mininja bot teammates.

All host identity comes from the environment — nothing private is baked in:

  MININJA_CLOUD_HOST   SSH target (required to enable remote teammates)
  MININJA_REMOTE_HOME  Remote home (default: /home/$USER style via probe)
  MININJA_REMOTE_GROK  Remote grok binary path
  MININJA_REMOTE_ROOT  Remote working tree for runs
  MININJA_REMOTE_CWD   Default cwd for new remote teammates

SSH is expected to land in a POSIX shell (plain Linux or WSL bash). The
script payload is base64 so intermediate shells do not re-parse it.
"""
from __future__ import annotations

import base64
import os
import subprocess
import time
from pathlib import Path

CLOUD_HOST = os.environ.get("MININJA_CLOUD_HOST", "").strip()
REMOTE_HOME = os.environ.get("MININJA_REMOTE_HOME", "").strip() or str(Path.home())
REMOTE_GROK = os.environ.get("MININJA_REMOTE_GROK", "").strip() or f"{REMOTE_HOME}/.grok/bin/grok"
REMOTE_ROOT = os.environ.get("MININJA_REMOTE_ROOT", "").strip() or f"{REMOTE_HOME}/mininja-cloud"
DEFAULT_CWD = os.environ.get("MININJA_REMOTE_CWD", "").strip() or REMOTE_ROOT

_CACHE: dict = {"at": 0.0, "data": None}


def configured() -> bool:
    return bool(CLOUD_HOST)


def ssh_wsl(script: str) -> list[str]:
    if not CLOUD_HOST:
        raise RuntimeError("MININJA_CLOUD_HOST is not set")
    enc = base64.b64encode(script.encode()).decode("ascii").replace("\n", "")
    # Default: remote runs bash. Override MININJA_CLOUD_REMOTE_WRAP for WSL-via-ssh.
    wrap = os.environ.get("MININJA_CLOUD_REMOTE_WRAP", "").strip()
    if wrap == "wsl":
        remote = f'wsl -e bash -lc "printf %s {enc} | base64 -d | bash -l"'
    else:
        remote = f'bash -lc "printf %s {enc} | base64 -d | bash -l"'
    return [
        "ssh",
        "-o",
        "BatchMode=yes",
        "-o",
        "ConnectTimeout=8",
        CLOUD_HOST,
        remote,
    ]


def run_script(script: str, timeout: int = 30) -> tuple[int, str, str]:
    if not CLOUD_HOST:
        return 1, "", "MININJA_CLOUD_HOST is not set"
    proc = subprocess.run(
        ssh_wsl(script),
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    return proc.returncode, proc.stdout, proc.stderr


def probe(force: bool = False) -> dict:
    now = time.time()
    if not force and _CACHE["data"] is not None and now - _CACHE["at"] < 45:
        return _CACHE["data"]
    if not CLOUD_HOST:
        data = {"ok": False, "host": None, "error": "MININJA_CLOUD_HOST is not set"}
        _CACHE.update(at=now, data=data)
        return data
    script = r"""
export PATH="$HOME/.grok/bin:$HOME/.local/bin:$PATH"
echo HOST=$(hostname)
echo USER=$(whoami)
echo ARCH=$(uname -m)
grok --version || true
if test -r "$HOME/.grok/auth.json"; then echo AUTH=ok; else echo AUTH=missing; fi
python3 -c "import json;from pathlib import Path;p=Path.home()/'.grok'/'accounts.json';
print('EMAIL='+(json.loads(p.read_text()).get('activeEmail') or '') if p.is_file() else 'EMAIL=')" 2>/dev/null || true
mkdir -p "$HOME/mininja-cloud/runs"
test -x "$HOME/.grok/bin/grok" && echo GROK_BIN=ok || echo GROK_BIN=missing
"""
    try:
        code, out, err = run_script(script, timeout=25)
    except (OSError, subprocess.SubprocessError) as exc:
        data = {"ok": False, "host": CLOUD_HOST, "error": str(exc)}
        _CACHE.update(at=now, data=data)
        return data
    lines = {ln.split("=", 1)[0]: ln.split("=", 1)[-1] for ln in out.splitlines() if "=" in ln}
    version = next((ln for ln in out.splitlines() if ln.startswith("grok ")), None)
    data = {
        "ok": code == 0 and lines.get("GROK_BIN") == "ok" and lines.get("AUTH") == "ok",
        "host": CLOUD_HOST,
        "machine": lines.get("HOST"),
        "user": lines.get("USER"),
        "arch": lines.get("ARCH"),
        "version": version,
        "auth": lines.get("AUTH"),
        "email": lines.get("EMAIL"),
        "error": err.strip()[-400:] if code != 0 else None,
    }
    _CACHE.update(at=now, data=data)
    return data


def remote_cwd(bot: dict) -> str:
    cwd = (bot.get("cwd") or "").strip()
    if not cwd:
        return DEFAULT_CWD
    # Already a remote-style home path
    if REMOTE_HOME and cwd.startswith(REMOTE_HOME):
        return cwd
    if cwd.startswith("/home/"):
        return cwd
    # Map local home → remote home without baking a username
    home = str(Path.home())
    if cwd.startswith(home + "/") or cwd == home:
        return REMOTE_HOME + cwd[len(home) :]
    return DEFAULT_CWD


def start_run(run_id: str, cmd: list[str], cwd: str) -> tuple[bool, str]:
    import shlex

    if not CLOUD_HOST:
        return False, "MININJA_CLOUD_HOST is not set"
    quoted = " ".join(shlex.quote(part) for part in cmd)
    run_dir = f"{REMOTE_ROOT}/runs/{run_id}"
    script = f"""
set -e
export PATH="$HOME/.grok/bin:$HOME/.local/bin:$PATH"
export GROK_DISABLE_AUTOUPDATER=1
RUN={shlex.quote(run_dir)}
mkdir -p "$RUN"
mkdir -p {shlex.quote(cwd)}
touch "$RUN/out.jsonl"
cat > "$RUN/run.sh" << EOF
#!/bin/bash
export PATH="\\$HOME/.grok/bin:\\$HOME/.local/bin:\\$PATH"
export GROK_DISABLE_AUTOUPDATER=1
cd {shlex.quote(cwd)}
{quoted} > {shlex.quote(run_dir + "/out.jsonl")} 2> {shlex.quote(run_dir + "/err.log")}
echo \\$? > {shlex.quote(run_dir + "/exit")}
EOF
chmod +x "$RUN/run.sh"
SESS="mn-{run_id[:8]}"
tmux kill-session -t "$SESS" 2>/dev/null || true
tmux new-session -d -s "$SESS" "$RUN/run.sh"
tmux list-panes -t "$SESS" -F '#{{pane_pid}}' > "$RUN/pid"
echo STARTED
"""
    try:
        code, out, err = run_script(script, timeout=25)
    except (OSError, subprocess.SubprocessError) as exc:
        return False, str(exc)
    if code != 0 or "STARTED" not in out:
        return False, (out + "\n" + err).strip()[-800:] or f"ssh exit {code}"
    return True, run_id


def tail_cmd(run_id: str) -> list[str]:
    script = f"""
touch "{REMOTE_ROOT}/runs/{run_id}/out.jsonl"
if command -v stdbuf >/dev/null 2>&1; then
  stdbuf -oL tail -n +1 -F "{REMOTE_ROOT}/runs/{run_id}/out.jsonl"
else
  tail -n +1 -F "{REMOTE_ROOT}/runs/{run_id}/out.jsonl"
fi
"""
    return ssh_wsl(script)


def run_finished(run_id: str) -> bool:
    script = f'test -f "{REMOTE_ROOT}/runs/{run_id}/exit" && echo DONE || echo LIVE'
    try:
        code, out, _err = run_script(script, timeout=15)
    except (OSError, subprocess.SubprocessError):
        return False
    return "DONE" in out


def stop_run(run_id: str) -> None:
    sess = f"mn-{run_id[:8]}"
    script = f"""
tmux kill-session -t {sess} 2>/dev/null || true
PID=$(cat "{REMOTE_ROOT}/runs/{run_id}/pid" 2>/dev/null || true)
if [ -n "$PID" ]; then
  kill "$PID" 2>/dev/null || true
  pkill -P "$PID" 2>/dev/null || true
fi
"""
    try:
        run_script(script, timeout=15)
    except (OSError, subprocess.SubprocessError):
        pass


def err_tail(run_id: str) -> str:
    script = f'tail -c 1200 "{REMOTE_ROOT}/runs/{run_id}/err.log" 2>/dev/null || true'
    try:
        _code, out, _err = run_script(script, timeout=15)
    except (OSError, subprocess.SubprocessError):
        return ""
    return out.strip()
