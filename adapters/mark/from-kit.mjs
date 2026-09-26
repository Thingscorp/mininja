/**
 * Pure mark → strings. No I/O. Pass kit/mark.json (or a merged overlay).
 * Face ids are kit SoT — no parallel tables. Mascot has no name.
 */

/**
 * @typedef {[string, string, string]} MarkLines
 */

/**
 * Deep-merge face records. Overlay keys win per field.
 * If overlay sets `eyes` but omits `lines`, drop inherited lines so
 * eyes-derive runs (lines would otherwise shadow the new eyes).
 * @param {Record<string, object>} [base]
 * @param {Record<string, object>} [overlay]
 * @returns {Record<string, object>}
 */
function mergeFaces(base = {}, overlay = {}) {
  const out = { ...base };
  for (const [id, patch] of Object.entries(overlay ?? {})) {
    if (patch == null || typeof patch !== "object") {
      out[id] = patch;
      continue;
    }
    const prev = base[id];
    if (prev != null && typeof prev === "object") {
      const merged = { ...prev, ...patch };
      if (Object.hasOwn(patch, "eyes") && !Object.hasOwn(patch, "lines")) {
        delete merged.lines;
      }
      if (patch.lines == null && Object.hasOwn(patch, "lines")) {
        delete merged.lines;
      }
      if (Array.isArray(merged.eyes)) merged.eyes = [...merged.eyes];
      if (Array.isArray(merged.lines)) merged.lines = [...merged.lines];
      out[id] = merged;
    } else {
      const next = { ...patch };
      if (Array.isArray(next.eyes)) next.eyes = [...next.eyes];
      if (Array.isArray(next.lines)) next.lines = [...next.lines];
      if (next.lines == null) delete next.lines;
      out[id] = next;
    }
  }
  return out;
}

/**
 * Merge a local mark overlay onto upstream kit (faces + mood chrome).
 * Adapters stay the studs; overlays swap brick specs.
 * Face records deep-merge; moodColorsUiOnly shallow-merges by key.
 * @param {object} base kit/mark.json
 * @param {object} [overlay]
 * @returns {object}
 */
export function mergeMark(base, overlay = {}) {
  const b = base ?? {};
  const o = overlay ?? {};
  return {
    ...b,
    ...o,
    faces: mergeFaces(b.faces ?? {}, o.faces ?? {}),
    moodColorsUiOnly: {
      ...(b.moodColorsUiOnly ?? {}),
      ...(o.moodColorsUiOnly ?? {}),
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
 * Build 3 mark lines from anatomical eyes [e_L, e_R] + hood/chin.
 * Matches console composeLockup: facing left swaps the pair.
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
  const mid = f.mirrored ? `${b}${a} ██` : `██ ${a}${b}`;
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
 * Stored right-facing → left-facing body (mirroredIdle hood/chin).
 * Eyes are anatomical [e_L, e_R]; left mid swaps the pair.
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
 * Stored left-facing (mirrored:true) → right-facing body (canonicalIdle).
 * @param {object} kit
 * @param {{ eyes?: [string, string] }} f
 * @returns {MarkLines}
 */
function unmirrorFacing(kit, f) {
  const hood = kit?.canonicalIdle?.lines?.[0] ?? idleLines(kit)[0];
  const chin = kit?.canonicalIdle?.lines?.[2] ?? idleLines(kit)[2];
  if (Array.isArray(f.eyes) && f.eyes.length >= 2) {
    const [a, b] = f.eyes;
    return [hood, `██ ${a}${b}`, chin];
  }
  const canon = kit?.canonicalIdle?.lines;
  if (Array.isArray(canon) && canon.length === 3) {
    return /** @type {MarkLines} */ ([...canon]);
  }
  return idleLines(kit);
}

/**
 * Facing is the desired output orientation. `face.mirrored` is how the
 * stored glyphs / eyes-derive base are oriented — facing always wins.
 * @param {object} kit
 * @param {string} [face]
 * @param {"left"|"right"} [facing]
 * @returns {MarkLines}
 */
export function linesFor(kit, face = "idle", facing = "right") {
  const f = faceRecord(kit, face);
  if (!f) return idleLines(kit);
  const wantLeft = facingOf(facing) === "left";
  const storedLeft = Boolean(f.mirrored);
  if (wantLeft === storedLeft) return faceLines(kit, f);
  return wantLeft ? mirrorFacing(kit, f) : unmirrorFacing(kit, f);
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
