#!/usr/bin/env node
/**
 * Assert console scene runtime loads kit/scene.json (SoT) — no forked STAGE_SEED.
 * kit/ is the only catalog SoT — this fails if someone reintroduces dual tables.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const kit = JSON.parse(readFileSync(join(root, "kit", "scene.json"), "utf8"));
const sceneSrc = readFileSync(join(here, "..", "src", "lib", "scene.ts"), "utf8");

const g = kit.geometry;
const derivesWidth = /export const STAGE_WIDTH\s*=\s*kit\.geometry\.stageWidthPx/.test(
  sceneSrc,
);
const widthMatch = sceneSrc.match(/export const STAGE_WIDTH\s*=\s*(\d+)/);
const width = widthMatch ? Number(widthMatch[1]) : null;
const derivesAnchor = /export const ANCHOR_RATIO\s*=\s*kit\.geometry\.anchorRatio/.test(
  sceneSrc,
);
const anchorOk =
  derivesAnchor ||
  sceneSrc.includes(`* ${g.anchorRatio}`) ||
  sceneSrc.includes(`*${g.anchorRatio}`);
const derivesMotion =
  /export const WALK_PX_PER_SEC\s*=\s*kit\.motion\.walkPxPerSec/.test(sceneSrc) &&
  /export const RUN_PX_PER_SEC\s*=\s*kit\.motion\.runPxPerSec/.test(sceneSrc);
const loadsKit =
  sceneSrc.includes("kit/scene.json") && sceneSrc.includes("registerFromKit");
const dualTable =
  /\bSTAGE_SEED\b/.test(sceneSrc) ||
  /\bEMOTION_SEED\b/.test(sceneSrc) ||
  /\bACTION_SEED\b/.test(sceneSrc);

const errors = [];
if (!derivesWidth && width !== g.stageWidthPx) {
  errors.push(
    `STAGE_WIDTH must derive kit.geometry.stageWidthPx (got ${width}, kit ${g.stageWidthPx})`,
  );
}
if (!anchorOk) {
  errors.push(`scene.ts missing anchorRatio ${g.anchorRatio} (kit SoT)`);
}
if (!derivesMotion) {
  errors.push("scene.ts must export WALK/RUN_PX_PER_SEC from kit.motion");
}
if ((kit.stages?.length ?? 0) !== g.stageCount) {
  errors.push(`kit stages length ${kit.stages?.length} != stageCount ${g.stageCount}`);
}
if (!loadsKit) {
  errors.push("scene.ts must import kit/scene.json and call registerFromKit()");
}
if (dualTable) {
  errors.push("scene.ts must not define STAGE_SEED / EMOTION_SEED / ACTION_SEED (kit is SoT)");
}
if (/Casque/i.test(sceneSrc)) {
  errors.push("scene.ts must not contain Casque (mascot unnamed)");
}

if (errors.length) {
  console.error("kit-align FAIL:");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}
console.log(
  `kit-align OK — stageWidthPx=${g.stageWidthPx} anchorRatio=${g.anchorRatio} stages=${g.stageCount} load=kit`,
);
