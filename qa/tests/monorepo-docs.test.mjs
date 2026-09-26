#!/usr/bin/env node
/** SUITE-DOC-* — brand narrators point at kit; graph connected; no affirmative Casque naming. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

/** Fail only on affirmative naming, not "never Casque" / forbiddenLists. */
function affirmsCasqueName(text) {
  const lines = text.split(/\n/);
  for (const line of lines) {
    if (!/\bCasque\b/.test(line)) continue;
    if (/never\s+Casque|not\s+Casque|forbidden|do\s+not\s+name|unnamed|no\s+Casque|avoid\s+Casque|≠\s*Casque|!=\s*Casque/i.test(line)) {
      continue;
    }
    return line.trim();
  }
  return null;
}

const docs = [
  "README.md",
  "BRAND.md",
  "BRAND-RULES.md",
  "PORTING.md",
  "GARDEN.md",
  "RECIPES.md",
  "SCENERY.md",
  "STYLEGUIDE.md",
  "TERMINAL-MOTION.md",
  "CONSTRUCTION.md",
  "HABITAT-PORT.md",
  "adapters/README.md",
  "examples/README.md",
  "kit/README.md",
];

for (const rel of docs) {
  const text = readFileSync(join(root, rel), "utf8");
  const bad = affirmsCasqueName(text);
  assert(!bad, `${rel} affirmatively names Casque: ${bad}`);
}

const recipes = readFileSync(join(root, "RECIPES.md"), "utf8");
assert(/kit\/mark\.json|faces/i.test(recipes), "RECIPES keeps face seam");
assert(/growth|garden/i.test(recipes), "RECIPES keeps garden/growth seam");
assert(/later|Phase later|not required for first/i.test(recipes), "RECIPES marked later plate");

const garden = readFileSync(join(root, "GARDEN.md"), "utf8");
assert(/kit\/scene\.json|garden/i.test(garden), "GARDEN points at kit");

const porting = readFileSync(join(root, "PORTING.md"), "utf8");
assert(/presenceLadder|mark-only|faces/i.test(porting), "PORTING ladder present");

const readme = readFileSync(join(root, "README.md"), "utf8");
assert(!/\.mp4/i.test(readme), "README has no mp4 embed");
assert(/kit\//.test(readme), "README points at kit");

console.log("PASS  SUITE-DOC-GRAPH / README / PORTING");
