import {
  test, assert, eq, deepEq, approx, includes, loadMark, loadScene, PATHS, readText,
  importFromKit,
} from "./_harness.mjs";

const EXPECTED_FACES = [
  "idle","blink","evaluating","allowed","asking","denied","sandboxing",
  "executing","completed","warning","error","cancelled","offline",
  "loadingRight","loadingLeft",
];
const MOOD_KEYS = ["idle","accent","ok","warn","err"];
const MOOD_HEX = {
  idle: "#334155", accent: "#6366f1", ok: "#22c55e", warn: "#eab308", err: "#ef4444",
};

// --- KIT-MARK-001 identity ---
test("TC-KIT-MARK-001a", "KIT-MARK-001", "happy", () => {
  const m = loadMark();
  eq(m.mascotNamed, false, "mascotNamed must be false");
  eq(m.name, "Mininja mark");
  eq(m.owner, "Thingscorp LLC");
  assert(typeof m.version === "string" && m.version.length > 0, "version string");
});
test("TC-KIT-MARK-001b", "KIT-MARK-001", "permission", () => {
  const m = loadMark();
  assert(Array.isArray(m.forbiddenNames), "forbiddenNames array");
  includes(m.forbiddenNames, "Casque", "forbiddenNames must include Casque");
});
test("TC-KIT-MARK-001c", "KIT-MARK-001", "security", () => {
  const m = loadMark();
  const blob = JSON.stringify(m.faces) + JSON.stringify(m.name);
  assert(!/\bCasque\b/i.test(blob) || m.forbiddenNames.includes("Casque"), "Casque only as forbidden");
  assert(!/\bCasque\b/.test(m.name), "brand name is not Casque");
});
test("TC-KIT-MARK-001d", "KIT-MARK-001", "invalid", () => {
  const m = loadMark();
  assert(m.mascotNamed !== true && m.mascotNamed !== "true", "mascotNamed must not be truthy");
});

// --- KIT-MARK-002 grid ---
test("TC-KIT-MARK-002a", "KIT-MARK-002", "happy", () => {
  const g = loadMark().grid;
  eq(g.columns, 5); eq(g.rows, 3); eq(g.cellAspect, "1:1"); eq(g.totalCells, 15);
  eq(g.columns * g.rows, g.totalCells, "totalCells = columns*rows");
});
test("TC-KIT-MARK-002b", "KIT-MARK-002", "boundary", () => {
  const m = loadMark();
  for (const [id, face] of Object.entries(m.faces)) {
    assert(Array.isArray(face.lines) && face.lines.length === 3, `${id} lines length 3`);
    for (let i = 0; i < 3; i++) {
      const cells = [...face.lines[i]];
      eq(cells.length, 5, `${id} line ${i} must be 5 cells (got ${cells.length}: ${JSON.stringify(face.lines[i])})`);
    }
  }
});
test("TC-KIT-MARK-002c", "KIT-MARK-002", "error", () => {
  const g = loadMark().grid;
  assert(g.cellAspect === "1:1", "non-square cellAspect forbidden in SoT");
  assert(g.columns === 5 && g.rows === 3, "grid lock must stay 5x3");
});

// --- KIT-MARK-003 codepoints ---
test("TC-KIT-MARK-003a", "KIT-MARK-003", "happy", () => {
  const cp = loadMark().codepoints;
  for (const k of [
    "hoodCornerRightFacing","hoodCornerLeftFacing","fullBlock","upperHalfBlock","space",
  ]) assert(k in cp, `missing codepoint ${k}`);
  eq(cp.hoodCornerRightFacing, "U+259A");
  eq(cp.hoodCornerLeftFacing, "U+259E");
  eq(cp.fullBlock, "U+2588");
  eq(cp.upperHalfBlock, "U+2580");
  eq(cp.space, "U+0020");
});
test("TC-KIT-MARK-003b", "KIT-MARK-003", "boundary", () => {
  const m = loadMark();
  const leftHood = String.fromCodePoint(0x259e);
  assert(m.mirroredIdle.lines[0].includes(leftHood), "mirroredIdle uses U+259E hood");
  assert(m.faces.loadingLeft.lines[0].includes(leftHood), "loadingLeft uses U+259E");
});
test("TC-KIT-MARK-003c", "KIT-MARK-003", "invalid", () => {
  const cp = loadMark().codepoints;
  assert(cp.hoodCornerRightFacing !== cp.hoodCornerLeftFacing, "mirrored corners must differ");
});

// --- KIT-MARK-004 canonical idle ---
test("TC-KIT-MARK-004a", "KIT-MARK-004", "happy", () => {
  const m = loadMark();
  deepEq(m.canonicalIdle.lines, m.faces.idle.lines, "canonicalIdle === faces.idle.lines");
  assert(/glyphs ARE the mark/i.test(m.canonicalIdle.note || ""), "note affirms glyphs ARE the mark");
});
test("TC-KIT-MARK-004b", "KIT-MARK-004", "error", async () => {
  const mod = await importFromKit();
  const m = loadMark();
  assert(typeof mod.linesFor === "function", "linesFor export");
  deepEq(mod.linesFor(m, "idle"), m.faces.idle.lines);
  deepEq(mod.linesFor(m, "__no_such_face__"), m.faces.idle.lines, "unknown→idle");
});

