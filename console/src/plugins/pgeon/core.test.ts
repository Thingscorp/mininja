import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { authorityFor, bestAnswer, rankedAnswers } from "./core.ts";
import { findAuthor, getStore, resetStore, voteFor } from "./store.ts";

describe("pgeon core", () => {
  afterEach(() => resetStore());

  it("gates the most-voted failed answer out of best", () => {
    const ranked = rankedAnswers("add");
    assert.equal(ranked[0]?.author, "charlie");
    assert.equal(ranked[0]?.passed, true);
    const bravo = ranked.find((a) => a.author === "bravo");
    assert.equal(bravo?.votes, 5);
    assert.equal(bravo?.passed, false);
    assert.equal(bestAnswer("add")?.author, "charlie");
  });

  it("votes on bravo cannot mint best", () => {
    const bravo = findAuthor("add", "bravo");
    assert.ok(bravo);
    voteFor(bravo);
    voteFor(bravo);
    assert.equal(bravo.votes, 7);
    assert.equal(bestAnswer("add")?.author, "charlie");
  });

  it("refuses to manufacture a best when nothing passed", () => {
    resetStore();
    getStore().answers.forEach((a) => {
      a.passed = false;
    });
    assert.equal(bestAnswer("add"), null);
  });

  it("authority is verified wins not vote sum", () => {
    const qs = getStore().questions;
    assert.equal(authorityFor("charlie", qs), 1);
    assert.equal(authorityFor("bravo", qs), 0);
  });
});
