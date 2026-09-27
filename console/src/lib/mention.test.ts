import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyMentionText,
  mentionQuery,
  parseMention,
  rosterSuggestions,
  routeComposer,
  stickyFromRoster,
  type RosterPal,
} from "./mention.ts";

const bots: RosterPal[] = [
  { id: "b1", name: "Ada", job: "docs", tint: "#54a6c9" },
  { id: "b2", name: "Piper", job: "code", tint: "#c95477", working: true },
  { id: "b3", name: "Scout", job: "qa", status: "error" },
];

describe("parseMention", () => {
  it("returns null without leading @", () => {
    assert.equal(parseMention("now", bots), null);
    assert.equal(parseMention("Ada do x", bots), null);
  });

  it("routes @all / @console", () => {
    assert.deepEqual(parseMention("@all dig", bots), {
      kind: "all",
      token: "all",
      body: "dig",
      bot: null,
    });
    assert.deepEqual(parseMention("@console now", bots), {
      kind: "console",
      token: "console",
      body: "now",
      bot: null,
    });
  });

  it("matches roster case-insensitive exact then prefix", () => {
    const m = parseMention("@ada ship it", bots);
    assert.equal(m?.kind, "pal");
    assert.equal(m && m.kind === "pal" ? m.bot.id : null, "b1");
    assert.equal(m?.body, "ship it");
    const pref = parseMention("@Pi hello", bots);
    assert.equal(pref && pref.kind === "pal" ? pref.bot.name : null, "Piper");
  });

  it("unknown token", () => {
    assert.equal(parseMention("@Zed hi", bots)?.kind, "unknown");
  });
});

describe("mentionQuery + rosterSuggestions + applyMentionText", () => {
  it("detects trailing @query", () => {
    assert.deepEqual(mentionQuery("@Ad"), { prefix: "Ad", start: 0 });
    assert.deepEqual(mentionQuery("hi @p"), { prefix: "p", start: 3 });
    assert.equal(mentionQuery("@Ada do"), null);
  });

  it("suggests all + pals + console filtered", () => {
    const all = rosterSuggestions("", bots);
    assert.equal(all[0]?.name, "all");
    assert.equal(all[all.length - 1]?.name, "console");
    assert.equal(all.length, 5);
    const filtered = rosterSuggestions("a", bots);
    assert.deepEqual(
      filtered.map((x) => x.name),
      ["all", "Ada"],
    );
  });

  it("applies suggestion into text", () => {
    assert.equal(applyMentionText("@Ad", "Ada"), "@Ada ");
    assert.equal(applyMentionText("x @p", "Piper"), "x @Piper ");
  });
});

describe("routeComposer", () => {
  it("pull/stop with optional who", () => {
    assert.deepEqual(routeComposer("stop", { bots, selected: "b1" }), {
      op: "pull",
      who: null,
      bot: bots[0],
    });
    const r = routeComposer("pull @Piper", { bots, selected: "console" });
    assert.equal(r.op, "pull");
    assert.equal(r.op === "pull" ? r.bot?.id : null, "b2");
  });

  it("retarget @Name body", () => {
    const r = routeComposer("retarget @Scout remaining", { bots, selected: "b1" });
    assert.equal(r.op, "retarget");
    assert.equal(r.op === "retarget" ? r.to?.id : null, "b3");
    assert.equal(r.op === "retarget" ? r.body : null, "remaining");
    assert.equal(routeComposer("retarget @Nope x", { bots, selected: null }).op, "retarget-error");
  });

  it("rally / console / task / select / program / sidebar", () => {
    assert.deepEqual(routeComposer("@all dig", { bots, selected: "console" }), {
      op: "rally",
      body: "dig",
    });
    assert.deepEqual(routeComposer("@console now", { bots, selected: "b1" }), {
      op: "console",
      body: "now",
    });
    assert.equal(routeComposer("@Ada", { bots, selected: "console" }).op, "select-pal");
    const task = routeComposer("@Ada ship", { bots, selected: "console" });
    assert.equal(task.op, "task");
    assert.equal(task.op === "task" ? task.body : null, "ship");
    assert.deepEqual(routeComposer("now", { bots, selected: "console" }), {
      op: "program",
      text: "now",
    });
    assert.deepEqual(routeComposer("dig trenches", { bots, selected: "b1" }), {
      op: "sidebar-task",
      botId: "b1",
      text: "dig trenches",
    });
    assert.equal(routeComposer("@Zed x", { bots, selected: null }).op, "unknown-mention");
  });
});

describe("stickyFromRoster", () => {
  it("ranks blocked > asking > busy", () => {
    assert.equal(stickyFromRoster(bots), "blocked");
    assert.equal(
      stickyFromRoster([{ id: "x", name: "X", working: true }], { asking: true }),
      "asking",
    );
    assert.equal(
      stickyFromRoster([{ id: "x", name: "X", working: true }]),
      "busy",
    );
    assert.equal(stickyFromRoster([{ id: "x", name: "X" }], { asking: true }), "asking");
    assert.equal(stickyFromRoster([{ id: "x", name: "X" }]), null);
  });
});
