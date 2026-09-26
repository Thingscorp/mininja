/**
 * Minimal kit QA harness. No external deps.
 * Tests register via `test(id, featureId, scenarioType, fn)`.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const qaDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const kitDir = join(qaDir, "..");
const root = join(kitDir, "..");

export const PATHS = {
  root,
  kitDir,
  qaDir,
  mark: join(kitDir, "mark.json"),
  scene: join(kitDir, "scene.json"),
  checkConsumers: join(kitDir, "check-consumers.mjs"),
  simGrid: join(root, "scripts", "sim-grid-habitat.py"),
  terminalMotion: join(root, "TERMINAL-MOTION.md"),
  gardenDoc: join(root, "GARDEN.md"),
  recipesDoc: join(root, "RECIPES.md"),
  brandDoc: join(root, "BRAND.md"),
  styleguide: join(root, "STYLEGUIDE.md"),
  porting: join(root, "PORTING.md"),
  changelog: join(root, "CHANGELOG.md"),
  fromKit: join(root, "adapters", "mark", "from-kit.mjs"),
  presenceAttrs: join(root, "adapters", "presence", "attrs.mjs"),
  presenceCss: join(root, "adapters", "presence", "presence.css"),
  sceneTs: join(root, "console", "src", "lib", "scene.ts"),
};

export function loadMark() {
  return JSON.parse(readFileSync(PATHS.mark, "utf8"));
}
export function loadScene() {
  return JSON.parse(readFileSync(PATHS.scene, "utf8"));
}
export function readText(p) {
  return readFileSync(p, "utf8");
}

/** @type {{ id: string, featureId: string, scenarioType: string, fn: () => void|Promise<void> }[]} */
export const registry = [];

export function test(id, featureId, scenarioType, fn) {
  registry.push({ id, featureId, scenarioType, fn });
}

export function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assertion failed");
}
export function eq(a, b, msg) {
  if (a !== b) throw new Error(msg || `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}
export function deepEq(a, b, msg) {
  const sa = JSON.stringify(a);
  const sb = JSON.stringify(b);
  if (sa !== sb) throw new Error(msg || `expected ${sb}, got ${sa}`);
}
export function approx(a, b, eps = 1e-9, msg) {
  if (Math.abs(a - b) > eps) throw new Error(msg || `expected ~${b}, got ${a}`);
}
export function includes(arr, item, msg) {
  assert(Array.isArray(arr) && arr.includes(item), msg || `missing ${item}`);
}
export function everyIn(items, set, msg) {
  for (const x of items) {
    assert(set.has(x) || (Array.isArray(set) && set.includes(x)), msg || `${x} not in set`);
  }
}

export function runCheckConsumers() {
  const r = spawnSync(process.execPath, [PATHS.checkConsumers], {
    encoding: "utf8",
    cwd: root,
  });
  return {
    ok: r.status === 0,
    status: r.status ?? 1,
    stdout: r.stdout || "",
    stderr: r.stderr || "",
  };
}

export async function importFromKit() {
  return import(pathToFileURL(PATHS.fromKit).href);
}
export async function importPresenceAttrs() {
  return import(pathToFileURL(PATHS.presenceAttrs).href);
}
