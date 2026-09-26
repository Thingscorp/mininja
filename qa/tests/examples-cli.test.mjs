#!/usr/bin/env node
/** SUITE-EX-CLI-001 — stranger path cli-banner. */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const sh = join(root, "examples", "cli-banner.sh");
const kit = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const idle = spawnSync("bash", [sh], { encoding: "utf8" });
assert(idle.status === 0, `idle exit ${idle.status}: ${idle.stderr}`);
assert(idle.stdout.includes(kit.canonicalIdle.lines[0]), "idle prints canonical hood");

const list = spawnSync("bash", [sh, "--list"], { encoding: "utf8" });
assert(list.status === 0, `--list exit ${list.status}`);
for (const id of Object.keys(kit.faces)) {
  assert(list.stdout.includes(id), `--list missing ${id}`);
}

const left = spawnSync("bash", [sh, "idle", "--facing", "left"], { encoding: "utf8" });
assert(left.status === 0, `facing left exit ${left.status}`);
assert(left.stdout.includes(kit.mirroredIdle.lines[0]), "facing left uses mirrored hood");

console.log("PASS  SUITE-EX-CLI-001");
