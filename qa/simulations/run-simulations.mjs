#!/usr/bin/env node
/**
 * Mock habitat/emote simulations — validate scenario kit ids against
 * kit/mark.json + kit/scene.json only. Exit non-zero on invalid ids.
 *
 * Usage: node qa/simulations/run-simulations.mjs [--report]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const wantReport = process.argv.includes("--report");

const mark = JSON.parse(readFileSync(join(root, "kit", "mark.json"), "utf8"));
const scene = JSON.parse(readFileSync(join(root, "kit", "scene.json"), "utf8"));

const FACES = new Set(Object.keys(mark.faces || {}));
const EMOTIONS = new Set((scene.emotions || []).map((e) => e.id));
const ACTIONS = new Set((scene.actions || []).map((a) => a.id));
const STAGES = new Set((scene.stages || []).map((s) => s.id));
const WEATHER = new Set(scene.weather || []);
const PROP_KINDS = new Set(scene.propKinds || []);
const TONES = new Set(Object.keys(mark.moodColorsUiOnly || {}));
const GROWTH_MIN = scene.garden?.growth?.min ?? 0;
const GROWTH_MAX = scene.garden?.growth?.max ?? 5;

const CONTEXTS = new Set(["mono", "multi-repo", "single-repo", "polyrepo"]);
const ROLES = new Set(["root", "leaf", "dependency", "fork", "stale"]);
const LINK_KINDS = new Set(["cable", "dependency", "workspace", "remote"]);

const REQUIRED = ["id", "title", "context", "trigger", "plants", "links", "then", "edgeCase", "expectedBehaviour"];

function loadScenarios() {
  const jsonl = join(here, "scenarios.jsonl");
  const dir = join(here, "scenarios");
  const out = [];
  if (existsSync(jsonl)) {
    const text = readFileSync(jsonl, "utf8");
    for (const [i, line] of text.split(/\n/).entries()) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      try {
        out.push({ scenario: JSON.parse(t), source: `scenarios.jsonl:${i + 1}` });
      } catch (e) {
        out.push({ scenario: null, source: `scenarios.jsonl:${i + 1}`, parseError: String(e.message || e) });
      }
    }
  }
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter((n) => n.endsWith(".json")).sort()) {
      try {
        out.push({ scenario: JSON.parse(readFileSync(join(dir, f), "utf8")), source: `scenarios/${f}` });
      } catch (e) {
        out.push({ scenario: null, source: `scenarios/${f}`, parseError: String(e.message || e) });
      }
    }
  }
  return out;
}

function checkGrowth(n, path, errors) {
  if (typeof n !== "number" || !Number.isInteger(n) || n < GROWTH_MIN || n > GROWTH_MAX) {
    errors.push(`${path}: growth must be integer ${GROWTH_MIN}..${GROWTH_MAX}, got ${JSON.stringify(n)}`);
  }
}

function validate(scenario, source) {
  const errors = [];
  if (!scenario) {
    errors.push(`${source}: parse error`);
    return errors;
  }
  for (const k of REQUIRED) {
    if (!(k in scenario)) errors.push(`${source}: missing field "${k}"`);
  }
  if (scenario.context && !CONTEXTS.has(scenario.context)) {
    errors.push(`${source}: context "${scenario.context}" not in ${[...CONTEXTS].join("|")}`);
  }
  if (!Array.isArray(scenario.plants)) {
    errors.push(`${source}: plants must be array`);
  } else {
    const labels = new Set();
    for (const [i, p] of scenario.plants.entries()) {
      if (!p || typeof p !== "object") {
        errors.push(`${source}: plants[${i}] invalid`);
        continue;
      }
      if (!p.label || typeof p.label !== "string") errors.push(`${source}: plants[${i}].label required`);
      if (labels.has(p.label)) errors.push(`${source}: duplicate plant label "${p.label}"`);
      labels.add(p.label);
      checkGrowth(p.growth, `${source}: plants[${i}].growth`, errors);
      if (!ROLES.has(p.role)) errors.push(`${source}: plants[${i}].role "${p.role}" invalid`);
    }
  }
  if (!Array.isArray(scenario.links)) {
    errors.push(`${source}: links must be array`);
  } else {
    const labels = new Set((scenario.plants || []).map((p) => p && p.label).filter(Boolean));
    for (const [i, l] of scenario.links.entries()) {
      if (!l || typeof l !== "object") {
        errors.push(`${source}: links[${i}] invalid`);
        continue;
      }
      if (!LINK_KINDS.has(l.kind)) errors.push(`${source}: links[${i}].kind "${l.kind}" invalid`);
      if (!labels.has(l.from)) errors.push(`${source}: links[${i}].from "${l.from}" not in plants`);
      if (!labels.has(l.to)) errors.push(`${source}: links[${i}].to "${l.to}" not in plants`);
      // Prefer existing kit prop for visual cable; dependency/workspace/remote are design-only overlays.
      if (l.kind === "cable" && !PROP_KINDS.has("cable")) {
        errors.push(`${source}: kit missing propKind cable`);
      }
    }
  }
  const then = scenario.then || {};
  if (then.face != null && !FACES.has(then.face)) {
    errors.push(`${source}: then.face "${then.face}" not in kit/mark.json faces`);
  }
  if (then.emotion != null && !EMOTIONS.has(then.emotion)) {
    errors.push(`${source}: then.emotion "${then.emotion}" not in kit/scene.json emotions`);
  }
  if (then.action != null && !ACTIONS.has(then.action)) {
    errors.push(`${source}: then.action "${then.action}" not in kit/scene.json actions`);
  }
  if (then.stage != null && !STAGES.has(then.stage)) {
    errors.push(`${source}: then.stage "${then.stage}" not in kit/scene.json stages`);
  }
  if (then.weather != null && !WEATHER.has(then.weather)) {
    errors.push(`${source}: then.weather "${then.weather}" not in kit/scene.json weather`);
  }
  if (then.tone != null && !TONES.has(then.tone)) {
    errors.push(`${source}: then.tone "${then.tone}" not in mark.moodColorsUiOnly (chrome only)`);
  }
  if ("mood" in then) {
    errors.push(`${source}: then.mood forbidden — use then.tone chrome only (no mood ids)`);
  }
  if (then.growthUpdates != null) {
    if (!Array.isArray(then.growthUpdates)) {
      errors.push(`${source}: then.growthUpdates must be array`);
    } else {
      const labels = new Set((scenario.plants || []).map((p) => p && p.label).filter(Boolean));
      for (const [i, g] of then.growthUpdates.entries()) {
        if (!g || !labels.has(g.label)) {
          errors.push(`${source}: growthUpdates[${i}].label "${g && g.label}" not in plants`);
        }
        checkGrowth(g && g.growth, `${source}: growthUpdates[${i}].growth`, errors);
      }
    }
  }
  const thenKeys = ["face", "emotion", "action", "stage", "weather", "growthUpdates", "tone"];
  const present = thenKeys.filter((k) => then[k] != null);
  if (present.length === 0 && Object.keys(then).length === 0) {
    errors.push(`${source}: then must include at least one seam field`);
  }
  if (scenario.weedsNote != null && typeof scenario.weedsNote !== "string") {
    errors.push(`${source}: weedsNote must be string (design-only)`);
  }
  // Guard: never invent weed kit constants in scenario body
  const blob = JSON.stringify(scenario);
  if (/\bpropKind"\s*:\s*"weed/i.test(blob) || /"kind"\s*:\s*"weed/i.test(blob)) {
    errors.push(`${source}: must not invent weed propKinds`);
  }
  if (/\bCasque\b/.test(blob)) {
    errors.push(`${source}: forbidden name Casque`);
  }
  return errors;
}

function familyOf(id) {
  if (/^seed-/.test(id)) return "seed";
  if (/^pr-/.test(id)) return "pr";
  if (/^ci-/.test(id)) return "ci";
  if (/^merge-|^rebase-/.test(id)) return "merge-rebase";
  if (/^push-|^release-|^tag-/.test(id)) return "push-release";
  if (/^dep-/.test(id)) return "dependency";
  if (/^mono-|^ci-pass-mono/.test(id)) return "monorepo";
  if (/^polyrepo-/.test(id)) return "polyrepo";
  if (/^cross-org-|^multi-org-/.test(id)) return "cross-org";
  if (/^weed-/.test(id)) return "weeds";
  if (/^secrets-|^offline-|^cancelled-/.test(id)) return "secrets-offline-cancel";
  if (/^agent-/.test(id)) return "agent-loops";
  if (/^stage-/.test(id)) return "stages";
  if (/^empty-|^recipe-|^archives-/.test(id)) return "misc";
  return "other";
}

function recommendMappings(rows) {
  /** Aggregate face/stage/emotion/action by family for REPORT. */
  const byFamily = new Map();
  for (const { scenario } of rows) {
    if (!scenario) continue;
    const fam = familyOf(scenario.id);
    if (!byFamily.has(fam)) byFamily.set(fam, []);
    byFamily.get(fam).push(scenario);
  }
  const lines = [];
  lines.push("# Simulation report — recommended mappings");
  lines.push("");
  lines.push(`Generated by \`qa/simulations/run-simulations.mjs --report\`.`);
  lines.push(`Kit: mark ${mark.version} · scene ${scene.version}.`);
  lines.push(`Scenarios: ${rows.filter((r) => r.scenario).length}.`);
  lines.push("");
  lines.push("## Metaphor rules (recap)");
  lines.push("");
  lines.push("- Machine SoT = `kit/mark.json` + `kit/scene.json` only.");
  lines.push("- Seams: face · stage · action · emotion · growth. `tone` = chrome only.");
  lines.push("- Garden = `repoBranch` plants. Weeds = design vocabulary only (no weed propKinds).");
  lines.push("- Links = design-only; prefer kit `cable` prop for visual links.");
  lines.push("- v1 ship = creature + habitat strip; recipes later plate, then-shape compatible.");
  lines.push("");
  lines.push("## Recommended mappings by family");
  lines.push("");
  for (const fam of [...byFamily.keys()].sort()) {
    lines.push(`### ${fam}`);
    lines.push("");
    lines.push("| id | face | emotion | action | stage | weather |");
    lines.push("|----|------|---------|--------|-------|---------|");
    for (const s of byFamily.get(fam)) {
      const t = s.then || {};
      lines.push(
        `| \`${s.id}\` | ${t.face || "—"} | ${t.emotion || "—"} | ${t.action || "—"} | ${t.stage || "—"} | ${t.weather || "—"} |`,
      );
    }
    lines.push("");
  }
  lines.push("## Top recommended defaults (taste seeds)");
  lines.push("");
  lines.push("| Dev event | face | emotion | action | stage |");
  lines.push("|-----------|------|---------|--------|-------|");
  const seeds = [
    ["clone / empty", "idle", "curious", "crouch", "dock"],
    ["first commit", "allowed", "happy", "nod", "desk"],
    ["PR open", "asking", "curious", "point", "desk"],
    ["PR approved", "allowed", "happy", "nod", "gate"],
    ["PR merged / release", "completed", "proud", "celebrate", "rooftop"],
    ["CI fail", "error", "confused", "shakeHead", "gate"],
    ["CI pass", "allowed", "relieved", "nod", "desk"],
    ["merge conflict", "denied", "frustrated", "shakeHead", "gate"],
    ["supply-chain scare", "denied", "startled", "shakeHead", "gate"],
    ["secrets leaked", "denied", "startled", "shakeHead", "gate"],
    ["offline", "offline", "sleepy", "sleep", "nightwatch"],
    ["cancelled", "cancelled", "embarrassed", "lookBack", "dock"],
    ["agent sandbox", "sandboxing", "mischievous", "peek", "workshop"],
    ["agent execute", "executing", "determined", "type", "workshop"],
    ["agent evaluate", "evaluating", "focused", "think", "desk"],
    ["gate deny", "denied", "frustrated", "shakeHead", "gate"],
  ];
  for (const row of seeds) {
    lines.push(`| ${row[0]} | ${row[1]} | ${row[2]} | ${row[3]} | ${row[4]} |`);
  }
  lines.push("");
  lines.push("## Unresolved edge cases (need Russ taste)");
  lines.push("");
  const open = [];
  for (const { scenario } of rows) {
    if (!scenario) continue;
    // Collect scenarios flagged as needing product taste
    const e = scenario.edgeCase || "";
    if (
      /which plant|crowding|draft chrome|hostile|overshoot|mixed graph|emotion-only|teardown|owns the warn|jump vs celebrate/i.test(
        e,
      )
    ) {
      open.push(`- **${scenario.id}**: ${e}`);
    }
  }
  // Always include known open questions from design
  open.push("- **Polyrepo multiple roots**: garden metaphor assumes one canopy — how loud should hub cables be?");
  open.push("- **Gate for approve vs deny**: same stage, opposite faces — need distinct barrier chrome?");
  open.push("- **Draft PR cable**: dashed/dim host chrome without new kit link kind?");
  open.push("- **Stale weed contrast**: growth 1 vs 5 enough, or need opacity/desaturate host rule?");
  open.push("- **Unbridged emotions** (`relieved`, `startled`, `sad`, `alert`): habitat-ok but no mark face — when to prefer face vs emotion?");
  open.push("- **growthUpdates teardown** after merge: vanish leaf instantly vs wilt animation?");
  if (open.length === 0) lines.push("_None flagged._");
  else lines.push([...new Set(open)].join("\n"));
  lines.push("");
  lines.push("## Kit vocab snapshot");
  lines.push("");
  lines.push(`- faces (${FACES.size}): ${[...FACES].join(", ")}`);
  lines.push(`- emotions (${EMOTIONS.size}): ${[...EMOTIONS].join(", ")}`);
  lines.push(`- actions (${ACTIONS.size}): ${[...ACTIONS].join(", ")}`);
  lines.push(`- stages (${STAGES.size}): ${[...STAGES].join(", ")}`);
  lines.push(`- weather (${WEATHER.size}): ${[...WEATHER].join(", ")}`);
  lines.push(`- propKinds: ${[...PROP_KINDS].join(", ")}`);
  lines.push(`- growth: ${GROWTH_MIN}..${GROWTH_MAX}`);
  lines.push(`- tones (chrome): ${[...TONES].join(", ")}`);
  lines.push("");
  return lines.join("\n");
}

