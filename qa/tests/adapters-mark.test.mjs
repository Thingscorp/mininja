#!/usr/bin/env node
/** SUITE-ADP-MARK-001 — facing-wins + unknown idle + deep mergeMark. Ports craft. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { linesFor, mergeMark, hasFace } from "../../adapters/mark/from-kit.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kit = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const idleRight = linesFor(kit, "idle", "right");
const idleLeft = linesFor(kit, "idle", "left");
assert(idleRight[0] === kit.canonicalIdle.lines[0], "idle right uses canonical hood");
assert(idleLeft[0] === kit.mirroredIdle.lines[0], "idle left uses mirrored hood");

const loadL = linesFor(kit, "loadingLeft", "right");
assert(loadL[0] === kit.canonicalIdle.lines[0], "loadingLeft+right facing wins → canonical body");

const unk = linesFor(kit, "not-a-face", "right");
assert(unk[0] === kit.canonicalIdle.lines[0], "unknown face → idle");
assert(!hasFace(kit, "not-a-face"), "hasFace false for unknown");

const merged = mergeMark(kit, { faces: { wink: { eyes: ["◆", "◆"], tone: "accent", motion: null, mirrored: false } } });
assert(merged.faces.wink.eyes[0] === "◆", "mergeMark adds overlay face");
assert(kit.faces.wink === undefined, "base kit untouched");
const winkLines = linesFor(merged, "wink", "right");
assert(winkLines[1].includes("◆"), "eyes-only overlay derives mid row");

assert(kit.mascotNamed === false, "mascot unnamed");
assert((kit.forbiddenNames || []).some((n) => /casque/i.test(n)), "Casque forbidden");

console.log("PASS  SUITE-ADP-MARK-001");
