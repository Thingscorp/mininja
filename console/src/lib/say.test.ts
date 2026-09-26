import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sayFrom } from "./say.ts";

describe("sayFrom", () => {
  it("prefers an ask", () => {
    const s = sayFrom({ title: "turn", ask: { q: "Turn needs refine on.", yes: "refine on" } });
    assert.equal(s?.text, "Turn needs refine on.");
    assert.equal(s?.yes, "refine on");
  });

  it("falls back to bottom", () => {
    assert.equal(sayFrom({ title: "now", bottom: "Watching again." })?.text, "Watching again.");
  });

  it("offers a ready job as a yes", () => {
    const s = sayFrom(undefined, "Finish leftover reviews");
    assert.equal(s?.yes, "Finish leftover reviews");
  });

  it("is silent when there is nothing to say", () => {
    assert.equal(sayFrom(), null);
  });
});
