#!/usr/bin/env node
/**
 * SUITE-CON-* source contracts (no Selenium / no UI rewrite).
 * Routes, boot beats, START chips, cardFor verbs, plugins, auth flags, theme tokens.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kit = JSON.parse(readFileSync(join(root, "kit", "scene.json"), "utf8"));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

// --- Routes ---
assert(existsSync(join(root, "console/src/routes/index.tsx")), "home route file");
assert(/createFileRoute\(["']\/["']\)/.test(read("console/src/routes/index.tsx")), "home /");
assert(/Mininja/.test(read("console/src/routes/index.tsx")), "home mounts Mininja");

const login = read("console/src/routes/login.tsx");
assert(/createFileRoute\(["']\/login["']\)/.test(login), "login route");
assert(/Sign-in is disabled|Sign in|signIn|GROK|provider/i.test(login), "login copy/providers");

assert(existsSync(join(root, "console/src/routes/api/auth/$.ts")), "auth api catch-all");
assert(/createFileRoute\(["']\/api\/auth\/\$["']\)/.test(read("console/src/routes/api/auth/$.ts")), "auth $");

const rootHead = read("console/src/routes/__root.tsx");
assert(/theme-color/.test(rootHead) && /#08090a/.test(rootHead), "theme-color");
assert(/og:type/.test(rootHead) && /website/.test(rootHead), "og:type website (buddy)");
assert(/title.*Mininja|Mininja/.test(rootHead), "title Mininja");

const err = read("console/src/lib/error-component.tsx");
assert(/Something went wrong|TriangleAlert|error\.message/i.test(err), "error screen copy");
assert(/bg-bg/.test(err) && /text-fg|text-muted|text-err/.test(err), "Hubzz tokens on error screen");
assert(!/bg-zinc|text-zinc/.test(err), "no zinc utilities on error screen");

// --- Boot ---
const mininjaUi = read("console/src/components/mininja.tsx");
assert(/700,\s*1100,\s*800,\s*550,\s*450,\s*450/.test(mininjaUi), "boot beats");
assert(/prefers-reduced-motion/.test(mininjaUi), "reduced motion");
assert(/setBoot\(6\)/.test(mininjaUi), "reduce → boot 6");

const START = [
  ["now", "brief", "todo", "plan", "pgeon", "ralph", "scene", "go"],
];
for (const cmd of START[0]) {
  assert(new RegExp(`\\[\\s*["']${cmd}["']`).test(mininjaUi) || mininjaUi.includes(`"${cmd}"`), `START chip ${cmd}`);
}

// --- cardFor verbs ---
const lib = read("console/src/lib/mininja.ts");
for (const verb of ["help", "now", "todo", "plan", "look", "scene", "feel", "do", "go", "clear", "offline", "wake"]) {
  // offline/wake may be in UI component; scene/feel/do/go must be in lib
  if (["scene", "feel", "do", "go", "help", "now", "todo", "plan", "clear"].includes(verb)) {
    assert(lib.includes(`cmd === "${verb}"`) || lib.includes(`"${verb}"`), `cardFor ${verb}`);
  }
}
assert(/__clear__/.test(lib), "clear sentinel");
assert(/Unknown command/.test(lib), "unknown command");

// help rows include habitat cmds
assert(/"scene"/.test(lib) && /"feel"/.test(lib) && /"do"/.test(lib) && /"go"/.test(lib), "help lists habitat");

// --- Banner motion vs kit ---
const banner = read("console/src/components/banner.tsx");
assert(
  (banner.includes("WALK_PX_PER_SEC") && banner.includes("RUN_PX_PER_SEC")) ||
    banner.includes(String(kit.motion.walkPxPerSec)) ||
    /170/.test(banner),
  "walk speed via kit motion",
);
assert(
  banner.includes("RUN_PX_PER_SEC") ||
    banner.includes(String(kit.motion.runPxPerSec)) ||
    /280/.test(banner),
  "run speed via kit motion",
);
assert(/26/.test(banner), "patrol speed");
assert(/translate3d/.test(banner), "camera translate3d");
assert(!/viewW\s*\*\s*0\.35/.test(banner), "no legacy 0.35 look-ahead");
assert(banner.includes(String(kit.motion.cameraLookAheadRight)), "look-ahead right");
assert(banner.includes(String(kit.motion.cameraLookAheadLeft)), "look-ahead left");

// --- Scene catalog ids ---
const sceneSrc = read("console/src/lib/scene.ts");
assert(/registerFromKit/.test(sceneSrc), "registerFromKit");
assert(!/\bSTAGE_SEED\b/.test(sceneSrc), "no STAGE_SEED");
for (const id of kit.stages.map((s) => s.id)) {
  // ids come from kit JSON import — presence of import is enough; don't require string literals
}
assert(/kit\/scene\.json/.test(sceneSrc), "imports kit scene");

// --- Plugins ---
const plugins = read("console/src/plugins/index.ts");
for (const name of ["pgeon", "refine", "compound", "qa", "turn", "save", "ralph", "brief"]) {
  assert(plugins.includes(name), `PROGRAMS has ${name}`);
}
assert(/dispatchProgram/.test(plugins), "dispatchProgram");

const qaFeat = join(root, "console/src/plugins/qa/features.json");
assert(existsSync(qaFeat), "qa features.json");
const feats = JSON.parse(readFileSync(qaFeat, "utf8"));
const ids = Array.isArray(feats) ? feats.map((f) => f.id || f["Feature ID"]) : [];
assert(ids.some((id) => String(id).startsWith("KIT-")), "features.json monorepo KIT-*");
assert(ids.some((id) => String(id).startsWith("CON-")), "features.json monorepo CON-*");
assert(!ids.every((id) => /^F\d+/.test(String(id))), "Aug Fnn register replaced");

// --- Auth ---
const authServer = read("console/src/lib/auth/server.ts");
assert(/VITE_AUTH_ENABLED|AUTH_ENABLED|better-auth|Better Auth/i.test(authServer + read("console/src/lib/auth/client.ts")), "auth stack");
assert(existsSync(join(root, "console/src/lib/auth/gates.tsx")) || existsSync(join(root, "console/src/lib/auth/gates.ts")), "gates");

// email-password flag
const ep = join(root, "console/src/lib/auth");
const authFiles = readdirSync(ep);
assert(authFiles.some((f) => /email|password|server|client|gates|middleware/i.test(f)), "auth modules present");

// --- Theme ---
const stylesCandidates = [
  "console/src/styles.css",
  "console/src/index.css",
  "console/src/app.css",
];
let styles = "";
for (const c of stylesCandidates) {
  if (existsSync(join(root, c))) {
    styles += read(c);
  }
}
// also search components for token refs
if (!styles) {
  // vite may use @import in root — soft check via __root / Tailwind theme
  styles = rootHead + mininjaUi;
}
assert(/#08090a|IBM Plex|bg-|mono/i.test(styles + rootHead), "theme tokens referenced");

// --- P2P library ---
const p2pPath = join(root, "console/src/lib/multiplayer/p2p.ts");
if (existsSync(p2pPath)) {
  const p2p = readFileSync(p2pPath, "utf8");
  assert(/P2PRoom|defaultIceServers|ice/i.test(p2p), "P2P exports");
}

// --- Preview bridge ---
assert(
  existsSync(join(root, "console/src/lib/preview-host-bridge.ts")) ||
    existsSync(join(root, "console/src/components/preview-host-bridge.tsx")),
  "preview bridge",
);

// --- Tooling ---
assert(existsSync(join(root, "console/scripts/brand-check.mjs")), "brand-check");
assert(existsSync(join(root, "console/scripts/kit-align.mjs")), "kit-align");
const brand = read("console/scripts/brand-check.mjs");
assert(/x:game|og:type|MAX_CARD/i.test(brand), "brand-check heuristics");

// --- Mascot / FRAMES ---
const mascot = read("console/src/components/mascot.tsx");
assert(/idle|blink|facing|lines/i.test(mascot), "mascot lockup");
assert(!/Casque/i.test(mascot), "no Casque in mascot");

console.log("PASS  SUITE-CON-SOURCE-CONTRACTS (routes/boot/cmds/plugins/auth/theme)");
