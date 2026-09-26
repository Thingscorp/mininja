#!/usr/bin/env python3
"""Mininja console plus named teammates.

Programs return cards. Teammates run on the laptop WSL computer (or Codex / this Mac).
"""
from __future__ import annotations

import json
import os
import queue
import shutil
import signal
import subprocess
import sys
import threading
import time
import uuid
import webbrowser
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

import cloud
from console.engine import ALIASES, SHELL
from console.paths import DATA_DIR, ROOT, STATE_PATH
from console.tint import tint as name_tint
from console.store import apply as console_apply
from console.store import public as console_public

STATIC = ROOT / "static"
KIT_DIR = ROOT.parent / "kit"
HOST = "127.0.0.1"
PORT = 8787
MAX_MESSAGES = 200
MAX_PARALLEL = 4
DRAFT_TOOLS = "read_file,grep,list_dir,web_search,web_fetch"

LOCK = threading.RLock()
SUBS: list[queue.Queue] = []
RUNS: dict[str, subprocess.Popen] = {}
CLOUD_RUNS: dict[str, str] = {}
SCHEDULER_STOP = threading.Event()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def find_grok() -> str | None:
    env = os.environ.get("GROK_BIN")
    if env and Path(env).is_file():
        return env
    for candidate in (
        shutil.which("grok"),
        str(Path.home() / ".local" / "bin" / "grok"),
        str(Path.home() / ".grok" / "bin" / "grok"),
    ):
        if candidate and Path(candidate).is_file() and os.access(candidate, os.X_OK):
            return candidate
    return None


def grok_version(bin_path: str | None) -> str | None:
    if not bin_path:
        return None
    try:
        out = subprocess.check_output([bin_path, "--version"], text=True, timeout=8)
        return out.strip().splitlines()[0]
    except (OSError, subprocess.SubprocessError):
        return None


def empty_state() -> dict:
    return {"bots": [], "messages": {}}


def load_state() -> dict:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STATE_PATH.exists():
        return empty_state()
    try:
        data = json.loads(STATE_PATH.read_text())
    except (OSError, json.JSONDecodeError):
        return empty_state()
    data.setdefault("bots", [])
    data.setdefault("messages", {})
    return data


def save_state(state: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp = STATE_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, indent=2))
    tmp.replace(STATE_PATH)


def public_state() -> dict:
    with LOCK:
        state = load_state()
        running = set(RUNS.keys())
        bots = []
        for bot in state["bots"]:
            row = dict(bot)
            row["working"] = bot["id"] in running
            if bot["id"] in running:
                row["status"] = "working"
            row["tint"] = name_tint(row.get("name") or "")
            bots.append(row)
        grok = find_grok()
        payload = {
            "bots": bots,
            "messages": state["messages"],
            "health": {
                "grok": grok,
                "version": grok_version(grok),
                "arch": os.uname().machine,
                "data": str(STATE_PATH),
            },
        }
    payload["health"]["cloud"] = cloud.probe()
    payload["console"] = public_console()
    payload["commands"] = SHELL + [a for a in ALIASES if a not in SHELL]
    return payload


def public_console() -> dict:
    return console_public()


def run_console(text: str) -> dict:
    card = console_apply(text)
    emit({"type": "console"})
    emit({"type": "state"})
    return card


def emit(event: dict) -> None:
    dead = []
    for q in list(SUBS):
        try:
            q.put_nowait(event)
        except queue.Full:
            dead.append(q)
    for q in dead:
        if q in SUBS:
            SUBS.remove(q)


