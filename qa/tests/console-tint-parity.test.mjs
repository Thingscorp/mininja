#!/usr/bin/env node
/** Host tint parity — console/src/lib/tint.ts ↔ bot/console/tint.py (OX-APP-005). */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const tintSrc = readFileSync(join(root, "console", "src", "lib", "tint.ts"), "utf8");
assert(/MUST NOT bake pal colors into kit/.test(tintSrc), "host-only tint rule");
assert(/createHash|sha256/.test(tintSrc), "sha256 name → hue");
assert(/STEEL\s*=\s*"#8a8f98"/.test(tintSrc), "steel sentinel");
assert(!/kit\/mark|kit\/scene|palColors/.test(tintSrc), "no kit pal-color table");

const names = ["Ada", "Piper", "Scout", "Cloud", "WSL", "Codex", "console", "Mininja", ""];
const expect = {};
for (const name of names) {
  const py = spawnSync(
    "python3",
    ["-c", "from console.tint import tint; import sys; print(tint(sys.argv[1]) if len(sys.argv)>1 else tint(''))", name],
    { cwd: join(root, "bot"), encoding: "utf8" },
  );
  assert(py.status === 0, `python tint ${JSON.stringify(name)}: ${py.stderr}`);
  expect[name] = py.stdout.trim();
}

const tintUrl = pathToFileURL(join(root, "console", "src", "lib", "tint.ts")).href;
const probe = `
import { tint, STEEL } from ${JSON.stringify(tintUrl)};
const expect = ${JSON.stringify(expect)};
if (STEEL !== "#8a8f98") throw new Error("STEEL");
for (const [name, hex] of Object.entries(expect)) {
  const got = tint(name);
  if (got !== hex) throw new Error("tint(" + JSON.stringify(name) + ") JS=" + got + " PY=" + hex);
}
console.log("parity ok");
`;
const js = spawnSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", probe], {
  encoding: "utf8",
});
assert(js.status === 0, `JS tint parity: ${js.stdout}${js.stderr}`);

console.log(`PASS  tint parity (${names.length} names; host chrome only)`);
