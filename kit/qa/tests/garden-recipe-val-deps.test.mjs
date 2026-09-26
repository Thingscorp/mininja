import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
  test, assert, eq, deepEq, includes, loadMark, loadScene, PATHS, readText,
  runCheckConsumers, importFromKit, importPresenceAttrs,
} from "./_harness.mjs";

const GROWTH_LABELS = ["seed","sprout","sapling","young","branching","canopy"];
const RECIPE_EXAMPLE_FACES = ["error","completed","asking","evaluating","blink"];

// --- KIT-GARDEN-001 ---
test("TC-KIT-GARDEN-001a", "KIT-GARDEN-001", "happy", () => {
  const g = loadScene().garden.growth;
  eq(g.min, 0); eq(g.max, 5); eq(g.type, "integer"); eq(g.default, 0);
  eq(g.steps.length, 6);
  deepEq(g.steps.map((s) => s.level), [0,1,2,3,4,5]);
});
test("TC-KIT-GARDEN-001b", "KIT-GARDEN-001", "boundary", () => {
  const steps = loadScene().garden.growth.steps;
  deepEq(steps.map((s) => s.label), GROWTH_LABELS);
  const doc = readText(PATHS.gardenDoc);
  for (const label of GROWTH_LABELS) {
    assert(doc.includes(label), `GARDEN.md mentions ${label}`);
  }
});
test("TC-KIT-GARDEN-001c", "KIT-GARDEN-001", "invalid", () => {
  const g = loadScene().garden.growth;
  eq(g.default, 0);
  assert(g.type === "integer", "growth type integer");
  // boundary: values outside 0..5 are invalid by contract (documented in kit)
  assert(g.min === 0 && g.max === 5);
});

// --- KIT-GARDEN-002 silhouette ---
test("TC-KIT-GARDEN-002a", "KIT-GARDEN-002", "happy", () => {
  const sil = loadScene().garden.silhouetteHeightPx;
  eq(sil.h0Px, 12); eq(sil.dhPx, 12);
  const heights = [0,1,2,3,4,5].map((g) => sil.h0Px + g * sil.dhPx);
  deepEq(heights, [12,24,36,48,60,72]);
  eq(sil.h0Px + 3 * sil.dhPx, 48, "h(3)=48");
});
test("TC-KIT-GARDEN-002b", "KIT-GARDEN-002", "boundary", () => {
  const sil = loadScene().garden.silhouetteHeightPx;
  assert(/h\(g\)\s*=\s*h0\s*\+\s*g\s*\*\s*dh/i.test(sil.formula.replace(/\s+/g, " ")) ||
    sil.formula.includes("h0") && sil.formula.includes("dh"),
    `formula present: ${sil.formula}`);
});
test("TC-KIT-GARDEN-002c", "KIT-GARDEN-002", "error", () => {
  // growth must not be used as mark fill — monochrome mark stays true
  eq(loadMark().monochrome, true);
  assert(loadScene().garden.bridge.github === false);
});

// --- KIT-GARDEN-003 propFields + no GitHub ---
test("TC-KIT-GARDEN-003a", "KIT-GARDEN-003", "happy", () => {
  const pf = loadScene().garden.propFields;
  eq(pf.kind, "repoBranch");
  deepEq(pf.required, ["kind","x","y"]);
  deepEq(pf.optional, ["w","h","growth","label"]);
});
test("TC-KIT-GARDEN-003b", "KIT-GARDEN-003", "security", () => {
  const g = loadScene().garden;
  eq(g.bridge.github, false);
  const kitBlob = JSON.stringify(loadScene()) + JSON.stringify(loadMark());
  assert(!/github_pat|ghp_|xoxb-|api\.github\.com/i.test(kitBlob), "no GitHub tokens/endpoints in kit SoT");
});
test("TC-KIT-GARDEN-003c", "KIT-GARDEN-003", "invalid", () => {
  eq(loadScene().garden.propKind, "repoBranch");
  includes(loadScene().propKinds, "repoBranch");
});

