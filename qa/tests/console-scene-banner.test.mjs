#!/usr/bin/env node
/** SUITE-CON-SCENE-001..004 / CON-BANNER-002 — catalog verbs + motion alignment. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kit = JSON.parse(readFileSync(join(root, "kit", "scene.json"), "utf8"));
const lib = readFileSync(join(root, "console", "src", "lib", "mininja.ts"), "utf8");
const banner = readFileSync(join(root, "console", "src", "components", "banner.tsx"), "utf8");
const scene = readFileSync(join(root, "console", "src", "lib", "scene.ts"), "utf8");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// scene/feel/do/go branches
for (const verb of ["scene", "feel", "do", "go"]) {
  assert(lib.includes(`cmd === "${verb}"`), `cardFor ${verb}`);
}
assert(/Unknown emotion|Unknown action|Unknown place/i.test(lib), "unknown habitat copy");
assert(/listStages|emotions|actions|stages|feel\/|do\/|go\//i.test(lib) || /scene\./.test(lib), "catalog wiring");

// motion alignment — walk/run via kit-derived exports (OX-APP-002)
assert(banner.includes("WALK_PX_PER_SEC") && banner.includes("RUN_PX_PER_SEC"), "banner uses kit motion exports");
assert(
  /export const WALK_PX_PER_SEC\s*=\s*kit\.motion\.walkPxPerSec/.test(scene),
  `scene exports walk ${kit.motion.walkPxPerSec}`,
);
assert(
  /export const RUN_PX_PER_SEC\s*=\s*kit\.motion\.runPxPerSec/.test(scene),
  `scene exports run ${kit.motion.runPxPerSec}`,
);
assert(banner.includes(String(kit.motion.patrolPxPerSec)), `patrol ${kit.motion.patrolPxPerSec}`);
assert(banner.includes(String(kit.motion.arriveEpsilonPx)) || /gap\s*>\s*6|epsilon|6/.test(banner), "arrive epsilon");
assert(/56/.test(banner) && /90/.test(banner), "patrol insets");

// camera look-ahead must match kit asymmetric ratios (no legacy 0.35)
const kitRight = kit.motion.cameraLookAheadRight;
const kitLeft = kit.motion.cameraLookAheadLeft;
assert(typeof kitRight === "number" && typeof kitLeft === "number", "kit look-ahead");
assert(!/viewW\s*\*\s*0\.35/.test(banner), "no legacy 0.35 look-ahead");
assert(banner.includes(String(kitRight)), `look-ahead right ${kitRight}`);
assert(banner.includes(String(kitLeft)), `look-ahead left ${kitLeft}`);

assert(/registerFromKit/.test(scene) && /kit\/scene\.json/.test(scene), "registerFromKit");
assert(!/\bSTAGE_SEED\b|\bEMOTION_SEED\b|\bACTION_SEED\b/.test(scene), "no dual seeds");

const align = spawnSync(process.execPath, [join(root, "console", "scripts", "kit-align.mjs")], {
  encoding: "utf8",
});
assert(align.status === 0, `kit-align: ${align.stdout}${align.stderr}`);

console.log(
  `PASS  SUITE-CON-SCENE-001..004 / BANNER-002 (lookAhead=${kitRight}/${kitLeft})`,
);
