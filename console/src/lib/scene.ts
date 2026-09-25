/**
 * Expandable Mininja scene contract.
 *
 * AI / programs drive the mascot AND the banner by emitting a SceneIntent:
 *   { emotion, action, stage, facing?, line?, intensity? }
 *
 * Catalogs (emotions / actions / stages / props / weather on stages) load from
 * kit/scene.json — the only SoT. Register overlays with registerEmotion /
 * registerAction / registerStage — no renderer rewrite. The mascot has no name.
 */

import kit from "../../../kit/scene.json" with { type: "json" };

export type Facing = "left" | "right";
export type Intensity = 0 | 1 | 2;
export type Tone = "idle" | "accent" | "ok" | "warn" | "err" | "muted";
export type Motion = "none" | "pulse" | "bounce" | "shake" | "bob" | "hop" | "sway";
export type Pose = "stand" | "crouch" | "jump" | "lean";
export type Weather = "clear" | "scan" | "sparks" | "night" | "rain" | "haze";
export type Fx = "none" | "think" | "scan" | "type" | "spark" | "sleep" | "search" | "wave";

export type EmotionDef = {
  id: string;
  label: string;
  tone: Tone;
  eyes: [string, string];
  motion?: Motion;
  hint: string;
};

export type ActionDef = {
  id: string;
  label: string;
  motion: Motion;
  pose: Pose;
  fx: Fx;
  hint: string;
};

export type StageProp = {
  kind: "block" | "shelf" | "lamp" | "crate" | "screen" | "antenna" | "moon" | "barrier" | "cable";
  x: number;
  y: number;
  w?: number;
  h?: number;
};

export type StageDef = {
  id: string;
  label: string;
  x: number;
  width: number;
  weather: Weather;
  hint: string;
  props: StageProp[];
};

export type SceneIntent = {
  emotion?: string;
  action?: string;
  stage?: string;
  facing?: Facing;
  line?: string;
  intensity?: Intensity;
  holdMs?: number;
};

export type Scene = {
  emotion: string;
  action: string;
  stage: string;
  facing: Facing;
  line: string;
  intensity: Intensity;
  holdMs: number;
};

/** Must match kit.geometry.stageWidthPx (assert + kit/check-consumers). */
export const STAGE_WIDTH = 420;

const emotions = new Map<string, EmotionDef>();
const actions = new Map<string, ActionDef>();
const stages = new Map<string, StageDef>();

export function registerEmotion(def: EmotionDef): void {
  emotions.set(def.id, def);
}

export function registerAction(def: ActionDef): void {
  actions.set(def.id, def);
}

export function registerStage(def: StageDef): void {
  stages.set(def.id, def);
}

const fbEmotion = kit.fallbacks.unknownEmotion;
const fbAction = kit.fallbacks.unknownAction;

export function getEmotion(id: string): EmotionDef {
  return emotions.get(id) ?? emotions.get(fbEmotion)!;
}

export function getAction(id: string): ActionDef {
  return actions.get(id) ?? actions.get(fbAction)!;
}

export function getStage(id: string): StageDef {
  return stages.get(id) ?? stages.get("dock")!;
}

export function hasEmotion(id: string): boolean {
  return emotions.has(id);
}

export function hasAction(id: string): boolean {
  return actions.has(id);
}

export function hasStage(id: string): boolean {
  return stages.has(id);
}

export function listEmotions(): EmotionDef[] {
  return [...emotions.values()];
}

export function listActions(): ActionDef[] {
  return [...actions.values()];
}

export function listStages(): StageDef[] {
  return [...stages.values()].sort((a, b) => a.x - b.x);
}

export function catalog(): { emotions: string[]; actions: string[]; stages: string[] } {
  return {
    emotions: listEmotions().map((e) => e.id),
    actions: listActions().map((a) => a.id),
    stages: listStages().map((s) => s.id),
  };
}

if (kit.geometry.stageWidthPx !== STAGE_WIDTH) {
  throw new Error(
    `kit geometry.stageWidthPx=${kit.geometry.stageWidthPx} != console STAGE_WIDTH=${STAGE_WIDTH}`,
  );
}
if (kit.geometry.anchorRatio !== 0.42) {
  throw new Error(`kit geometry.anchorRatio=${kit.geometry.anchorRatio} != console anchor 0.42`);
}

