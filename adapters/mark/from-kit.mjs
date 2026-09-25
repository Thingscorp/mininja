/**
 * Pure mark → strings. No I/O. Pass kit/mark.json (or a clone of it).
 * Mascot has no name.
 */

/**
 * @param {object} kit
 * @returns {string[]}
 */
export function listFaces(kit) {
  return Object.keys(kit.faces);
}

/**
 * @param {object} kit
 * @param {string} [face]
 * @param {"left"|"right"} [facing]
 * @returns {[string, string, string]}
 */
export function linesFor(kit, face = "idle", facing = "right") {
  const f = kit.faces[face] ?? kit.faces.idle;
  if (facing === "left" && !f.mirrored) {
    const [a, b] = f.eyes;
    const [hood, , chin] = kit.mirroredIdle.lines;
    return [hood, `${b}${a} ██`, chin];
  }
  return /** @type {[string, string, string]} */ ([...f.lines]);
}

/**
 * @param {object} kit
 * @param {string} [face]
 * @param {"left"|"right"} [facing]
 * @returns {string}
 */
export function lockup(kit, face = "idle", facing = "right") {
  return linesFor(kit, face, facing).join("\n");
}
