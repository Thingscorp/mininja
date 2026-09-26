/**
 * Name → hex. Host chrome only — MUST NOT bake pal colors into kit.
 * Parity with bot/console/tint.py (sha256 name → 20 even hues → #rrggbb).
 */
import { createHash } from "node:crypto";

export const STEEL = "#8a8f98";

function hslHex(h: number, sPct: number, litPct: number): string {
  const s = sPct / 100;
  const lit = litPct / 100;
  const c = (1 - Math.abs(2 * lit - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = lit - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round((v + m) * 255)));
  return `#${[ch(r), ch(g), ch(b)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/** Stable teammate tint from display name. Empty → steel. */
export function tint(name: string): string {
  const key = (name || "").trim().toLowerCase();
  if (!key) return STEEL;
  const digest = createHash("sha256").update(key, "utf8").digest();
  // 20 even hues. Byte 5 so Piper/Scout/Cloud/WSL/Codex do not share a stop.
  const stops = 20;
  const idx = digest.readUInt16BE(5) % stops;
  const hue = Math.floor((idx * 360) / stops);
  return hslHex(hue, 52, 56);
}
