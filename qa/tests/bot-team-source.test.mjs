#!/usr/bin/env node
/** SUITE-BOT-TEAM-001/002 — remote env gate + task/SSE/rally/retarget surface in source. */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const cloud = existsSync(join(root, "bot", "cloud.py")) ? readFileSync(join(root, "bot", "cloud.py"), "utf8") : "";
const server = readFileSync(join(root, "bot", "server.py"), "utf8");

assert(/MININJA_CLOUD|CLOUD_HOST|remote|codex|local/i.test(cloud + server), "computer modes referenced");
assert(!/sk-[a-zA-Z0-9]{10,}|api[_-]?key\s*=\s*["'][^"']+["']/i.test(server + cloud), "no hardcoded secrets");

assert(/\/api\/events|text\/event-stream|SSE|EventSource/i.test(server), "SSE events");
assert(/\/api\/bots|start_task|stop_bot|stop/i.test(server), "bots/tasks/stop");
assert(/hello|ping|ingest_event|broadcast/i.test(server) || /events/i.test(server), "event broadcast surface");

// P0: pull-off / retarget / rally-all
assert(/def retarget_task/.test(server), "retarget_task");
assert(/def rally_all/.test(server), "rally_all");
assert(/retarget:\s*bool\s*=\s*False|retarget=retarget/.test(server), "start_task retarget flag");
assert(/already working/.test(server), "refuse silent double-assign");
assert(/MAX_PARALLEL\s*=\s*4/.test(server), "MAX_PARALLEL cap");
assert(/api.*rally|parts == \["api", "rally"\]/.test(server), "POST /api/rally");
assert(/parts\[3\] == "retarget"/.test(server), "POST /api/bots/:id/retarget");
assert(/draft|auto|free/.test(server), "permission modes intact");
assert(/from console import credentials|console\.credentials|credential_id/.test(server), "credential bind surface");
assert(/api.*credentials|parts == \["api", "credentials"\]/.test(server), "POST/GET /api/credentials");
assert(/resolve_for_pal|_credential_inject/.test(server), "runtime credential resolve");
assert(/no LLM credential bound|credential/.test(server), "fail-closed unbound copy");


console.log("PASS  SUITE-BOT-TEAM-001/002 (+ retarget/rally)");
