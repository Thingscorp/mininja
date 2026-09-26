#!/usr/bin/env node
/**
 * Bake monochrome mark SVGs (and optional PNGs) from kit/mark.json.
 * Font stack comes from mark.typeface.cssStack (IBM Plex Mono first).
 *
 * Usage:
 *   node scripts/export-mark-assets.mjs           # SVGs only
 *   node scripts/export-mark-assets.mjs --png     # also rsvg-convert PNGs when available
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mark = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));
const wantPng = process.argv.includes("--png");

const typeface = mark.typeface;
if (!typeface?.family || !typeface?.cssStack) {
  console.error("kit/mark.json missing typeface.family / typeface.cssStack");
  process.exit(1);
}

const FONT = typeface.cssStack;
const FILL = "#0f172a";
const CELL = 20;
const ORIGIN_X = 30;
const ORIGIN_Y = 50;
const VIEW = 140;
const OUT_PX = 512;

function escXmlText(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cellText(ch, col, row) {
  if (ch === " " || ch === "") return "";
  const x = ORIGIN_X + col * CELL;
  const y = ORIGIN_Y + row * CELL;
  // Single-quoted attr so cssStack double-quotes stay literal (match existing visuals).
  return `  <text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family='${FONT}' font-size="${CELL}" fill="${FILL}">${escXmlText(ch)}</text>\n`;
}

function expressionSvg(id, face) {
  const lines = face.lines;
  const preview = lines.join("\n");
  let body = "";
  for (let row = 0; row < 3; row++) {
    const chars = [...lines[row]];
    for (let col = 0; col < 5; col++) {
      body += cellText(chars[col] ?? " ", col, row);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" width="${OUT_PX}" height="${OUT_PX}" role="img" aria-label="Mininja ${escXmlText(id)}">
  <!--
  Mininja mark — stacked Unicode lockup (glyphs ARE the mark), state: ${id}
${preview.split("\n").map((l) => `  ${l}`).join("\n")}
  Per-cell monospace grid 5×3; square viewBox with ≥1-row clearspace.
  Typeface: ${typeface.family} (kit/mark.json typeface)
  -->
  <title>Mininja — ${escXmlText(id)}</title>
${body}</svg>
`;
}

const assetsDir = join(root, "assets");
const faces = mark.faces || {};
let nSvg = 0;
for (const [id, face] of Object.entries(faces)) {
  if (!face?.lines || face.lines.length !== 3) continue;
  writeFileSync(join(assetsDir, `mininja-${id}.svg`), expressionSvg(id, face));
  nSvg += 1;
}

/** Patch any leftover non-kit mono stacks in visuals/*.svg to kit cssStack. */
const LEGACY_MONO_RE =
  /"[^"]+",\s*"[^"]+",\s*"DejaVu Sans Mono",\s*ui-monospace,\s*Menlo,\s*Consolas,\s*monospace/g;
const visualsDir = join(assetsDir, "visuals");
let nVis = 0;
if (existsSync(visualsDir)) {
  for (const name of readdirSync(visualsDir)) {
    if (!name.endsWith(".svg")) continue;
    const path = join(visualsDir, name);
    const before = readFileSync(path, "utf8");
    const after = before.replace(LEGACY_MONO_RE, FONT);
    if (after !== before) {
      writeFileSync(path, after);
      nVis += 1;
    }
  }
}

function hasRsvg() {
  return spawnSync("rsvg-convert", ["--version"], { encoding: "utf8" }).status === 0;
}

let nPng = 0;
if (wantPng) {
  if (!hasRsvg()) {
    console.warn("rsvg-convert not found — skipping PNG regenerate");
  } else {
    for (const f of readdirSync(assetsDir).filter((x) => x.startsWith("mininja-") && x.endsWith(".svg"))) {
      const svg = join(assetsDir, f);
      const png = join(assetsDir, f.replace(/\.svg$/, ".png"));
      const r = spawnSync("rsvg-convert", ["-w", String(OUT_PX), "-h", String(OUT_PX), "-o", png, svg], {
        encoding: "utf8",
      });
      if (r.status === 0) nPng += 1;
      else console.warn(`PNG fail ${f}: ${r.stderr || r.status}`);
    }
    if (existsSync(visualsDir)) {
      for (const f of readdirSync(visualsDir).filter((x) => x.endsWith(".svg"))) {
        const svg = join(visualsDir, f);
        const png = join(visualsDir, f.replace(/\.svg$/, ".png"));
        if (!existsSync(png)) continue;
        const r = spawnSync("rsvg-convert", ["-o", png, svg], { encoding: "utf8" });
        if (r.status === 0) nPng += 1;
        else console.warn(`visual PNG fail ${f}: ${r.stderr || r.status}`);
      }
    }
  }
}

console.log(
  `export-mark-assets: ${nSvg} expression SVGs, ${nVis} visuals patched, ${nPng} PNGs` +
    ` (face=${typeface.family} v${mark.version})`,
);
