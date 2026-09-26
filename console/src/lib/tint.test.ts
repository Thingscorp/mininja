import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { STEEL, tint } from "./tint.ts";

describe("tint (host chrome)", () => {
  it("maps empty to steel", () => {
    assert.equal(tint(""), STEEL);
    assert.equal(tint("  "), STEEL);
  });

  it("is stable and distinct for sample teammates", () => {
    assert.equal(tint("Ada"), "#54a6c9");
    assert.equal(tint("Piper"), "#c95477");
    assert.equal(tint("Scout"), "#54c9a6");
    assert.notEqual(tint("Ada"), tint("Piper"));
  });

  it("casefolds like the python host algo", () => {
    assert.equal(tint("Ada"), tint("ada"));
  });
});
