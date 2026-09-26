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

const widthMatch = sceneSrc.match(/export const STAGE_WIDTH\s*=\s*(\d+)/);
assert(widthMatch && Number(widthMatch[1]) === kit.geometry.stageWidthPx, "STAGE_WIDTH === kit");

for (const verb of ["scene", "feel", "do", "go"]) {
  assert(mininjaSrc.includes(`cmd === "${verb}"`), `cardFor implements ${verb}`);
}

const align = join(root, "console", "scripts", "kit-align.mjs");
assert(existsSync(align), "kit-align.mjs exists");
const r = spawnSync(process.execPath, [align], { encoding: "utf8" });
assert(r.status === 0, `kit-align failed: ${r.stdout}${r.stderr}`);

console.log("PASS  SUITE-CON-SCENE-005 / CON-TOOL-001");