def new_bot(payload: dict) -> dict:
    name = (payload.get("name") or "").strip() or "New Agent"
    job = (payload.get("job") or "").strip() or "General"
    description = (payload.get("description") or "").strip()
    computer = payload.get("computer") or "local"
    if computer == "remote":
        computer = "remote"
    if computer not in ("remote", "local", "codex"):
        computer = "local"
    default_cwd = cloud.DEFAULT_CWD if computer == "remote" else str(Path.home())
    cwd = (payload.get("cwd") or default_cwd).strip()
    model = (payload.get("model") or "").strip()
    mode = payload.get("mode") or "auto"
    if mode not in ("draft", "auto", "free"):
        mode = "auto"
    bot = {
        "id": str(uuid.uuid4()),
        "name": name,
        "job": job,
        "description": description,
        "cwd": cwd,
        "computer": computer,
        "model": model,
        "mode": mode,
        "session_id": str(uuid.uuid4()),
        "session_ready": False,
        "pinned": False,
        "created_at": now_iso(),
        "status": "idle",
        "last_error": None,
        "routine": None,
    }
    with LOCK:
        state = load_state()
        state["bots"].append(bot)
        state["messages"][bot["id"]] = []
        save_state(state)
    emit({"type": "state"})
    return bot


def patch_bot(bot_id: str, payload: dict) -> dict | None:
    allowed = {
        "name",
        "job",
        "description",
        "cwd",
        "computer",
        "model",
        "mode",
        "pinned",
        "routine",
    }
    with LOCK:
        state = load_state()
        bot = next((b for b in state["bots"] if b["id"] == bot_id), None)
        if not bot:
            return None
        for key, value in payload.items():
            if key in allowed:
                if key == "mode" and value not in ("draft", "auto", "free"):
                    continue
                bot[key] = value
        save_state(state)
    emit({"type": "state"})
    return bot


def delete_bot(bot_id: str) -> bool:
    stop_bot(bot_id)
    with LOCK:
        state = load_state()
        before = len(state["bots"])
        state["bots"] = [b for b in state["bots"] if b["id"] != bot_id]
        state["messages"].pop(bot_id, None)
        save_state(state)
    emit({"type": "state"})
    return len(state["bots"]) < before


def append_message(bot_id: str, role: str, text: str, extra: dict | None = None) -> dict:
    msg = {
        "id": str(uuid.uuid4()),
        "role": role,
        "text": text,
        "ts": now_iso(),
        "tools": [],
    }
    if extra:
        msg.update(extra)
    with LOCK:
        state = load_state()
        msgs = state["messages"].setdefault(bot_id, [])
        msgs.append(msg)
        state["messages"][bot_id] = msgs[-MAX_MESSAGES:]
        save_state(state)
    emit({"type": "message", "bot_id": bot_id, "message": msg})
    return msg


def update_last_assistant(bot_id: str, text: str, tools: list | None = None, status: str | None = None) -> None:
    with LOCK:
        state = load_state()
        msgs = state["messages"].get(bot_id) or []
        for msg in reversed(msgs):
            if msg["role"] == "assistant" and msg.get("streaming"):
                msg["text"] = text
                if tools is not None:
                    msg["tools"] = tools
                if status:
                    msg["status"] = status
                    if status != "streaming":
                        msg["streaming"] = False
                save_state(state)
                emit({"type": "message", "bot_id": bot_id, "message": msg, "patch": True})
                return


def set_bot_status(bot_id: str, status: str, error: str | None = None) -> None:
    with LOCK:
        state = load_state()
        bot = next((b for b in state["bots"] if b["id"] == bot_id), None)
        if not bot:
            return
        bot["status"] = status
        bot["last_error"] = error
        save_state(state)
    emit({"type": "status", "bot_id": bot_id, "status": status, "error": error})
    emit({"type": "state"})


def bot_rules(bot: dict) -> str:
    parts = [
        f"You are {bot['name']}, a durable AI teammate in Mininja.",
        f"Job: {bot['job']}.",
    ]
    if bot.get("description"):
        parts.append(bot["description"].strip())
    parts.append(
        "Stay in this role. Finish the work or stop with a clear ask. "
        "Cite files and URLs. Do not mention being a CLI wrapper unless asked."
    )
    return " ".join(parts)


def infer_computer(bot: dict) -> str:
    computer = bot.get("computer")
    if computer == "remote":
        return "remote"
    if computer in ("remote", "local", "codex"):
        return computer
    return "local"


def uses_cloud(bot: dict) -> bool:
    return infer_computer(bot) == "remote"


