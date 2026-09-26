/**
 * Colorize mark strings. Presence levels 1–2.
 * Face → tone id comes from kit.faces[].tone (keys in moodColorsUiOnly).
 * ANSI codes are terminal chrome for those ids — not a second face map.
 */
import { linesFor as linesForKit } from "../mark/from-kit.mjs";
import { kit as defaultKit } from "../mark/lockup.mjs";

/**
 * Terminal chrome for kit.moodColorsUiOnly keys (hex stays UI-only).
 * Keys track the upstream mood ids; unknown tones fall back to idle chrome.
 */
const ANSI_FOR_TONE = Object.freeze({
  idle: "\x1b[90m",
  accent: "\x1b[94m",
  ok: "\x1b[92m",
  warn: "\x1b[93m",
  err: "\x1b[91m",
});

const RESET = "\x1b[0m";

/**
 * @param {object} kit
 * @param {string} tone
 * @returns {boolean} true when tone is a moodColorsUiOnly key
 */
export function hasTone(kit, tone) {
  const moods = kit?.moodColorsUiOnly;
  return moods != null && Object.hasOwn(moods, tone);
}

/**
 * @param {object} kit
 * @param {string} [face]
 * @returns {string} tone id from moodColorsUiOnly
 */
export function toneForFace(kit, face = "idle") {
  const id = kit?.faces?.[face]?.tone ?? kit?.faces?.idle?.tone ?? "idle";
  return hasTone(kit, id) ? id : "idle";
}

/**
 * Colorize already-rendered mark lines.
 * @param {string[]} lines
 * @param {string} [tone] moodColorsUiOnly key
 * @returns {string}
 */
export function colorize(lines, tone = "idle") {
  const c = ANSI_FOR_TONE[tone] ?? ANSI_FOR_TONE.idle;
  return lines.map((l) => `${c}${l}${RESET}`).join("\n");
}

/**
 * @param {object} kit
 * @param {string} [face]
 * @param {{ color?: boolean, facing?: "left"|"right" }} [opts]
 * @returns {string}
 */
export function ansiLockupFromKit(kit, face = "idle", { color = true, facing = "right" } = {}) {
  const dir = facing === "left" ? "left" : "right";
  const lines = linesForKit(kit, face, dir);
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
