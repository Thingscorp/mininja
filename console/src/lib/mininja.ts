import { findBlocker, schedule, type Scheduled } from "./blockers.ts";
import type { MascotState } from "./mascot.ts";
import type { PigeonPose } from "./pigeon.ts";
import { dispatchProgram } from "../plugins/index.ts";
import {
  catalog,
  hasAction,
  hasEmotion,
  hasStage,
  listActions,
  listEmotions,
  listStages,
  type SceneIntent,
} from "./scene.ts";

export const LEDGER = {
  checkout: "~/mininja",
  published: "v0.10.3",
  candidate: "v0.10.4",
  sealed: "2026-08-12",
  captures: 69,
};

export type Card = {
  title: string;
  tag?: string;
  fields?: { label: string; value: string }[];
  rows?: string[];
  bottom?: string;
  gantt?: Scheduled[];
  face?: MascotState;
  scene?: SceneIntent;
  bird?: PigeonPose;
  stream?: string;
  ask?: { q: string; yes: string; no?: string };
};

export type Service = {
  id: string;
  name: string;
  label: string;
  bind: string;
  job: string;
  next: string;
};

export const SERVICES: Service[] = [
  {
    id: "api",
    name: "mininja-api",
    label: "The brain",
    bind: "127.0.0.1:8000",
    job: "The program that talks, remembers, and hands work to everything else.",
    next: "If the machine feels stuck, start here.",
  },
  {
    id: "web",
    name: "mininja-web",
    label: "Review desk",
    bind: "127.0.0.1:3200",
    job: "The screen a person uses to accept or reject saved work.",
    next: "Open this when you need to approve something.",
  },
  {
    id: "postgres",
    name: "mininja-postgres",
    label: "Memory",
    bind: "127.0.0.1:5432",
    job: `${LEDGER.captures} conversations live here.`,
    next: "Look here if chat forgets things.",
  },
];

function findService(q: string): Service | undefined {
  const s = q.toLowerCase().trim();
  if (!s) return undefined;
  return SERVICES.find(
    (x) => x.id === s || x.name.replace("mininja-", "") === s || x.label.toLowerCase() === s,
  );
}

