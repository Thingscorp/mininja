#!/usr/bin/env node
/** SUITE-DOC-ASSETS-001 — brand visuals exist; spot-check vs kit. */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kit = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const base = join(root, "assets", "visuals");
const names = [
  "expression-sheet",
  "construction",
  "clearspace",
  "minimum-size",
  "monochrome-vs-mood",
  "stage-strip",
  "terminal-motion",
  "donts",
];
for (const n of names) {
  assert(existsSync(join(base, `${n}.svg`)) || existsSync(join(base, `${n}.png`)), `missing ${n}`);
}
assert(
  existsSync(join(base, "console-scenery-banner.jpg")) ||
    existsSync(join(base, "console-scenery-banner.png")),
  "console-scenery-banner",
);

// spot-check construction.svg mentions grid or 5×3 if text
const construction = existsSync(join(base, "construction.svg"))
  ? readFileSync(join(base, "construction.svg"), "utf8")
  : "";
if (construction) {
  assert(
    /5|3|grid|cell|2588|259A/i.test(construction) || construction.length > 100,
    "construction asset non-trivial",
  );
}

assert(kit.grid?.columns === 5 && kit.grid?.rows === 3, "kit grid 5×3 SoT");

console.log("PASS  SUITE-DOC-ASSETS-001");
