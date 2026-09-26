#!/usr/bin/env node
/**
 * SUITE-MARK-TYPEFACE-001 — IBM Plex Mono SoT for mark lockup consistency.
 * Kit typeface pin · no Cascadia in assets SVGs · console+bot self-host fonts.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function walkSvg(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) walkSvg(p, out);
    else if (name.name.endsWith(".svg")) out.push(p);
  }
  return out;
}

const mark = JSON.parse(read("kit/mark.json"));
assert(mark.typeface?.family === "IBM Plex Mono", "mark.typeface.family === IBM Plex Mono");
assert(
  Array.isArray(mark.typeface.weights) &&
    mark.typeface.weights.includes(400) &&
    mark.typeface.weights.includes(500) &&
    mark.typeface.weights.includes(600),
  "mark.typeface.weights includes 400/500/600",
);
assert(
  /IBM Plex Mono/.test(mark.typeface.cssStack || ""),
  "mark.typeface.cssStack leads with IBM Plex Mono",
);

const svgs = walkSvg(join(root, "assets"));
assert(svgs.length > 0, "assets has SVGs");
for (const p of svgs) {
  const body = readFileSync(p, "utf8");
  assert(!/Cascadia/i.test(body), `no Cascadia in ${p.slice(root.length + 1)}`);
}

const styles = read("console/src/styles.css");
assert(/@font-face/.test(styles), "console styles @font-face");
assert(/ibm-plex-mono-400\.ttf/.test(styles), "console @font-face 400");
assert(/ibm-plex-mono-500\.ttf/.test(styles), "console @font-face 500");
assert(/ibm-plex-mono-600\.ttf/.test(styles), "console @font-face 600");
assert(!/fonts\.googleapis\.com/.test(read("console/src/routes/__root.tsx")), "console no Google Fonts link");

for (const w of [400, 500, 600]) {
  assert(
    existsSync(join(root, "console", "public", "fonts", `ibm-plex-mono-${w}.ttf`)),
    `console font ${w}`,
  );
  assert(
    existsSync(join(root, "bot", "static", "fonts", `ibm-plex-mono-${w}.ttf`)),
    `bot font ${w}`,
  );
}
assert(existsSync(join(root, "console", "public", "fonts", "OFL.txt")), "console OFL");
assert(existsSync(join(root, "bot", "static", "fonts", "OFL.txt")), "bot OFL");

const react = read("adapters/react/Mininja.tsx");
assert(/IBM Plex Mono/.test(react), "react adapter mark uses IBM Plex Mono");

console.log(
  `PASS  SUITE-MARK-TYPEFACE-001 (mark v${mark.version}; ${svgs.length} SVGs Cascadia-free; console+bot Plex self-host)`,
);
