/**
 * Pure mark → strings. No I/O. Pass kit/mark.json (or a merged overlay).
 * Face ids are kit SoT — no parallel tables. Mascot has no name.
 */

/**
 * @typedef {[string, string, string]} MarkLines
 */

/**
 * Merge a local mark overlay onto upstream kit (faces + mood chrome).
 * Adapters stay the studs; overlays swap brick specs.
 * @param {object} base kit/mark.json
 * @param {object} [overlay]
 * @returns {object}
 */
export function mergeMark(base, overlay = {}) {
  return {
    ...base,
    ...overlay,
    faces: { ...(base.faces ?? {}), ...(overlay.faces ?? {}) },
    moodColorsUiOnly: {
      ...(base.moodColorsUiOnly ?? {}),
      ...(overlay.moodColorsUiOnly ?? {}),
    },
  };
}

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
  return kit?.faces != null && Object.hasOwn(kit.faces, face);
}

/**
 * @param {"left"|"right"|string} [facing]
 * @returns {"left"|"right"}
 */
function facingOf(facing) {
  return facing === "left" ? "left" : "right";
}

/**
 * Resolve face record; unknown ids fall back to idle (filter contract).
 * @param {object} kit
 * @param {string} [face]
 */
function faceRecord(kit, face = "idle") {
  const faces = kit?.faces ?? {};
  return faces[face] ?? faces.idle ?? null;
}

/**
 * Idle / canonical 3-line fallback when a face record is missing fields.
 * @param {object} kit
 * @returns {MarkLines}
 */
function idleLines(kit) {
  const fromFace = kit?.faces?.idle?.lines;
  if (Array.isArray(fromFace) && fromFace.length === 3) {
    return /** @type {MarkLines} */ ([...fromFace]);
  }
  const fromCanon = kit?.canonicalIdle?.lines;
  if (Array.isArray(fromCanon) && fromCanon.length === 3) {
    return /** @type {MarkLines} */ ([...fromCanon]);
  }
  return ["▚████", "██ ●●", "▀▀▀▀▀"];
}

/**
 * Build 3 mark lines from eyes + hood/chin when `lines` is omitted (overlay-friendly).
 * @param {object} kit
 * @param {{ eyes: [string, string], mirrored?: boolean }} f
 * @returns {MarkLines}
 */
function linesFromEyes(kit, f) {
  const base = f.mirrored ? kit.mirroredIdle : kit.canonicalIdle;
  const fallback = idleLines(kit);
  const hood = base?.lines?.[0] ?? fallback[0];
  const chin = base?.lines?.[2] ?? fallback[2];
  const [a, b] = f.eyes;
  const mid = f.mirrored ? `${a}${b} ██` : `██ ${a}${b}`;
  return [hood, mid, chin];
}

/**
 * @param {object} kit
 * @param {{ eyes?: [string, string], mirrored?: boolean, lines?: string[] }} f
 * @returns {MarkLines}
 */
function faceLines(kit, f) {
  if (Array.isArray(f.lines) && f.lines.length === 3) {
    return /** @type {MarkLines} */ ([...f.lines]);
  }
  if (Array.isArray(f.eyes) && f.eyes.length >= 2) {
    return linesFromEyes(kit, f);
  }
  return idleLines(kit);
}

/**
 * Left-facing body from eyes (or mirroredIdle if eyes missing).
 * @param {object} kit
 * @param {{ eyes?: [string, string] }} f
 * @returns {MarkLines}
 */
function mirrorFacing(kit, f) {
  const hood = kit?.mirroredIdle?.lines?.[0] ?? idleLines(kit)[0];
  const chin = kit?.mirroredIdle?.lines?.[2] ?? idleLines(kit)[2];
  if (Array.isArray(f.eyes) && f.eyes.length >= 2) {
    const [a, b] = f.eyes;
    return [hood, `${b}${a} ██`, chin];
  }
  const mirrored = kit?.mirroredIdle?.lines;
  if (Array.isArray(mirrored) && mirrored.length === 3) {
    return /** @type {MarkLines} */ ([...mirrored]);
  }
  return idleLines(kit);
}

/**
 * @param {object} kit
 * @param {string} [face]
 * @param {"left"|"right"} [facing]
 * @returns {MarkLines}
 */
export function linesFor(kit, face = "idle", facing = "right") {
  const f = faceRecord(kit, face);
  if (!f) return idleLines(kit);
  if (facingOf(facing) === "left" && !f.mirrored) {
    return mirrorFacing(kit, f);
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
