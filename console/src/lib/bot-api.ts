/**
 * Thin client for bot/server.py teammate APIs.
 * Dev: Vite proxies /bot-api → 127.0.0.1:8787.
 * Override with VITE_BOT_URL. When bot is down, callers show a clear needs-bot card.
 */

import type { RosterPal } from "./mention";

/** Bot permission modes — same field as bot/server.py new_bot / patch_bot. */
export type PermissionMode = "draft" | "auto" | "free";

export const PERMISSION_MODES: PermissionMode[] = ["draft", "auto", "free"];

export function isPermissionMode(v: unknown): v is PermissionMode {
  return v === "draft" || v === "auto" || v === "free";
}

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

export type HostConfig = {
  v?: number;
  path?: string;
  maxParallel?: number;
  defaultMode?: string;
  botListen?: string;
  config?: {
    defaultMode?: string;
    showPlants?: boolean;
    showSticky?: boolean;
    maxParallel?: number;
    reducedMotion?: boolean;
  };
};

/** Read-only host settings from bot (CLI is SoT for writes). */
export async function fetchHostConfig(): Promise<HostConfig | null> {
  const out = await req("/api/host-config");
  if (!out.ok || out.needsBot) return null;
  return out as HostConfig;
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

/** PATCH bot fields — mode uses the same draft|auto|free values as spawn. */
export async function patchBot(
  botId: string,
  patch: { mode?: PermissionMode },
): Promise<BotApiResult> {
  return req(`/api/bots/${encodeURIComponent(botId)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/**
 * If the pal's mode differs, PATCH then run the task.
 * Mode is a bot field (not a task body field) — same as bot spawn form.
 */
export async function startTaskWithMode(
  botId: string,
  text: string,
  mode: PermissionMode,
  opts?: { retarget?: boolean; currentMode?: string | null },
): Promise<BotApiResult> {
  if (opts?.currentMode !== mode) {
    const patched = await patchBot(botId, { mode });
    if (patched.needsBot) return patched;
    if (!patched.ok) {
      return {
        ok: false,
        error: patched.error || `could not set mode to ${mode}`,
        needsBot: patched.needsBot,
      };
    }
  }
  return startTask(botId, text, opts?.retarget ? { retarget: true } : undefined);
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

/** Create a pal via bot POST /api/bots — same fields as Mac launcher spawn (minimal). */
export type CreateBotPayload = {
  name: string;
  job?: string;
  mode?: PermissionMode;
  description?: string;
  /** Defaults to local. remote/codex + cwd + credentials stay Mac-launcher rich. */
  computer?: "local" | "remote" | "codex";
  cwd?: string;
};

export async function createBot(payload: CreateBotPayload): Promise<BotApiResult> {
  const name = (payload.name || "").trim();
  if (!name) return { ok: false, error: "name required" };
  const body: Record<string, unknown> = {
    name,
    job: (payload.job || "").trim() || "General",
    description: payload.description || "",
    computer: payload.computer || "local",
  };
  // Omit mode → bot applies host-config defaultMode (CLI SoT).
  if (payload.mode && isPermissionMode(payload.mode)) body.mode = payload.mode;
  if (payload.cwd?.trim()) body.cwd = payload.cwd.trim();
  return req("/api/bots", {
    method: "POST",
    body: JSON.stringify(body),
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
