#!/usr/bin/env node
/** SUITE-BOT-CFG-001 — mininja config CLI + host-config SoT + server honors maxParallel. */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// --- source contracts ---
assert(existsSync(join(root, "bot", "scripts", "config.py")), "config.py");
assert(existsSync(join(root, "bot", "console", "host_config.py")), "host_config.py");
assert(existsSync(join(root, "qa", "SETTINGS.md")), "qa/SETTINGS.md");

const dispatcher = readFileSync(join(root, "bot", "mininja"), "utf8");
assert(/config\)\s+exec/.test(dispatcher), "mininja wires config");
assert(/config/.test(dispatcher), "usage lists config");

const server = readFileSync(join(root, "bot", "server.py"), "utf8");
assert(/MAX_PARALLEL\s*=\s*4/.test(server), "MAX_PARALLEL fallback");
assert(/def max_parallel/.test(server), "max_parallel()");
assert(/host_config\.get_max_parallel|get_max_parallel/.test(server), "reads host-config");
assert(/\/api\/host-config/.test(server), "GET /api/host-config");
assert(/default_mode\(/.test(server), "default_mode on create");

const readme = readFileSync(join(root, "bot", "README.md"), "utf8");
assert(/## Config/.test(readme), "README Config section");
assert(/mininja config/.test(readme), "README documents CLI");

const settings = readFileSync(join(root, "qa", "SETTINGS.md"), "utf8");
assert(/CLI is SoT|CLI \+ file/i.test(settings), "SETTINGS says CLI SoT");

// --- unit smoke ---
const unit = spawnSync("python3", [join(root, "bot", "scripts", "config-smoke.py")], {
  encoding: "utf8",
  env: { ...process.env, PYTHONPATH: join(root, "bot") },
});
if (unit.status !== 0) {
  process.stderr.write(unit.stdout + unit.stderr);
  throw new Error(`config-smoke exit ${unit.status}`);
}
process.stdout.write(unit.stdout);

// --- dispatcher ---
const usage = spawnSync(join(root, "bot", "mininja"), ["nosuch"], { encoding: "utf8" });
assert(usage.status === 2, "unknown cmd exit 2");
assert(/config/.test(usage.stderr), `usage lists config: ${usage.stderr}`);

const dataDir = join(root, "qa", ".tmp-bot-cfg-data");
rmSync(dataDir, { recursive: true, force: true });
mkdirSync(dataDir, { recursive: true });

const env = {
  ...process.env,
  MININJA_DATA: dataDir,
  PYTHONPATH: join(root, "bot"),
  PYTHONUNBUFFERED: "1",
};

const set = spawnSync(join(root, "bot", "mininja"), ["config", "set", "maxParallel", "7"], {
  encoding: "utf8",
  env,
  cwd: join(root, "bot"),
});
assert(set.status === 0, `config set: ${set.stderr}`);
assert(/maxParallel=7/.test(set.stdout), set.stdout);

const get = spawnSync(join(root, "bot", "mininja"), ["config", "get", "maxParallel"], {
  encoding: "utf8",
  env,
  cwd: join(root, "bot"),
});
assert(get.status === 0 && get.stdout.trim() === "7", `get ${get.stdout}`);

const file = readFileSync(join(dataDir, "host-config.json"), "utf8");
assert(/"v"\s*:\s*1/.test(file) && /"maxParallel"\s*:\s*7/.test(file), "file SoT");

// --- live server honors cap ---
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

  const hc = await (await fetch(`http://127.0.0.1:${port}/api/host-config`)).json();
  assert(hc.maxParallel === 7, `api maxParallel ${hc.maxParallel}`);
  assert(hc.config && hc.config.maxParallel === 7, "config block");
  assert(hc.botListen && String(hc.botListen).includes(String(port)), `botListen ${hc.botListen}`);
  assert(!JSON.stringify(hc).includes("secret"), "no secrets in host-config");

  // defaultMode from file
  spawnSync(join(root, "bot", "mininja"), ["config", "set", "defaultMode", "draft"], {
    encoding: "utf8",
    env,
    cwd: join(root, "bot"),
  });
  const bot = await (
    await fetch(`http://127.0.0.1:${port}/api/bots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "CfgPal", job: "t" }),
    })
  ).json();
  assert(bot.mode === "draft", `spawn mode ${bot.mode}`);

  console.log("PASS  SUITE-BOT-CFG-001 (config CLI + host-config + API)");
} finally {
  child.kill("SIGTERM");
  await sleep(200);
  try {
    child.kill("SIGKILL");
  } catch { /* */ }
}
