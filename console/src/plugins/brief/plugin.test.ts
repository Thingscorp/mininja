import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cardFor } from "../../lib/mininja.ts";
import { resetStream } from "../../lib/stream.ts";
import { resetStore as resetRefine } from "../refine/index.ts";

describe("brief", () => {
  afterEach(() => {
    resetStream();
    resetRefine();
  });

  it("emits facts and open loops", () => {
    const card = cardFor("brief");
    assert.equal(card.title, "brief");
    assert.ok(card.fields?.some((f) => f.label === "fact" && f.value.includes("v0.10.3")));
    assert.ok(card.fields?.some((f) => f.label === "loop" && f.value.includes("Finish leftover reviews")));
    assert.ok(card.fields?.some((f) => f.label === "source" && f.value === "none"));
    assert.match(card.stream ?? "", /\*\*fact\*\*/);
    assert.match(card.bottom ?? "", /does not promote/i);
  });

  it("lists a saved stream as source not fact", () => {
    cardFor("refine on");
    cardFor("turn");
    cardFor("save");
    const card = cardFor("brief");
    assert.ok(card.fields?.some((f) => f.label === "source" && f.value.startsWith("s1  ")));
    assert.ok(card.fields?.every((f) => f.label !== "fact" || !f.value.startsWith("s1")));
  });
});
