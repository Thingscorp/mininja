#!/usr/bin/env node
/** SUITE-BOT-KEY-001 — credential assign/share/change/unshare + no secret leak. */
import { spawn, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import { mkdirSync, readFileSync, rmSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dataDir = join(root, "qa", ".tmp-bot-cred-data");
rmSync(dataDir, { recursive: true, force: true });
mkdirSync(dataDir, { recursive: true });

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// Unit smoke (Python)
const unit = spawnSync(process.execPath.replace("node", "python3") === process.execPath
  ? "python3"
  : "python3", [join(root, "bot", "scripts", "credentials-smoke.py")], {
  encoding: "utf8",
  env: { ...process.env },
});
if (unit.status !== 0) {
  process.stderr.write(unit.stdout + unit.stderr);
  throw new Error(`credentials-smoke exit ${unit.status}`);
}
process.stdout.write(unit.stdout);

const env = {
  ...process.env,
  MININJA_DATA: dataDir,
  PYTHONPATH: join(root, "bot"),
  PYTHONUNBUFFERED: "1",
  // fixture env for resolve — not a real key
  XAI_API_KEY: "test-fixture-xai-not-real",
};

const child = spawn("python3", [join(root, "bot", "server.py"), "--no-open"], {
  env,
  cwd: join(root, "bot"),
  stdio: ["ignore", "pipe", "pipe"],
});

let bootLog = "";
child.stdout.on("data", (d) => (bootLog += d.toString()));
child.stderr.on("data", (d) => (bootLog += d.toString()));

let port = null;
for (let i = 0; i < 50; i++) {
  await sleep(100);
  const m = bootLog.match(/http:\/\/127\.0\.0\.1:(\d+)\//);
  if (m) {
    port = Number(m[1]);
    break;
  }
  if (child.exitCode != null) break;
}

try {
  assert(port, `server URL missing: ${bootLog.slice(0, 600)}`);
  for (let i = 0; i < 30; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/api/health`)).ok) break;
    } catch { /* */ }
    await sleep(100);
  }

  const base = `http://127.0.0.1:${port}`;

  // create slot
  const slotRes = await fetch(`${base}/api/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label: "shared-xai", kind: "env", provider: "xai", env: "XAI_API_KEY" }),
  });
  assert(slotRes.status === 201, `create slot ${slotRes.status}`);
  const slot = await slotRes.json();
  assert(slot.id && slot.has_secret === false, "slot public shape");
  assert(!("secret" in slot), "no secret field");

  const claudeRes = await fetch(`${base}/api/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label: "claude", kind: "env", provider: "anthropic" }),
  });
  assert(claudeRes.status === 201, "claude slot");
  const claude = await claudeRes.json();
  assert(claude.provider === "anthropic" && claude.env === "ANTHROPIC_API_KEY", "claude env default");

  // two pals share one slot
  const ada = await (await fetch(`${base}/api/bots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Ada", job: "a", credential_id: slot.id }),
  })).json();
  const bob = await (await fetch(`${base}/api/bots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Bob", job: "b", credential_id: slot.id }),
  })).json();
  assert(ada.id && bob.id, "pals created");

  const state = await (await fetch(`${base}/api/state`)).json();
  assert(Array.isArray(state.credentials), "state.credentials");
  const shared = state.credentials.find((s) => s.id === slot.id);
  assert(shared && shared.share_count === 2, `share_count ${shared && shared.share_count}`);
  const adaRow = state.bots.find((b) => b.id === ada.id);
  assert(adaRow.credential && adaRow.credential.provider === "xai", "credential chrome");
  assert(!JSON.stringify(state).includes("test-fixture-xai-not-real"), "no raw key in state");

  // change Ada → claude
  const ch = await fetch(`${base}/api/bots/${ada.id}/credential`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential_id: claude.id }),
  });
  assert(ch.status === 200, `change ${ch.status}`);
  const chBody = await ch.json();
  assert(chBody.credential_id === claude.id, "changed");

  // resolve Ada (ANTHROPIC unset → fail closed)
  const resAda = await (await fetch(`${base}/api/bots/${ada.id}/credential`)).json();
  assert(resAda.ok === false, "claude unbound env fails");

  // resolve Bob (XAI set → ok)
  const resBob = await (await fetch(`${base}/api/bots/${bob.id}/credential`)).json();
  assert(resBob.ok === true && /shared-xai/.test(resBob.using || ""), `bob using ${resBob.using}`);
  assert(!("inject" in resBob), "resolve public no inject");

  // task without credential fails closed
  const unbound = await (await fetch(`${base}/api/bots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Zoe", job: "z" }),
  })).json();
  const task = await fetch(`${base}/api/bots/${unbound.id}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "ping" }),
  });
  assert(task.status === 400, `unbound task ${task.status}`);
  const taskBody = await task.json();
  assert(/credential|key slot/i.test(taskBody.error || ""), `error ${taskBody.error}`);

  // unshare Bob
  const un = await fetch(`${base}/api/bots/${bob.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential_id: null }),
  });
  assert(un.status === 200, "unshare");
  const after = await (await fetch(`${base}/api/state`)).json();
  assert(after.bots.find((b) => b.id === bob.id).credential == null, "bob unbound");

  // delete slot clears bindings
  await fetch(`${base}/api/bots/${ada.id}/credential`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential_id: slot.id }),
  });
  const del = await fetch(`${base}/api/credentials/${slot.id}`, { method: "DELETE" });
  assert(del.status === 200, "delete slot");
  const cleared = await (await fetch(`${base}/api/state`)).json();
  assert(cleared.bots.find((b) => b.id === ada.id).credential == null, "ada cleared on slot delete");

  // Claude preview static
  const preview = await fetch(`${base}/themes/claude-preview.html`);
  assert(preview.status === 200, "claude preview");
  const previewHtml = await preview.text();
  assert(/#c96442|data-llm-provider="anthropic"|Claude theme/i.test(previewHtml), "claude tokens in preview");

  // UI source: theme + credential chrome
  const index = readFileSync(join(root, "bot", "static", "index.html"), "utf8");
  assert(/data-llm-provider|paintProviderTheme|fCred|credential_id/.test(index), "UI credential+theme");
  assert(/#c96442/.test(index), "anthropic terracotta in host CSS");
  assert(!/sk-[a-zA-Z0-9]{10,}/.test(index), "no sk- secrets in UI");

  // credentials file must not be in git tree paths
  const credFile = readFileSync(join(dataDir, "credentials.json"), "utf8");
  assert(/shared-xai|claude/.test(credFile), "slots persisted");
  assert(!/test-fixture-xai-not-real/.test(credFile), "env value not persisted");

  console.log("PASS  SUITE-BOT-KEY-001 (assign/share/change/unshare + Claude theme preview)");
} finally {
  child.kill("SIGTERM");
  await sleep(200);
  try { child.kill("SIGKILL"); } catch { /* */ }
}
