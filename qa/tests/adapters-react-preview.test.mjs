#!/usr/bin/env node
/** SUITE-ADP-REACT-001 / EX-REACT-001 — DOM attr contract via preview.mjs (no React install). */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const preview = join(root, "examples", "react", "preview.mjs");
const kit = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));
const tsx = readFileSync(join(root, "adapters", "react", "Mininja.tsx"), "utf8");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run(args) {
  return spawnSync(process.execPath, [preview, ...args], { encoding: "utf8" });
}

const idle = run([]);
assert(idle.status === 0, `idle exit ${idle.status}: ${idle.stderr}`);
assert(/aria-label="Mininja mark"/.test(idle.stdout), "aria-label Mininja mark");
assert(/data-face="idle"/.test(idle.stdout), "data-face idle");
assert(/data-facing="right"/.test(idle.stdout), "data-facing right");
assert(idle.stdout.includes(kit.canonicalIdle.lines[0]), "canonical hood in pre");

const staged = run(["evaluating", "--stage", "archives", "--action", "search", "--motion", "search"]);
assert(staged.status === 0, `staged exit ${staged.status}`);
assert(/data-stage="archives"/.test(staged.stdout), "data-stage");
assert(/data-action="search"/.test(staged.stdout), "data-action");
assert(/data-motion="search"/.test(staged.stdout), "data-motion");
assert(/data-state="search"/.test(staged.stdout), "data-state mirrors motion");

const left = run(["idle", "--facing", "left"]);
assert(left.status === 0, "facing left");
assert(/data-facing="left"/.test(left.stdout), "data-facing left");
assert(left.stdout.includes(kit.mirroredIdle.lines[0]), "mirrored hood");

const reduce = run(["idle", "--reduced-motion"]);
assert(/data-reduced-motion="true"/.test(reduce.stdout), "reduced-motion attr");

const list = run(["--list"]);
assert(list.status === 0, "--list");
for (const id of Object.keys(kit.faces)) {
  assert(list.stdout.includes(id), `--list missing ${id}`);
}

// Source contract: no kit load / no fs in Mininja.tsx
assert(!/readFileSync|node:fs|import\.meta\.url/.test(tsx), "Mininja.tsx presentational — no fs");
assert(/aria-label.*Mininja mark|Mininja mark/.test(tsx), "aria-label in component");
assert(!/Casque/i.test(tsx), "no Casque in Mininja.tsx");

console.log("PASS  SUITE-ADP-REACT-001 / EX-REACT-001");
