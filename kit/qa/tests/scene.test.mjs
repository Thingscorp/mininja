import {
  test, assert, eq, deepEq, approx, includes, loadMark, loadScene, PATHS, readText,
} from "./_harness.mjs";

const STAGE_IDS = ["nightwatch","dock","desk","workshop","archives","gate","rooftop"];
const WEATHER = ["clear","haze","night","sparks","scan","rain"];
const PROP_KINDS = ["block","shelf","lamp","crate","screen","antenna","moon","barrier","cable","repoBranch"];
const EMOTIONS = [
  "idle","curious","focused","happy","proud","mischievous","worried","confused",
  "startled","embarrassed","frustrated","determined","relieved","sleepy","alert","sad",
];
const ACTIONS = [
  "idle","blink","walk","run","think","scan","type","read","point","wave","jump","crouch",
  "lookBack","celebrate","shakeHead","nod","search","wait","sleep","carry","peek","climb",
];

// --- KIT-SCENE-001 geometry ---
test("TC-KIT-SCENE-001a", "KIT-SCENE-001", "happy", () => {
  const g = loadScene().geometry;
  eq(g.stageWidthPx, 420);
  eq(g.stageCount, 7);
  eq(g.worldWidthPx, g.stageCount * g.stageWidthPx, "L = N * W");
  eq(g.worldWidthPx, 2940);
});
test("TC-KIT-SCENE-001b", "KIT-SCENE-001", "boundary", () => {
  const g = loadScene().geometry;
  eq(g.anchorRatio, 0.42);
  approx(g.restOffsetPx, g.anchorRatio * g.stageWidthPx, 1e-9);
  eq(g.restOffsetPx, 176.4);
});
test("TC-KIT-SCENE-001c", "KIT-SCENE-001", "error", () => {
  const g = loadScene().geometry;
  assert(g.anchorRatio !== 0.5, "rest must not silently become 0.5W");
  assert(g.stageCount === 7, "no 8th stage without updating N");
});

// --- KIT-SCENE-002 default scene ---
test("TC-KIT-SCENE-002a", "KIT-SCENE-002", "happy", () => {
  const d = loadScene().defaultScene;
  eq(d.emotion, "idle");
  eq(d.action, "idle");
  eq(d.stage, "dock");
  eq(d.facing, "right");
  eq(d.line, "");
  eq(d.intensity, 1);
  eq(d.holdMs, 0);
});
test("TC-KIT-SCENE-002b", "KIT-SCENE-002", "boundary", () => {
  const s = loadScene();
  const dock = s.stages.find((t) => t.id === "dock");
  assert(dock, "dock stage exists");
  eq(dock.index, 1, "dock is stage index 1");
  eq(s.defaultScene.stage, "dock");
});
test("TC-KIT-SCENE-002c", "KIT-SCENE-002", "invalid", () => {
  const d = loadScene().defaultScene;
  const emotions = new Set(loadScene().emotions.map((e) => e.id));
  assert(emotions.has(d.emotion), "default emotion must resolve");
  const stages = new Set(loadScene().stages.map((t) => t.id));
  assert(stages.has(d.stage), "default stage must resolve");
});

// --- KIT-SCENE-003 motion ---
test("TC-KIT-SCENE-003a", "KIT-SCENE-003", "happy", () => {
  const m = loadScene().motion;
  eq(m.walkPxPerSec, 170);
  eq(m.runPxPerSec, 280);
  eq(m.patrolPxPerSec, 26);
  eq(m.arriveEpsilonPx, 6);
});
test("TC-KIT-SCENE-003b", "KIT-SCENE-003", "boundary", () => {
  const m = loadScene().motion;
  assert(m.cameraLookAheadRight != null);
  assert(m.cameraLookAheadLeft != null);
  assert(m.cameraFollowRatePerSec != null);
  eq(m.cameraLookAheadRight, 0.32);
  eq(m.cameraLookAheadLeft, 0.52);
  eq(m.cameraFollowRatePerSec, 5.2);
});
test("TC-KIT-SCENE-003c", "KIT-SCENE-003", "performance", () => {
  const m = loadScene().motion;
  assert(m.walkPxPerSec < m.runPxPerSec, "run faster than walk");
  assert(m.patrolPxPerSec < m.walkPxPerSec, "patrol slower than walk");
  assert(m.dtClampSec > 0 && m.dtClampSec <= 0.1);
});

