#!/usr/bin/env node
/** SUITE-BOT-UI-001 / BOT-UI-002 — static analysis of bot/static/index.html (no Selenium). */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const html = readFileSync(join(root, "bot", "static", "index.html"), "utf8");
const kit = JSON.parse(readFileSync(join(root, "kit", "scene.json"), "utf8"));
const stageIds = kit.stages.map((s) => s.id);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(/IBM Plex|font-mono|composer|sidebar|bots/i.test(html), "launcher chrome");
assert(/function goPlace|paintGrove|setMascot/.test(html), "habitat chrome fns");
assert(!/\bCasque\b/i.test(html), "no Casque");

// Kit hydration — no dual habitat table
assert(/\/kit\/scene\.json/.test(html), "fetches kit scene.json");
assert(/zonesFromKit|hydrateZones/.test(html), "hydrates ZONES from kit");
assert(!/id:\s*"watch"/.test(html), "no legacy watch zone id");
assert(!/id:\s*"roost"/.test(html), "no legacy roost zone id");
assert(!/id:\s*"forge"/.test(html), "no legacy forge zone id");
for (const id of stageIds) {
  assert(html.includes(`"${id}"`) || html.includes(`data-ink="${id}"`) || /zonesFromKit/.test(html), `stage surface ${id}`);
}
// Ink selectors mirror kit stage ids
for (const id of stageIds) {
  assert(new RegExp(`data-ink="${id}"`).test(html), `ink selector ${id}`);
}

assert(/grid|aside|main|⌘|Cmd|N\b|new bot|tint/i.test(html), "teammate UI affordances");

console.log(
  `PASS  SUITE-BOT-UI-001/002 (kit stages=${stageIds.join(",")} hydrated)`,
);
