/**
 * Mininja mark lockup helpers (presence levels 1–2).
 * Data: ../../kit/mark.json — glyphs are the mark. Mascot has no name.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kit = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));

export function listFaces() {
  return Object.keys(kit.faces);
}

export function linesFor(face = "idle", facing = "right") {
  const f = kit.faces[face] ?? kit.faces.idle;
  let lines = [...f.lines];
  if (facing === "left" && !f.mirrored) {
    // mirror hood + swap eye pair order, keep chin
    const eyes = f.eyes;
    const pair = `${eyes[1]}${eyes[0]}`;
    lines = ["████▞", `${pair} ██`, "▀▀▀▀▀"];
  }
  return lines;
}

export function lockup(face = "idle", facing = "right") {
  return linesFor(face, facing).join("\n");
}

export function asPre(face = "idle", facing = "right") {
  return `<pre aria-label="Mininja mark">${lockup(face, facing)}</pre>`;
}

export { kit };
