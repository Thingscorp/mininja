import type { Card } from "@/lib/mininja";
import type { Program } from "../types.ts";
import { asMarkdown, compile } from "./store.ts";

function run(): Card {
  const lines = compile();
  return {
    title: "brief",
    tag: `${lines.filter((l) => l.kind === "fact").length}f`,
    fields: lines.map((l) => ({
      label: l.kind === "loop" ? "loop" : l.kind,
      value: l.text,
    })),
    rows: ["save"],
    bottom: "Source is not a fact. Capture does not promote.",
    face: "completed",
    stream: asMarkdown(lines),
  };
}

export const brief: Program = { name: "brief", run: () => run() };
