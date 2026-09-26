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
const stillFnn = qaJson.every((f) => /^F\d+/.test(String(idOf(f))));
assert(stillFnn, "expected Aug Fnn ids (DEFECT-CON-QA-001 surface)");

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
assert(/x:game/.test(brand), "brand-check still mentions x:game (buddy warn surface)");
assert(/600|MAX_CARD/i.test(brand), "card byte budget");

const mig = join(root, "console", "migrations");
assert(existsSync(mig) && readdirSync(mig).some((f) => /auth|sql/i.test(f)), "auth migration");

console.log("PASS  SUITE-CON-PLUG / AUTH / TOOL-002 (Fnn drift + x:game warn asserted)");
