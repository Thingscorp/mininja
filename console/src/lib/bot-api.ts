/**
 * Thin client for bot/server.py teammate APIs.
 * Dev: Vite proxies /bot-api → 127.0.0.1:8787.
 * Override with VITE_BOT_URL. When bot is down, callers show a clear needs-bot card.
 */

import type { RosterPal } from "./mention";

export type BotPublicState = {
  bots: RosterPal[];
  messages?: Record<string, unknown>;
  health?: { ok?: boolean };
  commands?: string[];
};

export type BotApiResult = {
  ok: boolean;
  error?: string | null;
  needsBot?: boolean;
  [key: string]: unknown;
};

function botBase(): string {
  const env = (import.meta.env.VITE_BOT_URL as string | undefined)?.trim();
  if (env) return env.replace(/\/$/, "");
  // Same-origin proxy during Vite / Nitro serve; absolute for other hosts.
  if (typeof window !== "undefined" && import.meta.env.DEV) return "/bot-api";
  return "http://127.0.0.1:8787";
}

async function req(path: string, init?: RequestInit): Promise<BotApiResult> {
  const url = `${botBase()}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers || {}),
      },
    });
    let out: BotApiResult = { ok: res.ok };
    try {
      out = { ...(await res.json()), ok: res.ok };
    } catch {
      out = { ok: res.ok, error: res.statusText || "bad response" };
    }
    if (!res.ok && out.error == null) out.error = `HTTP ${res.status}`;
    return out;
  } catch (err) {
    return {
      ok: false,
      needsBot: true,
      error: err instanceof Error ? err.message : "bot unreachable",
    };
  }
}

export async function fetchBotState(): Promise<BotPublicState | null> {
  const out = await req("/api/state");
  if (!out.ok || out.needsBot) return null;
  const bots = Array.isArray(out.bots) ? (out.bots as RosterPal[]) : [];
  return {
    bots,
    messages: out.messages as Record<string, unknown> | undefined,
    health: out.health as { ok?: boolean } | undefined,
    commands: out.commands as string[] | undefined,
  };
}

export async function botAvailable(): Promise<boolean> {
  const out = await req("/api/health");
  return Boolean(out.ok && !out.needsBot);
}

export async function startTask(
  botId: string,
  text: string,
  opts?: { retarget?: boolean },
): Promise<BotApiResult> {
  const body: { text: string; retarget?: boolean } = { text };
  if (opts?.retarget) body.retarget = true;
  return req(`/api/bots/${encodeURIComponent(botId)}/tasks`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function stopBot(botId: string): Promise<BotApiResult> {
  return req(`/api/bots/${encodeURIComponent(botId)}/stop`, { method: "POST" });
}

export async function retargetTask(
  fromId: string,
  toId: string,
  text: string,
): Promise<BotApiResult> {
  return req(`/api/bots/${encodeURIComponent(fromId)}/retarget`, {
    method: "POST",
    body: JSON.stringify({ to: toId, text }),
  });
}

export async function rallyAll(text: string): Promise<BotApiResult> {
  return req("/api/rally", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function needsBotCard(op: string, detail?: string | null) {
  return {
    title: "Needs bot server",
    tag: "teammate",
    bottom:
      detail ||
      `${op} talks to the Mac launcher (bot on :8787). Start ./bot/mininja, or set VITE_BOT_URL.`,
  };
}
