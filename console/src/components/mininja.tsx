import { useCallback, useEffect, useRef, useState } from "react";
import { cardFor, type Card } from "@/lib/mininja";
import { findBlocker } from "@/lib/blockers";
import { Banner, type PalChrome } from "@/components/banner";
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
import {
  applyHabitatMentions,
  applyMentionText,
  mentionQuery,
  rosterSuggestions,
  routeComposer,
  stickyFromRoster,
  type MentionSuggestion,
  type RosterPal,
} from "@/lib/mention";
import {
  createBot,
  fetchBotState,
  isPermissionMode,
  needsBotCard,
  PERMISSION_MODES,
  patchBot,
  rallyAll,
  retargetTask,
  startTaskWithMode,
  stopBot,
  type BotApiResult,
  type PermissionMode,
} from "@/lib/bot-api";
/** Host steel — parity with lib/tint STEEL (avoid node:crypto in browser). */
const STEEL = "#8a8f98";

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

function toChrome(bots: RosterPal[], selectedIds: string[] = []): PalChrome[] {
  const sel = new Set(selectedIds);
  return bots.map((b) => ({
    id: b.id,
    name: b.name,
    tint: b.tint || STEEL,
    busy: Boolean(b.working),
    blocked: b.status === "error",
    selected: sel.has(b.id),
  }));
}

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
  /** Sidebar fallback — "console" | bot id (bot SoT grammar). */
  const [selected, setSelected] = useState<string>("console");
  /** Habitat multi-focus ids (shift+click); rings match is-sel. */
  const [multiIds, setMultiIds] = useState<string[]>([]);
  const [roster, setRoster] = useState<RosterPal[]>([]);
  const [mentionItems, setMentionItems] = useState<MentionSuggestion[]>([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  /** Approval mode for next @-task — same draft|auto|free as bot spawn. */
  const [permMode, setPermMode] = useState<PermissionMode>("auto");
  /** Bot launcher reachable — roster / create need it. */
  const [botUp, setBotUp] = useState(false);
  /** Tiny new-pal form (name + current mode). */
  const [newPalOpen, setNewPalOpen] = useState(false);
  const [newPalName, setNewPalName] = useState("");

  const ready = boot >= 6;
  const live: Scene = offline
    ? applyIntent(scene, { emotion: "sleepy", action: "sleep", stage: "nightwatch", line: "type wake to return" })
    : input && scene.action === "idle"
      ? applyIntent(scene, listeningIntent())
      : scene;

  const lastOut = [...lines].reverse().find((l) => l.kind === "out");
  const lastCard = lastOut?.kind === "out" ? lastOut.card : undefined;
  const bird: PigeonPose | undefined = lastCard?.bird;

  const selectedPal = roster.find((b) => b.id === selected);
  const bannerTint = selectedPal ? selectedPal.tint || STEEL : undefined;
  const focusIds =
    multiIds.length > 0
      ? multiIds
      : selected !== "console"
        ? [selected]
        : [];
  const bannerPals = toChrome(roster, focusIds);
  // Asking face ≈ kit bridge curious+wait (listening / soft interrupt). Match bot stickyInterrupt.
  const liveAsking = !offline && live.emotion === "curious" && live.action === "wait";
  const bannerSticky = stickyFromRoster(roster, { asking: liveAsking });

  useEffect(() => {
    if (selectedPal && isPermissionMode(selectedPal.mode)) {
      setPermMode(selectedPal.mode);
    }
  }, [selectedPal?.id, selectedPal?.mode]);

  const refreshRoster = useCallback(async () => {
    const state = await fetchBotState();
    if (!state) {
      setBotUp(false);
      return;
    }
    setBotUp(true);
    setRoster(state.bots || []);
    const live = state.bots || [];
    if (selected !== "console" && !live.some((b) => b.id === selected)) {
      setSelected("console");
      setMultiIds([]);
    } else {
      setMultiIds((prev) => {
        if (!prev.length) return prev;
        const next = prev.filter((id) => live.some((b) => b.id === id));
        return next.length === prev.length ? prev : next;
      });
    }
  }, [selected]);

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
    void refreshRoster();
    const t = window.setInterval(() => void refreshRoster(), 8000);
    return () => window.clearInterval(t);
  }, [refreshRoster]);

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

  function pushCmdOut(text: string, card: Card) {
    setLines((prev) => [
      ...prev,
      { kind: "cmd", id: n.current++, text },
      { kind: "out", id: n.current++, card },
    ]);
  }

  function runProgram(text: string) {
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

  async function setMode(next: PermissionMode) {
    setPermMode(next);
    if (!selectedPal) return;
    const result = await patchBot(selectedPal.id, { mode: next });
    if (result.needsBot || !result.ok) return;
    await refreshRoster();
  }

  /** Smallest create path — name + mode via bot POST /api/bots. Rich spawn stays Mac launcher. */
  async function createNewPal() {
    const name = newPalName.trim();
    if (!name) return;
    const result = await createBot({ name, mode: permMode });
    if (result.needsBot) {
      pushCmdOut(`new ${name}`, needsBotCard("New pal", result.error));
      setScene((s) => applyIntent(s, { emotion: "worried", action: "wait", line: "bot offline" }));
      return;
    }
    if (!result.ok) {
      pushCmdOut(`new ${name}`, {
        title: "New pal",
        tag: "error",
        bottom: String(result.error || "could not create"),
      });
      setScene((s) => applyIntent(s, { emotion: "worried", action: "wait", line: "" }));
      return;
    }
    const id = typeof result.id === "string" ? result.id : null;
    setNewPalName("");
    setNewPalOpen(false);
    if (id) setFocusPal(id);
    setScene((s) => applyIntent(s, listeningIntent()));
    pushCmdOut(`new ${name}`, {
      title: name,
      tag: "new",
      bottom: `Created ${name} (${permMode}). Keys / remote / routines: Mac launcher.`,
    });
    await refreshRoster();
  }

  async function settleBot(opLabel: string, text: string, result: BotApiResult, okCard: Card) {
    if (result.needsBot) {
      pushCmdOut(text, needsBotCard(opLabel, result.error));
      setScene((s) => applyIntent(s, { emotion: "worried", action: "wait", line: "bot offline" }));
      return;
    }
    if (!result.ok) {
      pushCmdOut(text, {
        title: opLabel,
        tag: "error",
        bottom: String(result.error || "failed"),
      });
      setScene((s) => applyIntent(s, { emotion: "worried", action: "wait", line: "" }));
      return;
    }
    pushCmdOut(text, okCard);
    setScene((s) => applyIntent(s, { emotion: "focused", action: "type", line: "" }));
    await refreshRoster();
  }

  async function run(raw: string) {
    if (!ready) return;
    const text = raw.trim();
    if (!text) return;
    setMentionItems([]);

    if (text.toLowerCase() === "offline" || text.toLowerCase() === "sleep") {
      setOffline(true);
      setScene((s) => applyIntent(s, { emotion: "sleepy", action: "sleep", stage: "nightwatch", line: "type wake to return" }));
      pushCmdOut(text, { title: "Offline", tag: "sleeping", bottom: "Type wake to return." });
      return;
    }
    if (text.toLowerCase() === "wake" || text.toLowerCase() === "online" || text.toLowerCase() === "reconnect") {
      setOffline(typeof navigator !== "undefined" && navigator.onLine === false);
      setScene((s) => applyIntent(s, { emotion: "alert", action: "wave", stage: "dock", line: "watching again" }));
      pushCmdOut(text, { title: "Online", bottom: "Watching again." });
      return;
    }
    if (offline) {
      pushCmdOut(text, { title: "Offline", bottom: "Type wake to try again." });
      return;
    }

    const route = routeComposer(text, { bots: roster, selected });

    if (route.op === "noop") return;

    if (route.op === "program" || route.op === "console") {
      const body = route.op === "console" ? route.body : route.text;
      if (route.op === "console") setFocusPal("console");
      runProgram(body);
      return;
    }

    if (route.op === "select-pal") {
      setFocusPal(route.bot.id);
      setScene((s) => applyIntent(s, listeningIntent()));
      pushCmdOut(text, {
        title: route.bot.name,
        tag: "focus",
        bottom: `Selected ${route.bot.name}. Type a task, or @mention anytime.`,
      });
      return;
    }

    if (route.op === "unknown-mention") {
      pushCmdOut(text, {
        title: "Unknown pal",
        tag: "error",
        bottom: `No roster match for @${route.token}. Start bot for live pals, or @console / programs.`,
      });
      setScene((s) => applyIntent(s, { emotion: "confused", action: "wait", line: "" }));
      return;
    }

    if (route.op === "retarget-error") {
      pushCmdOut(text, { title: "Retarget", tag: "error", bottom: "No matching pal." });
      setScene((s) => applyIntent(s, { emotion: "confused", action: "wait", line: "" }));
      return;
    }

    setScene((s) => applyIntent(s, evaluatingIntent()));

    if (route.op === "pull") {
      if (!route.bot) {
        pushCmdOut(text, {
          title: "Pull-off",
          tag: "idle",
          bottom: "No pal selected. Use stop @Name or select a pal first.",
        });
        return;
      }
      const result = await stopBot(route.bot.id);
      await settleBot("Pull-off", text, result, {
        title: "Pulled off",
        tag: route.bot.name,
        bottom: `${route.bot.name} stopped.`,
      });
      return;
    }

    if (route.op === "rally") {
      const result = await rallyAll(route.body);
      await settleBot("Rally", text, result, {
        title: "Rally",
        tag: "all",
        bottom: `Blasted idle pals: ${route.body}`,
      });
      return;
    }

    if (route.op === "retarget") {
      const to = route.to!;
      const from = selectedPal;
      let result: BotApiResult;
      if (from) {
        if (to.mode !== permMode) {
          const patched = await patchBot(to.id, { mode: permMode });
          if (patched.needsBot || !patched.ok) {
            await settleBot("Mode", text, patched, {
              title: "Mode",
              tag: to.name,
              bottom: `could not set ${permMode}`,
            });
            return;
          }
        }
        result = await retargetTask(from.id, to.id, route.body);
      } else {
        result = await startTaskWithMode(to.id, route.body, permMode, {
          retarget: true,
          currentMode: to.mode,
        });
      }
      setFocusPal(to.id);
      await settleBot("Retarget", text, result, {
        title: "Retarget",
        tag: to.name,
        bottom: `Assigned to ${to.name}: ${route.body}`,
      });
      return;
    }

    if (route.op === "task") {
      setFocusPal(route.bot.id);
      const result = await startTaskWithMode(route.bot.id, route.body, permMode, {
        currentMode: route.bot.mode,
      });
      await settleBot("Task", text, result, {
        title: route.bot.name,
        tag: "task",
        bottom: route.body,
      });
      return;
    }

    if (route.op === "sidebar-task") {
      const bot = roster.find((b) => b.id === route.botId);
      const result = await startTaskWithMode(route.botId, route.text, permMode, {
        currentMode: bot?.mode,
      });
      await settleBot("Task", text, result, {
        title: bot?.name || route.botId,
        tag: "task",
        bottom: route.text,
      });
      return;
    }
  }

  function setFocusPal(id: string, ids?: string[]) {
    setSelected(id);
    setMultiIds(ids ?? (id === "console" ? [] : [id]));
  }

  /** Habitat chip: click = solo @Name; shift+click = add @mentions. */
  function focusHabitatPal(pal: PalChrome, shift: boolean) {
    let nextIds: string[];
    if (shift) {
      const base =
        multiIds.length > 0
          ? multiIds
          : selected !== "console"
            ? [selected]
            : [];
      nextIds = base.includes(pal.id) ? base : [...base, pal.id];
    } else {
      nextIds = [pal.id];
    }
    setFocusPal(pal.id, nextIds);
    const names = nextIds
      .map((id) => roster.find((b) => b.id === id)?.name)
      .filter((n): n is string => Boolean(n));
    const next = applyHabitatMentions(input, names);
    setInput(next);
    setMentionItems([]);
    setScene((s) => applyIntent(s, listeningIntent()));
    inputRef.current?.focus();
  }

  function refreshMentionMenu(value: string) {
    const q = mentionQuery(value);
    if (!q) {
      setMentionItems([]);
      setMentionIndex(0);
      return;
    }
    const items = rosterSuggestions(q.prefix, roster);
    setMentionItems(items);
    setMentionIndex(0);
  }

  function pickMention(name: string) {
    const next = applyMentionText(input, name);
    if (next == null) return;
    setInput(next);
    setMentionItems([]);
    inputRef.current?.focus();
  }

  const placeholder = selectedPal
    ? `@${selectedPal.name} · @all · or a task for ${selectedPal.name}`
    : "@Ada · @all · now · todo · plan · pgeon";

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg" onClick={() => inputRef.current?.focus()}>
      {boot >= 1 ? (
        <div className="relative shrink-0">
          <div className="pointer-events-none absolute right-4 top-2 z-20 flex items-start gap-3">
            {refineOn() ? <span className="pointer-events-auto text-mini text-warn">refine</span> : null}
            {bird ? <Pigeon pose={bird} /> : null}
          </div>
          <Banner
            scene={live}
            blink={blink}
            reduce={reduce}
            ready={ready}
            tint={bannerTint}
            pals={bannerPals}
            sticky={bannerSticky}
            onPalClick={(pal, e) => focusHabitatPal(pal, e.shiftKey)}
          />
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
                  <Out card={line.card} onPick={(id) => void run(id)} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="min-h-0 flex-1" />
        )}

        {ready ? (
          <div className="rise relative shrink-0 space-y-1 pt-2">
            {mentionItems.length > 0 ? (
              <div
                className="absolute bottom-full left-0 right-0 mb-1 max-h-40 overflow-y-auto rounded border border-line bg-panel text-mini shadow-sm"
                role="listbox"
                aria-label="mention roster"
              >
                {mentionItems.map((it, i) => (
                  <button
                    key={it.id}
                    type="button"
                    role="option"
                    aria-selected={i === mentionIndex}
                    className={`flex w-full items-baseline gap-2 px-2 py-1 text-left hover:bg-hi/10 ${
                      i === mentionIndex ? "bg-hi/10 text-hi" : "text-fg"
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pickMention(it.name);
                    }}
                  >
                    <span style={it.tint ? { color: it.tint } : undefined}>@{it.name}</span>
                    <span className="truncate text-muted">{it.job}</span>
                  </button>
                ))}
              </div>
            ) : null}
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (mentionItems.length > 0 && mentionItems[mentionIndex]) {
                  pickMention(mentionItems[mentionIndex]!.name);
                  return;
                }
                void run(input);
                setInput("");
              }}
            >
              <span className="text-steel">❯</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  refreshMentionMenu(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (!mentionItems.length) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setMentionIndex((i) => Math.min(i + 1, mentionItems.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setMentionIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Escape") {
                    setMentionItems([]);
                  }
                }}
                className="min-w-0 flex-1 bg-transparent text-hi outline-none placeholder:text-muted"
                autoComplete="off"
                spellCheck={false}
                aria-label="command"
                placeholder={placeholder}
              />
            </form>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-mini text-muted">
              {START.map(([cmd]) => (
                <button
                  key={cmd}
                  type="button"
                  className="hover:text-hi"
                  onClick={(e) => {
                    e.stopPropagation();
                    void run(cmd);
                  }}
                >
                  {cmd}
                </button>
              ))}
              <span className="text-steel">@ · stop · retarget · @all</span>
              <span className="text-steel" aria-hidden="true">
                ·
              </span>
              <span className="inline-flex items-center gap-2" role="group" aria-label="approval mode">
                {PERMISSION_MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={permMode === m}
                    title={
                      m === "draft"
                        ? "read / search / web only"
                        : m === "auto"
                          ? "routine work proceeds, risky calls fail closed"
                          : "always-approve (deny rm -rf)"
                    }
                    className={permMode === m ? "text-hi" : "hover:text-hi"}
                    onClick={(e) => {
                      e.stopPropagation();
                      void setMode(m);
                    }}
                  >
                    {m}
                  </button>
                ))}
              </span>
              {botUp ? (
                <>
                  <span className="text-steel" aria-hidden="true">
                    ·
                  </span>
                  {newPalOpen ? (
                    <form
                      className="inline-flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                      onSubmit={(e) => {
                        e.preventDefault();
                        void createNewPal();
                      }}
                    >
                      <input
                        value={newPalName}
                        onChange={(e) => setNewPalName(e.target.value)}
                        className="w-24 bg-transparent text-hi outline-none placeholder:text-muted"
                        placeholder="name"
                        aria-label="new pal name"
                        autoComplete="off"
                        spellCheck={false}
                        autoFocus
                      />
                      <button type="submit" className="text-hi hover:underline" disabled={!newPalName.trim()}>
                        add
                      </button>
                      <button
                        type="button"
                        className="hover:text-hi"
                        onClick={() => {
                          setNewPalOpen(false);
                          setNewPalName("");
                        }}
                      >
                        cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      className="hover:text-hi"
                      title="Create a pal on the bot server"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewPalOpen(true);
                      }}
                    >
                      + pal
                    </button>
                  )}
                </>
              ) : null}
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
