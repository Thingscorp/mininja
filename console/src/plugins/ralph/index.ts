import type { Card } from "@/lib/mininja";
import type { Program } from "../types.ts";

/** Public build ships with an empty loop. Local `.ralph/items.json` is gitignored. */
type Item = {
  id: string;
  category: string;
  passes: boolean;
  blocked: boolean;
  description: string;
};

const items: Item[] = [];

function counts() {
  const passing = items.filter((i) => i.passes).length;
  const blocked = items.filter((i) => i.blocked).length;
  const remaining = items.filter((i) => !i.passes && !i.blocked).length;
  return { passing, blocked, remaining, total: items.length };
}

function status(): Card {
  const c = counts();
  const next = items.find((i) => !i.passes && !i.blocked);
  return {
    title: "ralph",
    tag: `${c.passing}/${c.total}`,
    fields: [
      { label: "run", value: "stopped" },
      { label: "pass", value: String(c.passing) },
      { label: "wait", value: String(c.remaining) },
      { label: "hold", value: String(c.blocked) },
    ],
    rows: next ? [`ralph ${next.id}`] : [],
    bottom: next ? next.description : "Nothing eligible.",
    face: next ? "executing" : "completed",
  };
}

function inspect(id: string): Card {
  const item = items.find((i) => i.id === id);
  if (!item) return { title: "ralph", bottom: "ralph, or ralph <id>.", face: "error" };
  return {
    title: item.id,
    tag: item.passes ? "pass" : item.blocked ? "hold" : "wait",
    bottom: item.description,
    face: item.passes ? "allowed" : item.blocked ? "cancelled" : "warning",
  };
}

function run(argv: string[]): Card {
  const verb = (argv[0] ?? "").toLowerCase();
  if (!verb || verb === "status") return status();
  return inspect(verb);
}

export const ralph: Program = { name: "ralph", run };