export function cardFor(raw: string): Card {
  const program = dispatchProgram(raw);
  if (program) return program;

  const parts = raw.trim().toLowerCase().replace(/^\//, "").split(/\s+/);
  const cmd = (parts[0] ?? "").replace(/[^a-z0-9]/g, "");
  const arg = parts.slice(1).join(" ");

  if (cmd === "help") {
    return {
      title: "help",
      rows: [
        "now",
        "todo",
        "plan",
        "brief",
        "api",
        "pgeon",
        "refine",
        "turn",
        "save",
        "compound",
        "qa",
        "ralph",
        "scene",
        "go",
        "feel",
        "do",
        "offline",
        "wake",
        "clear",
      ],
      scene: { emotion: "curious", action: "wave", stage: "dock", line: "what I can do" },
    };
  }

  if (cmd === "now" || cmd === "overview") {
    return {
      title: "now",
      fields: [
        { label: "live", value: LEDGER.published },
        { label: "next", value: `${LEDGER.candidate} unpublished` },
        { label: "saved", value: `${LEDGER.captures}` },
      ],
      scene: { emotion: "focused", action: "read", stage: "desk", line: "current state" },
    };
  }

  if (cmd === "plan" || cmd === "gantt") {
    return {
      title: "plan",
      gantt: schedule(),
      scene: { emotion: "focused", action: "point", stage: "desk", line: "order of work" },
    };
  }

  if (cmd === "todo") {
    return {
      title: "todo",
      rows: schedule().map((r) => r.title),
      scene: { emotion: "worried", action: "read", stage: "desk", line: "work that still needs you" },
    };
  }

  if (cmd === "scene") {
    const c = catalog();
    return {
      title: "scene",
      tag: "mininja",
      fields: [
        { label: "feel", value: c.emotions.join("  ") },
        { label: "do", value: c.actions.join("  ") },
        { label: "go", value: c.stages.join("  ") },
      ],
      bottom: "AI drives this with { emotion, action, stage, line }.",
      rows: ["feel proud", "do scan", "go archives"],
      scene: { emotion: "idle", action: "wave", stage: "dock", line: "the suite" },
    };
  }

  if (cmd === "feel") {
    if (!arg) {
      return {
        title: "feel",
        rows: listEmotions().map((e) => `feel ${e.id}`),
        bottom: "Pick an emotion.",
        scene: { emotion: "curious", action: "wait", line: "how should I look?" },
      };
    }
    if (!hasEmotion(arg)) {
      return {
        title: "Unknown emotion",
        bottom: "Use scene.",
        scene: { emotion: "confused", action: "shakeHead", stage: "gate", line: "not in the suite" },
      };
    }
    return {
      title: "feel",
      tag: arg,
      bottom: listEmotions().find((e) => e.id === arg)?.hint,
      scene: { emotion: arg, action: "idle", line: arg },
    };
  }

  if (cmd === "do") {
    if (!arg) {
      return {
        title: "do",
        rows: listActions().map((a) => `do ${a.id}`),
        bottom: "Pick an action.",
        scene: { emotion: "curious", action: "wait", line: "what should I do?" },
      };
    }
    if (!hasAction(arg)) {
      return {
        title: "Unknown action",
        bottom: "Use scene.",
        scene: { emotion: "confused", action: "shakeHead", stage: "gate", line: "not in the suite" },
      };
    }
    return {
      title: "do",
      tag: arg,
      bottom: listActions().find((a) => a.id === arg)?.hint,
      scene: { action: arg, line: arg },
    };
  }

  if (cmd === "go") {
    if (!arg) {
      return {
        title: "go",
        rows: listStages().map((s) => `go ${s.id}`),
        bottom: "Pick a place in the banner.",
        scene: { emotion: "curious", action: "wait", line: "where to?" },
      };
    }
    if (!hasStage(arg)) {
      return {
        title: "Unknown place",
        bottom: "Use scene.",
        scene: { emotion: "confused", action: "shakeHead", stage: "gate", line: "not on the map" },
      };
    }
    const stage = listStages().find((s) => s.id === arg);
    return {
      title: "go",
      tag: stage?.label ?? arg,
      bottom: stage?.hint,
      scene: { stage: arg, action: "walk", emotion: "determined", line: `heading to ${stage?.label ?? arg}` },
    };
  }

  const named = findBlocker(arg || cmd);
  if (named && (findBlocker(cmd) || (arg && findBlocker(arg)))) {
    return {
      title: named.title,
      tag: named.ready ? "ready" : `after ${named.waitingOn.join(", ")}`,
      bottom: named.why,
      rows: [`${named.days} day${named.days === 1 ? "" : "s"}`, `starts on day ${named.start + 1}`],
      scene: named.ready
        ? { emotion: "determined", action: "point", stage: "desk", line: named.title }
        : { emotion: "worried", action: "read", stage: "desk", line: `waiting on ${named.waitingOn[0]}` },
    };
  }

  if (cmd === "look" || findService(cmd) || findService(arg)) {
    const svc = findService(arg || cmd) ?? SERVICES[0];
    return {
      title: svc.label,
      tag: svc.bind,
      bottom: svc.job,
      rows: [svc.next],
      scene: { emotion: "curious", action: "scan", stage: "archives", line: svc.label },
    };
  }

  if (cmd === "clear") return { title: "__clear__", scene: { emotion: "idle", action: "idle", stage: "dock", line: "" } };

  return {
    title: "Unknown command",
    bottom: "Use help.",
    scene: { emotion: "confused", action: "shakeHead", stage: "gate", line: "use help" },
  };
}
