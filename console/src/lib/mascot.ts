import {
  intentFromCommand,
  sceneFromIntent,
  type Scene,
  type SceneIntent,
  type Tone,
} from "./scene.ts";

/** Official Mininja frames. Body is static. Only eyes (and the wrap on scan) change.
 * Glyphs: ralph/loop-install SoT (Thingscorp/mininja-console). Id `sandboxing` matches kit. */
export type MascotState =
  | "idle"
  | "blink"
  | "evaluating"
  | "loadingRight"
  | "loadingLeft"
  | "allowed"
  | "asking"
  | "denied"
  | "sandboxing"
  | "executing"
  | "completed"
  | "warning"
  | "error"
  | "cancelled"
  | "offline";

export type { Tone };

export type Frame = {
  lines: [string, string, string];
  tone: Tone;
  label: string;
  motion?: "pulse" | "bounce" | "shake";
};

/** Expression stocks. Eye glyphs must match kit/mark.json faces (gate: OX-APP-FRAMES). */
export const FRAMES: Record<MascotState, Frame> = {
  idle: { lines: ["▚████", "██ ●●", "▀▀▀▀▀"], tone: "idle", label: "idle" },
  blink: { lines: ["▚████", "██ ──", "▀▀▀▀▀"], tone: "idle", label: "idle" },
  evaluating: {
    lines: ["▚████", "██ ◐◑", "▀▀▀▀▀"],
    tone: "accent",
    label: "evaluating",
    motion: "pulse",
  },
  loadingRight: {
    lines: ["▚████", "██ ●●", "▀▀▀▀▀"],
    tone: "accent",
    label: "loading",
    motion: "pulse",
  },
  loadingLeft: {
    lines: ["████▞", "●● ██", "▀▀▀▀▀"],
    tone: "accent",
    label: "loading",
    motion: "pulse",
  },
  allowed: {
    lines: ["▚████", "██ ><", "▀▀▀▀▀"],
    tone: "ok",
    label: "allowed",
    motion: "bounce",
  },
  asking: { lines: ["▚████", "██ ??", "▀▀▀▀▀"], tone: "warn", label: "ask" },
  denied: {
    lines: ["▚████", "██ ┃┃", "▀▀▀▀▀"],
    tone: "err",
    label: "denied",
    motion: "shake",
  },
  sandboxing: { lines: ["▚████", "██ ◇◇", "▀▀▀▀▀"], tone: "muted", label: "sandbox" },
  executing: {
    lines: ["▚████", "██ ◣◢", "▀▀▀▀▀"],
    tone: "accent",
    label: "executing",
    motion: "pulse",
  },
  completed: {
    lines: ["▚████", "██ ▴▴", "▀▀▀▀▀"],
    tone: "ok",
    label: "completed",
    motion: "bounce",
  },
  warning: {
    lines: ["▚████", "██ ▲△", "▀▀▀▀▀"],
    tone: "warn",
    label: "warning",
    motion: "bounce",
  },
  error: {
    lines: ["▚████", "██ ××", "▀▀▀▀▀"],
    tone: "err",
    label: "error",
    motion: "shake",
  },
  cancelled: { lines: ["▚████", "██ ◦◦", "▀▀▀▀▀"], tone: "muted", label: "cancelled" },
  offline: { lines: ["▚████", "██ ‒‒", "▀▀▀▀▀"], tone: "muted", label: "offline" },
};

export function lockup(state: MascotState): [string, string, string] {
  return FRAMES[state].lines;
}

export function afterCommand(cmd: string, title: string, face?: MascotState): MascotState {
  if (face) return face;
  const intent = intentFromCommand(cmd, title, face);
  if (intent.emotion === "confused" || intent.action === "shakeHead") return "error";
  if (intent.emotion === "worried") return "warning";
  if (intent.action === "scan" || intent.action === "type" || intent.action === "search") return "executing";
  return "completed";
}

export function sceneAfterCommand(cmd: string, title: string, face?: MascotState, explicit?: SceneIntent): Scene {
  return sceneFromIntent(intentFromCommand(cmd, title, face, explicit));
}

export type { Scene, SceneIntent };
