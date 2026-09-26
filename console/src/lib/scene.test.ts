import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyIntent,
  catalog,
  composeLockup,
  DEFAULT_SCENE,
  hasAction,
  hasEmotion,
  hasStage,
  intentFromCommand,
  sceneFromIntent,
} from "./scene.ts";
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
