/**
 * Colorize mark strings. Presence levels 1–2.
 * Tone is UI chrome only — geometry stays from kit/mark.json via mark adapter.
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

/**
 * Colorize already-rendered mark lines.
 * @param {string[]} lines
 * @param {keyof typeof TONE} [tone]
 * @returns {string}
 */
export function colorize(lines, tone = "idle") {
  const c = TONE[tone] ?? TONE.idle;
  return lines.map((l) => `${c}${l}${TONE.reset}`).join("\n");
}

/**
 * @param {string} [face]
 * @param {{ color?: boolean, facing?: "left"|"right" }} [opts]
 * @returns {string}
 */
export function ansiLockup(face = "idle", { color = true, facing = "right" } = {}) {
  const lines = linesFor(face, facing);
  if (!color) return lines.join("\n");
  return colorize(lines, FACE_TONE[face] ?? "idle");
}