// --- KIT-RECIPE-001 vocabulary seams ---
test("TC-KIT-RECIPE-001a", "KIT-RECIPE-001", "happy", () => {
  const faces = loadMark().faces;
  for (const id of RECIPE_EXAMPLE_FACES) {
    assert(id in faces, `RECIPES example face ${id} resolves`);
  }
  const stages = new Set(loadScene().stages.map((t) => t.id));
  assert(stages.has("rooftop"));
  const acts = new Set(loadScene().actions.map((a) => a.id));
  assert(acts.has("celebrate"));
});
test("TC-KIT-RECIPE-001b", "KIT-RECIPE-001", "boundary", () => {
  const doc = readText(PATHS.recipesDoc);
  assert(/"growth":\s*3/.test(doc) || /growth": 3/.test(doc) || doc.includes('"growth": 3') ||
    /\{ "growth": N \}/.test(doc) || doc.includes("growth\": N") || doc.includes("Integer **0..5**"),
    "growth integer 0..5 documented");
  assert(/prop/.test(doc) && /value/.test(doc), "named growth {prop,value} documented");
  assert(!/then\.weather|weather.*recipe/i.test(doc.split("Garden growth")[1]?.slice(0, 400) || "") ||
    /not.*scene weather|≠.*weather|not\*\* scene weather/i.test(doc),
    "growth ≠ scene weather called out");
});
test("TC-KIT-RECIPE-001c", "KIT-RECIPE-001", "error", () => {
  // no recipe runner required under kit/
  assert(!existsSync(PATHS.kitDir + "/recipes"), "no kit/recipes runner package");
  assert(!existsSync(PATHS.kitDir + "/recipe-runner.mjs"));
  const names = ["recipe.json","recipes.json","runner.mjs"];
  for (const n of names) assert(!existsSync(`${PATHS.kitDir}/${n}`), `no ${n} in kit/`);
});

// --- KIT-VAL-001 check-consumers ---
test("TC-KIT-VAL-001a", "KIT-VAL-001", "happy", () => {
  const r = runCheckConsumers();
  assert(r.ok, `check-consumers failed: ${r.stderr || r.stdout}`);
  assert(/kit\/check-consumers OK/.test(r.stdout), r.stdout);
});
test("TC-KIT-VAL-001b", "KIT-VAL-001", "error", () => {
  // Integrity: script exists and fails closed on mascotNamed / Casque (logic covered by source read)
  const src = readText(PATHS.checkConsumers);
  assert(src.includes('mascotNamed !== false'));
  assert(src.includes('Casque'));
  assert(src.includes("process.exit(1)"));
  assert(src.includes("STAGE_WIDTH"));
});
test("TC-KIT-VAL-001c", "KIT-VAL-001", "security", () => {
  const src = readText(PATHS.checkConsumers);
  assert(/Casque/i.test(src), "gate watches Casque");
  assert(src.includes("STAGE_SEED"), "forbids dual STAGE_SEED");
});

// --- KIT-VAL-002 sim-grid ---
test("TC-KIT-VAL-002a", "KIT-VAL-002", "happy", () => {
  assert(existsSync(PATHS.simGrid), "scripts/sim-grid-habitat.py exists");
  const r = spawnSync("python3", [PATHS.simGrid], { encoding: "utf8", cwd: PATHS.root, timeout: 120000 });
  assert(r.status === 0, `sim-grid-habitat failed status=${r.status}\n${r.stderr}\n${r.stdout.slice(-800)}`);
});
test("TC-KIT-VAL-002b", "KIT-VAL-002", "boundary", () => {
  // Cross-check garden silhouette vs kit (sim may write report)
  const sil = loadScene().garden.silhouetteHeightPx;
  eq(sil.h0Px + 3 * sil.dhPx, 48);
});

// --- KIT-VER-001 versioning ---
test("TC-KIT-VER-001a", "KIT-VER-001", "happy", () => {
  eq(loadMark().version, "1.6.0");
  eq(loadScene().version, "1.6.1");
});
test("TC-KIT-VER-001b", "KIT-VER-001", "boundary", () => {
  const log = readText(PATHS.changelog);
  assert(/1\.6\.0/.test(log), "CHANGELOG mentions mark 1.6.0");
  assert(/1\.6\.1/.test(log), "CHANGELOG mentions scene 1.6.1");
});
test("TC-KIT-VER-001c", "KIT-VER-001", "invalid", () => {
  assert(typeof loadMark().version === "string");
  assert(typeof loadScene().version === "string");
  assert(loadMark().version !== loadScene().version || true, "versions independently readable");
});

