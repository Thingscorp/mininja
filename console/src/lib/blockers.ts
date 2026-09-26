/** Work that is in the way. The chart sorts itself: nothing starts until what it needs is done. */
export type Blocker = {
  id: string;
  title: string;
  why: string;
  days: number;
  needs: string[];
};

export type Scheduled = Blocker & {
  start: number;
  end: number;
  ready: boolean;
  critical: boolean;
  waitingOn: string[];
};

export const BLOCKERS: Blocker[] = [
  {
    id: "reviews",
    title: "Finish leftover reviews",
    why: "A review is a yes or no on saved work. You finish the queue before anyone reads the next release.",
    days: 2,
    needs: [],
  },
  {
    id: "read104",
    title: "Get a second reader on the next release",
    why: "The next release stays unpublished until a second person reads it. That step starts after leftover reviews end.",
    days: 1,
    needs: ["reviews"],
  },
  {
    id: "publish",
    title: "Publish the next release",
    why: "You publish after the second read is done.",
    days: 1,
    needs: ["read104"],
  },
  {
    id: "board",
    title: "Decide the old board files",
    why: "The old board is off. You keep or delete the files. No other job waits on this decision.",
    days: 1,
    needs: [],
  },
];

export function schedule(items: Blocker[] = BLOCKERS): Scheduled[] {
  const byId = new Map(items.map((b) => [b.id, b]));
  const start = new Map<string, number>();

  function earliest(id: string, stack = new Set<string>()): number {
    const hit = start.get(id);
    if (hit != null) return hit;
    if (stack.has(id)) {
      for (const x of stack) start.set(x, 0);
      return 0;
    }
    stack.add(id);
    const b = byId.get(id);
    if (!b) return 0;
    let s = 0;
    for (const n of b.needs) {
      if (stack.has(n)) continue;
      const dep = byId.get(n);
      if (!dep) continue;
      s = Math.max(s, earliest(n, stack) + dep.days);
    }
    const prev = start.get(id);
    start.set(id, prev == null ? s : Math.min(prev, s));
    return start.get(id) ?? 0;
  }

  const laid = items.map((b) => {
    const s = earliest(b.id);
    return {
      ...b,
      start: s,
      end: s + b.days,
      ready: b.needs.length === 0,
      critical: false,
      waitingOn: b.needs.map((id) => byId.get(id)?.title ?? id),
    };
  });

  const finish = Math.max(0, ...laid.map((r) => r.end));
  const onPath = new Set<string>();
  const walk = (id: string) => {
    if (onPath.has(id)) return;
    onPath.add(id);
    const cur = laid.find((x) => x.id === id);
    if (!cur) return;
    for (const x of laid) {
      if (cur.needs.includes(x.id) && x.end === cur.start) walk(x.id);
    }
  };
  for (const r of laid) if (r.end === finish) walk(r.id);

  return laid
    .map((r) => ({ ...r, critical: onPath.has(r.id) }))
    .sort((a, b) => a.start - b.start || a.end - b.end);
}

export function horizon(rows: Scheduled[]): number {
  return Math.max(1, ...rows.map((r) => r.end));
}

export function findBlocker(q: string): Scheduled | undefined {
  const s = q.toLowerCase().trim();
  if (!s) return undefined;
  const rows = schedule();
  const exact = rows.find((b) => b.id === s);
  if (exact) return exact;
  if (s.length < 4) return undefined;
  return rows.find((b) => b.title.toLowerCase().includes(s));
}
