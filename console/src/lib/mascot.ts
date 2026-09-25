import {
  composeLockup,
  DEFAULT_SCENE,
  intentFromCommand,
  intentFromLegacy,
  sceneFromIntent,
  type Scene,
  type SceneIntent,
  type Tone,
} from "./scene.ts";

/** Official Mininja frames. Body stays the lockup. Eyes, pose, and the banner change. The mascot has no name. */
export type MascotState =
  | "idle"
  | "blink"
  | "evaluating"
  | "loadingRight"
  | "loadingLeft"
  | "allowed"
  | "asking"
  | "denied"
  | "sandbox"
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

function legacyFrame(state: MascotState): Frame {
  const intent = intentFromLegacy(state) ?? {};
  const scene = sceneFromIntent({ ...intent, facing: state === "loadingLeft" ? "left" : "right" }, DEFAULT_SCENE);
  const built = composeLockup(scene, 0, state === "blink");
  const motion = built.motion === "pulse" || built.motion === "bounce" || built.motion === "shake" ? built.motion : undefined;
  return { lines: built.lines, tone: built.tone, label: built.label.split(" ")[0] ?? state, motion };
}

export const FRAMES: Record<MascotState, Frame> = {
  idle: legacyFrame("idle"),
  blink: legacyFrame("blink"),
  evaluating: legacyFrame("evaluating"),
  loadingRight: legacyFrame("loadingRight"),
  loadingLeft: legacyFrame("loadingLeft"),
  allowed: legacyFrame("allowed"),
  asking: legacyFrame("asking"),
  denied: legacyFrame("denied"),
  sandbox: legacyFrame("sandbox"),
  executing: legacyFrame("executing"),
  completed: legacyFrame("completed"),
  warning: legacyFrame("warning"),
  error: legacyFrame("error"),
  cancelled: legacyFrame("cancelled"),
  offline: legacyFrame("offline"),
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
