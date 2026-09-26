#!/usr/bin/env node
/**
 * Overlay kit faces / scene motion without forking console/.
 * Adapters stay the studs; you swap the brick specs (kit).
 *
 *   ./print-face.mjs allowed
 *   ./print-face.mjs allowed --ansi
 *   ./print-face.mjs allowed --facing left
 *   ./print-face.mjs wink
 *   ./print-face.mjs --list
 *   ./print-face.mjs --motion
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  hasFace,
  listFaces,
  lockup,
  mergeMark,
} from "../../adapters/mark/from-kit.mjs";
import { ansiLockupFromKit } from "../../adapters/ansi/render.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");

function loadJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? err.code : "";
    if (code === "ENOENT") {
      console.error("print-face: missing file: " + path);
    } else {
      console.error("print-face: cannot read JSON: " + path);
      console.error(String(err && err.message ? err.message : err));
    }
    process.exit(1);
  }
}

/** Scene overlay merge — motion / geometry only (mark uses adapters/mark mergeMark). */
function mergeScene(base, overlay) {
  return {
    ...base,
    ...overlay,
    motion: { ...(base.motion ?? {}), ...(overlay.motion ?? {}) },
    geometry: { ...(base.geometry ?? {}), ...(overlay.geometry ?? {}) },
  };
}

function usage() {
  process.stdout.write(`Usage: ./print-face.mjs [face] [options]

  FACE          print remixed mark (default: allowed — shows overlay eyes)
  --ansi        colorize via adapters/ansi (Node terminal chrome)
  --facing DIR  left | right (default: right)
  --list        face ids after overlay merge
  --motion      print merged scene motion speeds (scene-overlay.json)
  --help        this text

Overlays: mark-overlay.json · scene-overlay.json
Upstream kit stays untouched; adapters stay the studs.
Mark merge uses adapters/mark mergeMark (same helper hosts should call).

Examples:
  ./print-face.mjs allowed
  ./print-face.mjs allowed --ansi
  ./print-face.mjs allowed --facing left
  ./print-face.mjs wink
  ./print-face.mjs --list
  ./print-face.mjs --motion
`);
}

const args = process.argv.slice(2);
let face = "allowed";
let wantAnsi = false;
let wantList = false;
let wantMotion = false;
let wantHelp = false;
let facing = "right";

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--help" || a === "-h" || a === "help") wantHelp = true;
  else if (a === "--list" || a === "-l" || a === "list") wantList = true;
  else if (a === "--ansi") wantAnsi = true;
  else if (a === "--motion") wantMotion = true;
  else if (a === "--facing") {
    const next = args[++i];
    if (next == null || next.startsWith("-")) {
      console.error("print-face: --facing requires left or right");
      process.exit(1);
    }
    facing = next;
    if (facing !== "left" && facing !== "right") {
      console.error("print-face: facing must be left or right (got: " + facing + ")");
      process.exit(1);
    }
  } else if (a.startsWith("-")) {
    console.error("print-face: unknown option: " + a + " (try --help)");
    process.exit(1);
  } else face = a;
}

if (wantHelp) {
  usage();
  process.exit(0);
}

if (wantMotion) {
  const base = loadJson(join(root, "kit", "scene.json"));
  const overlay = loadJson(join(here, "scene-overlay.json"));
  const scene = mergeScene(base, overlay);
  const keys = ["walkPxPerSec", "runPxPerSec", "patrolPxPerSec"];
  for (const k of keys) {
    const before = base.motion?.[k];
    const after = scene.motion?.[k];
    const note = before !== after ? `  (upstream ${before})` : "";
    process.stdout.write(`${k}=${after}${note}\n`);
  }
  process.exit(0);
}

const base = loadJson(join(root, "kit", "mark.json"));
const overlay = loadJson(join(here, "mark-overlay.json"));
const kit = mergeMark(base, overlay);

if (wantList) {
  process.stdout.write(listFaces(kit).join("\n") + "\n");
  process.exit(0);
}

if (!hasFace(kit, face)) {
  console.error("print-face: unknown face: " + face);
  console.error("try: " + listFaces(kit).join(", "));
  console.error("(or: ./print-face.mjs --list)");
  process.exit(1);
}

const out = wantAnsi
  ? ansiLockupFromKit(kit, face, { facing })
  : lockup(kit, face, facing);
process.stdout.write(out + "\n");
