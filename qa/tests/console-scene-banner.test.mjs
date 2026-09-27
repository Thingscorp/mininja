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
assert(
  banner.includes("PATROL_PX_PER_SEC") &&
    /export const PATROL_PX_PER_SEC\s*=\s*kit\.motion\.patrolPxPerSec/.test(scene),
  `patrol export ${kit.motion.patrolPxPerSec}`,
);
assert(banner.includes(String(kit.motion.arriveEpsilonPx)) || /gap\s*>\s*6|epsilon|6/.test(banner), "arrive epsilon");
assert(/56/.test(banner) && /90/.test(banner), "patrol insets");

// camera look-ahead via kit.motion exports (OX-APP-D04) — no legacy 0.35
const kitRight = kit.motion.cameraLookAheadRight;
const kitLeft = kit.motion.cameraLookAheadLeft;
assert(typeof kitRight === "number" && typeof kitLeft === "number", "kit look-ahead");
assert(!/viewW\s*\*\s*0\.35/.test(banner), "no legacy 0.35 look-ahead");
assert(
  banner.includes("CAMERA_LOOK_AHEAD_RIGHT") && banner.includes("CAMERA_LOOK_AHEAD_LEFT"),
  `look-ahead exports ${kitRight}/${kitLeft}`,
);
assert(
  /export const CAMERA_LOOK_AHEAD_RIGHT\s*=\s*kit\.motion\.cameraLookAheadRight/.test(scene) &&
    /export const CAMERA_LOOK_AHEAD_LEFT\s*=\s*kit\.motion\.cameraLookAheadLeft/.test(scene),
  "scene exports camera look-ahead from kit",
);
assert(
  banner.includes("CAMERA_FOLLOW_RATE") &&
    /export const CAMERA_FOLLOW_RATE\s*=\s*kit\.motion\.cameraFollowRatePerSec/.test(scene),
  "camera follow rate export",
);

assert(/registerFromKit/.test(scene) && /kit\/scene\.json/.test(scene), "registerFromKit");
assert(!/\bSTAGE_SEED\b|\bEMOTION_SEED\b|\bACTION_SEED\b/.test(scene), "no dual seeds");

// garden plant growth — host paints kit silhouetteHeightPx (OX-APP-D03)
assert(/growthHeight|silhouetteHeightPx|h0Px/.test(scene), "scene exports growthHeight from kit garden");
assert(/prop-repoBranch|GardenPlant|hostGardenOverlay/.test(banner), "banner paints repoBranch plants");
const css = readFileSync(join(root, "console", "src", "styles.css"), "utf8");
assert(/\.prop-repoBranch/.test(css), "CSS has .prop-repoBranch silhouette");
assert(typeof kit.garden?.silhouetteHeightPx?.h0Px === "number", "kit garden h0");
assert(scene.includes(String(kit.garden.silhouetteHeightPx.h0Px)) || /GARDEN_H0|h0Px/.test(scene), "scene uses kit h0");

const align = spawnSync(process.execPath, [join(root, "console", "scripts", "kit-align.mjs")], {
  encoding: "utf8",
});
assert(align.status === 0, `kit-align: ${align.stdout}${align.stderr}`);

console.log(
  `PASS  SUITE-CON-SCENE-001..004 / BANNER-002 (lookAhead=${kitRight}/${kitLeft})`,
);
