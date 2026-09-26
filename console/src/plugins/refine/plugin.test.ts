import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cardFor } from "../../lib/mininja.ts";
import { resetStore } from "./index.ts";

describe("refine toggle", () => {
  afterEach(() => resetStore());

  it("starts off and toggles", () => {
    assert.equal(cardFor("refine").tag, "on");
    assert.equal(cardFor("refine").tag, "off");
  });

  it("accepts on and off", () => {
    assert.equal(cardFor("refine on").tag, "on");
    assert.equal(cardFor("refine on").tag, "on");
    assert.equal(cardFor("refine off").tag, "off");
  });

  it("unknown verb is explicit", () => {
    assert.equal(cardFor("refine pick").face, "error");
  });

  it("help still lists refine", () => {
    assert.ok(cardFor("help").rows?.includes("refine"));
  });
});
