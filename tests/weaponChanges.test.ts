// V4: "What changed" on the coverage page. The diff of two stands of weapon-status.json and the
// reader of an older stand from git (scripts/lib/weaponChangesGit.ts).

import { describe, expect, it } from "vitest";
import { WeaponChangesFile, WeaponStatusFile } from "../src/data/schema";
import rawChanges from "../src/data/weapon-changes.json";
import { changeText, diffWeaponStatus } from "../src/ui/weaponChanges";
import { baselineFor, statusAt } from "../scripts/lib/weaponChangesGit";

type Row = WeaponStatusFile["weapons"][number];

const dmg = (s10: number, s30: number, s60: number) => ({ s10, s30, s60 });
const row = (id: string, over: Partial<Row> = {}): Row =>
  ({
    id,
    name: id.toUpperCase(),
    status: "complete",
    trust: "measured",
    damage: { base: dmg(100, 300, 600), catalyst: null },
    ...over,
  }) as Row;

describe("diffWeaponStatus", () => {
  it("is empty for equal stands", () => {
    expect(diffWeaponStatus([row("a")], [row("a")])).toEqual([]);
  });

  it("names new and removed weapons", () => {
    const changes = diffWeaponStatus([row("a")], [row("b")]);
    expect(changes.map((c) => [c.kind, c.id])).toEqual([
      ["new", "b"],
      ["removed", "a"],
    ]);
  });

  it("reports the damage that moved most, with the time it belongs to", () => {
    const now = row("a", { damage: { base: dmg(100, 350, 610), catalyst: null } });
    const [change] = diffWeaponStatus([row("a")], [now]);
    expect(change).toMatchObject({ kind: "damage", time: "s30", catalyst: false, from: 300, to: 350 });
    expect(changeText(change!)).toBe("A 30 s: 300 → 350");
  });

  it("looks at the catalyst values when the base did not move", () => {
    const before = row("a", { damage: { base: dmg(1, 2, 3), catalyst: dmg(10, 20, 30) } });
    const now = row("a", { damage: { base: dmg(1, 2, 3), catalyst: dmg(10, 20, 60) } });
    const [change] = diffWeaponStatus([before], [now]);
    expect(changeText(change!)).toBe("A 60 s with Catalyst: 30 → 60");
  });

  it("ignores moves below 0.1 %", () => {
    const now = row("a", { damage: { base: dmg(100, 300.1, 600), catalyst: null } });
    expect(diffWeaponStatus([row("a")], [now])).toEqual([]);
  });

  it("reports a changed status", () => {
    const [change] = diffWeaponStatus([row("a")], [row("a", { status: "partial" })]);
    expect(changeText(change!)).toBe("A status: Complete → Partial");
  });
});

// The gate: against a stand from git. W2 (61c1fc8) moved Coldheart, Manticore and Fourth Horseman.
describe("the stand from git", () => {
  const before = statusAt("61c1fc8~1");
  const after = statusAt("61c1fc8");

  it("reads the stands of that commit", () => {
    expect(before.length).toBeGreaterThan(100);
    expect(after.length).toBeGreaterThan(before.length - 1);
  });

  it("shows what W2 changed", () => {
    const changes = diffWeaponStatus(before, after);
    const texts = changes.map(changeText);
    expect(texts).toContain("Coldheart 60 s: 14645 → 23816");
    expect(texts).toContain("The Manticore status: Estimated → Partial");
    expect(texts).toContain("The Fourth Horseman 30 s with Catalyst: 13520 → 17063");
    // Weapons W2 did not touch stay out.
    expect(changes.length).toBeLessThan(after.length / 2);
  });

  it("walks back to the last stand that differs", () => {
    const base = baselineFor(after);
    expect(diffWeaponStatus(base, after).length).toBeGreaterThan(0);
  });
});

describe("src/data/weapon-changes.json", () => {
  it("follows the schema", () => {
    const file = WeaponChangesFile.parse(rawChanges);
    expect(new Set(file.changes.map((c) => `${c.id}:${c.kind}`)).size).toBe(file.changes.length);
  });
});
