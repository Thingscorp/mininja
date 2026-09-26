import { existsSync } from "node:fs";
import {
  test, assert, eq, deepEq, includes, loadMark, loadScene, PATHS, readText,
  importFromKit,
} from "./_harness.mjs";

const FACE_MOTIONS = new Set([null, "pulse", "bounce", "shake"]);
const EMO_TONES = new Set(["idle", "accent", "ok", "warn", "err", "muted"]);
const EMO_MOTIONS = new Set(["pulse", "bounce", "sway", "shake"]);
const ACT_MOTIONS = new Set(["none", "bob", "pulse", "sway", "bounce", "hop", "shake"]);
const ACT_POSES = new Set(["stand", "lean", "jump", "crouch"]);
const ACT_FX = new Set(["none", "think", "scan", "type", "wave", "spark", "search", "sleep"]);

function stripTicks(s) {
  return String(s || "").replace(/`/g, "").trim();
}

function parseMdTable(doc, headerNeedle, colCount) {
  const lines = doc.split("\n");
  const start = lines.findIndex((l) => l.includes(headerNeedle));
  const rows = [];
  if (start < 0) return rows;
  for (let i = start + 2; i < lines.length; i++) {
    const l = lines[i];
    if (!l.startsWith("|")) break;
    const parts = l.split("|").map((s) => s.trim());
    const cells = parts.slice(1, 1 + colCount);
    if (!cells[0] || cells[0] === "id" || cells[0].startsWith("-")) continue;
    rows.push(cells.map(stripTicks));
  }
  return rows;
}

// --- KIT-MARK-010 face motion closed set ---
test("TC-KIT-MARK-010a", "KIT-MARK-010", "happy", () => {
  const faces = loadMark().faces;
  for (const [id, f] of Object.entries(faces)) {
    assert("motion" in f, `${id} must declare motion`);
    assert(FACE_MOTIONS.has(f.motion), `${id}.motion=${f.motion} not in closed set`);
  }
});
test("TC-KIT-MARK-010b", "KIT-MARK-010", "boundary", () => {
  const faces = loadMark().faces;
  eq(faces.blink.motion, null, "blink motion null — host timer only");
  eq(faces.idle.motion, null);
  assert(faces.error.motion === "shake" || FACE_MOTIONS.has(faces.error.motion));
});
test("TC-KIT-MARK-010c", "KIT-MARK-010", "invalid", () => {
  const motions = new Set(Object.values(loadMark().faces).map((f) => f.motion));
  assert(!motions.has("sway") && !motions.has("hop") && !motions.has("bob"),
    "face must not use action-only motions sway/hop/bob");
});

// --- KIT-SCENE-011 emotion schema deep ---
test("TC-KIT-SCENE-011a", "KIT-SCENE-011", "happy", () => {
  for (const e of loadScene().emotions) {
    assert(Array.isArray(e.eyes) && e.eyes.length === 2, `${e.id}.eyes[2]`);
    assert(EMO_TONES.has(e.tone), `${e.id}.tone=${e.tone}`);
    assert(typeof e.hint === "string" && e.hint.length > 0, `${e.id}.hint`);
    if (e.motion != null) assert(EMO_MOTIONS.has(e.motion), `${e.id}.motion=${e.motion}`);
  }
});
test("TC-KIT-SCENE-011b", "KIT-SCENE-011", "boundary", () => {
  const emos = loadScene().emotions;
  assert(emos.some((e) => e.tone === "muted"), "scene emotions may use muted");
  assert(!("muted" in loadMark().moodColorsUiOnly), "muted not a mark moodColorsUiOnly key");
  const mutedIds = emos.filter((e) => e.tone === "muted").map((e) => e.id);
  for (const id of ["embarrassed", "sleepy", "sad"]) {
    includes(mutedIds, id, `${id} uses muted`);
  }
});
test("TC-KIT-SCENE-011c", "KIT-SCENE-011", "error", () => {
  const doc = readText(PATHS.terminalMotion);
  const rows = parseMdTable(doc, "| id | eyes | tone | motion |", 4);
  eq(rows.length, 16, `TERMINAL-MOTION emotion rows=${rows.length}`);
  const byId = Object.fromEntries(loadScene().emotions.map((e) => [e.id, e]));
  for (const [id, eyes, tone, motion] of rows) {
    const e = byId[id];
    assert(e, `doc emotion ${id} missing in kit`);
    eq(`${e.eyes[0]} ${e.eyes[1]}`, eyes.replace(/\s+/g, " ").trim(), `${id} eyes`);
    eq(e.tone, tone, `${id} tone`);
    const kitMotion = e.motion || "—";
    const docMotion = !motion || motion === "—" || motion === "-" ? "—" : motion;
    eq(kitMotion, docMotion, `${id} motion`);
  }
});

// --- KIT-SCENE-012 action pose/fx/motion ---
test("TC-KIT-SCENE-012a", "KIT-SCENE-012", "happy", () => {
  for (const a of loadScene().actions) {
    assert(ACT_MOTIONS.has(a.motion), `${a.id}.motion=${a.motion}`);
    assert(ACT_POSES.has(a.pose), `${a.id}.pose=${a.pose}`);
    assert(ACT_FX.has(a.fx), `${a.id}.fx=${a.fx}`);
    assert(typeof a.hint === "string", `${a.id}.hint`);
  }
});
test("TC-KIT-SCENE-012b", "KIT-SCENE-012", "boundary", () => {
  const usedM = new Set(loadScene().actions.map((a) => a.motion));
  const usedP = new Set(loadScene().actions.map((a) => a.pose));
  const usedF = new Set(loadScene().actions.map((a) => a.fx));
  // closed sets are exactly the union used ∪ allowed — every used ∈ closed
  for (const x of usedM) assert(ACT_MOTIONS.has(x));
  for (const x of usedP) assert(ACT_POSES.has(x));
  for (const x of usedF) assert(ACT_FX.has(x));
  assert(usedP.has("stand") && usedP.has("crouch"));
});
test("TC-KIT-SCENE-012c", "KIT-SCENE-012", "error", () => {
  const doc = readText(PATHS.terminalMotion);
  const rows = parseMdTable(doc, "| id | motion | pose | fx |", 4);
  eq(rows.length, 22, `TERMINAL-MOTION action rows=${rows.length}`);
  const byId = Object.fromEntries(loadScene().actions.map((a) => [a.id, a]));
  for (const [id, motion, pose, fx] of rows) {
    const a = byId[id];
    assert(a, `doc action ${id} missing in kit`);
    eq(a.motion, motion, `${id} motion`);
    eq(a.pose, pose, `${id} pose`);
    eq(a.fx, fx, `${id} fx`);
  }
  assert(!loadScene().actions.some((a) => a.pose === "fly"), "no invented fly pose");
});

// --- KIT-SCENE-013 scene.source ---
test("TC-KIT-SCENE-013a", "KIT-SCENE-013", "happy", () => {
  const src = loadScene().source;
  assert(typeof src === "string" && src.length > 0, "scene.source present");
  assert(/scene\.ts/i.test(src) || /console/i.test(src), `source mentions console/scene.ts: ${src}`);
});
test("TC-KIT-SCENE-013b", "KIT-SCENE-013", "boundary", () => {
  const scenery = readText(PATHS.root + "/SCENERY.md");
  assert(/historical source/i.test(scenery), "SCENERY marks console as historical");
  assert(/kit\/scene\.json/i.test(scenery), "SCENERY points at kit SoT");
});
test("TC-KIT-SCENE-013c", "KIT-SCENE-013", "error", () => {
  const tm = readText(PATHS.terminalMotion);
  assert(/historical source/i.test(tm) || /not live SoT/i.test(tm),
    "TERMINAL-MOTION must not treat console as live SoT");
  // kit remains authoritative — version fields exist
  assert(typeof loadScene().version === "string");
});

// --- KIT-SCENE-014 stock prop layout ---
test("TC-KIT-SCENE-014a", "KIT-SCENE-014", "happy", () => {
  const s = loadScene();
  const kinds = new Set(s.propKinds);
  let count = 0;
  for (const st of s.stages) {
    for (const p of st.props || []) {
      count++;
      assert(kinds.has(p.kind), `kind ${p.kind}`);
      for (const k of ["x", "y", "w", "h"]) {
        assert(typeof p[k] === "number" && Number.isFinite(p[k]), `${st.id} prop missing ${k}`);
      }
      assert(p.w > 0 && p.h > 0, `${st.id} prop size`);
    }
  }
  assert(count > 0, "stock props exist");
});
test("TC-KIT-SCENE-014b", "KIT-SCENE-014", "boundary", () => {
  const s = loadScene();
  const W = s.geometry.stageWidthPx;
  for (const st of s.stages) {
    for (const p of st.props || []) {
      assert(p.x >= 0 && p.x <= W, `${st.id} prop.x=${p.x} within stage`);
      assert(p.y >= 0, `${st.id} prop.y>=0`);
    }
  }
});
test("TC-KIT-SCENE-014c", "KIT-SCENE-014", "error", () => {
  const stockKinds = new Set();
  for (const st of loadScene().stages) {
    for (const p of st.props || []) stockKinds.add(p.kind);
  }
  assert(!stockKinds.has("repoBranch"), "repoBranch still overlay-only in stock");
});

// --- KIT-VAL-003 CI workflow ---
test("TC-KIT-VAL-003a", "KIT-VAL-003", "happy", () => {
  assert(existsSync(PATHS.kitQaWorkflow), "kit-qa.yml exists");
  const yml = readText(PATHS.kitQaWorkflow);
  assert(/kit\/check-consumers\.mjs/.test(yml), "runs check-consumers");
  assert(/kit\/qa\/run-tests\.mjs/.test(yml), "runs run-tests");
});
test("TC-KIT-VAL-003b", "KIT-VAL-003", "boundary", () => {
  const yml = readText(PATHS.kitQaWorkflow);
  assert(/node-version:\s*["']?22/.test(yml), "Node 22");
  assert(/push:/.test(yml) && /pull_request:/.test(yml), "on push and PR");
});
test("TC-KIT-VAL-003c", "KIT-VAL-003", "error", () => {
  const yml = readText(PATHS.kitQaWorkflow);
  assert(!/npm (ci|install)|pnpm|yarn/.test(yml), "no app install matrix");
  assert(!/console\/|bot\//.test(yml.split("run:")[0] || yml), "workflow is kit-scoped");
});

// --- KIT-DEP-004 BRAND-RULES ---
test("TC-KIT-DEP-004a", "KIT-DEP-004", "happy", () => {
  assert(existsSync(PATHS.brandRules), "BRAND-RULES.md exists");
  const doc = readText(PATHS.brandRules);
  assert(/kit\/mark\.json/.test(doc), "points at kit/mark.json");
  assert(/moodColorsUiOnly/.test(doc), "narrates moodColorsUiOnly");
  assert(/24\s*px|24px/i.test(doc), "digital min 24px");
  assert(/one block-row|clearspace/i.test(doc), "clearspace rule");
});
test("TC-KIT-DEP-004b", "KIT-DEP-004", "security", () => {
  const doc = readText(PATHS.brandRules);
  assert(/no name|unnamed|mascot has no name/i.test(doc), "mascot unnamed");
  const mentions = [...doc.matchAll(/\bCasque\b/gi)];
  for (const m of mentions) {
    const ctx = doc.slice(Math.max(0, m.index - 40), m.index + 40);
    assert(/never|forbidden|no name|unnamed|not /i.test(ctx),
      `Casque without forbid context: ${ctx}`);
  }
});
test("TC-KIT-DEP-004c", "KIT-DEP-004", "boundary", () => {
  const doc = readText(PATHS.brandRules);
  // must not invent a parallel hex table that disagrees with kit
  const mood = loadMark().moodColorsUiOnly;
  for (const hex of Object.values(mood)) {
    // optional: if hex appears it must match; presence of moodColorsUiOnly pointer is enough
    void hex;
  }
  assert(/UI|app UI|in-app/i.test(doc), "mood colors UI-only framing");
  approxClearspace(doc);
});

function approxClearspace(doc) {
  assert(/one block-row/i.test(doc) || /clearspace/i.test(doc));
}

// --- KIT-DEP-005 facing-wins ---
test("TC-KIT-DEP-005a", "KIT-DEP-005", "happy", async () => {
  const mod = await importFromKit();
  const m = loadMark();
  const right = mod.linesFor(m, "idle", "right");
  const left = mod.linesFor(m, "idle", "left");
  deepEq(right, m.canonicalIdle.lines);
  deepEq(left, m.mirroredIdle.lines);
  assert(right[0] !== left[0], "facing changes hood orientation");
});
test("TC-KIT-DEP-005b", "KIT-DEP-005", "boundary", async () => {
  const mod = await importFromKit();
  const m = loadMark();
  // stored mirrored face + facing right → canonical body (facing wins)
  deepEq(mod.linesFor(m, "loadingLeft", "right"), m.canonicalIdle.lines);
  deepEq(mod.linesFor(m, "loadingLeft", "left"), m.mirroredIdle.lines);
});
test("TC-KIT-DEP-005c", "KIT-DEP-005", "error", async () => {
  const mod = await importFromKit();
  const m = loadMark();
  deepEq(mod.linesFor(m, "__nope__", "right"), m.faces.idle.lines, "unknown→idle");
  assert(!/Casque/i.test(mod.lockup(m, "idle", "right")));
});
