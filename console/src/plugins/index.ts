import type { Card } from "@/lib/mininja";
import { write } from "../lib/stream.ts";
import { brief } from "./brief/index.ts";
import { compound } from "./compound/index.ts";
import { pgeon } from "./pgeon/index.ts";
import { qa } from "./qa/index.ts";
import { ralph } from "./ralph/index.ts";
import { refine } from "./refine/index.ts";
import { save } from "./save/index.ts";
import { turn } from "./turn/index.ts";
import type { Program } from "./types.ts";

export const PROGRAMS: Program[] = [pgeon, refine, compound, qa, turn, save, ralph, brief];

export function dispatchProgram(raw: string): Card | undefined {
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  const head = (parts[0] ?? "").toLowerCase().replace(/^\//, "");
  const program = PROGRAMS.find((p) => p.name === head);
  if (!program) return undefined;
  const card = program.run(parts.slice(1));
  if (card.stream) write(card.stream);
  return card;
}