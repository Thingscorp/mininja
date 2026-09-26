#!/usr/bin/env node
/**
 * Emit the same <pre> contract as adapters/react/Mininja.tsx — no React install.
 *
 *   ./examples/react/preview.mjs
 *   ./examples/react/preview.mjs allowed
 *   ./examples/react/preview.mjs allowed --stage dock --action wave
 *   ./examples/react/preview.mjs evaluating --motion search --action search
 *   ./examples/react/preview.mjs idle --facing left
 *   ./examples/react/preview.mjs allowed --reduced-motion
 *   ./examples/react/preview.mjs --list
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  hasFace,
  linesFor,
  listFaces,
} from "../../adapters/mark/from-kit.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");

function loadJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? err.code : "";
    if (code === "ENOENT") {
      console.error("react/preview: missing file: " + path);
    } else {
      console.error("react/preview: cannot read JSON: " + path);
      console.error(String(err && err.message ? err.message : err));
    }
    process.exit(1);
  }
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function usage() {
  process.stdout.write(`Usage: ./examples/react/preview.mjs [face] [options]

  (no args)          idle lockup as <pre> HTML (Mininja contract)
  FACE               kit face id (default: idle)
  --stage ID         data-stage seam (kit/scene.json stages.*.id)
  --action ID        data-action seam (kit/scene.json actions.*.id)
  --motion ID        data-motion + data-state (kit action id; default: action)
  --facing DIR       left | right (default: right); mirrors lines via from-kit
  --reduced-motion   data-reduced-motion="true"
  --class NAME       class attribute
  --list             face ids from kit/mark.json
  --help             this text

No React required — proves the DOM seam before you wire adapters/react.

Examples:
  ./examples/react/preview.mjs
  ./examples/react/preview.mjs allowed --stage dock --action wave
  ./examples/react/preview.mjs evaluating --motion search --action search
  ./examples/react/preview.mjs idle --facing left
  ./examples/react/preview.mjs --list
`);
}

const args = process.argv.slice(2);
let face = "idle";
let stage = "";
let action = "";
let motion = "";
let facing = "right";
let reducedMotion = false;
let className = "";
let wantList = false;
let wantHelp = false;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--help" || a === "-h" || a === "help") wantHelp = true;
  else if (a === "--list" || a === "-l" || a === "list") wantList = true;
  else if (a === "--reduced-motion") reducedMotion = true;
  else if (a === "--stage") {
    stage = args[++i] ?? "";
    if (!stage || stage.startsWith("-")) {
      console.error("react/preview: --stage requires a kit stage id");
      process.exit(1);
    }
  } else if (a === "--action") {
    action = args[++i] ?? "";
    if (!action || action.startsWith("-")) {
      console.error("react/preview: --action requires a kit action id");
      process.exit(1);
    }
  } else if (a === "--motion") {
    motion = args[++i] ?? "";
    if (!motion || motion.startsWith("-")) {
      console.error("react/preview: --motion requires a kit action / presence id");
      process.exit(1);
    }
  } else if (a === "--facing") {
    const next = args[++i];
    if (next == null || next.startsWith("-")) {
      console.error("react/preview: --facing requires left or right");
      process.exit(1);
    }
    facing = next;
    if (facing !== "left" && facing !== "right") {
      console.error("react/preview: facing must be left or right (got: " + facing + ")");
      process.exit(1);
    }
  } else if (a === "--class") {
    className = args[++i] ?? "";
    if (!className || className.startsWith("-")) {
      console.error("react/preview: --class requires a class name");
      process.exit(1);
    }
  } else if (a.startsWith("-")) {
    console.error("react/preview: unknown option: " + a + " (try --help)");
    process.exit(1);
  } else {
    face = a;
  }
}

if (wantHelp) {
  usage();
  process.exit(0);
}

const kit = loadJson(join(root, "kit", "mark.json"));

if (wantList) {
  process.stdout.write(listFaces(kit).join("\n") + "\n");
  process.exit(0);
}

if (!hasFace(kit, face)) {
  console.error("react/preview: unknown face: " + face);
  console.error("try: " + listFaces(kit).join(", "));
  console.error("(or: ./examples/react/preview.mjs --list)");
  process.exit(1);
}

const lines = linesFor(kit, face, facing);
const motionId = motion || action;
const attrs = [
  className ? `class="${esc(className)}"` : null,
  `role="img"`,
  `aria-label="Mininja mark"`,
  `data-face="${esc(face)}"`,
  `data-facing="${esc(facing)}"`,
  `data-reduced-motion="${reducedMotion ? "true" : "false"}"`,
  stage ? `data-stage="${esc(stage)}"` : null,
  action ? `data-action="${esc(action)}"` : null,
  motionId
    ? `data-motion="${esc(motionId)}" data-state="${esc(motionId)}"`
    : null,
  `style="margin:0;line-height:1;font-family:"IBM Plex Mono",ui-monospace,"SF Mono",Menlo,monospace;font-weight:500;color:currentColor;white-space:pre"`,
]
  .filter(Boolean)
  .join(" ");

const body = lines.map(esc).join("\n");
process.stdout.write(`<pre ${attrs}>\n${body}\n</pre>\n`);
