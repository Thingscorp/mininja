#!/usr/bin/env node
/**
 * Assert console scene constants match kit/scene.json.
 * kit/ is the only SoT — this fails if someone forks the numbers.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const kit = JSON.parse(readFileSync(join(root, "kit", "scene.json"), "utf8"));
const sceneSrc = readFileSync(join(here, "..", "src", "lib", "scene.ts"), "utf8");

const g = kit.geometry;
const widthMatch = sceneSrc.match(/export const STAGE_WIDTH\s*=\s*(\d+)/);
const width = widthMatch ? Number(widthMatch[1]) : null;
const anchorOk = sceneSrc.includes(`* ${g.anchorRatio}`) || sceneSrc.includes(`*${g.anchorRatio}`);

const errors = [];
if (width !== g.stageWidthPx) {
  errors.push(`STAGE_WIDTH=${width} but kit geometry.stageWidthPx=${g.stageWidthPx}`);
}
if (!anchorOk) {
  errors.push(`scene.ts missing anchorRatio ${g.anchorRatio} (kit SoT)`);
}
if ((kit.stages?.length ?? 0) !== g.stageCount) {
  errors.push(`kit stages length ${kit.stages?.length} != stageCount ${g.stageCount}`);
}

if (errors.length) {
  console.error("kit-align FAIL:");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}
console.log(
  `kit-align OK — stageWidthPx=${g.stageWidthPx} anchorRatio=${g.anchorRatio} stages=${g.stageCount}`,
);
