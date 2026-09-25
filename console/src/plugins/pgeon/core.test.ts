import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { authorityFor, bestAnswer, rankedAnswers } from "./core.ts";
import { findAuthor, getStore, resetStore, voteFor } from "./store.ts";

describe("pgeon core", () => {
  afterEach(() => resetStore());

  it("gates the most-voted failed answer out of best", () => {
    const ranked = rankedAnswers("add");
    assert.equal(ranked[0]?.author, "carol");
    assert.equal(ranked[0]?.passed, true);
    const bob = ranked.find((a) => a.author === "bob");
    assert.equal(bob?.votes, 5);
    assert.equal(bob?.passed, false);
    assert.equal(bestAnswer("add")?.author, "carol");
  });

  it("votes on bob cannot mint best", () => {
    const bob = findAuthor("add", "bob");
    assert.ok(bob);
    voteFor(bob);
    voteFor(bob);
    assert.equal(bob.votes, 7);
    assert.equal(bestAnswer("add")?.author, "carol");
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
    assert.equal(authorityFor("carol", qs), 1);
    assert.equal(authorityFor("bob", qs), 0);
  });
});
