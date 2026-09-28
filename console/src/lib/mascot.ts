import mark from "../../../kit/mark.json" with { type: "json" };
import {
  intentFromCommand,
  sceneFromIntent,
  type Scene,
  type SceneIntent,
  type Tone,
} from "./scene.ts";

/** Official Mininja frames. Body is static. Only eyes (and the wrap on scan) change.
 * Glyphs: kit/mark.json faces (SoT). Hydrated like bot framesFromKit. */
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

const MASCOT_STATES: readonly MascotState[] = [
  "idle",
  "blink",
  "evaluating",
  "loadingRight",
  "loadingLeft",
  "allowed",
  "asking",
  "denied",
  "sandboxing",
  "executing",
  "completed",
  "warning",
  "error",
  "cancelled",
  "offline",
] as const;

/** Build FRAMES from kit/mark.json faces — eyes, tone, motion, lines. No dual table. */
function framesFromKit(kit: typeof mark): Record<MascotState, Frame> {
  const faces = kit.faces ?? {};
  const out: Partial<Record<MascotState, Frame>> = {};
  for (const id of MASCOT_STATES) {
    const face = (faces as Record<string, { lines?: string[]; tone?: string; motion?: string | null }>)[id];
    if (!face || !Array.isArray(face.lines) || face.lines.length !== 3) continue;
    const lines = face.lines as [string, string, string];
    // muted is host chrome elsewhere — kit face tones are idle|accent|ok|warn|err
    const tone = (face.tone === "muted" ? "idle" : face.tone || "idle") as Tone;
    const motion =
      face.motion === "pulse" || face.motion === "bounce" || face.motion === "shake"
        ? face.motion
        : undefined;
    out[id] = { lines, tone, label: id, ...(motion ? { motion } : {}) };
  }
  const idle = out.idle;
  if (!idle) {
    throw new Error("kit/mark.json faces.idle required for FRAMES hydrate");
  }
  for (const id of MASCOT_STATES) {
    if (!out[id]) out[id] = { ...idle, label: id };
  }
  return out as Record<MascotState, Frame>;
}

/** Expression stocks from kit/mark.json (gate: OX-APP-FRAMES). */
export const FRAMES: Record<MascotState, Frame> = framesFromKit(mark);

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