// --- KIT-MARK-005 mirrored ---
test("TC-KIT-MARK-005a", "KIT-MARK-005", "happy", () => {
  const m = loadMark();
  assert(Array.isArray(m.mirroredIdle.lines) && m.mirroredIdle.lines.length === 3);
  includes(m.mirroredIdle.usedBy, "loadingLeft");
  includes(m.mirroredIdle.usedBy, "facing-left");
});
test("TC-KIT-MARK-005b", "KIT-MARK-005", "boundary", () => {
  const m = loadMark();
  deepEq(m.faces.loadingLeft.lines, m.mirroredIdle.lines, "loadingLeft.lines === mirroredIdle");
  eq(m.faces.loadingLeft.mirrored, true);
});
test("TC-KIT-MARK-005c", "KIT-MARK-005", "error", () => {
  const m = loadMark();
  const rightHood = String.fromCodePoint(0x259a);
  assert(!m.faces.loadingLeft.lines[0].startsWith(rightHood), "left face must not use right hood");
});

// --- KIT-MARK-006 clearspace / min size ---
test("TC-KIT-MARK-006a", "KIT-MARK-006", "happy", () => {
  const m = loadMark();
  approx(m.clearspace.asFractionOfHeight, 1 / 3, 1e-9);
  assert(/one block-row/i.test(m.clearspace.rule || ""));
  eq(m.minimumSize.digitalPxHeight, 24);
  eq(m.minimumSize.terminalRows, 3);
  eq(m.minimumSize.minCellPx, 8);
});
test("TC-KIT-MARK-006b", "KIT-MARK-006", "boundary", () => {
  const m = loadMark();
  assert(m.minimumSize.digitalPxHeight >= 24, "digital floor 24px");
  assert(m.minimumSize.terminalRows >= 3, "terminal floor 3 rows");
});
test("TC-KIT-MARK-006c", "KIT-MARK-006", "invalid", () => {
  const m = loadMark();
  assert(m.minimumSize.digitalPxHeight !== 0 && m.minimumSize.minCellPx > 0);
});

// --- KIT-MARK-007 monochrome + mood ---
test("TC-KIT-MARK-007a", "KIT-MARK-007", "happy", () => {
  eq(loadMark().monochrome, true);
});
test("TC-KIT-MARK-007b", "KIT-MARK-007", "boundary", () => {
  const m = loadMark();
  deepEq(Object.keys(m.moodColorsUiOnly).sort(), [...MOOD_KEYS].sort());
  for (const [k, hex] of Object.entries(MOOD_HEX)) eq(m.moodColorsUiOnly[k], hex, `mood ${k}`);
  const tones = new Set(Object.values(m.faces).map((f) => f.tone));
  for (const t of tones) includes(MOOD_KEYS, t, `face tone ${t} must be moodColorsUiOnly key`);
});
test("TC-KIT-MARK-007c", "KIT-MARK-007", "error", () => {
  const m = loadMark();
  assert(!("muted" in m.moodColorsUiOnly), "muted absent from moodColorsUiOnly");
});

// --- KIT-MARK-008 faces ---
test("TC-KIT-MARK-008a", "KIT-MARK-008", "happy", () => {
  const faces = loadMark().faces;
  eq(Object.keys(faces).length, 15);
  deepEq(Object.keys(faces), EXPECTED_FACES);
});
test("TC-KIT-MARK-008b", "KIT-MARK-008", "boundary", () => {
  const faces = loadMark().faces;
  for (const [id, f] of Object.entries(faces)) {
    assert(Array.isArray(f.eyes) && f.eyes.length === 2, `${id}.eyes[2]`);
    assert(typeof f.tone === "string", `${id}.tone`);
    assert("motion" in f, `${id}.motion`);
    assert(typeof f.mirrored === "boolean", `${id}.mirrored`);
    assert(Array.isArray(f.lines) && f.lines.length === 3, `${id}.lines`);
  }
});
test("TC-KIT-MARK-008c", "KIT-MARK-008", "error", async () => {
  const mod = await importFromKit();
  const m = loadMark();
  eq(mod.hasFace(m, "wink"), false, "invented face wink must not exist");
  eq(mod.hasFace(m, "idle"), true);
  deepEq(mod.listFaces(m), EXPECTED_FACES);
});

// --- KIT-MARK-009 presence ladder ---
test("TC-KIT-MARK-009a", "KIT-MARK-009", "happy", () => {
  const ladder = loadMark().presenceLadder;
  eq(ladder.length, 4);
  deepEq(ladder.map((l) => l.id), ["mark-only","face-states","scoot-facing","scene-strip"]);
  deepEq(ladder.map((l) => l.level), [1,2,3,4]);
});
test("TC-KIT-MARK-009b", "KIT-MARK-009", "boundary", () => {
  const ladder = loadMark().presenceLadder;
  deepEq(ladder[0].needs, ["canonicalIdle"]);
  deepEq(ladder[1].needs, ["faces"]);
  deepEq(ladder[2].needs, ["faces","mirroredIdle"]);
  deepEq(ladder[3].needs, ["kit/scene.json"]);
});
test("TC-KIT-MARK-009c", "KIT-MARK-009", "error", () => {
  // scene is level 4 — mark.json itself must not require scene for faces
  const m = loadMark();
  assert(Object.keys(m.faces).length === 15, "faces usable at ladder level 2 without scene");
  assert(m.canonicalIdle, "mark-only needs canonicalIdle present");
});
