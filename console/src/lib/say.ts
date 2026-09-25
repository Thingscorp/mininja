import type { Card } from "./mininja.ts";

export type Say = {
  text: string;
  yes?: string;
  no?: string;
};

export function sayFrom(card?: Card, quest?: string): Say | null {
  if (card?.ask) return { text: card.ask.q, yes: card.ask.yes, no: card.ask.no };
  if (card?.bottom) return { text: card.bottom };
  if (quest) return { text: `${quest}?`, yes: quest };
  return null;
}
