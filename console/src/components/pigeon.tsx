import { useEffect, useState } from "react";
import { PIGEON, type PigeonPose } from "@/lib/pigeon";

const TONE: Record<PigeonPose, string> = {
  perch: "text-steel",
  flap: "text-steel",
  best: "text-ok",
  sulk: "text-muted",
  peck: "text-warn",
  startle: "text-err",
};

const MOTION: Record<PigeonPose, string> = {
  perch: "",
  flap: "",
  best: "mascot-bounce",
  sulk: "",
  peck: "",
  startle: "mascot-shake",
};

export function Pigeon({ pose }: { pose: PigeonPose }) {
  const frames = PIGEON[pose];
  const [i, setI] = useState(0);

  useEffect(() => {
    setI(0);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || frames.length < 2) return;
    const ms = pose === "flap" ? 140 : pose === "peck" ? 220 : 480;
    const t = window.setInterval(() => setI((n) => (n + 1) % frames.length), ms);
    return () => window.clearInterval(t);
  }, [pose, frames.length]);

  const lines = frames[i] ?? frames[0];
  return (
    <pre
      aria-label={`pgeon ${pose}`}
      className={`m-0 w-[4.5ch] shrink-0 text-ui leading-[1.05] ${TONE[pose]} ${MOTION[pose]}`}
    >
      {lines.join("\n")}
    </pre>
  );
}