// --- KIT-SCENE-004 weather ---
test("TC-KIT-SCENE-004a", "KIT-SCENE-004", "happy", () => {
  const w = loadScene().weather;
  eq(w.length, 6);
  deepEq(w, WEATHER);
});
test("TC-KIT-SCENE-004b", "KIT-SCENE-004", "boundary", () => {
  const s = loadScene();
  const set = new Set(s.weather);
  for (const st of s.stages) {
    assert(set.has(st.weather), `stage ${st.id} weather ${st.weather} ∉ enum`);
  }
});
test("TC-KIT-SCENE-004c", "KIT-SCENE-004", "error", () => {
  const s = loadScene();
  const used = new Set(s.stages.map((t) => t.weather));
  assert(s.weather.includes("rain"), "rain remains in enum");
  // rain unused in stock is allowed (overlay-only)
  assert(true, "rain unused in stock allowed");
  void used;
});

// --- KIT-SCENE-005 prop kinds ---
test("TC-KIT-SCENE-005a", "KIT-SCENE-005", "happy", () => {
  deepEq(loadScene().propKinds, PROP_KINDS);
  eq(loadScene().propKinds.length, 10);
});
test("TC-KIT-SCENE-005b", "KIT-SCENE-005", "boundary", () => {
  const s = loadScene();
  const set = new Set(s.propKinds);
  for (const st of s.stages) {
    for (const p of st.props || []) {
      assert(set.has(p.kind), `prop kind ${p.kind} on ${st.id} not in set`);
    }
  }
});
test("TC-KIT-SCENE-005c", "KIT-SCENE-005", "error", () => {
  const s = loadScene();
  includes(s.propKinds, "repoBranch");
  const stockKinds = new Set();
  for (const st of s.stages) for (const p of st.props || []) stockKinds.add(p.kind);
  assert(!stockKinds.has("repoBranch"), "repoBranch unused in stock stages by design");
  assert(!stockKinds.has("chair") && !stockKinds.has("desk"), "no invented chair/desk kinds");
});

// --- KIT-SCENE-006 stages ---
test("TC-KIT-SCENE-006a", "KIT-SCENE-006", "happy", () => {
  const stages = loadScene().stages;
  deepEq(stages.map((t) => t.id), STAGE_IDS);
});
test("TC-KIT-SCENE-006b", "KIT-SCENE-006", "boundary", () => {
  const s = loadScene();
  const W = s.geometry.stageWidthPx;
  const rest = s.geometry.restOffsetPx;
  stages: for (let i = 0; i < s.stages.length; i++) {
    const st = s.stages[i];
    eq(st.index, i, `${st.id}.index`);
    eq(st.x, i * W, `${st.id}.x`);
    approx(st.center, st.x + rest, 1e-9, `${st.id}.center`);
    eq(st.width, W, `${st.id}.width`);
  }
});
test("TC-KIT-SCENE-006c", "KIT-SCENE-006", "error", () => {
  const s = loadScene();
  eq(s.stages.length, s.geometry.stageCount);
  assert(s.stages.some((t) => t.id === "archives"), "archives stays in strip");
});

// --- KIT-SCENE-007 emotions ---
test("TC-KIT-SCENE-007a", "KIT-SCENE-007", "happy", () => {
  const emos = loadScene().emotions;
  eq(emos.length, 16);
  deepEq(emos.map((e) => e.id), EMOTIONS);
});
test("TC-KIT-SCENE-007b", "KIT-SCENE-007", "boundary", () => {
  const s = loadScene();
  const set = new Set(s.emotions.map((e) => e.id));
  for (const [face, bridge] of Object.entries(s.legacyFaceBridge)) {
    assert(set.has(bridge.emotion), `bridge ${face} emotion ${bridge.emotion}`);
  }
  for (const e of s.emotions) {
    assert(typeof e.tone === "string" && e.eyes && e.hint, `${e.id} fields`);
  }
});
test("TC-KIT-SCENE-007c", "KIT-SCENE-007", "error", () => {
  const s = loadScene();
  eq(s.fallbacks.unknownEmotion, "curious");
  assert(s.emotions.some((e) => e.id === "curious"));
  assert(!s.emotions.some((e) => e.id === "enraged"), "invented emotion absent");
});

