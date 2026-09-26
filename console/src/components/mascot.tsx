import { FRAMES, type MascotState } from "@/lib/mascot";
import { composeLockup, DEFAULT_SCENE, type Scene } from "@/lib/scene";

const TONE: Record<string, string> = {
  idle: "text-steel",
  accent: "text-steel-hot",
  ok: "text-ok",
  warn: "text-warn",
  err: "text-err",
  muted: "text-muted",
};

const MOTION: Record<string, string> = {
  none: "",
  pulse: "mascot-pulse",
  bounce: "mascot-bounce",
  shake: "mascot-shake",
  bob: "mascot-bob",
  hop: "mascot-hop",
  sway: "mascot-sway",
};

export function Mascot({
  state = "idle",
  scene,
  still = false,
  tick = 0,
  blink = false,
}: {
  state?: MascotState;
  scene?: Scene;
  still?: boolean;
  tick?: number;
  blink?: boolean;
}) {
  const frame = scene ? composeLockup(scene, tick, blink) : undefined;
  const legacy = FRAMES[state];
  const lines = frame?.lines ?? legacy.lines;
  const tone = frame?.tone ?? legacy.tone;
  const motion = frame?.motion ?? legacy.motion ?? "none";
  const label = frame?.label ?? legacy.label;
  const [a, b, c] = lines;
  return (
    <pre
      aria-label={`mininja ${label}`}
      className={`m-0 text-lock font-medium leading-none ${TONE[tone]} ${!still && motion !== "none" ? MOTION[motion] : ""}`}
    >
      {`${a}\n${b}\n${c}`}
    </pre>
  );
}

export function mascotFx(scene: Scene = DEFAULT_SCENE, blink = false): string {
  return composeLockup(scene, 0, blink).fx;
}
