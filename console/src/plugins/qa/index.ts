import type { Card } from "@/lib/mininja";
import type { Program } from "../types.ts";
import defects from "./defects.json" with { type: "json" };
import features from "./features.json" with { type: "json" };

type Feature = (typeof features)[number];
type Defect = (typeof defects)[number];

function feat(row: Feature) {
  return {
    id: row["Feature ID"],
    name: row["Feature Name"],
    story: row["User Story"],
    expected: row["Expected Behaviour"],
    edges: row["Edge Cases"],
    tests: row["Test Cases"],
    status: String(row["Current Status"] || "").toUpperCase(),
    defects: Number(row["Defect Count"] || 0),
    severity: row["Severity"],
    notes: row["Notes"],
    last: row["Last Tested Date"],
  };
}

function def(row: Defect) {
  return {
    id: row["Defect ID"],
    feature: row["Feature ID"],
    steps: row["Reproduction steps"],
    expected: row["Expected result"],
    actual: row["Actual result"],
    severity: row["Severity"],
    cause: row["Root cause hypothesis"],
    status: row["Status"],
  };
}

const FEATS = features.map(feat);
const DEFS = defects.map(def);

function openDefects() {
  return DEFS.filter((d) => d.status !== "fixed" && d.status !== "waived");
}

function counts() {
  const tested = FEATS.filter((f) => f.status === "TESTED").length;
  const retired = FEATS.filter((f) => f.status === "RETIRED").length;
  const live = FEATS.length - retired;
  const open = openDefects();
  const high = open.filter((d) => d.severity === "high" || d.severity === "critical");
  const suites = FEATS.filter((f) => f.tests && f.status !== "RETIRED").length;
  const conf = Math.max(
    0,
    Math.min(100, Math.round((tested / Math.max(1, live)) * 100 - high.length * 15 - open.length * 5)),
  );
  return { tested, total: FEATS.length, live, retired, suites, open: open.length, high: high.length, conf };
}

function sidecar(): Card {
  const c = counts();
  const stop = c.tested === c.live && c.high === 0 && c.open === 0;
  return {
    title: "qa",
    tag: `${c.conf}%`,
    fields: [
      { label: "live", value: `${c.tested}/${c.live}` },
      { label: "open", value: String(c.open) },
    ],
    rows: FEATS.filter((f) => f.status !== "RETIRED").map((f) => `qa ${f.id}`),
    bottom: stop ? "Register is current." : "Open work remains.",
    face: stop ? "completed" : "warning",
  };
}

function defectsCard(): Card {
  const open = openDefects();
  return {
    title: "defects",
    tag: `${open.length} open / ${DEFS.length}`,
    rows: DEFS.map((d) => `${d.id}  ${d.feature}  ${d.status}  ${d.severity}`),
    bottom: open.length ? "Open items still count." : "All closed or waived.",
    face: open.length ? "warning" : "completed",
  };
}

function inspect(id: string): Card {
  const f = FEATS.find((x) => x.id.toLowerCase() === id.toLowerCase());
  if (!f) {
    return { title: "qa", bottom: "qa, qa KIT-MARK-001, or qa defects.", face: "error" };
  }
  return {
    title: f.id,
    tag: f.status,
    fields: [
      { label: "name", value: f.name },
      { label: "tests", value: f.tests },
      { label: "defects", value: String(f.defects) },
      { label: "severity", value: f.severity },
    ],
    bottom: f.story,
    face: "completed",
  };
}

function run(argv: string[]): Card {
  const verb = (argv[0] ?? "").toLowerCase();
  if (!verb || verb === "help" || verb === "discover") return sidecar();
  if (verb === "defects") return defectsCard();
  if (verb === "tests" || verb === "run" || verb === "next") return sidecar();
  return inspect(argv[0] ?? verb);
}

export const qa: Program = { name: "qa", run };