// --- KIT-SCENE-008 actions ---
test("TC-KIT-SCENE-008a", "KIT-SCENE-008", "happy", () => {
  const acts = loadScene().actions;
  eq(acts.length, 22);
  deepEq(acts.map((a) => a.id), ACTIONS);
});
test("TC-KIT-SCENE-008b", "KIT-SCENE-008", "boundary", () => {
  const s = loadScene();
  const set = new Set(s.actions.map((a) => a.id));
  for (const [face, bridge] of Object.entries(s.legacyFaceBridge)) {
    assert(set.has(bridge.action), `bridge ${face} action ${bridge.action}`);
  }
});
test("TC-KIT-SCENE-008c", "KIT-SCENE-008", "error", () => {
  const s = loadScene();
  eq(s.fallbacks.unknownAction, "wait");
  assert(s.actions.some((a) => a.id === "wait"));
  assert(!s.actions.some((a) => a.id === "wink"), "invented action wink absent");
});

// --- KIT-SCENE-009 legacy bridge ---
test("TC-KIT-SCENE-009a", "KIT-SCENE-009", "happy", () => {
  const faces = Object.keys(loadMark().faces).sort();
  const bridge = Object.keys(loadScene().legacyFaceBridge).sort();
  deepEq(faces, bridge, "faces ↔ bridge key parity");
});
test("TC-KIT-SCENE-009b", "KIT-SCENE-009", "boundary", () => {
  const s = loadScene();
  const emos = new Set(s.emotions.map((e) => e.id));
  const acts = new Set(s.actions.map((a) => a.id));
  const stages = new Set(s.stages.map((t) => t.id));
  for (const [face, b] of Object.entries(s.legacyFaceBridge)) {
    assert(emos.has(b.emotion), `${face} emotion`);
    assert(acts.has(b.action), `${face} action`);
    if (b.stage != null) assert(stages.has(b.stage), `${face} stage ${b.stage}`);
    if (b.facing != null) assert(b.facing === "left" || b.facing === "right", `${face} facing`);
  }
});
test("TC-KIT-SCENE-009c", "KIT-SCENE-009", "error", () => {
  const b = loadScene().legacyFaceBridge;
  assert(b.idle.stage === undefined, "idle omits stage (keep-current)");
  assert(b.blink.stage === undefined, "blink omits stage (keep-current)");
});
test("TC-KIT-SCENE-009d", "KIT-SCENE-009", "permission", () => {
  // Doc must not invent stage=dock for idle/blink (DEFECT-DOC-001 fixed)
  const doc = readText(PATHS.terminalMotion);
  const row = doc.split("\n").find((l) => /\| idle \/ blink \|/.test(l));
  assert(row, "TERMINAL-MOTION face bridge row for idle/blink");
  assert(!/\|\s*dock\s*\|?\s*$/.test(row) && !/\| dock \|/.test(row),
    `idle/blink must not invent stage=dock; row=${row}`);
  assert(/\| — \|/.test(row) || /keep-current/i.test(row),
    `idle/blink stage should be — / keep-current; row=${row}`);
});

// --- KIT-SCENE-010 fallbacks ---
test("TC-KIT-SCENE-010a", "KIT-SCENE-010", "happy", () => {
  const f = loadScene().fallbacks;
  eq(f.unknownEmotion, "curious");
  eq(f.unknownAction, "wait");
  eq(f.unknownStage, "keep-current");
});
test("TC-KIT-SCENE-010b", "KIT-SCENE-010", "error", () => {
  const f = loadScene().fallbacks;
  assert(f.unknownStage === "keep-current", "unknown stage must not teleport");
  assert(f.unknownStage !== "dock" && f.unknownStage !== "nightwatch");
});
test("TC-KIT-SCENE-010c", "KIT-SCENE-010", "invalid", () => {
  const s = loadScene();
  assert(s.emotions.some((e) => e.id === s.fallbacks.unknownEmotion));
  assert(s.actions.some((a) => a.id === s.fallbacks.unknownAction));
});
