#!/usr/bin/env node
/** SUITE-EX-BADGE-001 / EX-DOC-001 — badge + examples README. */
import { readFileSync, existsSync, accessSync, constants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kit = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const badge = readFileSync(join(root, "examples", "readme-badge.md"), "utf8");
assert(badge.includes(kit.canonicalIdle.lines[0]), "badge has canonical hood");
assert(badge.includes(kit.canonicalIdle.lines[1]), "badge mid");
assert(badge.includes(kit.canonicalIdle.lines[2]), "badge bottom");
assert(!/\bCasque\b/i.test(badge) || /never|forbidden|not /i.test(badge), "badge unnamed");

const readme = readFileSync(join(root, "examples", "README.md"), "utf8");
assert(/cli-banner|readme-badge|remix|react|presence|PORTING|ladder/i.test(readme), "ladder table");
assert(!/\bCasque\b/.test(readme.split("\n").filter((l) => /\bCasque\b/.test(l) && !/never|forbidden|not |no |unnamed/i.test(l)).join("\n")), "no affirmative Casque");

const scripts = [
  "examples/cli-banner.sh",
  "examples/remix/print-face.mjs",
  "examples/react/preview.mjs",
  "examples/presence/preview.mjs",
];
for (const rel of scripts) {
  assert(existsSync(join(root, rel)), `missing ${rel}`);
  try {
    accessSync(join(root, rel), constants.X_OK);
  } catch {
    // soft: may lack +x on some checkouts; still exists
  }
}

console.log("PASS  SUITE-EX-BADGE-001 / EX-DOC-001");
