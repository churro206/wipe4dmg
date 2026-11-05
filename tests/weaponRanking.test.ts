import { describe, expect, it } from "vitest";
import rawStatus from "../src/data/weapon-status.json";
import { WeaponStatusFile } from "../src/data/schema";
import { lightOf, rankWeapons } from "../src/ui/weaponRanking";

const rows = WeaponStatusFile.parse(rawStatus).weapons;

const make = (name: string, status: "complete" | "partial" | "estimated", s10: number, s30: number, s60: number) =>
  ({ ...rows[0], id: name, name, status, damage: { base: { s10, s30, s60 }, catalyst: null } });
const small = [
  make("Alpha", "complete", 100, 300, 900),
  make("Bravo", "partial", 300, 200, 100),
  make("Charlie", "estimated", 200, 100, 500),
];

describe("rankWeapons", () => {
  it("sorts by the damage of the chosen time, descending by default", () => {
    expect(rankWeapons(small, { sort: "s10" }).map((r) => r.name)).toEqual(["Bravo", "Charlie", "Alpha"]);
    expect(rankWeapons(small, { sort: "s30" }).map((r) => r.name)).toEqual(["Alpha", "Bravo", "Charlie"]);
    expect(rankWeapons(small, { sort: "s60" }).map((r) => r.name)).toEqual(["Alpha", "Charlie", "Bravo"]);
  });

  it("reverses the order and sorts by name", () => {
    expect(rankWeapons(small, { sort: "s10", ascending: true }).map((r) => r.name)).toEqual(["Alpha", "Charlie", "Bravo"]);
    expect(rankWeapons(small, { sort: "name", ascending: true }).map((r) => r.name)).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("filters by status and by name", () => {
    expect(rankWeapons(small, { sort: "s10", status: "partial" }).map((r) => r.name)).toEqual(["Bravo"]);
    expect(rankWeapons(small, { sort: "s10", text: "ARL" }).map((r) => r.name)).toEqual(["Charlie"]);
  });

  it("does not change the input", () => {
    const copy = [...small];
    rankWeapons(small, { sort: "s60" });
    expect(small).toEqual(copy);
  });

  it("ranks the real file: sorted, and every row has a light from its status", () => {
    const ranked = rankWeapons(rows, { sort: "s60" });
    expect(ranked).toHaveLength(rows.length);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].damage.base.s60).toBeGreaterThanOrEqual(ranked[i].damage.base.s60);
    }
    expect(rows.map((r) => lightOf(r.status))).not.toContain(undefined);
  });
});

describe("lightOf", () => {
  it("maps the computed status of the data file to a traffic light", () => {
    expect(lightOf("complete").color).toBe("green");
    expect(lightOf("partial").color).toBe("yellow");
    expect(lightOf("estimated").color).toBe("red");
  });
});
