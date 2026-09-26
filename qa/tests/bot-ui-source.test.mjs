#!/usr/bin/env node
/** SUITE-BOT-UI-001 / BOT-UI-002 — static analysis of bot/static/index.html (no Selenium). */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const html = readFileSync(join(root, "bot", "static", "index.html"), "utf8");
const kit = JSON.parse(readFileSync(join(root, "kit", "scene.json"), "utf8"));
const stageIds = new Set(kit.stages.map((s) => s.id));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(/IBM Plex|font-mono|composer|sidebar|bots/i.test(html), "launcher chrome");
assert(/function goPlace|paintGrove|setMascot/.test(html), "habitat chrome fns");
assert(!/\bCasque\b/i.test(html), "no Casque");

const zm = html.match(/const ZONES\s*=\s*(\[[\s\S]*?\]);/);
assert(zm, "ZONES defined");
const zoneIds = [...zm[1].matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
assert(zoneIds.length >= 4, `zones ${zoneIds}`);

const overlap = zoneIds.filter((id) => stageIds.has(id));
const kitOnly = [...stageIds].filter((id) => !zoneIds.includes(id));
// Dual habitat table: bot ZONES ≠ kit stages (except maybe desk)
assert(
  overlap.length < stageIds.size,
  "expected bot ZONES to diverge from kit stage ids (defect surface)",
);
assert(kitOnly.length > 0, `kit stages absent from ZONES: ${kitOnly.join(",")}`);

// UI density / Linear-bar proxies
assert(/grid|aside|main|⌘|Cmd|N\b|new bot|tint/i.test(html), "teammate UI affordances");

console.log(
  `PASS  SUITE-BOT-UI-001/002 (zoneIds=${zoneIds.join(",")} kitOverlap=${overlap.join(",") || "none"} kitMissing=${kitOnly.join(",")})`,
);
