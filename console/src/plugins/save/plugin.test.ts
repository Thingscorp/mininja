import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cardFor } from "../../lib/mininja.ts";
import { resetStream } from "../../lib/stream.ts";
import { resetStore as resetPgeon } from "../pgeon/index.ts";
import { resetStore as resetRefine } from "../refine/index.ts";

describe("save compounds", () => {
  afterEach(() => {
    resetStream();
    resetPgeon();
    resetRefine();
  });

  it("keeps the turn stream and pgeon locks it", () => {
    assert.equal(cardFor("save").face, "denied");
    cardFor("refine on");
    const turn = cardFor("turn");
    assert.match(turn.stream ?? "", /Lock the test/);
    const saved = cardFor("save");
    assert.equal(saved.tag, "s1");
    assert.ok(saved.rows?.includes("pgeon ask s1"));
    const asked = cardFor("pgeon ask s1");
    assert.equal(asked.title, "s1");
    assert.equal(asked.face, "denied");
    assert.match(asked.bottom ?? "", /stream/);
  });
});
