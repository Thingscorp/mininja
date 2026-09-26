/** Fitness only. Empty stream uses the frozen seed. A live stream is the next seed. */

export type Candidate = {
  id: string;
  fitness: number;
  prompt: string;
};

const FROZEN: Candidate[] = [
  { id: "helper", fitness: 0.41, prompt: "You are a helper." },
  { id: "spec", fitness: 0.78, prompt: "Answer in one block. Name the check you will pass." },
  { id: "gate", fitness: 0.91, prompt: "Lock the test before you answer. Refuse a winner if nothing passed." },
];

function score(prompt: string): number {
  let n = 0.28;
  if (/lock|refuse|fail closed/i.test(prompt)) n += 0.34;
  if (/test|check|pass/i.test(prompt)) n += 0.22;
  if (prompt.length > 24 && prompt.length < 180) n += 0.1;
  if (/one (line|block)/i.test(prompt)) n += 0.08;
  return Math.min(0.99, Number(n.toFixed(2)));
}

function vary(seed: string): Candidate[] {
  const base = seed.replace(/\s+/g, " ").trim();
  const spec = /check|test/i.test(base)
    ? `${base} State the check in one line.`
    : `Name the check you will pass. ${base}`;
  const shut = /lock|refuse/i.test(base) ? `${base} Fail closed.` : `Lock the test before you answer. ${base}`;
  return [
    { id: "seed", prompt: base, fitness: score(base) },
    { id: "spec", prompt: spec, fitness: score(spec) },
    { id: "shut", prompt: shut, fitness: score(shut) },
  ];
}

export function ranked(seed?: string): Candidate[] {
  const list = seed?.trim() ? vary(seed) : FROZEN;
  return list.slice().sort((a, b) => b.fitness - a.fitness);
}

export function lead(seed?: string): Candidate {
  return ranked(seed)[0]!;
}
