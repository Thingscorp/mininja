import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyHabitatMentions,
  applyMentionText,
  MAX_PARALLEL,
  mentionQuery,
  parseMention,
  rosterSuggestions,
  routeComposer,
  splitLeadingMentions,
  stickyFromRoster,
  type RosterPal,
} from "./mention.ts";

const bots: RosterPal[] = [
  { id: "b1", name: "Ada", job: "docs", tint: "#54a6c9" },
  { id: "b2", name: "Piper", job: "code", tint: "#c95477", working: true },
  { id: "b3", name: "Scout", job: "qa", status: "error" },
  { id: "b4", name: "Bea", job: "ops" },
  { id: "b5", name: "Cara", job: "design" },
  { id: "b6", name: "Dee", job: "research" },
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

describe("splitLeadingMentions", () => {
  it("peels multi pals + body", () => {
    assert.deepEqual(splitLeadingMentions("@Ada @Bea do X"), {
      tokens: ["Ada", "Bea"],
      body: "do X",
    });
    assert.deepEqual(splitLeadingMentions("@Ada"), {
      tokens: ["Ada"],
      body: "",
    });
    assert.equal(splitLeadingMentions("now"), null);
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
    assert.equal(all.length, 8);
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

describe("applyHabitatMentions", () => {
  it("sets @Name for single focus; programs are not a task body", () => {
    assert.equal(applyHabitatMentions("", ["Ada"]), "@Ada ");
    assert.equal(applyHabitatMentions("now", ["Ada"]), "@Ada ");
  });

  it("joins multi names", () => {
    assert.equal(applyHabitatMentions("", ["Ada", "Bea"]), "@Ada @Bea ");
  });

  it("keeps trailing task body after leading @mentions", () => {
    assert.equal(applyHabitatMentions("@Ada do the thing", ["Ada", "Bea"]), "@Ada @Bea do the thing");
    assert.equal(applyHabitatMentions("@Ada  do the thing", ["Bea"]), "@Bea do the thing");
  });

  it("replaces incomplete leading @query; no body", () => {
    assert.equal(applyHabitatMentions("@Ad", ["Ada"]), "@Ada ");
  });

  it("no leading @ (mid-line incomplete) → replace, do not keep program text", () => {
    assert.equal(applyHabitatMentions("hi @p", ["Piper", "Scout"]), "@Piper @Scout ");
  });

  it("empty names strips leading @s and keeps body", () => {
    assert.equal(applyHabitatMentions("@Ada @Bea do X", []), "do X");
    assert.equal(applyHabitatMentions("@Ada ", []), "");
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

  it("fan-out multi @pals with same body", () => {
    const r = routeComposer("@Ada @Bea do X", { bots, selected: "console" });
    assert.equal(r.op, "fan-out");
    assert.equal(r.op === "fan-out" ? r.body : null, "do X");
    assert.deepEqual(
      r.op === "fan-out" ? r.bots.map((b) => b.name) : null,
      ["Ada", "Bea"],
    );
  });

  it("multi @ with empty body → select-pals (no empty task spam)", () => {
    const r = routeComposer("@Ada @Bea", { bots, selected: "console" });
    assert.equal(r.op, "select-pals");
    assert.deepEqual(
      r.op === "select-pals" ? r.bots.map((b) => b.id) : null,
      ["b1", "b4"],
    );
  });

  it("@all stays rally (unchanged)", () => {
    assert.equal(routeComposer("@all dig", { bots, selected: null }).op, "rally");
  });

  it("mixed @Ada @console falls back to single-mention on first token", () => {
    const r = routeComposer("@Ada @console do X", { bots, selected: "console" });
    assert.equal(r.op, "task");
    assert.equal(r.op === "task" ? r.bot.name : null, "Ada");
    assert.equal(r.op === "task" ? r.body : null, "@console do X");
  });

  it("unknown in multi run → unknown-mention (no silent skip)", () => {
    const r = routeComposer("@Ada @Nope do X", { bots, selected: "console" });
    assert.equal(r.op, "unknown-mention");
    assert.equal(r.op === "unknown-mention" ? r.token : null, "Nope");
  });

  it("more than MAX_PARALLEL named → fan-out-cap (no partial start)", () => {
    assert.equal(MAX_PARALLEL, 4);
    const r = routeComposer("@Ada @Bea @Piper @Scout @Cara dig", { bots, selected: "console" });
    assert.equal(r.op, "fan-out-cap");
    assert.equal(r.op === "fan-out-cap" ? r.count : null, 5);
    assert.equal(r.op === "fan-out-cap" ? r.max : null, 4);
  });

  it("opts.maxParallel from host-config overrides default cap", () => {
    const r = routeComposer("@Ada @Bea @Piper @Scout @Cara dig", {
      bots,
      selected: "console",
      maxParallel: 6,
    });
    assert.equal(r.op, "fan-out");
    assert.equal(r.op === "fan-out" ? r.bots.length : null, 5);
  });

  it("dedupes repeated pal in fan-out", () => {
    const r = routeComposer("@Ada @Ada do X", { bots, selected: "console" });
    assert.equal(r.op, "fan-out");
    assert.equal(r.op === "fan-out" ? r.bots.length : null, 1);
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
