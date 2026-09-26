import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PIGEON, poseFromFace } from "./pigeon.ts";
import { cardFor } from "./mininja.ts";
import { resetStore } from "../plugins/pgeon/index.ts";

describe("pgeon pigeon", () => {
  it("every pose is a 2-line bird", () => {
    for (const frames of Object.values(PIGEON)) {
      assert.ok(frames.length >= 1);
      for (const frame of frames) {
        assert.equal(frame.length, 2);
      }
    }
  });

  it("faces map onto bird poses", () => {
    assert.equal(poseFromFace("allowed"), "best");
    assert.equal(poseFromFace("sandboxing"), "flap");
    assert.equal(poseFromFace("denied"), "sulk");
  });

  it("pgeon best ships the proud bird", () => {
    resetStore();
    assert.equal(cardFor("pgeon best").bird, "best");
    assert.equal(cardFor("pgeon vote bravo").bird, "flap");
    assert.equal(cardFor("pgeon ask empty").bird, "sulk");
  });
});
