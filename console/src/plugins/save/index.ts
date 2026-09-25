import type { Card } from "@/lib/mininja";
import type { Program } from "../types.ts";
import { getKept, keep, listKept, peek, resetStream } from "../../lib/stream.ts";

function listCard(): Card {
  const items = listKept();
  if (!items.length) {
    return { title: "save", bottom: "nothing saved.", face: "denied" };
  }
  return {
    title: "save",
    tag: `${items.length}`,
    fields: items.map((k) => ({ label: k.id, value: k.text })),
    rows: items.map((k) => `pgeon ask ${k.id}`),
    bottom: "Output is input.",
    face: "completed",
  };
}

function run(argv: string[]): Card {
  const verb = (argv[0] ?? "").toLowerCase();
  if (verb === "reset") {
    resetStream();
    return { title: "save", tag: "reset", bottom: "stream cleared.", face: "cancelled" };
  }
  if (verb === "list") return listCard();
  if (verb) {
    const item = getKept(verb);
    if (!item) return { title: "save", bottom: `no ${verb}`, face: "error" };
    return {
      title: item.id,
      fields: [{ label: "text", value: item.text }],
      rows: [`pgeon ask ${item.id}`],
      face: "completed",
    };
  }
  const item = keep();
  if (!item) {
    return {
      title: "save",
      tag: "empty",
      bottom: peek() ? "already saved." : "nothing on the stream. run turn first.",
      face: "denied",
    };
  }
  return {
    title: "save",
    tag: item.id,
    fields: [{ label: "text", value: item.text }],
    rows: [`pgeon ask ${item.id}`, "save list"],
    bottom: "Output is input.",
    face: "completed",
  };
}

export const save: Program = { name: "save", run };
