import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cardFor } from "../../lib/mininja.ts";

describe("qa program", () => {
  it("default is the register sidecar", () => {
    const card = cardFor("qa");
    assert.equal(card.title, "qa");
    assert.ok(card.rows?.includes("qa F01"));
  });

  it("discover lists real feature ids", () => {
    const rows = cardFor("qa discover").rows ?? [];
    assert.ok(rows.some((r) => r === "qa F01"));
    assert.ok(rows.some((r) => r === "qa F33"));
  });

  it("inspects a feature by id including itself", () => {
    const card = cardFor("qa F33");
    assert.equal(card.title, "F33");
    assert.match(card.bottom ?? "", /verified/);
    assert.equal(cardFor("qa F37").title, "F37");
  });
});