/** Load kit catalogs into the register maps. Props/weather ride on StageDef — no separate registerProp/Weather. */
function registerFromKit(): void {
  for (const e of kit.emotions) {
    registerEmotion({
      id: e.id,
      label: e.label,
      tone: e.tone as Tone,
      eyes: e.eyes as [string, string],
      ...(e.motion ? { motion: e.motion as Motion } : {}),
      hint: e.hint,
    });
  }
  for (const a of kit.actions) {
    registerAction({
      id: a.id,
      label: a.label,
      motion: a.motion as Motion,
      pose: a.pose as Pose,
      fx: a.fx as Fx,
      hint: a.hint,
    });
  }
  for (const s of kit.stages) {
    registerStage({
      id: s.id,
      label: s.label,
      x: s.x,
      width: s.width,
      weather: s.weather as Weather,
      hint: s.hint,
      props: s.props as StageProp[],
    });
  }
}

registerFromKit();

const kitDefault = kit.defaultScene;
export const DEFAULT_SCENE: Scene = {
  emotion: kitDefault.emotion,
  action: kitDefault.action,
  stage: kitDefault.stage,
  facing: kitDefault.facing as Facing,
  line: kitDefault.line,
  intensity: kitDefault.intensity as Intensity,
  holdMs: kitDefault.holdMs,
};

export function applyIntent(current: Scene, intent: SceneIntent): Scene {
  const emotion = intent.emotion
    ? hasEmotion(intent.emotion)
      ? intent.emotion
      : fbEmotion
    : current.emotion;
  const action = intent.action
    ? hasAction(intent.action)
      ? intent.action
      : fbAction
    : current.action;
  const nextStage = intent.stage
    ? hasStage(intent.stage)
      ? intent.stage
      : current.stage
    : current.stage;
  let facing = intent.facing ?? current.facing;
  if (!intent.facing && nextStage !== current.stage) {
    facing = getStage(nextStage).x >= getStage(current.stage).x ? "right" : "left";
  }
  return {
    emotion,
    action,
    stage: nextStage,
    facing,
    line: intent.line !== undefined ? intent.line : current.line,
    intensity: intent.intensity ?? current.intensity,
    holdMs: intent.holdMs ?? 0,
  };
}

export function sceneFromIntent(intent: SceneIntent, current: Scene = DEFAULT_SCENE): Scene {
  return applyIntent(current, intent);
}

export function stageCenter(id: string): number {
  const s = getStage(id);
  return s.x + s.width * 0.42;
}

export function worldWidth(): number {
  const last = listStages().at(-1);
  return last ? last.x + last.width : STAGE_WIDTH;
}

export function nearestStage(x: number): StageDef {
  const list = listStages();
  let best = list[0]!;
  let bestDist = Infinity;
  for (const s of list) {
    const cx = s.x + s.width / 2;
    const d = Math.abs(cx - x);
    if (d < bestDist) {
      best = s;
      bestDist = d;
    }
  }
  return best;
}

/** Legacy mascot states still accepted as a compact face id — from kit.legacyFaceBridge. */
export const LEGACY_INTENT: Record<string, SceneIntent> = Object.fromEntries(
  Object.entries(kit.legacyFaceBridge).map(([face, intent]) => [face, { ...intent } as SceneIntent]),
);

export function intentFromLegacy(face?: string): SceneIntent | undefined {
  if (!face) return undefined;
  return LEGACY_INTENT[face];
}

