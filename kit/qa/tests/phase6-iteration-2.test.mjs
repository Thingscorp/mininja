import { existsSync } from "node:fs";
import {
  test, assert, eq, approx, includes, loadMark, loadScene, PATHS, readText,
} from "./_harness.mjs";

const EPS = 1e-6;

// --- KIT-SCENE-015 geometry.formula ---
test("TC-KIT-SCENE-015a", "KIT-SCENE-015", "happy", () => {
  const f = loadScene().geometry.formula;
  assert(f && typeof f === "object", "geometry.formula object");
  for (const k of ["stageOrigin", "restPoint", "worldWidth"]) {
    assert(typeof f[k] === "string" && f[k].length > 0, `formula.${k}`);
  }
  assert(/i\s*\*\s*stageWidthPx/.test(f.stageOrigin), `stageOrigin: ${f.stageOrigin}`);
  assert(/anchorRatio/.test(f.restPoint) && /stageWidthPx/.test(f.restPoint), `restPoint: ${f.restPoint}`);
  assert(/stageCount/.test(f.worldWidth) && /stageWidthPx/.test(f.worldWidth), `worldWidth: ${f.worldWidth}`);
});
test("TC-KIT-SCENE-015b", "KIT-SCENE-015", "boundary", () => {
  const s = loadScene();
  const g = s.geometry;
  const W = g.stageWidthPx;
  const rest = g.restOffsetPx;
  // formula identities already implied by stage layout
  for (let i = 0; i < s.stages.length; i++) {
    const st = s.stages[i];
    eq(st.x, i * W, `${st.id} x_i = i*W`);
    approx(st.center, st.x + rest, 1e-9, `${st.id} c_i`);
  }
  eq(g.worldWidthPx, g.stageCount * W);
});
test("TC-KIT-SCENE-015c", "KIT-SCENE-015", "error", () => {
  const f = loadScene().geometry.formula;
  assert(!/0\.5\s*\*\s*W|0\.5W/.test(JSON.stringify(f)), "formula must not encode 0.5W rest");
  assert(Object.keys(f).length === 3, "no invented parallel formula keys");
});

// --- KIT-SCENE-016 motion derived timings ---
test("TC-KIT-SCENE-016a", "KIT-SCENE-016", "happy", () => {
  const s = loadScene();
  const W = s.geometry.stageWidthPx;
  const m = s.motion;
  eq(m.patrolSpanPx, W - m.patrolInsetLeftPx - m.patrolInsetRightPx, "patrolSpan = W - insets");
  approx(m.adjacentStageWalkSec, W / m.walkPxPerSec, EPS);
  approx(m.adjacentStageRunSec, W / m.runPxPerSec, EPS);
  approx(m.fullPatrolSec, m.patrolSpanPx / m.patrolPxPerSec, EPS);
});
test("TC-KIT-SCENE-016b", "KIT-SCENE-016", "boundary", () => {
  const m = loadScene().motion;
  assert(m.patrolInsetLeftPx > 0 && m.patrolInsetRightPx > 0);
  assert(m.patrolSpanPx < loadScene().geometry.stageWidthPx);
  assert(m.fullPatrolSec > m.adjacentStageRunSec, "one-way patrol slower than stage-run");
});
test("TC-KIT-SCENE-016c", "KIT-SCENE-016", "error", () => {
  const m = loadScene().motion;
  const W = loadScene().geometry.stageWidthPx;
  // must not silently store round-trip 2*span/vp as fullPatrol (kit is one-way)
  const roundTrip = (2 * m.patrolSpanPx) / m.patrolPxPerSec;
  assert(Math.abs(m.fullPatrolSec - roundTrip) > 0.1, "fullPatrolSec is one-way not round-trip");
  assert(Math.abs(m.adjacentStageWalkSec - W / m.runPxPerSec) > 0.1, "walk timing ≠ run speed");
});

// --- KIT-MARK-011 face eyes slot in lines ---
test("TC-KIT-MARK-011a", "KIT-MARK-011", "happy", () => {
  const faces = loadMark().faces;
  for (const [id, f] of Object.entries(faces)) {
    const cells = [...f.lines[1]];
    eq(cells.length, 5, `${id} mid-row 5 cells`);
    const slot = f.mirrored ? [cells[0], cells[1]] : [cells[3], cells[4]];
    deepEyes(slot, f.eyes, id);
  }
});
function deepEyes(slot, eyes, id) {
  eq(slot[0], eyes[0], `${id} eye0`);
  eq(slot[1], eyes[1], `${id} eye1`);
}
test("TC-KIT-MARK-011b", "KIT-MARK-011", "boundary", () => {
  const m = loadMark();
  eq(m.faces.loadingLeft.mirrored, true);
  const cells = [...m.faces.loadingLeft.lines[1]];
  // mirrored: eyes cols 1–2; body cols 4–5
  deepEyes([cells[0], cells[1]], m.faces.loadingLeft.eyes, "loadingLeft");
  assert(cells[3] === "█" || cells[3] === String.fromCodePoint(0x2588), "loadingLeft body after eyes");
});
test("TC-KIT-MARK-011c", "KIT-MARK-011", "error", () => {
  // eyes must not live only outside lines — lines ARE the mark
  for (const [id, f] of Object.entries(loadMark().faces)) {
    const mid = f.lines[1];
    assert(mid.includes(f.eyes[0]) && mid.includes(f.eyes[1]), `${id} eyes embedded in lines`);
  }
});

