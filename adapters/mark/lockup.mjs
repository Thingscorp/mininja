/**
 * Mark → strings. Presence levels 1–2.
 * Data: ../../kit/mark.json — glyphs are the mark. Mascot has no name.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kit = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));

/** @returns {string[]} face ids */
export function listFaces() {
  return Object.keys(kit.faces);
}

/**
 * @param {string} [face]
 * @param {"left"|"right"} [facing]
 * @returns {[string, string, string]}
 */
export function linesFor(face = "idle", facing = "right") {
  const f = kit.faces[face] ?? kit.faces.idle;
  if (facing === "left" && !f.mirrored) {
    const [a, b] = f.eyes;
    const [hood, , chin] = kit.mirroredIdle.lines;
    return [hood, `${b}${a} ██`, chin];
  }
  return /** @type {[string, string, string]} */ ([...f.lines]);
}

/** @returns {string} three lines joined by \\n */
export function lockup(face = "idle", facing = "right") {
  return linesFor(face, facing).join("\n");
}

export { kit };
