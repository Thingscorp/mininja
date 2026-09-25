import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cardFor } from "../../lib/mininja.ts";
import { afterCommand } from "../../lib/mascot.ts";
import { resetStore } from "./index.ts";

describe("pgeon plugin", () => {
  afterEach(() => resetStore());

  it("is dispatched as a first-class command", () => {
    const card = cardFor("pgeon");
    assert.equal(card.title, "add");
    assert.equal(card.tag, "verified");
    assert.ok(card.rows?.includes("pgeon vote bob"));
  });

  it("best shows carol and gates bob", () => {
    const card = cardFor("pgeon best");
    assert.equal(card.title, "add");
    assert.equal(card.tag, "verified");
    assert.equal(card.face, "allowed");
    assert.ok(card.fields?.some((f) => f.label === "best" && f.value.includes("carol")));
    assert.ok(card.fields?.some((f) => f.label === "bob" && f.value.includes("gated")));
  });

  it("vote bob leaves best on carol and uses sandbox face", () => {
    const card = cardFor("pgeon vote bob");
    assert.equal(card.face, "sandbox");
    assert.match(card.bottom ?? "", /best unchanged/);
    assert.equal(cardFor("pgeon best").fields?.find((f) => f.label === "best")?.value.includes("carol"), true);
  });

  it("ask empty refuses a best", () => {
    const card = cardFor("pgeon ask empty");
    assert.equal(card.face, "denied");
    assert.match(card.bottom ?? "", /no best/);
    assert.equal(afterCommand("pgeon ask empty", card.title, card.face), "denied");
  });

  it("help lists the plugin", () => {
    assert.ok(cardFor("help").rows?.includes("pgeon"));
  });
});
