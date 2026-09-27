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

/** Host mirror of bot/server.py MAX_PARALLEL — fan-out refuse above this. */
export const MAX_PARALLEL = 4;

/**
 * Peel leading consecutive @tokens and the trailing body.
 * `@Ada @Bea do X` → { tokens: ["Ada","Bea"], body: "do X" }
 */
export function splitLeadingMentions(
  text: string,
): { tokens: string[]; body: string } | null {
  let rest = String(text || "").trim();
  if (!rest.startsWith("@")) return null;
  const tokens: string[] = [];
  while (rest.startsWith("@")) {
    const m = rest.match(/^@([^\s]+)(?:\s+([\s\S]*))?$/);
    if (!m) break;
    tokens.push(m[1]!);
    rest = m[2] ?? "";
    if (!rest.startsWith("@")) {
      return { tokens, body: rest.trim() };
    }
  }
  return tokens.length ? { tokens, body: rest.trim() } : null;
}

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

/**
 * Habitat chip click → composer @mentions.
 * Leading @mentions (and incomplete @query) → replace names, **keep trailing task body**.
 * No leading @ (programs like `now`) → replace with `@Names ` only (don't append program text).
 * Empty names → strip leading @s, keep body.
 */
export function applyHabitatMentions(raw: string, names: string[]): string {
  const clean = (names || []).map((n) => String(n || "").trim()).filter(Boolean);
  const insert = clean.map((n) => `@${n}`).join(" ") + (clean.length ? " " : "");
  const trimmed = String(raw || "").trimStart();

  if (!trimmed.startsWith("@")) {
    return insert;
  }

  // Peel leading @tokens; leftover after the run is the task body to keep.
  let rest = trimmed;
  let body = "";
  while (rest.startsWith("@")) {
    const m = rest.match(/^@([^\s]+)(?:\s+([\s\S]*))?$/);
    if (!m) break;
    const after = m[2] ?? "";
    if (after.startsWith("@")) {
      rest = after;
      continue;
    }
    body = after.trim();
    break;
  }

  if (!clean.length) return body;
  return body ? insert + body : insert;
}

export type ComposerRoute =
  | { op: "noop" }
  | { op: "pull"; who: string | null; bot: RosterPal | null }
  | { op: "retarget"; toToken: string; body: string; to: RosterPal | null }
  | { op: "rally"; body: string }
  | { op: "console"; body: string }
  | { op: "select-pal"; bot: RosterPal }
  | { op: "select-pals"; bots: RosterPal[] }
  | { op: "task"; bot: RosterPal; body: string }
  | { op: "fan-out"; bots: RosterPal[]; body: string }
  | { op: "fan-out-cap"; count: number; max: number }
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

function classifyToken(
  token: string,
  bots: RosterPal[],
):
  | { kind: "all" | "console" | "unknown"; token: string }
  | { kind: "pal"; token: string; bot: RosterPal } {
  const lower = token.toLowerCase();
  if (lower === "all") return { kind: "all", token };
  if (lower === "console") return { kind: "console", token };
  const bot = findPal(bots, token);
  if (!bot) return { kind: "unknown", token };
  return { kind: "pal", token, bot };
}

function uniquePals(bots: RosterPal[]): RosterPal[] {
  const seen = new Set<string>();
  const out: RosterPal[] = [];
  for (const b of bots) {
    if (seen.has(b.id)) continue;
    seen.add(b.id);
    out.push(b);
  }
  return out;
}

/**
 * Route one composer line (bot runLine parity).
 * `selected` is "console" | bot id — sidebar fallback when no @ mention.
 *
 * Multi-@: consecutive leading known pals → fan-out same body (cap MAX_PARALLEL).
 * Mixed `@Ada @console` → fall back to single-mention on the first token
 * (body keeps the rest, including later @s). Unknown in the run → unknown-mention.
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

  const split = splitLeadingMentions(line);
  if (split && split.tokens.length > 1) {
    const kinds = split.tokens.map((t) => classifyToken(t, bots));
    const unknown = kinds.find((k) => k.kind === "unknown");
    if (unknown && unknown.kind === "unknown") {
      return { op: "unknown-mention", token: unknown.token };
    }
    const mixed = kinds.some((k) => k.kind === "all" || k.kind === "console");
    if (!mixed) {
      const pals = uniquePals(
        kinds.filter((k): k is { kind: "pal"; token: string; bot: RosterPal } => k.kind === "pal").map((k) => k.bot),
      );
      if (!pals.length) return { op: "noop" };
      if (!split.body) return { op: "select-pals", bots: pals };
      if (pals.length > MAX_PARALLEL) {
        return { op: "fan-out-cap", count: pals.length, max: MAX_PARALLEL };
      }
      return { op: "fan-out", bots: pals, body: split.body };
    }
    // Mixed with @all / @console → single-mention on first token (documented).
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

export type StickyRank = "blocked" | "asking" | "busy";

/** Glance sticky interrupt — blocked > asking > busy (host chrome; matches bot stickyInterrupt). */
export function stickyFromRoster(
  bots: RosterPal[],
  opts?: { asking?: boolean },
): StickyRank | null {
  if ((bots || []).some((b) => b.status === "error")) return "blocked";
  if (opts?.asking) return "asking";
  if ((bots || []).some((b) => b.working)) return "busy";
  return null;
}
