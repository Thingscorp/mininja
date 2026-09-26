#!/usr/bin/env node
/** SUITE-SCR-SIM-001 / CI-KIT-001 — sim-grid report ↔ kit; workflow steps. */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kit = JSON.parse(readFileSync(join(root, "kit", "scene.json"), "utf8"));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const sim = spawnSync("python3", [join(root, "scripts", "sim-grid-habitat.py")], {
  encoding: "utf8",
  cwd: root,
});
assert(sim.status === 0, `sim-grid exit ${sim.status}: ${sim.stderr}`);
assert(/pass=|locked/i.test(sim.stdout), "sim output");

const reportPath = join(root, "scripts", "sim-grid-habitat-report.json");
assert(existsSync(reportPath), "report json");
const report = JSON.parse(readFileSync(reportPath, "utf8"));
assert(report.locked === true || report.fail_hard === 0, "locked/no hard fail");
assert(Number(report.fail_hard || 0) === 0, "fail_hard=0");

// motion cross-check
assert(kit.motion.walkPxPerSec === 170 && kit.motion.runPxPerSec === 280, "kit motion SoT");

const wf = readFileSync(join(root, ".github", "workflows", "kit-qa.yml"), "utf8");
assert(/name:\s*kit-qa/.test(wf), "workflow name");
assert(/node-version:\s*['"]?22/.test(wf) || /node.version.*22/i.test(wf), "Node 22");
assert(/push:|pull_request:/.test(wf), "triggers");
assert(/kit\/qa|run-tests|check-consumers/i.test(wf), "kit QA steps");

console.log("PASS  SUITE-SCR-SIM-001 / CI-KIT-001");
