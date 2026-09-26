#!/usr/bin/env node
/** SUITE-CON-PLUG-* / CON-AUTH-* / CON-TOOL-002 — source + JSON drift checks. */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const plugDir = join(root, "console", "src", "plugins");
const plugins = readdirSync(plugDir).filter((d) => existsSync(join(plugDir, d, "plugin.ts")) || existsSync(join(plugDir, d, "index.ts")));
for (const name of ["pgeon", "refine", "compound", "qa", "turn", "save", "ralph", "brief"]) {
  assert(plugins.includes(name) || existsSync(join(plugDir, name)), `plugin ${name}`);
}

const qaJson = JSON.parse(read("console/src/plugins/qa/features.json"));
assert(Array.isArray(qaJson) && qaJson.length > 0, "features.json array");
const idOf = (f) => f.id || f["Feature ID"];
assert(qaJson.every((f) => idOf(f)), "feature ids");
const ids = qaJson.map((f) => String(idOf(f)));
assert(ids.some((id) => id.startsWith("KIT-")), "matrix includes KIT-*");
assert(ids.some((id) => id.startsWith("CON-")), "matrix includes CON-*");
assert(ids.some((id) => id.startsWith("BOT-")), "matrix includes BOT-*");
assert(!ids.every((id) => /^F\d+/.test(id)), "Aug Fnn register replaced");
assert(qaJson.length >= 100, `features.json size ${qaJson.length}`);

const defectsJson = join(root, "console", "src", "plugins", "qa", "defects.json");
if (existsSync(defectsJson)) {
  const d = JSON.parse(readFileSync(defectsJson, "utf8"));
  assert(Array.isArray(d) || typeof d === "object", "defects.json parseable");
}

// Auth modules
const authDir = join(root, "console", "src", "lib", "auth");
assert(existsSync(authDir), "auth dir");
const authFiles = readdirSync(authDir);
assert(authFiles.some((f) => /server/.test(f)), "auth server");
assert(authFiles.some((f) => /client/.test(f)), "auth client");
assert(authFiles.some((f) => /gate|middleware/.test(f)), "gates/middleware");

const server = read(join("console/src/lib/auth", authFiles.find((f) => /server/.test(f))));
assert(!/sk-[a-zA-Z0-9]{20,}/.test(server), "no sk- secrets");
assert(/DATABASE_URL|pglite|postgres|better-auth|GROK_AUTH|VITE_AUTH/i.test(server + authFiles.join(",")), "env-configured auth");

const brand = read("console/scripts/brand-check.mjs");
assert(/x:game/.test(brand), "brand-check still mentions x:game (canvas warn surface)");
assert(/website/.test(brand), "brand-check documents buddy og:type website");
assert(/600|MAX_CARD/i.test(brand), "card byte budget");

const mig = join(root, "console", "migrations");
assert(existsSync(mig) && readdirSync(mig).some((f) => /auth|sql/i.test(f)), "auth migration");

console.log("PASS  SUITE-CON-PLUG / AUTH / TOOL-002 (monorepo matrix + x:game warn asserted)");
