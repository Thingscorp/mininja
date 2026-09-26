#!/usr/bin/env node
/** SUITE-ADP-MARK-002 — lockup.mjs Node convenience; listFaces ⊂ kit. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  hasFace,
  kit as lockedKit,
  linesFor,
  listFaces,
  lockup,
  mergeMark,
} from "../../adapters/mark/lockup.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const disk = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(lockedKit.version === disk.version, "lockup kit version matches disk");
const faces = listFaces();
for (const id of faces) {
  assert(Object.hasOwn(disk.faces, id), `listFaces id ${id} ⊂ mark.faces`);
}
assert(faces.length === Object.keys(disk.faces).length, "listFaces count");
assert(hasFace("idle") && !hasFace("not-a-face"), "hasFace");

const text = lockup("idle", "right");
assert(text.includes(disk.canonicalIdle.lines[0]), "lockup idle");
assert(linesFor("idle", "left")[0] === disk.mirroredIdle.lines[0], "linesFor left");

const merged = mergeMark({ faces: { wink: { eyes: ["◆", "◆"], tone: "accent", motion: null, mirrored: false } } });
assert(merged.faces.wink, "mergeMark via lockup");

const src = readFileSync(join(root, "adapters", "mark", "lockup.mjs"), "utf8");
assert(src.includes("node:fs") || src.includes('from "node:fs"') || src.includes("readFileSync"), "uses fs (Node-only)");

console.log("PASS  SUITE-ADP-MARK-002");
