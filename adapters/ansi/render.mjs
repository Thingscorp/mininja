/**
 * Colorize mark strings. Presence levels 1–2.
 * Face → tone id comes from kit.faces[].tone (keys in moodColorsUiOnly).
 * ANSI codes are terminal chrome for those ids — not a second face map.
 */
import { linesFor as linesForKit } from "../mark/from-kit.mjs";
import { kit as defaultKit } from "../mark/lockup.mjs";

/** Terminal chrome for kit.moodColorsUiOnly keys (hex stays UI-only). */
const ANSI_FOR_TONE = {
  idle: "\x1b[90m",
  accent: "\x1b[94m",
  ok: "\x1b[92m",
  warn: "\x1b[93m",
  err: "\x1b[91m",
  reset: "\x1b[0m",
};

/**
 * @param {object} kit
 * @param {string} [face]
 * @returns {string} tone id from moodColorsUiOnly
 */
export function toneForFace(kit, face = "idle") {
  const moods = kit.moodColorsUiOnly ?? {};
  const id = kit.faces?.[face]?.tone ?? kit.faces?.idle?.tone ?? "idle";
  return id in moods ? id : "idle";
}

/**
 * Colorize already-rendered mark lines.
 * @param {string[]} lines
 * @param {string} [tone] moodColorsUiOnly key
 * @returns {string}
 */
export function colorize(lines, tone = "idle") {
  const c = ANSI_FOR_TONE[tone] ?? ANSI_FOR_TONE.idle;
  return lines.map((l) => `${c}${l}${ANSI_FOR_TONE.reset}`).join("\n");
}

/**
 * @param {object} kit
 * @param {string} [face]
 * @param {{ color?: boolean, facing?: "left"|"right" }} [opts]
 * @returns {string}
 */
export function ansiLockupFromKit(kit, face = "idle", { color = true, facing = "right" } = {}) {
  const lines = linesForKit(kit, face, facing);
  if (!color) return lines.join("\n");
  return colorize(lines, toneForFace(kit, face));
}

/**
 * Node convenience over default kit/mark.json.
 * @param {string} [face]
 * @param {{ color?: boolean, facing?: "left"|"right" }} [opts]
 * @returns {string}
 */
export function ansiLockup(face = "idle", opts = {}) {
  return ansiLockupFromKit(defaultKit, face, opts);
}
