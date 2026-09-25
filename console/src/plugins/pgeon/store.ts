/** Session store for the laptop plugin. Converted from pgeon arena: no HTTP, no MCP. */

export type Question = {
  id: string;
  prompt: string;
  /** Locked at ask-time, before any answer exists. */
  criterion: string;
  closed: boolean;
};

export type Answer = {
  id: string;
  question_id: string;
  author: string;
  passed: boolean;
  votes: number;
};

export type Store = {
  questions: Question[];
  answers: Answer[];
};

function seed(): Store {
  return {
    questions: [
      {
        id: "add",
        prompt: "add two numbers",
        criterion: "solution(2, 3) === 5 && solution(0, 0) === 0",
        closed: true,
      },
    ],
    answers: [
      { id: "a1", question_id: "add", author: "alice", passed: true, votes: 1 },
      { id: "a2", question_id: "add", author: "carol", passed: true, votes: 3 },
      { id: "a3", question_id: "add", author: "bob", passed: false, votes: 5 },
    ],
  };
}

let store: Store = seed();

export function resetStore(): Store {
  store = seed();
  return store;
}

export function getStore(): Store {
  return store;
}

export function question(id: string): Question | undefined {
  return store.questions.find((q) => q.id === id);
}

export function answersFor(id: string): Answer[] {
  return store.answers.filter((a) => a.question_id === id);
}

export function findAuthor(qid: string, author: string): Answer | undefined {
  return store.answers.find((a) => a.question_id === qid && a.author === author);
}

export function voteFor(answer: Answer): void {
  answer.votes += 1;
}

export function askQuestion(id: string, prompt: string, criterion: string): Question {
  const existing = question(id);
  if (existing) return existing;
  const q: Question = { id, prompt, criterion, closed: false };
  store.questions.push(q);
  return q;
}
