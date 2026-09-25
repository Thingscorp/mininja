import type { Card } from "@/lib/mininja";
import type { Program } from "../types.ts";
import { peek } from "../../lib/stream.ts";
import { isOn } from "../refine/store.ts";
import { lead, ranked } from "./store.ts";

function run(): Card {
  if (!isOn()) {
    return {
      title: "turn",
      tag: "off",
      bottom: "refine is off.",
      face: "denied",
      ask: { q: "Turn needs refine on.", yes: "refine on" },
    };
  }
  const seed = peek();
  const top = lead(seed);
  return {
    title: "turn",
    tag: seed ? "loop" : "fitness",
    fields: ranked(seed).map((c) => ({
      label: c.id === top.id ? "lead" : c.id,
      value: c.id === top.id ? `${c.fitness.toFixed(2)}  ${c.id}  ${c.prompt}` : c.fitness.toFixed(2),
    })),
    rows: ["save"],
    bottom: "Fitness is not verified. pgeon grades.",
    face: "warning",
    stream: top.prompt,
  };
}

export const turn: Program = { name: "turn", run: () => run() };
