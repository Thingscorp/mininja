#!/usr/bin/env node
/**
 * kit/ owns glyphs + numbers. This gate fails if a known consumer forks them.
 * Values always come from mark.json / scene.json — never invented here.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kitDir = dirname(fileURLToPath(import.meta.url));
const root = join(kitDir, "..");
const mark = JSON.parse(readFileSync(join(kitDir, "mark.json"), "utf8"));
const scene = JSON.parse(readFileSync(join(kitDir, "scene.json"), "utf8"));

const errors = [];

if (mark.mascotNamed !== false) {
  errors.push("mark.json: mascotNamed must be false (mascot unnamed)");
}
if (!Array.isArray(mark.forbiddenNames) || !mark.forbiddenNames.includes("Casque")) {
  errors.push("mark.json: forbiddenNames must include Casque");
}

const g = scene.geometry;
const m = scene.motion;
if (!g || !m) {
  errors.push("scene.json: missing geometry or motion");
}

const consoleDir = join(root, "console");
if (existsSync(consoleDir) && g && m) {
  const sceneTs = readFileSync(join(consoleDir, "src", "lib", "scene.ts"), "utf8");
  const bannerTs = readFileSync(join(consoleDir, "src", "components", "banner.tsx"), "utf8");

  const widthMatch = sceneTs.match(/export const STAGE_WIDTH\s*=\s*(\d+)/);
  const width = widthMatch ? Number(widthMatch[1]) : null;
  if (width !== g.stageWidthPx) {
    errors.push(
      `console STAGE_WIDTH=${width} != kit geometry.stageWidthPx=${g.stageWidthPx}`,
    );
  }

  const anchorOk =
    sceneTs.includes(`* ${g.anchorRatio}`) || sceneTs.includes(`*${g.anchorRatio}`);
  if (!anchorOk) {
    errors.push(`console scene.ts missing kit anchorRatio ${g.anchorRatio}`);
  }

  // Speeds: banner inlines walk/run from intensity — must match kit motion.
  const walk = m.walkPxPerSec;
  const run = m.runPxPerSec;
  const speedLit = new RegExp(
    String.raw`intensity\s*>=\s*2\s*\?\s*${run}\s*:\s*${walk}`,
  );
  if (!speedLit.test(bannerTs)) {
    errors.push(
      `console banner.tsx walk/run must match kit motion ` +
        `(expected intensity >= 2 ? ${run} : ${walk})`,
    );
  }

  if ((scene.stages?.length ?? 0) !== g.stageCount) {
    errors.push(
      `kit stages length ${scene.stages?.length} != stageCount ${g.stageCount}`,
    );
  }
}

if (errors.length) {
  console.error("kit/check-consumers FAIL:");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}

const bits = [
  `mark v${mark.version}`,
  `scene v${scene.version}`,
  g ? `stageWidthPx=${g.stageWidthPx}` : null,
  m ? `walk=${m.walkPxPerSec} run=${m.runPxPerSec}` : null,
  existsSync(consoleDir) ? "console aligned" : "console absent (skipped)",
].filter(Boolean);
console.log(`kit/check-consumers OK — ${bits.join(" · ")}`);
