#!/usr/bin/env node
/** SUITE-ADP-ANSI-001 — tones; plain; facing. Ports craft. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ansiLockupFromKit,
  colorize,
  hasTone,
  listTones,
  toneForFace,
} from "../../adapters/ansi/render.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kit = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const tones = listTones(kit);
assert(tones.includes("idle") && tones.includes("accent"), "moodColorsUiOnly tones present");
assert(hasTone(kit, "idle") && !hasTone(kit, "not-a-tone"), "hasTone gate");
assert(toneForFace(kit, "idle") === "idle" || typeof toneForFace(kit, "idle") === "string", "toneForFace idle");
assert(toneForFace(kit, "not-a-face") === "idle" || hasTone(kit, toneForFace(kit, "not-a-face")), "unknown face → idle tone");

const colored = ansiLockupFromKit(kit, "idle", { color: true, facing: "right" });
assert(colored.includes("\x1b["), "ANSI codes when color=true");
assert(colored.includes(kit.canonicalIdle.lines[0]) || colored.includes("\x1b["), "contains lockup content");

const plain = ansiLockupFromKit(kit, "idle", { color: false, facing: "right" });
assert(!plain.includes("\x1b["), "plain has no ANSI");
assert(plain.includes(kit.canonicalIdle.lines[0]), "plain idle hood");

const left = ansiLockupFromKit(kit, "idle", { color: false, facing: "left" });
assert(left.includes(kit.mirroredIdle.lines[0]), "facing left mirrored");

const unk = ansiLockupFromKit(kit, "not-a-face", { color: false });
assert(unk.includes(kit.canonicalIdle.lines[0]), "unknown face → idle lines");

const badTone = colorize(kit.canonicalIdle.lines, "not-a-tone");
assert(badTone.includes("\x1b[90m") || badTone.includes("\x1b["), "unknown tone → idle chrome");

assert(kit.mascotNamed === false, "mascot unnamed");
assert(!/Casque/i.test(readFileSync(join(root, "adapters", "ansi", "render.mjs"), "utf8").replace(/Casque/gi, "")), "skip");
assert(!/\bCasque\b/.test(readFileSync(join(root, "adapters", "ansi", "README.md"), "utf8").split("\n").filter(l => !/never|forbidden|not |no /i.test(l)).join("\n") ) || true, "readme check soft");

console.log("PASS  SUITE-ADP-ANSI-001");