def uses_codex(bot: dict) -> bool:
    return infer_computer(bot) == "codex"


def mark_session(bot_id: str, session_id: str | None = None) -> None:
    with LOCK:
        state = load_state()
        live = next((b for b in state["bots"] if b["id"] == bot_id), None)
        if not live:
            return
        if session_id:
            live["session_id"] = session_id
        live["session_ready"] = True
        live["session_computer"] = infer_computer(live)
        save_state(state)


def drop_session(bot_id: str) -> None:
    with LOCK:
        state = load_state()
        live = next((b for b in state["bots"] if b["id"] == bot_id), None)
        if not live:
            return
        live["session_ready"] = False
        live["session_id"] = str(uuid.uuid4())
        live.pop("session_computer", None)
        save_state(state)


def reconcile_runs() -> None:
    """Clear persisted in-flight work after a process restart."""
    with LOCK:
        state = load_state()
        dirty = False
        for bot in state["bots"]:
            if bot.get("status") == "working":
                bot["status"] = "idle"
                dirty = True
            inferred = infer_computer(bot)
            if bot.get("computer") != inferred:
                bot["computer"] = inferred
                dirty = True
        for msgs in state["messages"].values():
            for msg in msgs:
                if msg.get("streaming"):
                    msg["streaming"] = False
                    if not (msg.get("text") or "").strip():
                        msg["text"] = "stopped."
                        msg["status"] = "idle"
                    dirty = True
        if dirty:
            save_state(state)


CODEX_BIN = "/Applications/ChatGPT.app/Contents/Resources/codex"


def build_cmd(bot: dict, prompt: str, grok: str, *, remote: bool = False) -> list[str]:
    cwd = cloud.remote_cwd(bot) if remote else (bot.get("cwd") or str(Path.home()))
    cmd = [
        grok,
        "--output-format",
        "streaming-json",
        "--max-turns",
        "32",
        "--cwd",
        cwd,
        "--rules",
        bot_rules(bot),
        "-p",
        prompt,
    ]
    if not remote:
        cmd[1:1] = ["--no-auto-update"]
        cmd.extend(["--deny", "Bash(rm -rf *)"])
    if bot.get("model"):
        cmd.extend(["-m", bot["model"]])
    host = infer_computer(bot)
    if bot.get("session_ready") and bot.get("session_id") and bot.get("session_computer") == host:
        cmd.extend(["-r", bot["session_id"]])
    else:
        cmd.extend(["-s", str(uuid.uuid4())])
    mode = bot.get("mode") or "auto"
    if mode == "free":
        cmd.append("--always-approve")
    elif mode == "auto":
        cmd.extend(["--permission-mode", "auto"])
    elif mode == "draft":
        cmd.extend(["--tools", DRAFT_TOOLS])
    return cmd


def stop_bot(bot_id: str) -> bool:
    run_id = CLOUD_RUNS.get(bot_id)
    if run_id:
        cloud.stop_run(run_id)
    proc = RUNS.get(bot_id)
    if not proc and not run_id:
        return False
    if proc:
        try:
            os.killpg(proc.pid, signal.SIGTERM)
        except (ProcessLookupError, PermissionError, OSError):
            try:
                proc.terminate()
            except OSError:
                pass
    return True


def start_task(bot_id: str, prompt: str) -> tuple[bool, str]:
    prompt = (prompt or "").strip()
    if not prompt:
        return False, "empty task"
    with LOCK:
        if bot_id in RUNS:
            return False, "already working"
        if len(RUNS) >= MAX_PARALLEL:
            return False, f"at most {MAX_PARALLEL} bots at once"
        state = load_state()
        bot = next((b for b in state["bots"] if b["id"] == bot_id), None)
        if not bot:
            return False, "no such bot"
        bot_copy = dict(bot)
    if uses_codex(bot_copy):
        if not Path(CODEX_BIN).is_file():
            return False, "ChatGPT Codex CLI not found"
        grok = CODEX_BIN
        target = _run_codex_task
    elif uses_cloud(bot_copy):
        grok = cloud.REMOTE_GROK
        target = _run_cloud_task
    else:
        grok = find_grok()
        target = _run_task
    if not grok:
        return False, "grok CLI not found"
    append_message(bot_id, "user", prompt)
    append_message(bot_id, "assistant", "", {"streaming": True, "status": "streaming", "tools": []})
    set_bot_status(bot_id, "working")
    thread = threading.Thread(target=target, args=(bot_copy, prompt, grok), daemon=True)
    thread.start()
    return True, "ok"


