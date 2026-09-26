import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cardFor } from "../../lib/mininja.ts";
import { resetStore } from "./index.ts";

describe("compound plugin", () => {
  afterEach(() => resetStore());

  it("default is the sidecar", () => {
    const card = cardFor("compound");
    assert.equal(card.title, "sidecar");
    assert.ok(card.fields?.some((f) => f.label === "cover"));
    assert.ok(card.fields?.some((f) => f.label === "goal"));
    assert.ok(card.fields?.some((f) => f.label === "build"));
    assert.ok(card.fields?.some((f) => f.value.startsWith("ralph  ") || f.value.includes("persist") || f.value.includes("Owner")));
  });

  it("extra verbs still show the sidecar", () => {
    assert.equal(cardFor("compound goal").title, "sidecar");
    assert.equal(cardFor("compound check").title, "sidecar");
    assert.equal(cardFor("compound next").title, "sidecar");
  });

  it("help lists compound", () => {
    assert.ok(cardFor("help").rows?.includes("compound"));
  });
});
