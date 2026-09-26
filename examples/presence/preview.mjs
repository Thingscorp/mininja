#!/usr/bin/env node
/**
 * Presence craft preview — slots (idle + search) + Messaged chip + sidebar roster row.
 * No React. Proves data-motion / data-state seams + --fg tint.
 *
 *   ./examples/presence/preview.mjs
 *   ./examples/presence/preview.mjs --html > /tmp/mininja-presence.html
 *   ./examples/presence/preview.mjs --list-actions
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { linesFor } from "../../adapters/mark/from-kit.mjs";
import {
  attrsToString,
  chipCopy,
  esc,
  presenceAttrs,
  rosterCopy,
} from "../../adapters/presence/attrs.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function usage() {
  process.stdout.write(`Usage: ./examples/presence/preview.mjs [options]

  (no args)         idle + search slots, Messaged chip, sidebar roster row
  --html            full standalone HTML document (pipe to a file and open)
  --list-actions    kit/scene.json action ids (motion seam vocabulary)
  --peer NAME       chip peer label (default: alex-from-design)
  --agent NAME      sidebar row agent label (default: ports-presence-agent)
  --fg COLOR        chip --fg tint (default: #FF6700)
  --row-fg COLOR    sidebar mark --fg (default: #E11D48)
  --help            this text

Motion ids are kit action strings — searching-like → search. No parallel expression table.
`);
}

const args = process.argv.slice(2);
let wantHtml = false;
let wantList = false;
let wantHelp = false;
let peer = "alex-from-design";
let agent = "ports-presence-agent";
let fg = "#FF6700";
let rowFg = "#E11D48";

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--help" || a === "-h") wantHelp = true;
  else if (a === "--html") wantHtml = true;
  else if (a === "--list-actions") wantList = true;
  else if (a === "--peer") {
    peer = args[++i] ?? "";
    if (!peer) {
      console.error("--peer requires a name");
      process.exit(1);
    }
  } else if (a === "--agent") {
    agent = args[++i] ?? "";
    if (!agent) {
      console.error("--agent requires a name");
      process.exit(1);
    }
  } else if (a === "--fg") {
    fg = args[++i] ?? "";
    if (!fg) {
      console.error("--fg requires a CSS color");
      process.exit(1);
    }
  } else if (a === "--row-fg") {
    rowFg = args[++i] ?? "";
    if (!rowFg) {
      console.error("--row-fg requires a CSS color");
      process.exit(1);
    }
  } else if (a.startsWith("-")) {
    console.error("unknown option: " + a + " (try --help)");
    process.exit(1);
  } else {
    console.error("unexpected arg: " + a + " (try --help)");
    process.exit(1);
  }
}

if (wantHelp) {
  usage();
  process.exit(0);
}

const mark = loadJson(join(root, "kit", "mark.json"));
const scene = loadJson(join(root, "kit", "scene.json"));

if (wantList) {
  const ids = (scene.actions ?? []).map((a) => a.id);
  process.stdout.write(ids.join("\n") + "\n");
  process.exit(0);
}

const chipSvg = readFileSync(
  join(root, "adapters", "presence", "mark-chip.svg"),
  "utf8",
).trim();
const css = readFileSync(
  join(root, "adapters", "presence", "presence.css"),
  "utf8",
);

/** Decorative inline SVG (strip a11y; parent names the control). */
function decoMark(svg) {
  return svg
    .replace(/\srole="img"/, "")
    .replace(/\saria-label="[^"]*"/, "")
    .replace("<svg ", '<svg focusable="false" aria-hidden="true" ');
}

function markPre(face, motion, stage, action) {
  const lines = linesFor(mark, face);
  const attrs = presenceAttrs({
    face,
    stage,
    action,
    motion,
    className: "mininja-mark",
  });
  const body = lines.map(esc).join("\n");
  return `<pre ${attrsToString(attrs)} style="margin:0;line-height:1;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-weight:500;font-size:12px;color:var(--fg);white-space:pre">${body}</pre>`;
}

