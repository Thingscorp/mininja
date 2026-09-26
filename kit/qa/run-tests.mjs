#!/usr/bin/env node
/**
 * Kit QA runner — asserts mark.json + scene.json + check-consumers (+ sim when invoked by tests).
 * Exit non-zero on any failure.
 */
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registry } from "./tests/_harness.mjs";

const testsDir = join(dirname(fileURLToPath(import.meta.url)), "tests");

async function loadSuites() {
  const files = readdirSync(testsDir)
    .filter((f) => f.endsWith(".test.mjs"))
    .sort();
  for (const f of files) {
    await import(pathToFileURL(join(testsDir, f)).href);
  }
}

async function main() {
  await loadSuites();
  const results = [];
  let passed = 0;
  let failed = 0;
  for (const t of registry) {
    const start = Date.now();
    try {
      await t.fn();
      passed++;
      results.push({ id: t.id, featureId: t.featureId, scenarioType: t.scenarioType, ok: true, ms: Date.now() - start });
      console.log(`PASS  ${t.id}  (${t.featureId}/${t.scenarioType})`);
    } catch (err) {
      failed++;
      const msg = err && err.message ? err.message : String(err);
      results.push({ id: t.id, featureId: t.featureId, scenarioType: t.scenarioType, ok: false, ms: Date.now() - start, error: msg });
      console.error(`FAIL  ${t.id}  (${t.featureId}/${t.scenarioType})`);
      console.error(`      ${msg}`);
    }
  }
  console.log("");
  console.log(`kit/qa: ${passed} passed, ${failed} failed, ${registry.length} total`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
