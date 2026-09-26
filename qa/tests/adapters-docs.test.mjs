#!/usr/bin/env node
/** SUITE-ADP-DOC-001 — adapters README ladder; kit pointers; no affirmative Casque. */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function affirmsCasque(text) {
  for (const line of text.split("\n")) {
    if (!/\bCasque\b/.test(line)) continue;
    if (/never\s+Casque|not\s+Casque|forbidden|do\s+not\s+name|unnamed|no\s+Casque|avoid\s+Casque|≠\s*Casque/i.test(line)) continue;
    return line.trim();
  }
  return null;
}

const paths = [
  "adapters/README.md",
  "adapters/mark/README.md",
  "adapters/ansi/README.md",
  "adapters/react/README.md",
  "adapters/presence/README.md",
];
for (const rel of paths) {
  assert(existsSync(join(root, rel)), `missing ${rel}`);
  const text = readFileSync(join(root, rel), "utf8");
  const bad = affirmsCasque(text);
  assert(!bad, `${rel} names Casque: ${bad}`);
  assert(/kit\/|mark\.json|scene\.json|presence|faces|ladder|port/i.test(text), `${rel} kit/ladder pointer`);
}

const top = readFileSync(join(root, "adapters", "README.md"), "utf8");
assert(/mark|faces|presence|scene/i.test(top), "ladder vocabulary");

console.log("PASS  SUITE-ADP-DOC-001");