const COMMAND_INTENT: Record<string, SceneIntent> = {
  now: { emotion: "focused", action: "read", stage: "desk", line: "current state" },
  overview: { emotion: "focused", action: "read", stage: "desk", line: "current state" },
  todo: { emotion: "worried", action: "read", stage: "desk", line: "work that still needs you" },
  plan: { emotion: "focused", action: "point", stage: "desk", line: "order of work" },
  gantt: { emotion: "focused", action: "point", stage: "desk", line: "order of work" },
  look: { emotion: "curious", action: "scan", stage: "archives", line: "checking the box" },
  api: { emotion: "alert", action: "scan", stage: "archives", line: "the brain" },
  web: { emotion: "curious", action: "scan", stage: "archives", line: "review desk" },
  postgres: { emotion: "curious", action: "search", stage: "archives", line: "memory" },
  brief: { emotion: "focused", action: "read", stage: "desk", line: "fact / source / open loop" },
  pgeon: { emotion: "alert", action: "search", stage: "archives", line: "verified answers" },
  refine: { emotion: "determined", action: "type", stage: "workshop", line: "tightening" },
  turn: { emotion: "curious", action: "think", stage: "desk", line: "one fitness pick" },
  save: { emotion: "proud", action: "carry", stage: "desk", line: "keeping the last stream" },
  compound: { emotion: "focused", action: "type", stage: "workshop", line: "sidecar the run" },
  qa: { emotion: "focused", action: "scan", stage: "workshop", line: "the register" },
  ralph: { emotion: "determined", action: "type", stage: "workshop", line: "ongoing work" },
  help: { emotion: "curious", action: "wave", stage: "dock", line: "what I can do" },
  offline: { emotion: "sleepy", action: "sleep", stage: "nightwatch", line: "type wake to return" },
  sleep: { emotion: "sleepy", action: "sleep", stage: "nightwatch", line: "type wake to return" },
  wake: { emotion: "alert", action: "wave", stage: "dock", line: "watching again" },
  online: { emotion: "alert", action: "wave", stage: "dock", line: "watching again" },
  reconnect: { emotion: "alert", action: "wave", stage: "dock", line: "watching again" },
  clear: { emotion: "idle", action: "idle", stage: "dock", line: "" },
};

export function evaluatingIntent(): SceneIntent {
  return { emotion: "focused", action: "think", line: "working", holdMs: 0 };
}

export function listeningIntent(): SceneIntent {
  return { emotion: "curious", action: "wait", line: "" };
}

export function intentFromCommand(cmd: string, title: string, face?: string, explicit?: SceneIntent): SceneIntent {
  if (explicit) return explicit;
  const head = cmd.trim().toLowerCase().replace(/^\//, "").split(/\s+/)[0] ?? "";
  const fromCmd = COMMAND_INTENT[head];
  const fromFace = intentFromLegacy(face);
  const t = title.toLowerCase();
  if (t === "unknown command" || t === "say that again?" || t === "unknown" || t.includes("didn’t catch") || t.includes("didn't catch")) {
    return { emotion: "confused", action: "shakeHead", stage: "gate", line: "use help", holdMs: 1400 };
  }
  if (head === "freeze" || head === "pause" || t.includes("feature pause") || t.includes("features are off")) {
    return { emotion: "worried", action: "point", stage: "gate", line: title, holdMs: 1200 };
  }
  if (fromCmd) {
    return { ...fromFace, ...fromCmd, holdMs: fromCmd.holdMs ?? 1600 };
  }
  if (fromFace) return { ...fromFace, line: title, holdMs: 1400 };
  return { emotion: "proud", action: "celebrate", stage: "rooftop", line: title, holdMs: 1400 };
}

export type LockupFrame = {
  lines: [string, string, string];
  tone: Tone;
  motion: Motion;
  fx: Fx;
  label: string;
};

export function composeLockup(scene: Scene, tick = 0, blink = false): LockupFrame {
  const emotion = getEmotion(scene.emotion);
  const action = getAction(blink || scene.action === "blink" ? "blink" : scene.action);
  const facing = scene.facing;
  const eyes = blink || action.id === "blink" ? (["─", "─"] as [string, string]) : action.id === "sleep" ? (["‒", "‒"] as [string, string]) : emotion.eyes;
  const pair = facing === "left" ? `${eyes[1]}${eyes[0]}` : `${eyes[0]}${eyes[1]}`;
  const step = tick % 2 === 0;
  const walking = action.id === "walk" || action.id === "run" || action.id === "carry";
  const feet = walking ? (step ? "▀▀ ▀▀" : "▀ ▀▀▀") : action.pose === "crouch" ? "▄▄▄▄▄" : "▀▀▀▀▀";
  let hood: string;
  let mid: string;
  if (facing === "left") {
    hood = action.pose === "lean" ? "███▞ " : "████▞";
    mid = action.pose === "crouch" ? `${pair} ██` : `${pair} ██`;
  } else {
    hood = action.pose === "lean" ? " ▚███" : "▚████";
    mid = action.pose === "crouch" ? `██ ${pair}` : `██ ${pair}`;
  }
  if (action.pose === "jump") {
    hood = facing === "left" ? "████▞" : "▚████";
  }
  return {
    lines: [hood, mid, feet],
    tone: emotion.tone,
    motion: action.motion === "none" ? (emotion.motion ?? "none") : action.motion,
    fx: action.fx,
    label: `${emotion.label} ${action.label}`,
  };
}
