import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cardFor } from "../../lib/mininja.ts";

describe("ralph", () => {
  it("bare name is loop status", () => {
    const card = cardFor("ralph");
    assert.equal(card.title, "ralph");
    assert.ok(card.fields?.some((f) => f.label === "wait"));
    assert.ok((card.rows?.length ?? 0) === 0 || card.bottom === "Nothing eligible.");
  });

  it("inspects an item", () => {
    const card = cardFor("ralph turn-reads-stream");
    assert.equal(card.title, "turn-reads-stream");
    assert.equal(card.tag, "pass");
  });
});