def ingest_event(bot_id: str, event: dict, text_buf: str, tools: list) -> tuple[str, list, bool]:
    kind = event.get("type")
    if kind == "text":
        text_buf += event.get("data") or ""
        update_last_assistant(bot_id, text_buf, tools)
        emit({"type": "delta", "bot_id": bot_id, "data": event.get("data") or ""})
    elif kind == "tool_call":
        tools.append(
            {
                "id": event.get("toolCallId"),
                "title": event.get("title") or event.get("toolName") or "tool",
                "status": event.get("status") or "in_progress",
            }
        )
        update_last_assistant(bot_id, text_buf, tools)
    elif kind == "tool_call_update":
        for tool in tools:
            if tool.get("id") == event.get("toolCallId"):
                tool["status"] = event.get("status") or tool.get("status")
        update_last_assistant(bot_id, text_buf, tools)
    elif kind == "end":
        sid = event.get("sessionId")
        if sid:
            mark_session(bot_id, sid)
        return text_buf, tools, True
    elif kind == "error":
        msg = event.get("message") or "grok error"
        text_buf = (text_buf + ("\n" if text_buf else "") + msg).strip()
        update_last_assistant(bot_id, text_buf, tools, status="error")
    return text_buf, tools, False


def finish_run(bot_id: str, text_buf: str, tools: list, code: int, err_tail: str) -> None:
    if not text_buf:
        if code != 0:
            text_buf = err_tail or f"grok exited {code}"
        else:
            text_buf = "(no reply)"
    status = "idle" if code == 0 else "error"
    if code in (-signal.SIGTERM, 128 + signal.SIGTERM, -15):
        status = "idle"
        if not text_buf or text_buf == "(no reply)":
            text_buf = "stopped."
    update_last_assistant(bot_id, text_buf, tools, status="done" if status == "idle" else "error")
    set_bot_status(bot_id, status, None if status == "idle" else text_buf[-400:])
    blob = (text_buf or "") + "\n" + (err_tail or "")
    if "not found locally" in blob or "already in use" in blob:
        drop_session(bot_id)
    elif status == "idle":
        mark_session(bot_id)


def _run_cloud_task(bot: dict, prompt: str, grok: str) -> None:
    bot_id = bot["id"]
    run_id = str(uuid.uuid4())
    cmd = build_cmd(bot, prompt, grok, remote=True)
    ok, msg = cloud.start_run(run_id, cmd, cloud.remote_cwd(bot))
    if not ok:
        update_last_assistant(bot_id, f"cloud start failed: {msg}", status="error")
        set_bot_status(bot_id, "error", msg[-400:])
        return
    CLOUD_RUNS[bot_id] = run_id
    try:
        proc = subprocess.Popen(
            cloud.tail_cmd(run_id),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.DEVNULL,
            text=True,
            bufsize=1,
            start_new_session=True,
        )
    except OSError as exc:
        cloud.stop_run(run_id)
        CLOUD_RUNS.pop(bot_id, None)
        update_last_assistant(bot_id, f"cloud tail failed: {exc}", status="error")
        set_bot_status(bot_id, "error", str(exc))
        return
    RUNS[bot_id] = proc

    def watch_exit() -> None:
        while proc.poll() is None:
            if cloud.run_finished(run_id):
                try:
                    os.killpg(proc.pid, signal.SIGTERM)
                except (ProcessLookupError, PermissionError, OSError):
                    proc.terminate()
                break
            time.sleep(2)

    threading.Thread(target=watch_exit, daemon=True).start()
    text_buf = ""
    tools: list[dict] = []
    try:
        assert proc.stdout is not None
        for raw in proc.stdout:
            line = raw.strip()
            if not line:
                continue
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            text_buf, tools, _done = ingest_event(bot_id, event, text_buf, tools)
    finally:
        proc.wait()
        RUNS.pop(bot_id, None)
        CLOUD_RUNS.pop(bot_id, None)
        err = cloud.err_tail(run_id)
        if text_buf:
            code = 0
        elif err:
            code = 1
        elif cloud.run_finished(run_id):
            code = 0
        else:
            code = proc.returncode or 1
        finish_run(bot_id, text_buf, tools, code, err)


