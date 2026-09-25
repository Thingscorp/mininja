import { LEDGER } from "../../lib/mininja.ts";
import { schedule } from "../../lib/blockers.ts";
import { listKept, peek } from "../../lib/stream.ts";
import itemsDoc from "../../../.ralph/items.json" with { type: "json" };

export type Line = { kind: "fact" | "source" | "loop"; text: string };

export function compile(): Line[] {
  const lines: Line[] = [
    { kind: "fact", text: `${LEDGER.published} is live` },
    { kind: "fact", text: `${LEDGER.candidate} is unpublished` },
    { kind: "fact", text: `${LEDGER.captures} saved` },
  ];

  const kept = listKept();
  if (kept.length) {
    for (const k of kept) lines.push({ kind: "source", text: `${k.id}  ${k.text}` });
  } else {
    lines.push({ kind: "source", text: "none" });
  }
  const loose = peek();
  if (loose && !kept.some((k) => k.text === loose)) {
    lines.push({ kind: "source", text: `peek  ${loose}` });
  }

  for (const job of schedule()) {
    lines.push({ kind: "loop", text: job.ready ? job.title : `${job.title}  after ${job.waitingOn.join(", ")}` });
  }
  for (const item of itemsDoc.items) {
    if (item.passes) continue;
    lines.push({
      kind: "loop",
      text: item.blocked ? `${item.id}  hold` : `${item.id}  wait`,
    });
  }
  return lines;
}

export function asMarkdown(lines: Line[]): string {
  return lines
    .map((l) => {
      if (l.kind === "fact") return `**fact** ${l.text}`;
      if (l.kind === "source") return `**source** ${l.text}`;
      return `**open loop** ${l.text}`;
    })
    .join("\n");
}
