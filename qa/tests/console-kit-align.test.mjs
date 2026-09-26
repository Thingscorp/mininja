#!/usr/bin/env node
/** SUITE-CON-SCENE-005 / CON-TOOL-001 — console loads kit; no dual seed; no Casque. */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const sceneSrc = readFileSync(join(root, "console", "src", "lib", "scene.ts"), "utf8");
const kit = JSON.parse(readFileSync(join(root, "kit", "scene.json"), "utf8"));
const mininjaSrc = readFileSync(join(root, "console", "src", "lib", "mininja.ts"), "utf8");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(sceneSrc.includes("kit/scene.json"), "imports kit/scene.json");
assert(sceneSrc.includes("registerFromKit"), "calls registerFromKit");
assert(!/\bSTAGE_SEED\b/.test(sceneSrc), "no STAGE_SEED");
assert(!/\bEMOTION_SEED\b/.test(sceneSrc), "no EMOTION_SEED");
assert(!/\bACTION_SEED\b/.test(sceneSrc), "no ACTION_SEED");
assert(!/Casque/i.test(sceneSrc), "no Casque in scene.ts");

assert(
  /export const STAGE_WIDTH\s*=\s*kit\.geometry\.stageWidthPx/.test(sceneSrc),
  "STAGE_WIDTH derives kit.geometry.stageWidthPx",
);
assert(
  /export const ANCHOR_RATIO\s*=\s*kit\.geometry\.anchorRatio/.test(sceneSrc),
  "ANCHOR_RATIO derives kit.geometry.anchorRatio",
);
assert(
  /export const WALK_PX_PER_SEC\s*=\s*kit\.motion\.walkPxPerSec/.test(sceneSrc) &&
    /export const RUN_PX_PER_SEC\s*=\s*kit\.motion\.runPxPerSec/.test(sceneSrc),
  "WALK/RUN_PX_PER_SEC derive kit.motion",
);

for (const verb of ["scene", "feel", "do", "go"]) {
  assert(mininjaSrc.includes(`cmd === "${verb}"`), `cardFor implements ${verb}`);
}

const align = join(root, "console", "scripts", "kit-align.mjs");
assert(existsSync(align), "kit-align.mjs exists");
const r = spawnSync(process.execPath, [align], { encoding: "utf8" });
assert(r.status === 0, `kit-align failed: ${r.stdout}${r.stderr}`);

console.log("PASS  SUITE-CON-SCENE-005 / CON-TOOL-001");
