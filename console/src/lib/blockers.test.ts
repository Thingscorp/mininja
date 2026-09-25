import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BLOCKERS, findBlocker, horizon, schedule } from "./blockers.ts";

describe("schedule", () => {
  it("places independent work at day 0", () => {
    const rows = schedule();
    const reviews = rows.find((r) => r.id === "reviews")!;
    const board = rows.find((r) => r.id === "board")!;
    assert.equal(reviews.start, 0);
    assert.equal(reviews.end, 2);
    assert.equal(reviews.ready, true);
    assert.equal(board.start, 0);
    assert.equal(board.ready, true);
  });

  it("starts a job after every need finishes", () => {
    const rows = schedule();
    const read = rows.find((r) => r.id === "read104")!;
    const pub = rows.find((r) => r.id === "publish")!;
    assert.equal(read.start, 2);
    assert.equal(read.end, 3);
    assert.equal(read.ready, false);
    assert.equal(pub.start, 3);
    assert.equal(pub.end, 4);
    assert.deepEqual(pub.waitingOn, ["Get a second reader on the next release"]);
  });

  it("marks every job on a longest path critical", () => {
    const rows = schedule();
    const crit = rows.filter((r) => r.critical).map((r) => r.id).sort();
    assert.deepEqual(crit, ["publish", "read104", "reviews"].sort());
    assert.equal(rows.find((r) => r.id === "board")!.critical, false);
  });

  it("horizon is the latest end", () => {
    assert.equal(horizon(schedule()), 4);
  });

  it("breaks cycles without hanging", () => {
    const rows = schedule([
      { id: "a", title: "A", why: "", days: 1, needs: ["b"] },
      { id: "b", title: "B", why: "", days: 1, needs: ["a"] },
    ]);
    assert.equal(rows.length, 2);
    assert.ok(rows.every((r) => Number.isFinite(r.start) && r.start >= 0));
    assert.ok(rows.every((r) => r.end >= r.start));
  });

  it("skips missing needs", () => {
    const rows = schedule([
      { id: "a", title: "A", why: "", days: 2, needs: ["ghost"] },
    ]);
    assert.equal(rows[0].start, 0);
    assert.equal(rows[0].end, 2);
  });

  it("findBlocker matches id exactly", () => {
    assert.equal(findBlocker("reviews")?.id, "reviews");
    assert.equal(findBlocker("nope"), undefined);
  });

  it("does not match one and two letter queries", () => {
    assert.equal(findBlocker("on"), undefined);
    assert.equal(findBlocker("a"), undefined);
  });

  it("keeps four seeded jobs", () => {
    assert.equal(BLOCKERS.length, 4);
  });
});
