/**
 * Pure mark → strings. No I/O. Pass kit/mark.json (or a merged overlay).
 * Face ids are kit SoT — no parallel tables. Mascot has no name.
 */

/**
 * @param {object} kit
 * @returns {string[]} face ids (kit order)
 */
export function listFaces(kit) {
  return Object.keys(kit?.faces ?? {});
}

/**
 * @param {object} kit
 * @param {string} face
 * @returns {boolean}
 */
export function hasFace(kit, face) {
  return Boolean(kit?.faces && Object.prototype.hasOwnProperty.call(kit.faces, face));
}

/**
 * Resolve face record; unknown ids fall back to idle (filter contract).
 * @param {object} kit
 * @param {string} [face]
 */
function faceRecord(kit, face = "idle") {
  const faces = kit?.faces ?? {};
  return faces[face] ?? faces.idle;
}

/**
 * Build 3 mark lines from eyes + hood/chin when `lines` is omitted (overlay-friendly).
 * @param {object} kit
 * @param {{ eyes: [string, string], mirrored?: boolean, lines?: string[] }} f
 * @returns {[string, string, string]}
 */
function linesFromEyes(kit, f) {
  const base = f.mirrored ? kit.mirroredIdle : kit.canonicalIdle;
  const [hood, , chin] = base.lines;
  const [a, b] = f.eyes;
  const mid = f.mirrored ? `${a}${b} ██` : `██ ${a}${b}`;
  return [hood, mid, chin];
}

/**
 * @param {object} kit
 * @param {{ eyes?: [string, string], mirrored?: boolean, lines?: string[] }} f
 * @returns {[string, string, string]}
 */
function faceLines(kit, f) {
  if (Array.isArray(f.lines) && f.lines.length === 3) {
    return /** @type {[string, string, string]} */ ([...f.lines]);
  }
  if (Array.isArray(f.eyes) && f.eyes.length >= 2) {
    return linesFromEyes(kit, f);
  }
  return /** @type {[string, string, string]} */ ([...kit.faces.idle.lines]);
}

/**
 * @param {object} kit
 * @param {string} [face]
 * @param {"left"|"right"} [facing]
 * @returns {[string, string, string]}
 */
export function linesFor(kit, face = "idle", facing = "right") {
  const f = faceRecord(kit, face);
  if (facing === "left" && !f.mirrored) {
    const [a, b] = f.eyes;
    const [hood, , chin] = kit.mirroredIdle.lines;
    return [hood, `${b}${a} ██`, chin];
  }
  return faceLines(kit, f);
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
