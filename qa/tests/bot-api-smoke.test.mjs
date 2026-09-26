#!/usr/bin/env node
/** SUITE-BOT-API-001 / BOT-LAUNCH-001 — health + cmd smoke via temporary server. */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import { mkdirSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dataDir = join(root, "qa", ".tmp-bot-data");
mkdirSync(dataDir, { recursive: true });

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const env = {
  ...process.env,
  MININJA_DATA: dataDir,
  PYTHONPATH: join(root, "bot"),
  PYTHONUNBUFFERED: "1",
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
  assert(port, `server did not print URL: ${bootLog.slice(0, 800)}`);

  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {
      /* retry */
    }
    await sleep(100);
  }
  assert(ready, `health not ready: ${bootLog.slice(0, 500)}`);

  const health = await (await fetch(`http://127.0.0.1:${port}/api/health`)).json();
  assert(health && typeof health === "object", "health JSON");

  const index = await fetch(`http://127.0.0.1:${port}/`);
  assert(index.status === 200, `index ${index.status}`);
  const html = await index.text();
  assert(/Mininja|IBM Plex|composer|grove|mascot/i.test(html), "index UI");

  const state = await fetch(`http://127.0.0.1:${port}/api/state`);
  assert(state.status === 200, "api/state");

  const cmd = await fetch(`http://127.0.0.1:${port}/api/cmd`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "help" }),
  });
  assert(cmd.status === 200, `cmd help ${cmd.status}`);
  const cmdBody = await cmd.json();
  assert(cmdBody.ok === true && cmdBody.card, "cmd ok+card");

  const bot = await fetch(`http://127.0.0.1:${port}/api/bots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "QA", job: "smoke", description: "ephemeral" }),
  });
  assert(bot.status === 201 || bot.status === 200, `create bot ${bot.status}`);
  const botBody = await bot.json();
  assert(botBody.id, "bot id");

  const del = await fetch(`http://127.0.0.1:${port}/api/bots/${botBody.id}`, { method: "DELETE" });
  assert(del.status === 200, `delete bot ${del.status}`);

  // P0: rally-all + retarget surfaces (empty / missing target fail closed)
  const rallyEmpty = await fetch(`http://127.0.0.1:${port}/api/rally`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "" }),
  });
  assert(rallyEmpty.status === 400, `rally empty ${rallyEmpty.status}`);
  const rallyBody = await rallyEmpty.json();
  assert(rallyBody.ok === false && /empty/i.test(rallyBody.error || ""), "rally empty error");

  const bot2 = await (
    await fetch(`http://127.0.0.1:${port}/api/bots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ada", job: "rally", description: "ephemeral" }),
    })
  ).json();
  assert(bot2.id, "bot2 id");

  const rallyNoGrok = await fetch(`http://127.0.0.1:${port}/api/rally`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "ping blockers" }),
  });
  assert(rallyNoGrok.status === 200, `rally status ${rallyNoGrok.status}`);
  const rallyOut = await rallyNoGrok.json();
  assert(rallyOut.ok === true && Array.isArray(rallyOut.started) && Array.isArray(rallyOut.skipped), "rally shape");
  // Without grok CLI, started may be empty and skipped carries reason — still a valid rally path.
  assert(rallyOut.started.length + rallyOut.skipped.length >= 1, "rally touched roster");

  const retargetBad = await fetch(`http://127.0.0.1:${port}/api/bots/${bot2.id}/retarget`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: "", text: "x" }),
  });
  assert(retargetBad.status === 400, `retarget bad ${retargetBad.status}`);

  const stop = await fetch(`http://127.0.0.1:${port}/api/bots/${bot2.id}/stop`, { method: "POST" });
  assert(stop.status === 200, `stop ${stop.status}`);

  const del2 = await fetch(`http://127.0.0.1:${port}/api/bots/${bot2.id}`, { method: "DELETE" });
  assert(del2.status === 200, `delete bot2 ${del2.status}`);

  const indexMentions = html;
  assert(/parseMention|mentionMenu|rally all|@Ada/i.test(indexMentions), "index has @/rally chrome");

  console.log("PASS  SUITE-BOT-API-001 / BOT-LAUNCH-001 (+ rally/retarget)");
} finally {
  child.kill("SIGTERM");
  await sleep(200);
  try {
    child.kill("SIGKILL");
  } catch {
    /* */
  }
}
