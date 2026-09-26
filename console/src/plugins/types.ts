import type { Card } from "@/lib/mininja";

/** A program the shell can run. Not a skill. Not a plugin. */
export type Program = {
  name: string;
  run: (argv: string[]) => Card;
};
