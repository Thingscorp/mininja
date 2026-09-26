#!/usr/bin/env node
/** SUITE-ADP-PRES-001 — presenceAttrs + truncation; motion ⊂ kit actions. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { presenceAttrs, chipCopy, rosterCopy } from "../../adapters/presence/attrs.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const scene = JSON.parse(readFileSync(join(root, "kit", "scene.json"), "utf8"));
const actionIds = new Set((scene.actions || []).map((a) => a.id));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const a = presenceAttrs({ face: "evaluating", stage: "archives", action: "search" });
assert(a["data-face"] === "evaluating", "face");
assert(a["data-stage"] === "archives", "stage");
assert(a["data-action"] === "search", "action");
assert(a["data-motion"] === "search", "motion falls back to action");
assert(a["data-state"] === "search", "state mirrors motion");
assert(a["aria-label"] === "Mininja mark", "unnamed mark label");
assert(actionIds.has("search"), "search is kit action");
assert(actionIds.has("idle") && actionIds.has("think"), "idle/think kit actions");

const chip = chipCopy({ peer: "abcdefghijklmnopqrs", maxPeer: 18 });
assert(chip.peer.endsWith("…"), "peer truncates");
assert(chip.peer.length === 18, "peer max length");

const row = rosterCopy({ name: "x".repeat(40), maxName: 22 });
assert(row.name.endsWith("…") && row.name.length === 22, "roster truncates");

const css = readFileSync(join(root, "adapters", "presence", "presence.css"), "utf8");
assert(!/Casque/i.test(css), "no Casque in presence.css");
assert(/data-motion=["']search["']|\[data-motion="search"\]/.test(css), "css keys search motion");

console.log("PASS  SUITE-ADP-PRES-001");
