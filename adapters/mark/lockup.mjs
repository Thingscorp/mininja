/**
 * Node convenience: load kit/mark.json, then mark → strings.
 * Browsers: import ./from-kit.mjs and pass kit JSON (no node:fs).
 * Mascot has no name.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  hasFace as hasFaceKit,
  listFaces as listFacesKit,
  linesFor as linesForKit,
  lockup as lockupKit,
  mergeMark as mergeMarkKit,
} from "./from-kit.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kit = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));

/** @returns {string[]} face ids */
export function listFaces() {
  return listFacesKit(kit);
}

/**
 * @param {string} face
 * @returns {boolean}
 */
export function hasFace(face) {
  return hasFaceKit(kit, face);
}

/**
 * @param {string} [face]
 * @param {"left"|"right"} [facing]
 * @returns {[string, string, string]}
 */
export function linesFor(face = "idle", facing = "right") {
  return linesForKit(kit, face, facing);
}

/** @returns {string} three lines joined by \\n */
export function lockup(face = "idle", facing = "right") {
  return lockupKit(kit, face, facing);
}

/**
 * @param {object} overlay
 * @returns {object} default kit merged with overlay
 */
export function mergeMark(overlay = {}) {
  return mergeMarkKit(kit, overlay);
}

export { kit };
export {
  hasFaceKit as hasFaceFromKit,
  listFacesKit as listFacesFromKit,
  linesForKit as linesForFromKit,
  lockupKit as lockupFromKit,
  mergeMarkKit as mergeMarkFromKit,
};