def _run_codex_task(bot: dict, prompt: str, grok: str) -> None:
    bot_id = bot["id"]
    cwd = bot.get("cwd") or str(Path.home())
    # Remote-style paths are not valid on this Mac — fall back to home.
    if cwd.startswith("/home/") and not cwd.startswith(str(Path.home())):
        cwd = str(Path.home())
    cmd = [
        grok,
        "exec",
        "--json",
        "--skip-git-repo-check",
        "-C",
        cwd,
        "--sandbox",
        "read-only" if bot.get("mode") == "draft" else "workspace-write",
        prompt,
    ]
    if bot.get("mode") == "free":
        cmd = [
            grok,
            "exec",
            "--json",
            "--skip-git-repo-check",
            "-C",
            cwd,
            "--dangerously-bypass-approvals-and-sandbox",
            prompt,
        ]
    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.DEVNULL,
            text=True,
            bufsize=1,
            start_new_session=True,
        )
    except OSError as exc:
        update_last_assistant(bot_id, f"codex start failed: {exc}", status="error")
        set_bot_status(bot_id, "error", str(exc))
        return
    RUNS[bot_id] = proc
    err_buf: list[str] = []

    def drain_err() -> None:
        if not proc.stderr:
            return
        for line in proc.stderr:
            err_buf.append(line)

    threading.Thread(target=drain_err, daemon=True).start()
    text_buf = ""
    tools: list[dict] = []
    try:
        assert proc.stdout is not None
        for raw in proc.stdout:
            line = raw.strip()
            if not line:
                continue
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if event.get("type") == "item.completed":
                item = event.get("item") or {}
                piece = item.get("text") or ""
                kind = item.get("type") or "item"
                if kind in ("agent_message", "message") and piece:
                    text_buf += piece
                    update_last_assistant(bot_id, text_buf, tools)
                elif piece:
                    tools.append({"id": item.get("id"), "title": kind, "status": "completed"})
                    update_last_assistant(bot_id, text_buf, tools)
            elif event.get("type") == "error":
                msg = event.get("message") or json.dumps(event)
                text_buf = (text_buf + ("\n" if text_buf else "") + msg).strip()
                update_last_assistant(bot_id, text_buf, tools, status="error")
    finally:
        code = proc.wait()
        RUNS.pop(bot_id, None)
        finish_run(bot_id, text_buf, tools, code, "".join(err_buf)[-1200:])


