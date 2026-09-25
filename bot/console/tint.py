"""Name → hex. One job: a stable color for a named teammate."""
from __future__ import annotations

import hashlib

STEEL = "#8a8f98"


def _hsl_hex(h: int, s: int, lit: int) -> str:
    s = s / 100.0
    lit = lit / 100.0
    c = (1.0 - abs(2.0 * lit - 1.0)) * s
    hp = (h % 360) / 60.0
    x = c * (1.0 - abs(hp % 2.0 - 1.0))
    m = lit - c / 2.0
    if 0.0 <= hp < 1.0:
        r, g, b = c, x, 0.0
    elif 1.0 <= hp < 2.0:
        r, g, b = x, c, 0.0
    elif 2.0 <= hp < 3.0:
        r, g, b = 0.0, c, x
    elif 3.0 <= hp < 4.0:
        r, g, b = 0.0, x, c
    elif 4.0 <= hp < 5.0:
        r, g, b = x, 0.0, c
    else:
        r, g, b = c, 0.0, x

    def ch(v: float) -> int:
        return max(0, min(255, round((v + m) * 255.0)))

    return f"#{ch(r):02x}{ch(g):02x}{ch(b):02x}"


def tint(name: str) -> str:
    key = (name or "").strip().casefold()
    if not key:
        return STEEL
    digest = hashlib.sha256(key.encode("utf-8")).digest()
    # 20 even hues. Byte 5 so Piper/Scout/Cloud/WSL/Codex do not share a stop.
    stops = 20
    idx = int.from_bytes(digest[5:7], "big") % stops
    hue = (idx * 360) // stops
    return _hsl_hex(hue, 52, 56)
