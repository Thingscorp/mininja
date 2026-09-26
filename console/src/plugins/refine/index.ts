import type { Card } from "@/lib/mininja";
import type { Program } from "../types.ts";
import { isOn, resetStore, setOn, toggle } from "./store.ts";

function stateCard(): Card {
  const on = isOn();
  return {
    title: "refine",
    tag: on ? "on" : "off",
    bottom: on ? "Type turn. Fitness is not verified." : "Prompt turns are off.",
    face: on ? "warning" : "cancelled",
  };
}

function run(argv: string[]): Card {
  const verb = (argv[0] ?? "").toLowerCase();
  if (!verb) toggle();
  else if (verb === "on") setOn(true);
  else if (verb === "off") setOn(false);
  else if (verb === "reset") resetStore();
  else return { title: "refine", bottom: "on or off.", face: "error" };
  return stateCard();
}

export const refine: Program = { name: "refine", run };

export { isOn, resetStore };