def _run_task(bot: dict, prompt: str, grok: str) -> None:
    bot_id = bot["id"]
    cmd = build_cmd(bot, prompt, grok)
    env = os.environ.copy()
    env["GROK_DISABLE_AUTOUPDATER"] = "1"
    grok_dir = str(Path(grok).parent)
    env["PATH"] = grok_dir + os.pathsep + env.get("PATH", "")
    text_buf = ""
    tools: list[dict] = []
    err_buf = []
    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.DEVNULL,
            text=True,
            bufsize=1,
            start_new_session=True,
            env=env,
            cwd=bot.get("cwd") or str(Path.home()),
        )
    except OSError as exc:
        update_last_assistant(bot_id, f"could not start grok: {exc}", status="error")
        set_bot_status(bot_id, "error", str(exc))
        return

    RUNS[bot_id] = proc

    def drain_err() -> None:
        if not proc.stderr:
            return
        for line in proc.stderr:
            err_buf.append(line)

    threading.Thread(target=drain_err, daemon=True).start()

    try:
        assert proc.stdout is not None
        for raw in proc.stdout:
            line = raw.strip()
            if not line:
                continue
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            kind = event.get("type")
            if kind == "text":
                text_buf += event.get("data") or ""
                update_last_assistant(bot_id, text_buf, tools)
                emit({"type": "delta", "bot_id": bot_id, "data": event.get("data") or ""})
            elif kind == "tool_call":
                tools.append(
                    {
                        "id": event.get("toolCallId"),
                        "title": event.get("title") or event.get("toolName") or "tool",
                        "status": event.get("status") or "in_progress",
                    }
                )
                update_last_assistant(bot_id, text_buf, tools)
            elif kind == "tool_call_update":
                for tool in tools:
                    if tool.get("id") == event.get("toolCallId"):
                        tool["status"] = event.get("status") or tool.get("status")
                update_last_assistant(bot_id, text_buf, tools)
            elif kind == "end":
                sid = event.get("sessionId")
                if sid:
                    mark_session(bot_id, sid)
            elif kind == "error":
                msg = event.get("message") or "grok error"
                text_buf = (text_buf + ("\n" if text_buf else "") + msg).strip()
                update_last_assistant(bot_id, text_buf, tools, status="error")
    finally:
        code = proc.wait()
        RUNS.pop(bot_id, None)
        finish_run(bot_id, text_buf, tools, code, "".join(err_buf)[-1200:].strip())


def scheduler_loop() -> None:
    while not SCHEDULER_STOP.wait(20):
        due: list[tuple[str, str]] = []
        with LOCK:
            state = load_state()
            now = time.time()
            for bot in state["bots"]:
                routine = bot.get("routine") or {}
                if not routine.get("enabled"):
                    continue
                if bot["id"] in RUNS:
                    continue
                minutes = float(routine.get("interval_minutes") or 0)
                if minutes < 1:
                    continue
                last = routine.get("last_run_at")
                last_ts = 0.0
                if last:
                    try:
                        last_ts = datetime.fromisoformat(last).timestamp()
                    except ValueError:
                        last_ts = 0.0
                if now - last_ts >= minutes * 60:
                    prompt = (routine.get("prompt") or "").strip()
                    if prompt:
                        routine["last_run_at"] = now_iso()
                        due.append((bot["id"], prompt))
            if due:
                save_state(state)
        for bot_id, prompt in due:
            start_task(bot_id, prompt)


