/**
 * One-mouth composer grammar — pure parse/route (no DOM).
 * Parity with bot/static/index.html parseMention / runLine.
 * Host chrome only; never kit.
 */

export type RosterPal = {
  id: string;
  name: string;
  job?: string;
  tint?: string;
  working?: boolean;
  status?: string;
  /** Permission mode from bot — draft | auto | free. */
  mode?: string;
};

export type Mention =
  | { kind: "all"; token: string; body: string; bot: null }
  | { kind: "console"; token: string; body: string; bot: null }
  | { kind: "pal"; token: string; body: string; bot: RosterPal }
  | { kind: "unknown"; token: string; body: string; bot: null };

export type MentionSuggestion = {
  id: string;
  name: string;
  job: string;
  tint?: string;
};

/** Match @Name / @all / @console at start of composer text (case-insensitive roster). */
export function parseMention(text: string, bots: RosterPal[]): Mention | null {
  const raw = String(text || "");
  const m = raw.match(/^\s*@([^\s]+)(\s+[\s\S]*)?$/);
  if (!m) return null;
  const token = m[1]!;
  const body = (m[2] || "").trim();
  const lower = token.toLowerCase();
  if (lower === "all") return { kind: "all", token, body, bot: null };
  if (lower === "console") return { kind: "console", token, body, bot: null };
  const roster = bots || [];
  const hit =
    roster.find((b) => (b.name || "").toLowerCase() === lower) ||
    roster.find((b) => (b.name || "").toLowerCase().startsWith(lower));
  if (!hit) return { kind: "unknown", token, body, bot: null };
  return { kind: "pal", token, body, bot: hit };
}

/** Active @autocomplete query at end of input. */
export function mentionQuery(text: string): { prefix: string; start: number } | null {
  const raw = String(text || "");
  const m = raw.match(/(^|\s)@([^\s]*)$/);
  if (!m) return null;
  return { prefix: m[2] || "", start: raw.length - (m[2] || "").length - 1 };
}

/** Roster dropdown items: @all, pals, @console — filtered by prefix. */
export function rosterSuggestions(prefix: string, bots: RosterPal[]): MentionSuggestion[] {
  const p = (prefix || "").toLowerCase();
  const items: MentionSuggestion[] = [{ id: "__all__", name: "all", job: "rally every pal" }];
  for (const b of bots || []) {
    items.push({ id: b.id, name: b.name, job: b.job || "", tint: b.tint });
  }
  items.push({ id: "__console__", name: "console", job: "programs" });
  if (!p) return items;
  return items.filter((it) => it.name.toLowerCase().startsWith(p));
}

/** Apply a picked suggestion into the composer text. */
export function applyMentionText(raw: string, name: string): string | null {
  const q = mentionQuery(raw);
  if (!q) return null;
  return raw.slice(0, q.start) + "@" + name + " ";
}

export type ComposerRoute =
  | { op: "noop" }
  | { op: "pull"; who: string | null; bot: RosterPal | null }
  | { op: "retarget"; toToken: string; body: string; to: RosterPal | null }
  | { op: "rally"; body: string }
  | { op: "console"; body: string }
  | { op: "select-pal"; bot: RosterPal }
  | { op: "task"; bot: RosterPal; body: string }
  | { op: "unknown-mention"; token: string }
  | { op: "program"; text: string }
  | { op: "sidebar-task"; botId: string; text: string }
  | { op: "retarget-error"; reason: "no-target" };

function findPal(bots: RosterPal[], token: string): RosterPal | undefined {
  const t = token.toLowerCase();
  return (
    bots.find((b) => (b.name || "").toLowerCase() === t) ||
    bots.find((b) => b.id === token) ||
    bots.find((b) => (b.name || "").toLowerCase().startsWith(t))
  );
}

/**
 * Route one composer line (bot runLine parity).
 * `selected` is "console" | bot id — sidebar fallback when no @ mention.
 */
export function routeComposer(
  text: string,
  opts: { bots: RosterPal[]; selected: string | null },
): ComposerRoute {
  const line = (text || "").trim();
  if (!line) return { op: "noop" };
  const bots = opts.bots || [];
  const selected = opts.selected;

  const pull = line.match(/^(stop|pull)(?:\s+@?(\S+))?(?:\s+[\s\S]*)?$/i);
  if (pull) {
    const who = (pull[2] || "").toLowerCase() || null;
    let bot: RosterPal | null = null;
    if (who) {
      bot = findPal(bots, who) || null;
    } else if (selected && selected !== "console") {
      bot = bots.find((b) => b.id === selected) || null;
    }
    return { op: "pull", who, bot };
  }

  const ret = line.match(/^retarget\s+@?(\S+)\s+([\s\S]+)$/i);
  if (ret) {
    const toToken = ret[1]!;
    const body = ret[2]!.trim();
    const to = findPal(bots, toToken) || null;
    if (!to) return { op: "retarget-error", reason: "no-target" };
    return { op: "retarget", toToken, body, to };
  }

  const mention = parseMention(line, bots);
  if (mention) {
    if (mention.kind === "all") {
      if (!mention.body) return { op: "noop" };
      return { op: "rally", body: mention.body };
    }
    if (mention.kind === "console") {
      return { op: "console", body: mention.body || "help" };
    }
    if (mention.kind === "unknown") {
      return { op: "unknown-mention", token: mention.token };
    }
    if (mention.kind === "pal" && mention.bot) {
      if (!mention.body) return { op: "select-pal", bot: mention.bot };
      return { op: "task", bot: mention.bot, body: mention.body };
    }
  }

  if (!selected || selected === "console") {
    return { op: "program", text: line };
  }
  return { op: "sidebar-task", botId: selected, text: line };
}

/** Glance sticky interrupt — blocked > busy (asking is face/runtime). */
export function stickyFromRoster(bots: RosterPal[]): "blocked" | "busy" | null {
  if ((bots || []).some((b) => b.status === "error")) return "blocked";
  if ((bots || []).some((b) => b.working)) return "busy";
  return null;
}
