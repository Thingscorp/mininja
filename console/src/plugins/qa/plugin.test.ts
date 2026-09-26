import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cardFor } from "../../lib/mininja.ts";

describe("qa program", () => {
  it("default is the register sidecar", () => {
    const card = cardFor("qa");
    assert.equal(card.title, "qa");
    assert.ok(card.rows?.some((r) => r.startsWith("qa KIT-") || r.startsWith("qa CON-") || r.startsWith("qa BOT-")));
  });

  it("discover lists monorepo feature ids", () => {
    const rows = cardFor("qa discover").rows ?? [];
    assert.ok(rows.some((r) => r === "qa KIT-MARK-001"));
    assert.ok(rows.some((r) => r.startsWith("qa CON-")));
  });

  it("inspects a feature by id including itself", () => {
    const card = cardFor("qa KIT-MARK-001");
    assert.equal(card.title, "KIT-MARK-001");
    assert.match(card.bottom ?? "", /mascot|kit|brand/i);
    assert.equal(cardFor("qa CON-PLUG-007").title, "CON-PLUG-007");
  });
});