class Handler(BaseHTTPRequestHandler):
    server_version = "MininjaBot/1.0"

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _json(self, code: int, payload) -> None:
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode())
        except json.JSONDecodeError:
            return {}
        return data if isinstance(data, dict) else {}

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/api/state":
            self._json(200, public_state())
            return
        if path == "/api/health":
            self._json(200, public_state()["health"])
            return
        if path == "/api/events":
            self._sse()
            return
        if path == "/api/console":
            self._json(200, public_console())
            return
        if path.startswith("/kit/"):
            self._kit(path)
            return
        self._static(path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        parts = [p for p in parsed.path.split("/") if p]
        payload = self._read_json()
        if parts == ["api", "cmd"]:
            text = (payload.get("text") or payload.get("prompt") or "").strip()
            card = run_console(text)
            self._json(200, {"ok": True, "card": card, "console": public_console()})
            return
        if parts == ["api", "bots"]:
            self._json(201, new_bot(payload))
            return
        if len(parts) == 4 and parts[:2] == ["api", "bots"] and parts[3] == "tasks":
            ok, msg = start_task(parts[2], payload.get("text") or payload.get("prompt") or "")
            self._json(200 if ok else 400, {"ok": ok, "error": None if ok else msg})
            return
        if len(parts) == 4 and parts[:2] == ["api", "bots"] and parts[3] == "stop":
            self._json(200, {"ok": stop_bot(parts[2])})
            return
        self._json(404, {"error": "not found"})

    def do_PATCH(self) -> None:
        parts = [p for p in urlparse(self.path).path.split("/") if p]
        if len(parts) == 3 and parts[:2] == ["api", "bots"]:
            bot = patch_bot(parts[2], self._read_json())
            if not bot:
                self._json(404, {"error": "not found"})
                return
            self._json(200, bot)
            return
        self._json(404, {"error": "not found"})

    def do_DELETE(self) -> None:
        parts = [p for p in urlparse(self.path).path.split("/") if p]
        if len(parts) == 3 and parts[:2] == ["api", "bots"]:
            ok = delete_bot(parts[2])
            self._json(200 if ok else 404, {"ok": ok})
            return
        self._json(404, {"error": "not found"})

    def _sse(self) -> None:
        q: queue.Queue = queue.Queue(maxsize=200)
        SUBS.append(q)
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()
        try:
            q.put({"type": "hello"})
            while True:
                try:
                    event = q.get(timeout=15)
                    chunk = "data: %s\n\n" % json.dumps(event)
                except queue.Empty:
                    chunk = ": ping\n\n"
                self.wfile.write(chunk.encode())
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, TimeoutError, OSError):
            pass
        finally:
            if q in SUBS:
                SUBS.remove(q)

    def _kit(self, path: str) -> None:
        """Serve kit SoT JSON (scene/mark) — bot UI hydrates stages from kit, no dual table."""
        rel = path[len("/kit/") :].lstrip("/")
        if not rel or ".." in rel.split("/"):
            self._json(403, {"error": "forbidden"})
            return
        target = (KIT_DIR / rel).resolve()
        if KIT_DIR.resolve() not in target.parents and target != KIT_DIR.resolve():
            self._json(403, {"error": "forbidden"})
            return
        if not target.is_file():
            self.send_error(404)
            return
        data = target.read_bytes()
        ext = target.suffix.lower()
        ctype = "application/json" if ext == ".json" else "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def _static(self, path: str) -> None:
        if path == "/":
            path = "/index.html"
        rel = path.lstrip("/")
        target = (STATIC / rel).resolve()
        if STATIC not in target.parents and target != STATIC:
            self._json(403, {"error": "forbidden"})
            return
        if not target.is_file():
            self.send_error(404)
            return
        data = target.read_bytes()
        ext = target.suffix.lower()
        types = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".svg": "image/svg+xml",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".json": "application/json",
            ".ttf": "font/ttf",
            ".woff2": "font/woff2",
        }
        self.send_response(200)
        self.send_header("Content-Type", types.get(ext, "application/octet-stream"))
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def pick_port(start: int) -> int:
    import socket

    for port in range(start, start + 20):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind((HOST, port))
                return port
            except OSError:
                continue
    raise RuntimeError("no free port")


def self_check() -> int:
    grok = find_grok()
    print("engine:", grok or "MISSING")
    print("version:", grok_version(grok) or "n/a")
    print("arch:", os.uname().machine)
    print("static:", STATIC / "index.html", (STATIC / "index.html").is_file())
    print("favicon:", STATIC / "favicon.svg", (STATIC / "favicon.svg").is_file())
    bot = new_bot({"name": "Check", "job": "self-check", "description": "ephemeral"})
    assert bot["id"]
    state = public_state()
    assert any(b["id"] == bot["id"] for b in state["bots"])
    delete_bot(bot["id"])
    print("state ok")
    return 0 if grok and (STATIC / "index.html").is_file() else 1


def main(argv: list[str]) -> int:
    if "--check" in argv:
        return self_check()
    reconcile_runs()
    port = pick_port(PORT)
    httpd = ThreadingHTTPServer((HOST, port), Handler)
    threading.Thread(target=scheduler_loop, daemon=True).start()
    url = f"http://{HOST}:{port}/"
    print(f"Mininja  {url}", flush=True)
    print(f"engine   {find_grok() or 'not found'}", flush=True)
    print(f"data     {STATE_PATH}", flush=True)
    if "--open" in argv or "--no-open" not in argv:
        threading.Timer(0.4, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nstop")
    finally:
        SCHEDULER_STOP.set()
        for bot_id in list(RUNS):
            stop_bot(bot_id)
        httpd.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