function main() {
  const rows = loadScenarios();
  if (rows.length === 0) {
    console.error("FAIL  no scenarios found in qa/simulations/scenarios.jsonl or scenarios/");
    process.exit(1);
  }

  let failed = 0;
  const errorsAll = [];
  const familyCounts = new Map();
  const contextCounts = new Map();

  for (const row of rows) {
    if (row.parseError) {
      failed++;
      errorsAll.push(`${row.source}: ${row.parseError}`);
      continue;
    }
    const errs = validate(row.scenario, row.source);
    if (errs.length) {
      failed++;
      errorsAll.push(...errs);
    }
    if (row.scenario) {
      const fam = familyOf(row.scenario.id);
      familyCounts.set(fam, (familyCounts.get(fam) || 0) + 1);
      contextCounts.set(row.scenario.context, (contextCounts.get(row.scenario.context) || 0) + 1);
    }
  }

  const ok = rows.length - failed;
  console.log("Mininja habitat/emote simulations");
  console.log(`kit mark=${mark.version} scene=${scene.version}`);
  console.log(`scenarios: ${rows.length}  valid: ${ok}  invalid: ${failed}`);
  console.log("");
  console.log("Matrix — by family:");
  for (const [k, v] of [...familyCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${k.padEnd(24)} ${v}`);
  }
  console.log("Matrix — by context:");
  for (const [k, v] of [...contextCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${k.padEnd(24)} ${v}`);
  }
  console.log("");

  if (wantReport) {
    const report = recommendMappings(rows);
    const out = join(here, "REPORT.md");
    writeFileSync(out, report);
    console.log(`wrote ${out}`);
  }

  if (failed) {
    console.error("VALIDATION ERRORS:");
    for (const e of errorsAll) console.error(`  • ${e}`);
    process.exit(1);
  }
  console.log("PASS  all scenario kit ids validate");
}

main();
