import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyIntent,
  catalog,
  clampGrowth,
  composeLockup,
  DEFAULT_SCENE,
  growthHeight,
  hasAction,
  hasEmotion,
  hasStage,
  hostGardenOverlay,
  intentFromCommand,
  sceneFromIntent,
} from "./scene.ts";
import kit from "../../../kit/scene.json" with { type: "json" };
import { afterCommand } from "./mascot.ts";

describe("scene registry", () => {
  it("ships a full suite", () => {
    const c = catalog();
    assert.ok(c.emotions.length >= 14);
    assert.ok(c.actions.length >= 18);
    assert.ok(c.stages.length >= 6);
    assert.ok(hasEmotion("proud"));
    assert.ok(hasAction("scan"));
    assert.ok(hasStage("archives"));
  });

  it("unknown ids fall back without throwing", () => {
    const next = applyIntent(DEFAULT_SCENE, { emotion: "not-real", action: "also-fake", stage: "nowhere" });
    assert.equal(next.emotion, "curious");
    assert.equal(next.action, "wait");
    assert.equal(next.stage, "dock");
  });

  it("faces the walk toward the new stage", () => {
    const right = applyIntent(DEFAULT_SCENE, { stage: "rooftop" });
    assert.equal(right.facing, "right");
    const left = applyIntent({ ...DEFAULT_SCENE, stage: "rooftop" }, { stage: "nightwatch" });
    assert.equal(left.facing, "left");
  });

  it("composeLockup flips the hood when facing left", () => {
    const r = composeLockup({ ...DEFAULT_SCENE, facing: "right" });
    const l = composeLockup({ ...DEFAULT_SCENE, facing: "left" });
    assert.match(r.lines[0], /▚/);
    assert.match(l.lines[0], /▞/);
  });
});

describe("intentFromCommand", () => {
  it("maps look into the archives", () => {
    const intent = intentFromCommand("look api", "The brain");
    assert.equal(intent.stage, "archives");
    assert.equal(intent.action, "scan");
  });

  it("maps unknown to the gate", () => {
    const intent = intentFromCommand("xyzzy", "Unknown command");
    assert.equal(intent.stage, "gate");
    assert.equal(intent.emotion, "confused");
  });

  it("honors an explicit scene on the card", () => {
    const intent = intentFromCommand("now", "now", undefined, { emotion: "mischievous", stage: "workshop" });
    assert.equal(intent.emotion, "mischievous");
    assert.equal(intent.stage, "workshop");
  });

  it("sceneFromIntent keeps current stage when omitted", () => {
    const next = sceneFromIntent({ emotion: "happy", action: "wave" }, { ...DEFAULT_SCENE, stage: "archives" });
    assert.equal(next.stage, "archives");
    assert.equal(next.emotion, "happy");
  });
});

describe("afterCommand", () => {
  it("unknown titles become error", () => {
    assert.equal(afterCommand("xyzzy", "Unknown command"), "error");
  });

  it("pause becomes warning", () => {
    assert.equal(afterCommand("pause", "Feature pause"), "warning");
  });

  it("look becomes executing", () => {
    assert.equal(afterCommand("look api", "The brain"), "executing");
  });

  it("plan becomes completed", () => {
    assert.equal(afterCommand("plan", "plan"), "completed");
  });
});

describe("garden growth", () => {
  it("maps growth 0..5 to kit silhouette heights", () => {
    const h0 = kit.garden.silhouetteHeightPx.h0Px;
    const dh = kit.garden.silhouetteHeightPx.dhPx;
    for (let g = 0; g <= 5; g++) {
      assert.equal(growthHeight(g), h0 + g * dh);
    }
    assert.equal(growthHeight(3), 48);
    assert.equal(growthHeight(undefined), h0 + kit.garden.growth.default * dh);
  });

  it("clamps invalid growth to kit default", () => {
    assert.equal(clampGrowth(99), kit.garden.growth.default);
    assert.equal(clampGrowth(-1), kit.garden.growth.default);
    assert.equal(clampGrowth(2.5), kit.garden.growth.default);
    assert.equal(clampGrowth(4), 4);
  });

  it("one pal, one plant when roster exists", () => {
    const pals = [
      { id: "a", name: "Ada", tint: "#54a6c9" },
      { id: "b", name: "Piper", tint: "#c95477" },
    ];
    const plants = hostGardenOverlay(pals);
    assert.equal(plants.length, 2);
    assert.equal(plants[0]!.palId, "a");
    assert.equal(plants[1]!.palId, "b");
    assert.equal(plants[0]!.kind, "repoBranch");
    assert.equal(plants[0]!.tint, "#54a6c9");
  });

  it("empty roster still shows a plant from overlay", () => {
    const plants = hostGardenOverlay([]);
    assert.ok(plants.length >= 1);
    assert.equal(plants[0]!.kind, "repoBranch");
    assert.ok(plants[0]!.growth === 0 || plants[0]!.growth === 3 || plants[0]!.growth == null || (plants[0]!.growth! >= 0 && plants[0]!.growth! <= 5));
  });
});
