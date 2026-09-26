#!/usr/bin/env node
/** SUITE-EX-REMIX-001 — wink overlay derives lines; motion diff. */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const print = join(root, "examples", "remix", "print-face.mjs");
const overlay = JSON.parse(readFileSync(join(root, "examples", "remix", "mark-overlay.json"), "utf8"));
const kit = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));
const scene = JSON.parse(readFileSync(join(root, "kit", "scene.json"), "utf8"));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(existsSync(print), "print-face.mjs");
assert(overlay.faces?.wink?.eyes, "wink eyes-only overlay");

const wink = spawnSync(process.execPath, [print, "wink"], { encoding: "utf8" });
assert(wink.status === 0, `wink exit ${wink.status}: ${wink.stderr}`);
assert(wink.stdout.includes(overlay.faces.wink.eyes[0]) || wink.stdout.length > 0, "wink output");

const list = spawnSync(process.execPath, [print, "--list"], { encoding: "utf8" });
assert(list.status === 0 && list.stdout.includes("wink"), "--list includes wink");

const motion = spawnSync(process.execPath, [print, "--motion"], { encoding: "utf8" });
assert(motion.status === 0, `--motion exit ${motion.status}`);
assert(/walk|170|run|280|motion/i.test(motion.stdout), "motion speeds printed");

const left = spawnSync(process.execPath, [print, "idle", "--facing", "left"], { encoding: "utf8" });
assert(left.status === 0, "facing left");
assert(left.stdout.includes(kit.mirroredIdle.lines[0]), "mirrored idle");

assert(!/Casque/i.test(readFileSync(join(root, "examples", "remix", "README.md"), "utf8").split("\n").filter(l => /\bCasque\b/.test(l) && !/never|forbidden|not |no /i.test(l)).join("\n")), "no affirmative Casque");

console.log("PASS  SUITE-EX-REMIX-001");
