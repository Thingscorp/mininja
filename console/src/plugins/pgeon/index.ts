import type { Card } from "@/lib/mininja";
import type { Program } from "../types.ts";
import { poseFromFace } from "../../lib/pigeon.ts";
import { getKept } from "../../lib/stream.ts";
import { authorityFor, bestAnswer, rankedAnswers } from "./core.ts";
import {
  askQuestion,
  findAuthor,
  getStore,
  question,
  resetStore,
  voteFor,
} from "./store.ts";

function qid(arg: string): string {
  return (arg || "add").toLowerCase().replace(/[^a-z0-9]/g, "") || "add";
}

function bestCard(id: string): Card {
  const q = question(id);
  if (!q) {
    return { title: "pgeon", bottom: `no question ${id}`, face: "error" };
  }
  const ranked = rankedAnswers(q.id);
  const best = bestAnswer(q.id);
  if (!best) {
    return {
      title: q.id,
      tag: "none",
      fields: [{ label: "test", value: q.criterion }],
      bottom: "no best",
      face: "denied",
    };
  }
  return {
    title: q.id,
    tag: "verified",
    fields: ranked.map((a) => ({
      label: a.id === best.id ? "best" : a.author,
      value: a.passed
        ? `pass  ${a.votes}${a.id === best.id ? `  ${a.author}` : ""}`
        : `fail  ${a.votes}  gated`,
    })),
    rows: ranked.filter((a) => a.id !== best.id).map((a) => `pgeon vote ${a.author}`),
    bottom: "Votes cannot mint best.",
    face: "allowed",
  };
}

function askCard(arg: string): Card {
  if (!arg || arg === "add") {
    const q = question("add");
    if (!q) return { title: "pgeon", bottom: "no question add", face: "error" };
    return {
      title: q.id,
      tag: "locked",
      fields: [{ label: "test", value: q.criterion }],
      bottom: "Locked before answers existed.",
      face: "completed",
    };
  }
  const saved = getKept(arg.toLowerCase());
  if (saved) {
    const q = askQuestion(saved.id, saved.id, saved.text);
    return {
      ...bestCard(q.id),
      bottom: bestAnswer(q.id) ? undefined : "locked from the stream. no best.",
    };
  }
  const id = qid(arg);
  const q = askQuestion(id, id, "locked at ask-time");
  return bestCard(q.id);
}

function voteCard(authorRaw: string): Card {
  const author = (authorRaw || "bravo").toLowerCase();
  const answer = findAuthor("add", author);
  if (!answer) {
    return { title: "vote", bottom: `no author ${author}`, face: "error" };
  }
  voteFor(answer);
  const best = bestAnswer("add");
  const wins = best ? authorityFor(best.author, getStore().questions) : 0;
  return {
    title: "vote",
    tag: author,
    fields: [
      { label: "votes", value: String(answer.votes) },
      { label: "best", value: best ? best.author : "none" },
      { label: "wins", value: String(wins) },
    ],
    bottom: !answer.passed ? "best unchanged" : undefined,
    face: answer.passed ? "completed" : "sandboxing",
  };
}

function run(argv: string[]): Card {
  const verb = (argv[0] ?? "").toLowerCase();
  const rest = argv.slice(1).join(" ").trim();
  let card: Card;
  if (!verb || verb === "best" || verb === "open" || question(qid(verb))) {
    card = bestCard(verb && verb !== "best" && verb !== "open" ? qid(verb) : "add");
  } else if (verb === "ask") card = askCard(rest);
  else if (verb === "vote") card = voteCard(rest);
  else if (verb === "reset") {
    resetStore();
    card = { title: "pgeon", tag: "reset", bottom: "seed restored.", face: "cancelled" };
  } else card = { title: "pgeon", bottom: "pgeon, pgeon vote bravo, pgeon ask empty.", face: "error" };
  return { ...card, bird: poseFromFace(card.face) };
}

export const pgeon: Program = { name: "pgeon", run };

export { resetStore };
