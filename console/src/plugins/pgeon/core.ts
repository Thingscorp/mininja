/**
 * Converted pgeon core for this console only.
 * Thesis: reality decides correct; votes only rank within what passed.
 * No Bradley-Terry, no MCP, no HTTP. Vote-sum inside the gate.
 */
import { answersFor, type Answer, type Question } from "./store.ts";

export function rankedAnswers(questionId: string): Answer[] {
  return answersFor(questionId)
    .slice()
    .sort((a, b) => {
      const ap = a.passed ? 1 : 0;
      const bp = b.passed ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return b.votes - a.votes;
    });
}

/** Top of the verified set, or null. Never manufactured. */
export function bestAnswer(questionId: string): Answer | null {
  const passed = rankedAnswers(questionId).filter((a) => a.passed);
  return passed[0] ?? null;
}

/** Closed-question wins only. Upvotes never count. */
export function authorityFor(author: string, questions: Question[]): number {
  let wins = 0;
  for (const q of questions) {
    if (!q.closed) continue;
    const best = bestAnswer(q.id);
    if (best?.author === author) wins += 1;
  }
  return wins;
}
