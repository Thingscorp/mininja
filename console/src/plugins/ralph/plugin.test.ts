import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cardFor } from "../../lib/mininja.ts";

describe("ralph", () => {
  it("bare name is loop status", () => {
    const card = cardFor("ralph");
    assert.equal(card.title, "ralph");
    assert.ok(card.fields?.some((f) => f.label === "wait"));
    assert.equal(card.bottom, "Nothing eligible.");
    assert.equal(card.face, "completed");
  });

  it("unknown id is an error", () => {
    const card = cardFor("ralph nonexistent-item");
    assert.equal(card.title, "ralph");
    assert.equal(card.face, "error");
  });
});
