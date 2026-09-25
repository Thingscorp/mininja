import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cardFor } from "./mininja.ts";
import { afterCommand } from "./mascot.ts";

describe("cardFor", () => {
  it("now returns current state not the todo list", () => {
    const card = cardFor("now");
    assert.equal(card.title, "now");
    assert.ok(card.fields?.some((f) => f.label === "live"));
    assert.equal(card.scene?.stage, "desk");
  });

  it("overview aliases match now", () => {
    assert.equal(cardFor("overview").title, "now");
  });

  it("todo returns the work list", () => {
    assert.equal(cardFor("todo").title, "todo");
    assert.ok((cardFor("todo").rows?.length ?? 0) >= 1);
  });

  it("pause is gone", () => {
    assert.equal(cardFor("pause").title, "Unknown command");
    assert.equal(cardFor("freeze").title, "Unknown command");
  });

  it("plan returns a four-bar chart", () => {
    const card = cardFor("plan");
    assert.equal(card.title, "plan");
    assert.equal(card.gantt?.length, 4);
    assert.equal(cardFor("gantt").gantt?.length, 4);
  });

  it("help lists plan and offline", () => {
    const rows = cardFor("help").rows ?? [];
    assert.ok(rows.includes("plan"));
    assert.ok(rows.includes("offline"));
    assert.ok(rows.includes("scene"));
  });

  it("api names the main program", () => {
    assert.equal(cardFor("api").title, "The brain");
    assert.equal(cardFor("look api").title, "The brain");
    assert.equal(cardFor("look api").scene?.stage, "archives");
  });

  it("unknown command is explicit", () => {
    const card = cardFor("xyzzy");
    assert.equal(card.title, "Unknown command");
    assert.equal(card.scene?.stage, "gate");
  });

  it("strips a leading slash", () => {
    assert.equal(cardFor("/now").title, "now");
  });

  it("clear is a sentinel", () => {
    assert.equal(cardFor("clear").title, "__clear__");
  });

  it("scene lists the suite", () => {
    const card = cardFor("scene");
    assert.equal(card.title, "scene");
    assert.ok(card.fields?.some((f) => f.label === "feel"));
    assert.ok(card.fields?.some((f) => f.label === "go"));
  });

  it("feel proud sets the emotion", () => {
    const card = cardFor("feel proud");
    assert.equal(card.scene?.emotion, "proud");
  });

  it("go archives sets the stage", () => {
    const card = cardFor("go archives");
    assert.equal(card.scene?.stage, "archives");
  });

  it("do scan sets the action", () => {
    const card = cardFor("do scan");
    assert.equal(card.scene?.action, "scan");
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
