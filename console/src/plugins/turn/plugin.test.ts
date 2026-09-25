import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cardFor } from "../../lib/mininja.ts";
import { resetStream } from "../../lib/stream.ts";
import { resetStore } from "../refine/index.ts";

describe("turn", () => {
  afterEach(() => {
    resetStore();
    resetStream();
  });

  it("refuses when refine is off", () => {
    const card = cardFor("turn");
    assert.equal(card.tag, "off");
    assert.equal(card.face, "denied");
  });

  it("picks by fitness when refine is on", () => {
    cardFor("refine on");
    const card = cardFor("turn");
    assert.equal(card.tag, "fitness");
    assert.equal(card.face, "warning");
    assert.ok(card.fields?.some((f) => f.label === "lead" && f.value.includes("gate")));
    assert.match(card.bottom ?? "", /not verified/i);
  });

  it("generation 2 is not generation 1", () => {
    cardFor("refine on");
    const first = cardFor("turn");
    const second = cardFor("turn");
    const lead1 = first.fields?.find((f) => f.label === "lead")?.value ?? "";
    const lead2 = second.fields?.find((f) => f.label === "lead")?.value ?? "";
    assert.equal(first.tag, "fitness");
    assert.equal(second.tag, "loop");
    assert.notEqual(lead2, lead1);
    assert.match(second.bottom ?? "", /not verified/i);
  });
});
