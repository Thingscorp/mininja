import { useEffect, useRef, useState } from "react";
import { cardFor, type Card } from "@/lib/mininja";
import { findBlocker } from "@/lib/blockers";
import { Banner } from "@/components/banner";
import { Pigeon } from "@/components/pigeon";
import { Gantt } from "@/components/gantt";
import {
  applyIntent,
  DEFAULT_SCENE,
  evaluatingIntent,
  listeningIntent,
  intentFromCommand,
  type Scene,
} from "@/lib/scene";
import type { PigeonPose } from "@/lib/pigeon";
import { isOn as refineOn } from "@/plugins/refine";

type Line =
  | { kind: "cmd"; id: number; text: string }
  | { kind: "out"; id: number; card: Card };

const START: [string, string][] = [
  ["now", "current state"],
  ["brief", "fact / source / open loop"],
  ["todo", "work that still needs you"],
  ["plan", "order of work"],
  ["pgeon", "verified answers"],
  ["ralph", "ongoing work"],
  ["scene", "the emotional suite"],
  ["go", "walk the banner"],
];

export function Mininja() {
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const n = useRef(1);

  const [boot, setBoot] = useState(0);
  const [input, setInput] = useState("");
  const [blink, setBlink] = useState(false);
  const [scene, setScene] = useState<Scene>(DEFAULT_SCENE);
  const [offline, setOffline] = useState(false);
  const [reduce, setReduce] = useState(true);
  const [lines, setLines] = useState<Line[]>([]);

  const ready = boot >= 6;
  const live: Scene = offline
    ? applyIntent(scene, { emotion: "sleepy", action: "sleep", stage: "nightwatch", line: "type wake to return" })
    : input && scene.action === "idle"
      ? applyIntent(scene, listeningIntent())
      : scene;

  const lastOut = [...lines].reverse().find((l) => l.kind === "out");
  const lastCard = lastOut?.kind === "out" ? lastOut.card : undefined;
  const bird: PigeonPose | undefined = lastCard?.bird;

  useEffect(() => {
    const sync = () => setOffline(typeof navigator !== "undefined" && navigator.onLine === false);
    sync();
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    window.addEventListener("offline", sync);
    window.addEventListener("online", sync);
    return () => {
      window.removeEventListener("offline", sync);
      window.removeEventListener("online", sync);
    };
  }, []);

  useEffect(() => {
    const prefers = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefers) {
      setBoot(6);
      return;
    }
    const beats = [700, 1100, 800, 550, 450, 450];
    let i = 0;
    let timer: number;
    const next = () => {
      i += 1;
      setBoot(i);
      if (i === 2) {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 150);
      }
      if (i === 3) setScene((s) => applyIntent(s, { action: "wave", emotion: "alert", line: "" }));
      if (i === 6) setScene((s) => applyIntent(s, { emotion: "idle", action: "idle", line: "" }));
      if (i < 6) timer = window.setTimeout(next, beats[i] ?? 450);
    };
    timer = window.setTimeout(next, beats[0]);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready || offline) return;
    let on: number | undefined;
    const loop = () =>
      window.setTimeout(() => {
        setBlink(true);
        on = window.setTimeout(() => setBlink(false), 150);
        timer = loop();
      }, 8000 + Math.random() * 6000);
    let timer = loop();
    return () => {
      window.clearTimeout(timer);
      if (on) window.clearTimeout(on);
    };
  }, [ready, offline]);

  useEffect(() => {
    if (ready) inputRef.current?.focus();
  }, [ready]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [lines, scene]);

  function run(raw: string) {
    if (!ready) return;
    const text = raw.trim();
    if (!text) return;
    if (text.toLowerCase() === "offline" || text.toLowerCase() === "sleep") {
      setOffline(true);
      setScene((s) => applyIntent(s, { emotion: "sleepy", action: "sleep", stage: "nightwatch", line: "type wake to return" }));
      setLines((prev) => [
        ...prev,
        { kind: "cmd", id: n.current++, text },
        {
          kind: "out",
          id: n.current++,
          card: {
            title: "Offline",
            tag: "sleeping",
            bottom: "Type wake to return.",
          },
        },
      ]);
      return;
    }
    if (text.toLowerCase() === "wake" || text.toLowerCase() === "online" || text.toLowerCase() === "reconnect") {
      setOffline(typeof navigator !== "undefined" && navigator.onLine === false);
      setScene((s) => applyIntent(s, { emotion: "alert", action: "wave", stage: "dock", line: "watching again" }));
      setLines((prev) => [
        ...prev,
        { kind: "cmd", id: n.current++, text },
        { kind: "out", id: n.current++, card: { title: "Online", bottom: "Watching again." } },
      ]);
      return;
    }
    if (offline) {
      setLines((prev) => [
        ...prev,
        { kind: "cmd", id: n.current++, text },
        {
          kind: "out",
          id: n.current++,
          card: { title: "Offline", bottom: "Type wake to try again." },
        },
      ]);
      return;
    }
    const card = cardFor(text);
    if (card.title === "__clear__") {
      setLines([]);
      setScene(DEFAULT_SCENE);
      return;
    }
    setLines((prev) => [...prev, { kind: "cmd", id: n.current++, text }]);
    setScene((s) => applyIntent(s, evaluatingIntent()));
    window.setTimeout(() => {
      const intent = intentFromCommand(text, card.title, card.face, card.scene);
      setScene((s) => applyIntent(s, intent));
      setLines((prev) => [...prev, { kind: "out", id: n.current++, card }]);
      const hold = intent.holdMs || (intent.emotion === "confused" || intent.emotion === "worried" ? 1400 : 1800);
      window.setTimeout(() => {
        setScene((s) => applyIntent(s, { action: "idle", line: s.line, emotion: s.emotion }));
      }, hold);
    }, 650);
  }

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg" onClick={() => inputRef.current?.focus()}>
      {boot >= 1 ? (
        <div className="relative shrink-0">
          <div className="pointer-events-none absolute right-4 top-2 z-20 flex items-start gap-3">
            {refineOn() ? <span className="pointer-events-auto text-mini text-warn">refine</span> : null}
            {bird ? <Pigeon pose={bird} /> : null}
          </div>
          <Banner scene={live} blink={blink} reduce={reduce} ready={ready} />
        </div>
      ) : (
        <div className="h-32" />
      )}

      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-4 py-3 sm:px-6 sm:py-4">
        {boot >= 4 ? (
          <div ref={logRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto">
            {lines.map((line, i) => {
              const last = i >= lines.length - 2;
              return line.kind === "cmd" ? (
                <div key={line.id} className={last ? "text-hi" : "text-muted"}>
                  <span className="text-steel">❯</span> {line.text}
                </div>
              ) : (
                <div key={line.id} className={last ? "" : "opacity-45"}>
                  <Out card={line.card} onPick={(id) => run(id)} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="min-h-0 flex-1" />
        )}

        {ready ? (
          <div className="rise shrink-0 space-y-1 pt-2">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                run(input);
                setInput("");
              }}
            >
              <span className="text-steel">❯</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-hi outline-none placeholder:text-muted"
                autoComplete="off"
                spellCheck={false}
                aria-label="command"
                placeholder="now · go archives · feel proud"
              />
            </form>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-mini text-muted">
              {START.map(([cmd]) => (
                <button
                  key={cmd}
                  type="button"
                  className="hover:text-hi"
                  onClick={(e) => {
                    e.stopPropagation();
                    run(cmd);
                  }}
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-8" />
        )}
      </div>
    </div>
  );
}

function pickable(line: string): boolean {
  const head = line.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  if (
    [
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
      "help",
      "offline",
      "wake",
      "clear",
      "look",
      "scene",
      "go",
      "feel",
      "do",
    ].includes(head)
  ) {
    return true;
  }
  return Boolean(findBlocker(line));
}

function Out({ card, onPick }: { card: Card; onPick?: (id: string) => void }) {
  return (
    <article className="space-y-0.5">
      <div>
        <span className="text-hi">{card.title}</span>
        {card.tag ? <span className="ml-2 text-muted">{card.tag}</span> : null}
      </div>
      {card.gantt ? <Gantt rows={card.gantt} onPick={onPick} /> : null}
      {card.fields?.map((f, i) => (
        <div key={`${i}:${f.label}`} className="grid grid-cols-[3.5rem_1fr] gap-2">
          <span className="text-muted">{f.label}</span>
          <span className="min-w-0 break-words">{f.value}</span>
        </div>
      ))}
      {card.rows?.map((r) =>
        pickable(r) ? (
          <button
            key={r}
            type="button"
            className="block text-left text-pretty hover:text-hi"
            onClick={(e) => {
              e.stopPropagation();
              onPick?.(r);
            }}
          >
            {r}
          </button>
        ) : (
          <div key={r}>{r}</div>
        ),
      )}
      {card.bottom ? <p className="text-muted">{card.bottom}</p> : null}
    </article>
  );
}
