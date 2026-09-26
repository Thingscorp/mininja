#!/usr/bin/env node
/** SUITE-SIM-HABITAT-001 — mock habitat/emote simulations validate against kit. */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const runner = join(root, "qa", "simulations", "run-simulations.mjs");
const scenarios = join(root, "qa", "simulations", "scenarios.jsonl");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(existsSync(runner), "run-simulations.mjs missing");
assert(existsSync(scenarios), "scenarios.jsonl missing");

const r = spawnSync(process.execPath, [runner], {
  encoding: "utf8",
  cwd: root,
});
assert(r.status === 0, `simulations exit ${r.status}:\n${r.stderr || r.stdout}`);
assert(/PASS\s+all scenario kit ids validate/i.test(r.stdout), "expected PASS line");
assert(/scenarios:\s+\d+/i.test(r.stdout), "expected scenario count");

console.log("PASS  SUITE-SIM-HABITAT-001");