// --- KIT-DEP-006 CONSTRUCTION.md ---
test("TC-KIT-DEP-006a", "KIT-DEP-006", "happy", () => {
  assert(existsSync(PATHS.root + "/CONSTRUCTION.md"), "CONSTRUCTION.md exists");
  const doc = readText(PATHS.root + "/CONSTRUCTION.md");
  assert(/kit\/mark\.json/.test(doc), "points at kit/mark.json");
  assert(/5/.test(doc) && /3/.test(doc), "narrates 5×3 grid");
  assert(/U\+259A/.test(doc) && /U\+2588/.test(doc), "narrates hood/block codepoints");
});
test("TC-KIT-DEP-006b", "KIT-DEP-006", "boundary", () => {
  const doc = readText(PATHS.root + "/CONSTRUCTION.md");
  const m = loadMark();
  assert(doc.includes(m.canonicalIdle.lines[0]), "canonical hood line");
  assert(doc.includes("▀▀▀▀▀") || doc.includes(m.canonicalIdle.lines[2]), "chin line");
  assert(/columns?\s*4.?5|eye slot/i.test(doc), "eye slot columns narrated");
});
test("TC-KIT-DEP-006c", "KIT-DEP-006", "security", () => {
  const doc = readText(PATHS.root + "/CONSTRUCTION.md");
  assert(/no name|unnamed|has no name/i.test(doc), "mascot unnamed");
  const mentions = [...doc.matchAll(/\bCasque\b/gi)];
  for (const hit of mentions) {
    const ctx = doc.slice(Math.max(0, hit.index - 40), hit.index + 40);
    assert(/never|forbidden|no name|unnamed/i.test(ctx), `Casque without forbid: ${ctx}`);
  }
});

// --- KIT-DEP-007 kit/README.md ---
test("TC-KIT-DEP-007a", "KIT-DEP-007", "happy", () => {
  assert(existsSync(PATHS.kitDir + "/README.md"));
  const doc = readText(PATHS.kitDir + "/README.md");
  assert(/mark\.json/.test(doc) && /scene\.json/.test(doc));
  assert(/check-consumers\.mjs/.test(doc), "points at check-consumers");
  assert(/sim-grid-habitat/.test(doc), "points at sim-grid");
});
test("TC-KIT-DEP-007b", "KIT-DEP-007", "boundary", () => {
  const doc = readText(PATHS.kitDir + "/README.md");
  assert(/garden|repoBranch|growth/i.test(doc), "garden brick narrated");
  assert(/presence ladder|mark → faces|mark -> faces/i.test(doc), "presence ladder");
  assert(/silent second constant|second constant table/i.test(doc), "anti dual-table guidance");
});
test("TC-KIT-DEP-007c", "KIT-DEP-007", "security", () => {
  const doc = readText(PATHS.kitDir + "/README.md");
  assert(/never Casque|no (personal )?name/i.test(doc), "mascot unnamed / never Casque");
  assert(/No secrets/i.test(doc), "no secrets invariant");
});

// --- KIT-DEP-008 HABITAT-PORT SoT currency ---
test("TC-KIT-DEP-008a", "KIT-DEP-008", "happy", () => {
  assert(existsSync(PATHS.root + "/HABITAT-PORT.md"));
  const doc = readText(PATHS.root + "/HABITAT-PORT.md");
  assert(/kit\/scene\.json/.test(doc), "points at kit scene SoT");
  assert(/registerFromKit|check-consumers/.test(doc), "alignment path present");
});
test("TC-KIT-DEP-008b", "KIT-DEP-008", "boundary", () => {
  const doc = readText(PATHS.root + "/HABITAT-PORT.md");
  const ver = loadScene().version;
  // must not hardcode a stale kit version that disagrees with live SoT
  assert(!/\(v1\.5\.0/.test(doc), "stale v1.5.0 claim removed");
  assert(
    doc.includes(ver) || /see kit\/scene\.json|kit\/scene\.json.*version/i.test(doc),
    `HABITAT-PORT must cite live scene version ${ver} or defer to kit file`,
  );
});
test("TC-KIT-DEP-008c", "KIT-DEP-008", "error", () => {
  const doc = readText(PATHS.root + "/HABITAT-PORT.md");
  // monorepo column must not claim console STAGE_SEED dual table as current SoT
  assert(
    !/kit\/scene\.json stages \+ `console` STAGE_SEED/.test(doc),
    "must not claim console STAGE_SEED dual table beside kit",
  );
  assert(/registerFromKit/.test(doc) || /no STAGE_SEED|kit is SoT|dual.?seed/i.test(doc),
    "must narrate registerFromKit / no dual seed");
});
