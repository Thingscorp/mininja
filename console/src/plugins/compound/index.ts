import type { Card } from "@/lib/mininja";
import type { Program } from "../types.ts";
import { active, bar, coverage, getStore, progress, resetStore } from "./store.ts";

function sidecar(): Card {
  const s = getStore();
  const { done, total } = progress();
  const pct = coverage();
  const cur = active() ?? s.modules.find((m) => m.status === "--");
  const locked = s.modules.filter((m) => m.status === "OK");
  const tail = locked.slice(-3);
  return {
    title: "sidecar",
    tag: `${s.phase}  ${pct}%`,
    fields: [
      { label: "cover", value: `${bar(pct)}  ${pct}%` },
      { label: "goal", value: `${done}/${total}` },
      { label: "build", value: s.instruction },
      ...tail.map((m) => ({
        label: m.status,
        value: `${m.id}  ${m.purpose}`,
      })),
      ...(cur
        ? [{ label: cur.status, value: `${cur.id}  ${cur.purpose}` }]
        : []),
    ],
    bottom: s.focus,
    face: s.decision === "terminate" ? "completed" : "executing",
  };
}

function run(argv: string[]): Card {
  const verb = (argv[0] ?? "").toLowerCase();
  if (verb === "reset") {
    resetStore();
    return { title: "compound", tag: "reset", bottom: "seed restored.", face: "cancelled" };
  }
  return sidecar();
}

export const compound: Program = { name: "compound", run };

export { resetStore };
