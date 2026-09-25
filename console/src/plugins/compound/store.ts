/** Live unix-compound run. Text in, text out. */

export type Status = "OK" | ">>" | ".." | "XX" | "--";

export type Module = {
  id: string;
  purpose: string;
  iface: string;
  status: Status;
};

export type Criterion = {
  id: string;
  text: string;
  done: boolean;
};

export type Store = {
  phase: string;
  depth: number;
  focus: string;
  decision: "continue" | "lock" | "terminate";
  residuals: string;
  instruction: string;
  criteria: Criterion[];
  modules: Module[];
};

function seed(): Store {
  return {
    phase: "next",
    depth: 2,
    focus: "brief compiles the session. persist-stream still waits on a store.",
    decision: "terminate",
    residuals: "persist-stream is blocked. brief is session-only.",
    instruction: "Owner: persist-stream, or stop.",
    criteria: [
      { id: "1", text: "Sidecar shows phase, coverage, status, and decision.", done: true },
      { id: "2", text: "Each program does one job.", done: true },
      { id: "3", text: "Pickable lines are commands.", done: true },
      { id: "4", text: "turn exists as a named pending module.", done: true },
      { id: "5", text: "When refine is on, turn produces one fitness pick.", done: true },
    ],
    modules: [
      { id: "shell", purpose: "route a line to a card", iface: "cmd → card", status: "OK" },
      { id: "pgeon", purpose: "gate answers", iface: "pgeon", status: "OK" },
      { id: "refine", purpose: "toggle prompt turns", iface: "refine", status: "OK" },
      { id: "hero", purpose: "hold him and the guest", iface: "face + bird", status: "OK" },
      { id: "compound", purpose: "sidecar the run", iface: "compound", status: "OK" },
      { id: "qa", purpose: "read the register", iface: "qa", status: "OK" },
      { id: "turn", purpose: "one fitness pick", iface: "turn", status: "OK" },
      { id: "save", purpose: "keep the last stream", iface: "save", status: "OK" },
      { id: "ralph", purpose: "outer gate for ongoing work", iface: "ralph", status: "OK" },
      { id: "brief", purpose: "compile fact source loop", iface: "brief", status: "OK" },
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

export function progress(): { done: number; total: number } {
  return {
    done: store.criteria.filter((c) => c.done).length,
    total: store.criteria.length,
  };
}

export function coverage(): number {
  const { done, total } = progress();
  return total ? Math.round((done / total) * 100) : 0;
}

export function active(): Module | undefined {
  return store.modules.find((m) => m.status === ">>") ?? store.modules.find((m) => m.status === "..");
}

export function bar(pct: number): string {
  const n = Math.round(pct / 10);
  return `${"█".repeat(n)}${"░".repeat(10 - n)}`;
}
