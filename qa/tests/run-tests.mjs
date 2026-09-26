#!/usr/bin/env node
/** Phase 2 monorepo suite runner — highest-risk console + kit consumer paths. */
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(here)
  .filter((f) => f.endsWith(".test.mjs"))
  .sort();

let passed = 0;
let failed = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, [join(here, f)], { encoding: "utf8" });
  if (r.status === 0) {
    passed += 1;
    process.stdout.write(r.stdout);
  } else {
    failed += 1;
    process.stdout.write(r.stdout);
    process.stderr.write(r.stderr || `FAIL ${f} exit ${r.status}\n`);
  }
}

console.log(`\nqa/tests: ${passed} passed, ${failed} failed, ${passed + failed} total`);
process.exit(failed ? 1 : 0);
