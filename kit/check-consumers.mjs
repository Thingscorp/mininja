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

  // OX-APP-001: STAGE_WIDTH / ANCHOR_RATIO derived from kit.geometry (not forked literals).
  const derivesWidth = /export const STAGE_WIDTH\s*=\s*kit\.geometry\.stageWidthPx/.test(
    sceneTs,
  );
  const widthMatch = sceneTs.match(/export const STAGE_WIDTH\s*=\s*(\d+)/);
  const width = widthMatch ? Number(widthMatch[1]) : null;
  if (!derivesWidth && width !== g.stageWidthPx) {
    errors.push(
      `console STAGE_WIDTH must derive kit.geometry.stageWidthPx ` +
        `(got literal ${width}, kit ${g.stageWidthPx})`,
    );
  }

  const derivesAnchor = /export const ANCHOR_RATIO\s*=\s*kit\.geometry\.anchorRatio/.test(
    sceneTs,
  );
  const anchorLitOk =
    sceneTs.includes(`* ${g.anchorRatio}`) || sceneTs.includes(`*${g.anchorRatio}`);
  if (!derivesAnchor && !anchorLitOk) {
    errors.push(`console scene.ts missing kit anchorRatio ${g.anchorRatio}`);
  }
  if (!sceneTs.includes("ANCHOR_RATIO") && !anchorLitOk) {
    errors.push("console scene.ts must use ANCHOR_RATIO or kit anchor literal");
  }

  // OX-APP-002: walk/run from kit.motion via scene exports (or legacy intensity literals).
  const walk = m.walkPxPerSec;
  const run = m.runPxPerSec;
  const derivesWalk = /export const WALK_PX_PER_SEC\s*=\s*kit\.motion\.walkPxPerSec/.test(
    sceneTs,
  );
  const derivesRun = /export const RUN_PX_PER_SEC\s*=\s*kit\.motion\.runPxPerSec/.test(
    sceneTs,
  );
  const bannerUsesDerived =
    bannerTs.includes("WALK_PX_PER_SEC") && bannerTs.includes("RUN_PX_PER_SEC");
  const speedLit = new RegExp(
    String.raw`intensity\s*>=\s*2\s*\?\s*${run}\s*:\s*${walk}`,
  );
  if (!(derivesWalk && derivesRun && bannerUsesDerived) && !speedLit.test(bannerTs)) {
    errors.push(
      `console banner walk/run must read kit.motion ` +
        `(WALK/RUN_PX_PER_SEC exports or intensity >= 2 ? ${run} : ${walk})`,
    );
  }

  if ((scene.stages?.length ?? 0) !== g.stageCount) {
    errors.push(
      `kit stages length ${scene.stages?.length} != stageCount ${g.stageCount}`,
    );
  }

  // Habitat: console must load/register from kit — forbid STAGE_SEED dual table.
  if (/\bSTAGE_SEED\b/.test(sceneTs) || /\bEMOTION_SEED\b/.test(sceneTs) || /\bACTION_SEED\b/.test(sceneTs)) {
    errors.push(
      "console scene.ts must not define STAGE_SEED/EMOTION_SEED/ACTION_SEED (kit is SoT)",
    );
  }
  if (!sceneTs.includes("kit/scene.json") || !sceneTs.includes("registerFromKit")) {
    errors.push("console scene.ts must import kit/scene.json and call registerFromKit()");
  }
  if (/Casque/i.test(sceneTs)) {
    errors.push("console scene.ts must not contain Casque (mascot unnamed; kit.forbiddenNames only)");
  }

  // Habitat chrome: register* + SceneIntent must remain the extension surface.
  for (const api of [
    "registerEmotion",
    "registerAction",
    "registerStage",
    "SceneIntent",
  ]) {
    if (!sceneTs.includes(api)) {
      errors.push(`console scene.ts missing habitat API ${api}`);
    }
  }

  // Banner camera look-ahead ratios from kit motion.
  // Every viewW*<n> look-ahead literal must be kit cameraLookAheadRight/Left — no legacy dual (e.g. 0.35).
  const laR = m.cameraLookAheadRight;
  const laL = m.cameraLookAheadLeft;
  const follow = m.cameraFollowRatePerSec;
  const allowedLook = new Set(
    [laR, laL].filter((n) => typeof n === "number").map((n) => String(n)),
  );
  const lookAheadLits = [...bannerTs.matchAll(/viewW\s*\*\s*(\d+(?:\.\d+)?)/g)].map(
    (m) => m[1],
  );
  if (allowedLook.size && lookAheadLits.length === 0) {
    errors.push(
      `console banner.tsx missing viewW* look-ahead (expected kit ${[...allowedLook].join("/")})`,
    );
  }
  for (const lit of lookAheadLits) {
    if (!allowedLook.has(lit)) {
      errors.push(
        `console banner.tsx look-ahead viewW*${lit} not in kit motion ` +
          `(allowed ${[...allowedLook].join(", ")})`,
      );
    }
  }
  if (laR != null && !lookAheadLits.includes(String(laR))) {
    errors.push(`console banner.tsx missing cameraLookAheadRight ${laR}`);
  }
  if (laL != null && !lookAheadLits.includes(String(laL))) {
    errors.push(`console banner.tsx missing cameraLookAheadLeft ${laL}`);
  }
  if (follow != null && !bannerTs.includes(String(follow))) {
    errors.push(`console banner.tsx missing cameraFollowRatePerSec ${follow}`);
  }

  // Prop kinds closed set — every kit kind must appear in console seed or types.
  for (const kind of scene.propKinds || []) {
    if (!sceneTs.includes(`"${kind}"`) && !sceneTs.includes(`'${kind}'`)) {
      errors.push(`console scene.ts missing propKind ${kind}`);
    }
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
  scene.stages ? `stages=${scene.stages.length}` : null,
  existsSync(consoleDir) ? "console habitat aligned" : "console absent (skipped)",
].filter(Boolean);
console.log(`kit/check-consumers OK — ${bits.join(" · ")}`);
