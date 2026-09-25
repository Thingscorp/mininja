/**
 * ANSI renderer for Mininja faces (levels 1–2).
 * Tone colors are UI chrome only — mark geometry stays from kit/mark.json.
 */
import { linesFor } from "../mark/lockup.mjs";

const TONE = {
  idle: "\x1b[90m",
  accent: "\x1b[94m",
  ok: "\x1b[92m",
  warn: "\x1b[93m",
  err: "\x1b[91m",
  reset: "\x1b[0m",
};

const FACE_TONE = {
  idle: "idle",
  blink: "idle",
  evaluating: "accent",
  allowed: "ok",
  asking: "warn",
  denied: "err",
  sandboxing: "idle",
  executing: "accent",
  completed: "ok",
  warning: "warn",
  error: "err",
  cancelled: "idle",
  offline: "idle",
  loadingRight: "accent",
  loadingLeft: "accent",
};

export function ansiLockup(face = "idle", { color = true, facing = "right" } = {}) {
  const lines = linesFor(face, facing);
  if (!color) return lines.join("\n");
  const tone = FACE_TONE[face] ?? "idle";
  const c = TONE[tone] ?? TONE.idle;
  return lines.map((l) => `${c}${l}${TONE.reset}`).join("\n");
}
