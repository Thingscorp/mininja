#!/usr/bin/env node
/** SUITE-BOT-CLI-001 / BOT-ENG-001 / BOT-SEED-001 — CLI + engine parity + seed. */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const eng = readFileSync(join(root, "bot", "console", "engine.py"), "utf8");
assert(/def is_command/.test(eng), "is_command");
assert(/COMMANDS\s*=/.test(eng), "COMMANDS list");
assert(/KIT_STAGES|scene\.json/.test(eng), "engine loads kit scene");

const consolePrograms = ["pgeon", "refine", "compound", "qa", "turn", "save", "ralph", "brief"];
const habitat = ["scene", "feel", "do", "go"];
const m = eng.match(/COMMANDS\s*=\s*\[([\s\S]*?)\]/);
const block = m ? m[1] : "";
for (const v of habitat) {
  assert(new RegExp(`"${v}"`).test(block), `bot COMMANDS includes ${v}`);
}
for (const p of consolePrograms) {
  assert(new RegExp(`"${p}"`).test(eng), `bot engine has plugin ${p}`);
}

assert(existsSync(join(root, "bot", "scripts", "cmd.py")), "cmd.py");
assert(existsSync(join(root, "bot", "scripts", "tint.py")), "tint.py");
assert(existsSync(join(root, "bot", "scripts", "check.sh")), "check.sh");
assert(existsSync(join(root, "bot", "scripts", "cmd-smoke.py")), "cmd-smoke.py");

const tint = spawnSync("python3", [join(root, "bot", "scripts", "tint.py"), "slate"], {
  encoding: "utf8",
  cwd: join(root, "bot"),
  env: { ...process.env, PYTHONPATH: join(root, "bot") },
});
if (tint.status === 0) {
  assert(/#[0-9a-fA-F]{6}/.test(tint.stdout), `tint hex: ${tint.stdout}`);
}

assert(existsSync(join(root, "bot", "seed", "pages.txt")), "seed/pages.txt");
const pages = readFileSync(join(root, "bot", "seed", "pages.txt"), "utf8").trim();
assert(pages.split("\n").filter(Boolean).length >= 1, "pages.txt non-empty");
assert(existsSync(join(root, "bot", "scripts", "seed.py")) || existsSync(join(root, "bot", "scripts", "seed.sh")), "seed script");

const smoke = readFileSync(join(root, "bot", "scripts", "cmd-smoke.py"), "utf8");
assert(/SHELL|programs\(\)|ALIASES|mininja.*cmd/i.test(smoke), "cmd-smoke iterates SHELL programs");

const cmdHelp = spawnSync("python3", [join(root, "bot", "scripts", "cmd.py"), "help"], {
  encoding: "utf8",
  cwd: join(root, "bot"),
  env: { ...process.env, PYTHONPATH: join(root, "bot"), MININJA_DATA: join(root, "qa", ".tmp-bot-data") },
});
assert(cmdHelp.status === 0, `cmd help exit ${cmdHelp.status}: ${cmdHelp.stderr}`);
assert(/help|now|todo/i.test(cmdHelp.stdout), "cmd help JSON card");
assert(/scene|feel|"do"|go/.test(cmdHelp.stdout), "cmd help lists habitat verbs");

for (const verb of ["scene", "feel proud", "do scan", "go archives"]) {
  const r = spawnSync("python3", [join(root, "bot", "scripts", "cmd.py"), ...verb.split(" ")], {
    encoding: "utf8",
    cwd: join(root, "bot"),
    env: { ...process.env, PYTHONPATH: join(root, "bot"), MININJA_DATA: join(root, "qa", ".tmp-bot-data-hab") },
  });
  assert(r.status === 0, `cmd ${verb} exit ${r.status}: ${r.stderr}`);
  assert(/title/.test(r.stdout), `cmd ${verb} card`);
}

console.log("PASS  SUITE-BOT-CLI-001 / BOT-ENG-001 (habitat parity + seed)");
