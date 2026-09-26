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
    assert.ok(card.rows?.includes("pgeon vote bravo"));
  });

  it("best shows charlie and gates bravo", () => {
    const card = cardFor("pgeon best");
    assert.equal(card.title, "add");
    assert.equal(card.tag, "verified");
    assert.equal(card.face, "allowed");
    assert.ok(card.fields?.some((f) => f.label === "best" && f.value.includes("charlie")));
    assert.ok(card.fields?.some((f) => f.label === "bravo" && f.value.includes("gated")));
  });

  it("vote bravo leaves best on charlie and uses sandboxing face", () => {
    const card = cardFor("pgeon vote bravo");
    assert.equal(card.face, "sandboxing");
    assert.match(card.bottom ?? "", /best unchanged/);
    assert.equal(cardFor("pgeon best").fields?.find((f) => f.label === "best")?.value.includes("charlie"), true);
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