function slot(status, face, motion, stage, action, tint) {
  return `<div class="mininja-slot" style="--fg:${esc(tint.fg)};--bg:${esc(tint.bg)}">
  <span class="mininja-slot__status">${esc(status)}</span>
  ${markPre(face, motion, stage, action)}
</div>`;
}

const { label, peer: peerOut } = chipCopy({
  label: "Messaged",
  peer,
  maxPeer: 18,
});
const { name: agentOut } = rosterCopy({ name: agent, maxName: 22 });

const chipMark = decoMark(chipSvg);
const chipName = peerOut ? `${label} ${peerOut}` : label;
const chip = `<button type="button" class="mininja-chip" style="--fg:${esc(fg)}" aria-label="${esc(chipName)}" data-face="idle" data-motion="idle" data-state="idle">
  <span class="mininja-chip__mark">${chipMark}</span>
  <span class="mininja-chip__label">${esc(label)}</span>
  <span class="mininja-chip__peer">${esc(peerOut)}</span>
</button>`;

/* searching-like host feeling → kit action id `search` on data-state / data-motion */
/* Decorative mark: data-* seams only (parent <a> owns the accessible name). */
const row = `<a class="mininja-row" href="#agent" style="--fg:${esc(rowFg)};--badge:#22c55e" aria-label="${esc(agentOut)}">
  <span class="mininja-row__avatar">
    <span class="mininja-row__mark" data-face="evaluating" data-action="search" data-motion="search" data-state="search">${decoMark(chipSvg)}</span>
    <span class="mininja-row__badge" title="online"></span>
  </span>
  <span class="mininja-row__name">${esc(agentOut)}</span>
  <button type="button" class="mininja-row__more" aria-label="Options" tabindex="-1">···</button>
</a>`;

const idleSlot = slot("Idle", "idle", "idle", "dock", "idle", {
  fg: "#0f172a",
  bg: "#e2e8f0",
});
const searchSlot = slot(
  "Searching",
  "evaluating",
  "search",
  "archives",
  "search",
  {
    fg: "#0369a1",
    bg: "#e0f2fe",
  },
);

if (wantHtml) {
  process.stdout.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Mininja presence — slots + chip + sidebar row</title>
<style>
body{font-family:ui-sans-serif,system-ui,sans-serif;margin:2rem;background:#f8fafc;color:#0f172a}
h1{font-size:1.1rem;font-weight:650;margin:0 0 0.35rem}
h2{font-size:0.95rem;margin:1.25rem 0 0.5rem}
p{margin:0 0 1.25rem;max-width:36rem;color:#475569;font-size:0.9rem}
.row{display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center;margin-bottom:0.5rem}
.sidebar{width:min(100%,16rem);padding:0.35rem;border:1px solid #e2e8f0;border-radius:0.65rem;background:#fff}
code{font-size:0.8em}
${css}
</style>
</head>
<body>
<h1>Mininja presence craft</h1>
<p>Working slots + Messaged chip + sidebar roster row. Kit action ids on
<code>data-motion</code> / <code>data-state</code> (searching-like → <code>search</code>).
First-party mark only. Mascot has no name.</p>
<h2>Slots (idle + search)</h2>
<div class="row">
${idleSlot}
${searchSlot}
</div>
<h2>Messaged-style chip</h2>
<div class="row">
${chip}
</div>
<h2>Sidebar roster row</h2>
<div class="sidebar">
${row}
</div>
</body>
</html>
`);
  process.exit(0);
}

process.stdout.write(`# Mininja presence preview

## Idle slot
${idleSlot}

## Searching slot (kit action: search)
${searchSlot}

## Messaged chip
${chip}

## Sidebar roster row (mark@24, data-state=search)
${row}

# tips
#   ./examples/presence/preview.mjs --html > /tmp/mininja-presence.html
#   ./examples/presence/preview.mjs --list-actions
#   ./examples/presence/preview.mjs --agent "very-long-agent-display-name"
`);
