"""Durable paths. One place so the UI and CLI share the same store."""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
_override = os.environ.get("MININJA_DATA", "").strip()
DATA_DIR = Path(_override).expanduser() if _override else Path.home() / "Library" / "Application Support" / "MininjaBot"
STATE_PATH = DATA_DIR / "state.json"
CONSOLE_PATH = DATA_DIR / "console.json"
LOCK_PATH = DATA_DIR / "console.lock"
LEDGER_DIR = ROOT / ".mininja"
SEED_DIR = ROOT / "seed" / "official"
PAGES_PATH = ROOT / "seed" / "pages.txt"
