/** Universal text stream. Last output is the next program's input. */

export type Kept = { id: string; text: string };

let last = "";
let n = 0;
let kept: Kept[] = [];

export function write(text: string): void {
  const t = text.trim();
  if (t) last = t;
}

export function peek(): string {
  return last;
}

export function keep(): Kept | undefined {
  if (!last) return undefined;
  n += 1;
  const item = { id: `s${n}`, text: last };
  kept = [...kept, item];
  return item;
}

export function getKept(id: string): Kept | undefined {
  return kept.find((k) => k.id === id);
}

export function listKept(): Kept[] {
  return kept;
}

export function resetStream(): void {
  last = "";
  n = 0;
  kept = [];
}
