#!/usr/bin/env node
/**
 * Override kit faces without forking console/.
 * Adapters stay the studs; you swap the brick specs (kit).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lockup } from "../../adapters/mark/from-kit.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const base = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));
const overlay = JSON.parse(readFileSync(join(here, "mark-overlay.json"), "utf8"));

const kit = {
  ...base,
  ...overlay,
  faces: { ...base.faces, ...overlay.faces },
};

const face = process.argv[2] || "allowed";
process.stdout.write(lockup(kit, face) + "\n");
