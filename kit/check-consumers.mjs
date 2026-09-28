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

  // OX-APP-D04: camera / patrol from kit.motion via scene exports (or legacy literals).
  const laR = m.cameraLookAheadRight;
  const laL = m.cameraLookAheadLeft;
  const follow = m.cameraFollowRatePerSec;
  const patrol = m.patrolPxPerSec;
  const derivesCam =
    /export const CAMERA_LOOK_AHEAD_RIGHT\s*=\s*kit\.motion\.cameraLookAheadRight/.test(
      sceneTs,
    ) &&
    /export const CAMERA_LOOK_AHEAD_LEFT\s*=\s*kit\.motion\.cameraLookAheadLeft/.test(
      sceneTs,
    );
  const derivesFollow =
    /export const CAMERA_FOLLOW_RATE\s*=\s*kit\.motion\.cameraFollowRatePerSec/.test(
      sceneTs,
    );
  const derivesPatrol =
    /export const PATROL_PX_PER_SEC\s*=\s*kit\.motion\.patrolPxPerSec/.test(sceneTs);
  const bannerUsesCam =
    bannerTs.includes("CAMERA_LOOK_AHEAD_RIGHT") &&
    bannerTs.includes("CAMERA_LOOK_AHEAD_LEFT");
  const bannerUsesFollow = bannerTs.includes("CAMERA_FOLLOW_RATE");
  const bannerUsesPatrol = bannerTs.includes("PATROL_PX_PER_SEC");
  const allowedLook = new Set(
    [laR, laL].filter((n) => typeof n === "number").map((n) => String(n)),
  );
  const lookAheadLits = [...bannerTs.matchAll(/viewW\s*\*\s*(\d+(?:\.\d+)?)/g)].map(
    (m) => m[1],
  );
  const camLiteralOk =
    allowedLook.size > 0 &&
    lookAheadLits.length > 0 &&
    lookAheadLits.every((lit) => allowedLook.has(lit)) &&
    lookAheadLits.includes(String(laR)) &&
    lookAheadLits.includes(String(laL));
  if (!(derivesCam && bannerUsesCam) && !camLiteralOk) {
    errors.push(
      `console banner camera look-ahead must read kit.motion ` +
        `(CAMERA_LOOK_AHEAD_* exports or viewW*${laR}/${laL})`,
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
  if (follow != null && !(derivesFollow && bannerUsesFollow) && !bannerTs.includes(String(follow))) {
    errors.push(`console banner.tsx missing cameraFollowRatePerSec ${follow}`);
  }
  if (patrol != null && !(derivesPatrol && bannerUsesPatrol) && !bannerTs.includes(String(patrol))) {
    errors.push(`console banner.tsx missing patrolPxPerSec ${patrol}`);
  }

  // OX-APP-FRAMES: console FRAMES eyes+tone+motion from kit/mark.json faces.
  const mascotTs = readFileSync(join(consoleDir, "src", "lib", "mascot.ts"), "utf8");
  const hydratesFrames =
    mascotTs.includes("kit/mark.json") && /mark\.faces|framesFromKit/.test(mascotTs);
  if (!hydratesFrames) {
    errors.push(
      "console mascot.ts must import kit/mark.json and build FRAMES from mark.faces (OX-APP-FRAMES)",
    );
  }
  for (const [id, face] of Object.entries(mark.faces || {})) {
    const eyes = face?.eyes;
    if (!Array.isArray(eyes) || eyes.length < 2) continue;
    const mid = `██ ${eyes[0]}${eyes[1]}`;
    // Dual-table guard: hardcoded face blocks must match kit eyes/tone/motion.
    const blockRe = new RegExp(
      String.raw`${id}:\s*\{[\s\S]*?(?=\n\s*(?:[a-zA-Z]+:\s*\{|\};))`,
    );
    const block = mascotTs.match(blockRe)?.[0];
    if (block && /lines\s*:/.test(block)) {
      if (!block.includes(`${eyes[0]}${eyes[1]}`) && !block.includes(mid)) {
        errors.push(
          `console mascot.ts FRAMES ${id} eyes fork kit (want "${mid}") (OX-APP-FRAMES)`,
        );
      }
      const toneM = block.match(/tone:\s*"([^"]+)"/);
      if (toneM && face.tone && toneM[1] !== face.tone) {
        errors.push(
          `console mascot.ts FRAMES ${id} tone "${toneM[1]}" != kit "${face.tone}" (OX-APP-FRAMES)`,
        );
      }
      const motionM = block.match(/motion:\s*"([^"]+)"/);
      if (face.motion == null || face.motion === undefined) {
        if (motionM) {
          errors.push(
            `console mascot.ts FRAMES ${id} motion "${motionM[1]}" but kit null (OX-APP-FRAMES)`,
          );
        }
      } else if (motionM && motionM[1] !== face.motion) {
        errors.push(
          `console mascot.ts FRAMES ${id} motion "${motionM[1]}" != kit "${face.motion}" (OX-APP-FRAMES)`,
        );
      } else if (!motionM) {
        errors.push(
          `console mascot.ts FRAMES ${id} missing motion "${face.motion}" (OX-APP-FRAMES)`,
        );
      }
    } else if (!hydratesFrames && !mascotTs.includes(mid)) {
      errors.push(
        `console mascot.ts FRAMES missing kit face ${id} mid-row "${mid}" (OX-APP-FRAMES)`,
      );
    }
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
