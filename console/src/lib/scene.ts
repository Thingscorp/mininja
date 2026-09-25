/**
 * Expandable Mininja scene contract.
 *
 * AI / programs drive the mascot AND the banner by emitting a SceneIntent:
 *   { emotion, action, stage, facing?, line?, intensity? }
 *
 * Unknown ids fall back (curious / wait / dock). Register new ones with
 * registerEmotion / registerAction / registerStage — no renderer rewrite.
 */

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

export function getEmotion(id: string): EmotionDef {
  return emotions.get(id) ?? emotions.get("curious")!;
}

export function getAction(id: string): ActionDef {
  return actions.get(id) ?? actions.get("wait")!;
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

const EMOTION_SEED: EmotionDef[] = [
  { id: "idle", label: "idle", tone: "idle", eyes: ["●", "●"], hint: "at rest, nothing asked" },
  { id: "curious", label: "curious", tone: "accent", eyes: ["◉", "●"], hint: "looking into something" },
  { id: "focused", label: "focused", tone: "accent", eyes: ["◐", "◑"], motion: "pulse", hint: "working a problem" },
  { id: "happy", label: "happy", tone: "ok", eyes: [">", "<"], motion: "bounce", hint: "pleased with the result" },
  { id: "proud", label: "proud", tone: "ok", eyes: ["▴", "▴"], motion: "bounce", hint: "finished something worth keeping" },
  { id: "mischievous", label: "mischievous", tone: "accent", eyes: ["¬", "¬"], hint: "about to try a side path" },
  { id: "worried", label: "worried", tone: "warn", eyes: ["◆", "◆"], motion: "sway", hint: "something is in the way" },
  { id: "confused", label: "confused", tone: "warn", eyes: ["?", "?"], hint: "did not understand" },
  { id: "startled", label: "startled", tone: "err", eyes: ["◎", "◎"], motion: "shake", hint: "unexpected failure" },
  { id: "embarrassed", label: "embarrassed", tone: "muted", eyes: ["◦", "◦"], hint: "cancelled or walked back" },
  { id: "frustrated", label: "frustrated", tone: "err", eyes: ["×", "×"], motion: "shake", hint: "blocked or denied" },
  { id: "determined", label: "determined", tone: "accent", eyes: ["◣", "◢"], motion: "pulse", hint: "executing a run" },
  { id: "relieved", label: "relieved", tone: "ok", eyes: ["◠", "◠"], hint: "a hold cleared" },
  { id: "sleepy", label: "sleepy", tone: "muted", eyes: ["‒", "‒"], hint: "offline / watching paused" },
  { id: "alert", label: "alert", tone: "accent", eyes: ["●", "●"], motion: "pulse", hint: "just woke, scanning" },
  { id: "sad", label: "sad", tone: "muted", eyes: [".", "."], hint: "nothing eligible, empty result" },
];

const ACTION_SEED: ActionDef[] = [
  { id: "idle", label: "idle", motion: "none", pose: "stand", fx: "none", hint: "standing" },
  { id: "blink", label: "blink", motion: "none", pose: "stand", fx: "none", hint: "eyes closed a beat" },
  { id: "walk", label: "walk", motion: "bob", pose: "stand", fx: "none", hint: "moving between places" },
  { id: "run", label: "run", motion: "bob", pose: "stand", fx: "none", hint: "hurrying to a place" },
  { id: "think", label: "think", motion: "pulse", pose: "stand", fx: "think", hint: "evaluating" },
  { id: "scan", label: "scan", motion: "pulse", pose: "stand", fx: "scan", hint: "reading a service or file" },
  { id: "type", label: "type", motion: "pulse", pose: "lean", fx: "type", hint: "writing or executing" },
  { id: "read", label: "read", motion: "sway", pose: "stand", fx: "none", hint: "reviewing current state" },
  { id: "point", label: "point", motion: "none", pose: "lean", fx: "none", hint: "indicating a next step" },
  { id: "wave", label: "wave", motion: "bounce", pose: "stand", fx: "wave", hint: "greeting or help" },
  { id: "jump", label: "jump", motion: "hop", pose: "jump", fx: "spark", hint: "celebrating" },
  { id: "crouch", label: "crouch", motion: "none", pose: "crouch", fx: "none", hint: "inspecting something low" },
  { id: "lookBack", label: "look back", motion: "sway", pose: "stand", fx: "none", hint: "checking what was left" },
  { id: "celebrate", label: "celebrate", motion: "bounce", pose: "jump", fx: "spark", hint: "done" },
  { id: "shakeHead", label: "shake head", motion: "shake", pose: "stand", fx: "none", hint: "no / unknown" },
  { id: "nod", label: "nod", motion: "bob", pose: "stand", fx: "none", hint: "yes / allowed" },
  { id: "search", label: "search", motion: "sway", pose: "lean", fx: "search", hint: "looking for an answer" },
  { id: "wait", label: "wait", motion: "sway", pose: "stand", fx: "none", hint: "listening for input" },
  { id: "sleep", label: "sleep", motion: "none", pose: "crouch", fx: "sleep", hint: "offline" },
  { id: "carry", label: "carry", motion: "bob", pose: "lean", fx: "none", hint: "saving / moving a stream" },
  { id: "peek", label: "peek", motion: "none", pose: "crouch", fx: "search", hint: "checking a hidden detail" },
  { id: "climb", label: "climb", motion: "hop", pose: "jump", fx: "none", hint: "changing elevation" },
];

const STAGE_SEED: StageDef[] = [
  {
    id: "nightwatch",
    label: "night watch",
    x: 0,
    width: STAGE_WIDTH,
    weather: "night",
    hint: "sleep / offline",
    props: [
      { kind: "moon", x: 310, y: 10, w: 18, h: 18 },
      { kind: "antenna", x: 48, y: 28, w: 4, h: 36 },
      { kind: "block", x: 20, y: 72, w: 56, h: 14 },
    ],
  },
  {
    id: "dock",
    label: "dock",
    x: STAGE_WIDTH,
    width: STAGE_WIDTH,
    weather: "haze",
    hint: "home bay",
    props: [
      { kind: "crate", x: 28, y: 62, w: 28, h: 22 },
      { kind: "crate", x: 52, y: 70, w: 22, h: 14 },
      { kind: "cable", x: 90, y: 84, w: 120, h: 2 },
      { kind: "screen", x: 300, y: 36, w: 46, h: 28 },
    ],
  },
  {
    id: "desk",
    label: "desk",
    x: STAGE_WIDTH * 2,
    width: STAGE_WIDTH,
    weather: "clear",
    hint: "status, plan, brief",
    props: [
      { kind: "screen", x: 40, y: 30, w: 54, h: 34 },
      { kind: "lamp", x: 110, y: 24, w: 10, h: 40 },
      { kind: "block", x: 140, y: 72, w: 36, h: 10 },
      { kind: "crate", x: 330, y: 66, w: 26, h: 18 },
    ],
  },
  {
    id: "workshop",
    label: "workshop",
    x: STAGE_WIDTH * 3,
    width: STAGE_WIDTH,
    weather: "sparks",
    hint: "ralph, execute, refine",
    props: [
      { kind: "block", x: 24, y: 68, w: 80, h: 16 },
      { kind: "antenna", x: 200, y: 20, w: 3, h: 48 },
      { kind: "crate", x: 240, y: 60, w: 30, h: 24 },
      { kind: "lamp", x: 320, y: 18, w: 12, h: 46 },
    ],
  },
  {
    id: "archives",
    label: "archives",
    x: STAGE_WIDTH * 4,
    width: STAGE_WIDTH,
    weather: "scan",
    hint: "look, pgeon, memory",
    props: [
      { kind: "shelf", x: 16, y: 16, w: 18, h: 70 },
      { kind: "shelf", x: 42, y: 16, w: 18, h: 70 },
      { kind: "shelf", x: 68, y: 16, w: 18, h: 70 },
      { kind: "shelf", x: 340, y: 16, w: 18, h: 70 },
      { kind: "crate", x: 200, y: 66, w: 24, h: 18 },
    ],
  },
  {
    id: "gate",
    label: "gate",
    x: STAGE_WIDTH * 5,
    width: STAGE_WIDTH,
    weather: "haze",
    hint: "ask, deny, unknown",
    props: [
      { kind: "barrier", x: 170, y: 48, w: 80, h: 36 },
      { kind: "lamp", x: 150, y: 14, w: 10, h: 50 },
      { kind: "lamp", x: 258, y: 14, w: 10, h: 50 },
    ],
  },
  {
    id: "rooftop",
    label: "rooftop",
    x: STAGE_WIDTH * 6,
    width: STAGE_WIDTH,
    weather: "clear",
    hint: "completed / proud",
    props: [
      { kind: "block", x: 20, y: 70, w: 40, h: 16 },
      { kind: "block", x: 70, y: 58, w: 28, h: 28 },
      { kind: "antenna", x: 300, y: 12, w: 4, h: 56 },
      { kind: "block", x: 340, y: 64, w: 48, h: 22 },
    ],
  },
];

for (const e of EMOTION_SEED) registerEmotion(e);
for (const a of ACTION_SEED) registerAction(a);
for (const s of STAGE_SEED) registerStage(s);

export const DEFAULT_SCENE: Scene = {
  emotion: "idle",
  action: "idle",
  stage: "dock",
  facing: "right",
  line: "",
  intensity: 1,
  holdMs: 0,
};

export function applyIntent(current: Scene, intent: SceneIntent): Scene {
  const emotion = intent.emotion
    ? hasEmotion(intent.emotion)
      ? intent.emotion
      : "curious"
    : current.emotion;
  const action = intent.action
    ? hasAction(intent.action)
      ? intent.action
      : "wait"
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

/** Legacy mascot states still accepted as a compact face id. */
export const LEGACY_INTENT: Record<string, SceneIntent> = {
  idle: { emotion: "idle", action: "idle" },
  blink: { emotion: "idle", action: "blink" },
  evaluating: { emotion: "focused", action: "think", stage: "desk" },
  loadingRight: { emotion: "focused", action: "walk", facing: "right" },
  loadingLeft: { emotion: "focused", action: "walk", facing: "left" },
  allowed: { emotion: "happy", action: "nod", stage: "desk" },
  asking: { emotion: "curious", action: "wait" },
  denied: { emotion: "frustrated", action: "shakeHead", stage: "gate" },
  sandboxing: { emotion: "mischievous", action: "peek", stage: "workshop" },
  executing: { emotion: "determined", action: "type", stage: "workshop" },
  completed: { emotion: "proud", action: "celebrate", stage: "rooftop" },
  warning: { emotion: "worried", action: "point", stage: "gate" },
  error: { emotion: "confused", action: "shakeHead", stage: "gate" },
  cancelled: { emotion: "embarrassed", action: "lookBack", stage: "dock" },
  offline: { emotion: "sleepy", action: "sleep", stage: "nightwatch" },
};

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
