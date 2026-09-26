import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Mascot } from "@/components/mascot";
import {
  getAction,
  getStage,
  listStages,
  RUN_PX_PER_SEC,
  stageCenter,
  WALK_PX_PER_SEC,
  worldWidth,
  type Scene,
  type StageDef,
  type StageProp,
} from "@/lib/scene";

/** Host pal chrome — tint hex from Apps tint algo; never from kit. */
export type PalChrome = {
  id: string;
  name: string;
  tint: string;
  busy?: boolean;
  blocked?: boolean;
};

export type StickyRank = "blocked" | "asking" | "busy";

type BannerProps = {
  scene: Scene;
  blink?: boolean;
  reduce?: boolean;
  ready?: boolean;
  /** Selected / focal pal tint for habitat chrome. */
  tint?: string;
  /** Concurrent pals — color-coded chips in habitat glass. */
  pals?: PalChrome[];
  /** Glance sticky interrupt (blocked > asking > busy); host-owned. */
  sticky?: StickyRank | null;
};

export function Banner({
  scene,
  blink = false,
  reduce = false,
  ready = true,
  tint,
  pals = [],
  sticky = null,
}: BannerProps) {
  const viewRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const actorEl = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(scene);
  const readyRef = useRef(ready);
  sceneRef.current = scene;
  readyRef.current = ready;

  const [viewW, setViewW] = useState(640);
  const [tick, setTick] = useState(0);
  const [traveling, setTraveling] = useState(false);
  const [facing, setFacing] = useState(scene.facing);
  const [place, setPlace] = useState(scene.stage);

  const actorRef = useRef(stageCenter(scene.stage));
  const camRef = useRef(Math.max(0, stageCenter(scene.stage) - 180));
  const faceRef = useRef(scene.facing);
  const movingRef = useRef(false);
  const patrol = useRef({ dir: 1 as 1 | -1 });

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const measure = () => setViewW(el.clientWidth || 640);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!reduce) return;
    const dest = stageCenter(scene.stage);
    actorRef.current = dest;
    camRef.current = Math.max(0, dest - viewW * (scene.facing === "right" ? 0.32 : 0.52));
    if (actorEl.current) actorEl.current.style.left = `${dest}px`;
    if (worldRef.current) worldRef.current.style.transform = `translate3d(${-Math.round(camRef.current)}px,0,0)`;
    setTraveling(false);
    setFacing(scene.facing);
    setPlace(scene.stage);
  }, [scene.stage, scene.facing, reduce, viewW]);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    let last = performance.now();
    let stepAcc = 0;
    const paint = () => {
      if (actorEl.current) actorEl.current.style.left = `${actorRef.current}px`;
      if (worldRef.current) {
        worldRef.current.style.transform = `translate3d(${-Math.round(camRef.current)}px,0,0)`;
      }
    };
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sceneRef.current;
      const dest = stageCenter(s.stage);
      const gap = dest - actorRef.current;
      const moving = Math.abs(gap) > 6;
      if (moving) {
        const dir = gap > 0 ? "right" : "left";
        if (faceRef.current !== dir) {
          faceRef.current = dir;
          setFacing(dir);
        }
        const speed = s.intensity >= 2 ? RUN_PX_PER_SEC : WALK_PX_PER_SEC;
        actorRef.current += Math.sign(gap) * Math.min(Math.abs(gap), speed * dt);
      } else {
        const action = getAction(s.action);
        const canPatrol = readyRef.current && action.id === "idle" && !s.line;
        if (canPatrol) {
          const stage = getStage(s.stage);
          const min = stage.x + 56;
          const max = stage.x + stage.width - 90;
          actorRef.current += patrol.current.dir * 26 * dt;
          if (actorRef.current > max) {
            patrol.current.dir = -1;
            actorRef.current = max;
            if (faceRef.current !== "left") {
              faceRef.current = "left";
              setFacing("left");
            }
          } else if (actorRef.current < min) {
            patrol.current.dir = 1;
            actorRef.current = min;
            if (faceRef.current !== "right") {
              faceRef.current = "right";
              setFacing("right");
            }
          }
        } else {
          actorRef.current = dest;
        }
      }
      if (movingRef.current !== moving) {
        movingRef.current = moving;
        setTraveling(moving);
      }
      const here = nearestVisible(actorRef.current).id;
      setPlace((prev) => (prev === here ? prev : here));

      const look = faceRef.current === "right" ? viewW * 0.32 : viewW * 0.52;
      const desired = actorRef.current - look;
      const maxCam = Math.max(0, worldWidth() - viewW);
      const clamped = Math.min(maxCam, Math.max(0, desired));
      const k = 1 - Math.exp(-dt * 5.2);
      camRef.current += (clamped - camRef.current) * k;
      paint();

      stepAcc += dt;
      const cadence = moving || getAction(s.action).id === "run" ? 0.16 : 0.28;
      if (stepAcc >= cadence) {
        stepAcc = 0;
        setTick((n) => n + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    paint();
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduce, viewW]);

  const live: Scene = {
    ...scene,
    facing,
    action: traveling ? (scene.intensity >= 2 ? "run" : "walk") : scene.action,
  };
  const shown = getStage(place);
  const weather = shown.weather;
  const chromeStyle = tint ? ({ ["--pal-tint"]: tint } as CSSProperties) : undefined;

  return (
    <header
      ref={viewRef}
      className={`banner weather-${weather}${tint ? " has-pal-tint" : ""}`}
      style={chromeStyle}
      data-sticky={sticky || undefined}
    >
      <div className="banner-hud">
        <span className="text-mini text-muted">{shown.label}</span>
        {sticky ? (
          <span className={`banner-sticky sticky-${sticky}`} data-rank={sticky}>
            {sticky}
          </span>
        ) : null}
        {pals.length > 0 ? (
          <span className="banner-pals" aria-label="pals in habitat">
            {pals.map((p) => (
              <span
                key={p.id}
                className={`pal-chip${p.busy ? " is-busy" : ""}${p.blocked ? " is-blocked" : ""}`}
                style={{ ["--pal-tint"]: p.tint } as CSSProperties}
                title={p.name}
              >
                {(p.name || "?").trim().slice(0, 1).toUpperCase() || "?"}
              </span>
            ))}
          </span>
        ) : null}
        <span className="text-mini text-steel">
          {scene.emotion}
          <span className="text-muted"> · </span>
          {traveling ? "walk" : scene.action}
        </span>
      </div>
      <div className="banner-sky" aria-hidden="true" />
      <div ref={worldRef} className="banner-world" style={{ width: worldWidth() }}>
        <div className="banner-mid" aria-hidden="true">
          {listStages().map((s) => (
            <StageSilhouette key={s.id} stage={s} />
          ))}
        </div>
        <div className="banner-ground" aria-hidden="true" />
        <div className="banner-props" aria-hidden="true">
          {listStages().map((s) =>
            s.props.map((p, i) => <Prop key={`${s.id}-${i}`} stage={s} prop={p} />),
          )}
        </div>
        <div ref={actorEl} className="banner-actor" style={{ left: actorRef.current }}>
          {scene.line ? <div className="banner-line">{scene.line}</div> : <div className="banner-line is-empty" />}
          <div className={`banner-fx fx-${traveling ? "none" : getAction(live.action).fx}`}>
            <Mascot scene={live} tick={tick} blink={blink && !traveling} />
          </div>
        </div>
      </div>
    </header>
  );
}

function nearestVisible(x: number): StageDef {
  const list = listStages();
  return list.reduce((best, s) => {
    const bc = best.x + best.width / 2;
    const sc = s.x + s.width / 2;
    return Math.abs(sc - x) < Math.abs(bc - x) ? s : best;
  }, list[0]!);
}

function StageSilhouette({ stage }: { stage: StageDef }) {
  return (
    <div className={`stage-cell stage-${stage.id}`} style={{ left: stage.x, width: stage.width }}>
      <span className="stage-mark">{stage.label}</span>
    </div>
  );
}

function Prop({ stage, prop }: { stage: StageDef; prop: StageProp }) {
  return (
    <span
      className={`prop prop-${prop.kind}`}
      style={{
        left: stage.x + prop.x,
        top: prop.y,
        width: prop.w,
        height: prop.h,
      }}
    />
  );
}
