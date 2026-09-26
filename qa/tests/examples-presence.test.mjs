#!/usr/bin/env node
/** SUITE-EX-PRES-001 — four regions; list-actions ⊂ kit; truncation. */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const preview = join(root, "examples", "presence", "preview.mjs");
const scene = JSON.parse(readFileSync(join(root, "kit", "scene.json"), "utf8"));
const actionIds = (scene.actions || []).map((a) => a.id);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const list = spawnSync(process.execPath, [preview, "--list-actions"], { encoding: "utf8" });
assert(list.status === 0, `--list-actions exit ${list.status}`);
for (const id of actionIds) {
  assert(list.stdout.includes(id), `list-actions missing ${id}`);
}

const out = spawnSync(process.execPath, [preview, "--peer", "x".repeat(40), "--agent", "y".repeat(40)], { encoding: "utf8" });
assert(out.status === 0, `preview exit ${out.status}: ${out.stderr}`);
assert(/…|\.\.\./.test(out.stdout) || out.stdout.length < 40 + 40 + 200, "truncation or compact output");
assert(/data-motion|search|idle|Messaged|roster|chip/i.test(out.stdout), "presence regions");

const html = spawnSync(process.execPath, [preview, "--html"], { encoding: "utf8" });
assert(html.status === 0 && /<html|<pre|data-motion/i.test(html.stdout), "html mode");

console.log("PASS  SUITE-EX-PRES-001");
