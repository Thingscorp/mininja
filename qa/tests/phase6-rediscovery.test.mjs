#!/usr/bin/env node
/** Phase 6 rediscovery — features missed in the first 130 matrix pulse. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kit = JSON.parse(readFileSync(join(root, "kit", "scene.json"), "utf8"));
const mark = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

// KIT-VAL-004 — check-consumers look-ahead closed-set
{
  const cc = read("kit/check-consumers.mjs");
  assert(/allowedLook/.test(cc), "KIT-VAL-004: allowedLook set");
  assert(/lookAheadLits/.test(cc), "KIT-VAL-004: scans viewW look-aheads");
  assert(
    /cameraLookAheadRight/.test(cc) && /cameraLookAheadLeft/.test(cc),
    "KIT-VAL-004: kit fields",
  );
  const r = spawnSync(process.execPath, [join(root, "kit", "check-consumers.mjs")], {
    encoding: "utf8",
  });
  assert(r.status === 0, `KIT-VAL-004 gate: ${r.stdout}${r.stderr}`);
}

// CON-TOOL-004 — brand-check buddy website guidance (Apps-fixed surface)
{
  const brand = read("console/scripts/brand-check.mjs");
  assert(/buddy|DOM apps/i.test(brand), "CON-TOOL-004: buddy docs");
  assert(/website/.test(brand) && /x:game/.test(brand), "CON-TOOL-004: both types narrated");
  assert(/rootDeclaresOgTypeGame/.test(brand), "CON-TOOL-004: game helper");
  assert(
    /hasCanvas\s*&&\s*!rootDeclaresOgTypeGame/.test(brand),
    "CON-TOOL-004: x:game warn only on canvas",
  );
  assert(
    /keep og:type="website"|og:type="website"|not pushed to x:game|buddy apps are not pushed/i.test(
      brand,
    ),
    "CON-TOOL-004: buddy not pushed to x:game",
  );
  const rootTsx = read("console/src/routes/__root.tsx");
  assert(/og:type/.test(rootTsx) && /website/.test(rootTsx), "CON-TOOL-004: console website");
  assert(!/x:game/.test(rootTsx), "CON-TOOL-004: console not coerced to x:game");
}

// CON-BANNER-004 — reduce-motion snap uses kit look-aheads
{
  const banner = read("console/src/components/banner.tsx");
  const laR = kit.motion.cameraLookAheadRight;
  const laL = kit.motion.cameraLookAheadLeft;
  assert(typeof laR === "number" && typeof laL === "number", "CON-BANNER-004: kit ratios");
  assert(!/viewW\s*\*\s*0\.35/.test(banner), "CON-BANNER-004: no legacy 0.35");
  assert(
    new RegExp(
      String.raw`facing\s*===\s*["']right["']\s*\?\s*${laR}\s*:\s*${laL}`,
    ).test(banner),
    "CON-BANNER-004: reduce-motion facing-aware kit look-aheads",
  );
}

// DOC-TM-001 — TRADEMARK.md contracts
{
  const tm = read("TRADEMARK.md");
  assert(/Thingscorp LLC/i.test(tm), "DOC-TM-001: owner");
  assert(/has no name|no name/i.test(tm), "DOC-TM-001: mascot unnamed");
  assert(/™/.test(tm) && /®/.test(tm), "DOC-TM-001: ™ vs ® guidance");
  assert(/Do\s+\*\*not\*\*\s+use the ®/i.test(tm), "DOC-TM-001: no ®");
  assert(!/Casque/i.test(tm), "DOC-TM-001: TRADEMARK must not name Casque");
  assert(
    (mark.forbiddenNames || []).includes("Casque"),
    "DOC-TM-001: kit still forbids Casque",
  );
}

// DOC-CHANGE-001 — CHANGELOG narrates kit versions
{
  const cl = read("CHANGELOG.md");
  assert(/1\.6\.0/.test(cl), "DOC-CHANGE-001: 1.6.0 narrated");
  assert(/kit\/(?:mark|scene)\.json/i.test(cl), "DOC-CHANGE-001: points at kit JSON");
  assert(!/STAGE_SEED/.test(cl), "DOC-CHANGE-001: no STAGE_SEED dual table");
}

// DOC-STYLE-001 — STYLEGUIDE unbridged emotions ↔ kit
{
  const sg = read("STYLEGUIDE.md");
  const unbridged = ["alert", "relieved", "sad", "startled"];
  const emotionIds = new Set(kit.emotions.map((e) => e.id));
  for (const id of unbridged) {
    assert(emotionIds.has(id), `DOC-STYLE-001: kit has ${id}`);
    assert(new RegExp(`\\b${id}\\b`).test(sg), `DOC-STYLE-001: STYLEGUIDE mentions ${id}`);
  }
  assert(
    /habitat|SceneIntent|expansion|not orphans/i.test(sg),
    "DOC-STYLE-001: expansion framing",
  );
  const bridge = Object.keys(kit.legacyFaceBridge || {});
  assert(bridge.length === 15, `DOC-STYLE-001: 15-face bridge (got ${bridge.length})`);
}

// BOT-SHELL-001 — SHELL extends COMMANDS (Apps surface; structural assert only)
{
  const eng = read("bot/console/engine.py");
  assert(/\bCOMMANDS\s*=/.test(eng), "BOT-SHELL-001: COMMANDS");
  assert(/\bSHELL\s*=\s*COMMANDS\s*\+/.test(eng), "BOT-SHELL-001: SHELL builds on COMMANDS");
}

// ADP-MARK-003 — facing always wins over mirrored storage
{
  const fromKit = read("adapters/mark/from-kit.mjs");
  assert(/facing always wins/i.test(fromKit), "ADP-MARK-003: facing always wins comment");
  assert(/export function linesFor/.test(fromKit), "ADP-MARK-003: linesFor");
  assert(
    /mirrorFacing/.test(fromKit) && /unmirrorFacing/.test(fromKit),
    "ADP-MARK-003: mirror helpers",
  );
  const readme = read("adapters/mark/README.md");
  assert(/facing always wins/i.test(readme), "ADP-MARK-003: README facing-wins");
}

console.log(
  "PASS  PHASE6-REDISCOVERY (KIT-VAL-004 CON-TOOL-004 CON-BANNER-004 DOC-TM-001 DOC-CHANGE-001 DOC-STYLE-001 BOT-SHELL-001 ADP-MARK-003)",
);