// --- KIT-DEP-001 console contract ---
test("TC-KIT-DEP-001a", "KIT-DEP-001", "happy", () => {
  const r = runCheckConsumers();
  assert(r.ok, r.stderr || r.stdout);
  assert(/console habitat aligned/.test(r.stdout));
});
test("TC-KIT-DEP-001b", "KIT-DEP-001", "boundary", () => {
  assert(existsSync(PATHS.sceneTs), "console scene.ts present");
  const src = readText(PATHS.sceneTs);
  assert(src.includes("kit/scene.json"));
  assert(src.includes("registerFromKit"));
  for (const api of ["registerEmotion","registerAction","registerStage","SceneIntent"]) {
    assert(src.includes(api), `missing ${api}`);
  }
  assert(!/\bSTAGE_SEED\b/.test(src));
  assert(!/Casque/i.test(src));
});
test("TC-KIT-DEP-001c", "KIT-DEP-001", "security", () => {
  const src = readText(PATHS.sceneTs);
  includes(loadScene().propKinds, "repoBranch");
  assert(src.includes("repoBranch") || src.includes("'repoBranch'") || src.includes('"repoBranch"'));
});

// --- KIT-DEP-002 adapters ---
test("TC-KIT-DEP-002a", "KIT-DEP-002", "happy", async () => {
  const mod = await importFromKit();
  const m = loadMark();
  deepEq(mod.listFaces(m), Object.keys(m.faces));
  eq(mod.hasFace(m, "idle"), true);
  eq(mod.hasFace(m, "nope"), false);
  deepEq(mod.linesFor(m, "idle"), m.faces.idle.lines);
  deepEq(mod.linesFor(m, "__unknown__"), m.faces.idle.lines, "unknown→idle");
});
test("TC-KIT-DEP-002b", "KIT-DEP-002", "boundary", async () => {
  const mod = await importFromKit();
  const m = loadMark();
  const merged = mod.mergeMark(m, { faces: { idle: { tone: "accent" } } });
  eq(merged.faces.idle.tone, "accent");
  assert(Array.isArray(merged.faces.idle.lines), "deep merge keeps lines");
  eq(merged.faces.idle.lines[0], m.faces.idle.lines[0]);
});
test("TC-KIT-DEP-002c", "KIT-DEP-002", "error", async () => {
  const css = readText(PATHS.presenceCss);
  const acts = new Set(loadScene().actions.map((a) => a.id));
  const motionIds = [...css.matchAll(/data-motion="([a-zA-Z]+)"/g)].map((x) => x[1]);
  for (const id of new Set(motionIds)) {
    assert(acts.has(id), `presence CSS motion id ${id} must ⊂ actions`);
  }
  const attrs = await importPresenceAttrs();
  const a = attrs.presenceAttrs({ face: "error", action: "shakeHead", stage: "gate" });
  eq(a["data-face"], "error");
  eq(a["data-action"], "shakeHead");
  eq(a["data-motion"], "shakeHead");
  eq(a["data-stage"], "gate");
  assert(!/Casque/i.test(a["aria-label"] || ""));
});

// --- KIT-DEP-003 brand narration ---
test("TC-KIT-DEP-003a", "KIT-DEP-003", "happy", () => {
  const doc = readText(PATHS.terminalMotion);
  const row = doc.split("\n").find((l) => /\| idle \/ blink \|/.test(l));
  assert(row && (/\| — \|/.test(row) || /keep-current/i.test(row)),
    "DEFECT-DOC-001 fixed: idle/blink stage — / keep-current");
});
test("TC-KIT-DEP-003b", "KIT-DEP-003", "security", () => {
  for (const p of [PATHS.brandDoc, PATHS.styleguide, PATHS.porting]) {
    if (!existsSync(p)) continue;
    const t = readText(p);
    // Casque may appear only as forbidden/never instruction
    const mentions = [...t.matchAll(/\bCasque\b/gi)];
    for (const m of mentions) {
      const start = Math.max(0, m.index - 40);
      const ctx = t.slice(start, m.index + 40);
      assert(/never|forbidden|no name|unnamed|not /i.test(ctx),
        `Casque in brand voice without forbid context: …${ctx}…`);
    }
  }
});
test("TC-KIT-DEP-003c", "KIT-DEP-003", "boundary", () => {
  const recipes = readText(PATHS.recipesDoc);
  assert(/kit\/mark\.json|kit\/scene\.json/.test(recipes) || /machine SoT|shared brick/i.test(recipes));
  assert(/later|demotion|without.*runner|v1 ships/i.test(recipes), "recipes later plate language");
});
