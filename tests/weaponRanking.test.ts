import { describe, expect, it } from "vitest";
import rawLimits from "../src/data/status-limits.json";
import rawStatus from "../src/data/weapon-status.json";
import { StatusLimits, WeaponStatusFile } from "../src/data/schema";
import { namedWeapons } from "../scripts/lib/weaponStatus";
import { weapons } from "../src/ui/data";
import {
  aegisCell,
  causeLabel,
  comesIn,
  damageRanks,
  openCount,
  quantumCell,
  quantumLight,
  quantumTitle,
  rankWeapons,
  type WeaponRow,
} from "../src/ui/weaponRanking";
import { readFileSync } from "node:fs";

const rows = WeaponStatusFile.parse(rawStatus).weapons;
const limits = StatusLimits.parse(rawLimits);

const make = (
  name: string,
  status: WeaponRow["status"],
  s10: number,
  s30: number,
  s60: number,
  extra: Partial<WeaponRow> = {},
): WeaponRow => ({
  ...rows[0],
  id: name,
  name,
  status,
  damage: { base: { s10, s30, s60 }, catalyst: null },
  sentences: [],
  ...extra,
});
const quantum = (deviation: number) => ({ row: "r", measured: 100, model: 100 * (1 + deviation), deviation });
const checked = (...deviations: (number | null)[]) => ({
  check: "checked" as const,
  rows: deviations.map((deviation) => ({ row: "a", assumptions: [], measured: 1, model: 1, deviation })),
});
const small = [
  make("Alpha", "complete", 100, 300, 900, { quantum: quantum(0.01), trust: "measured", aegis: checked(0.05) }),
  make("Bravo", "partial", 300, 200, 100, { quantum: null, trust: "estimated", aegis: checked(-0.1, 0.02) }),
  make("Charlie", "estimated", 200, 100, 500, {
    quantum: quantum(-0.04),
    trust: "derived",
    aegis: { check: "no independent check", rows: [] },
    sentences: [{ text: "a", state: "open" }, { text: "b", state: "rule" }, { text: "c", state: "open" }],
  }),
];
const names = (list: WeaponRow[]) => list.map((r) => r.name);

describe("rankWeapons", () => {
  it("sorts by the damage of the chosen time, descending by default", () => {
    expect(names(rankWeapons(small, { sort: "damage", time: "s10" }))).toEqual(["Bravo", "Charlie", "Alpha"]);
    expect(names(rankWeapons(small, { sort: "damage", time: "s30" }))).toEqual(["Alpha", "Bravo", "Charlie"]);
    expect(names(rankWeapons(small, { sort: "damage", time: "s60" }))).toEqual(["Alpha", "Charlie", "Bravo"]);
  });

  it("reverses the order and sorts by name", () => {
    expect(names(rankWeapons(small, { sort: "damage", time: "s10", ascending: true }))).toEqual(["Alpha", "Charlie", "Bravo"]);
    expect(names(rankWeapons(small, { sort: "name", time: "s10", ascending: true }))).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("sorts by status, trust and the number of open sentences", () => {
    expect(names(rankWeapons(small, { sort: "status", time: "s10" }))).toEqual(["Charlie", "Bravo", "Alpha"]);
    expect(names(rankWeapons(small, { sort: "trust", time: "s10", ascending: true }))).toEqual(["Alpha", "Charlie", "Bravo"]);
    expect(names(rankWeapons(small, { sort: "open", time: "s10" }))[0]).toBe("Charlie");
  });

  it("sorts by the size of the deviation and puts rows without a value last in both directions", () => {
    expect(names(rankWeapons(small, { sort: "quantum", time: "s10" }))).toEqual(["Charlie", "Alpha", "Bravo"]);
    expect(names(rankWeapons(small, { sort: "quantum", time: "s10", ascending: true }))).toEqual(["Alpha", "Charlie", "Bravo"]);
    expect(names(rankWeapons(small, { sort: "aegis", time: "s10" }))).toEqual(["Bravo", "Alpha", "Charlie"]);
    expect(names(rankWeapons(small, { sort: "aegis", time: "s10", ascending: true }))).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("filters by status and by name", () => {
    expect(names(rankWeapons(small, { sort: "damage", time: "s10", status: "partial" }))).toEqual(["Bravo"]);
    expect(names(rankWeapons(small, { sort: "damage", time: "s10", text: "ARL" }))).toEqual(["Charlie"]);
    expect(names(rankWeapons(small, { sort: "damage", time: "s10", status: "all", text: " " }))).toHaveLength(3);
  });

  it("does not change the input", () => {
    const copy = [...small];
    rankWeapons(small, { sort: "damage", time: "s60" });
    expect(small).toEqual(copy);
  });

  it("ranks the real file: sorted by the chosen time", () => {
    for (const time of ["s10", "s30", "s60"] as const) {
      const ranked = rankWeapons(rows, { sort: "damage", time });
      expect(ranked).toHaveLength(rows.length);
      for (let i = 1; i < ranked.length; i++) {
        expect(ranked[i - 1].damage.base[time]).toBeGreaterThanOrEqual(ranked[i].damage.base[time]);
      }
    }
  });
});

describe("damageRanks", () => {
  it("gives rank 1 to the most damage of the chosen time, independent of the sort", () => {
    expect(damageRanks(small, "s10").get("Bravo")).toBe(1);
    expect(damageRanks(small, "s60").get("Alpha")).toBe(1);
    expect(damageRanks(small, "s60").get("Bravo")).toBe(3);
  });
});

describe("quantumLight (limits of status-limits.json)", () => {
  it("has a derived source for the upper limit", () => {
    expect(limits.quantumRed).toBeGreaterThan(limits.quantumDeviation);
    expect(limits.quantumRedSource.status).toBe("derived");
  });

  it("is green up to the dead zone, yellow up to the red limit, red above (both signs)", () => {
    const { quantumDeviation: g, quantumRed: r } = limits;
    expect(quantumLight(0, limits).color).toBe("green");
    expect(quantumLight(g, limits).color).toBe("green");
    expect(quantumLight(-g, limits).color).toBe("green");
    expect(quantumLight(g + 0.0001, limits).color).toBe("yellow");
    expect(quantumLight(-(g + 0.0001), limits).color).toBe("yellow");
    expect(quantumLight(r, limits).color).toBe("yellow");
    expect(quantumLight(r + 0.0001, limits).color).toBe("red");
    expect(quantumLight(-(r + 0.0001), limits).color).toBe("red");
  });

  it("shows no colour but the text 'no row' without a Quantum row", () => {
    expect(quantumLight(null, limits)).toEqual({ color: null, label: "no row" });
  });

  it("writes the deviation with sign and one decimal", () => {
    expect(quantumLight(0.0123, limits).label).toBe("+1.2 %");
    expect(quantumLight(-0.05, limits).label).toBe("-5.0 %");
  });

  it("Cloudstrike is green, 0 % from Quantum", () => {
    const cloudstrike = rows.find((r) => r.name === "Cloudstrike");
    expect(quantumLight(cloudstrike?.quantum?.deviation ?? null, limits).color).toBe("green");
  });
});

describe("quantumCell", () => {
  const circular = (deviation: number) => ({
    ...rows[0],
    quantum: { ...quantum(deviation), rowNote: "", basis: "total" as const, circular: true, catalystRow: false, factors: null },
  });

  it("does not show a weapon that reads its row as green", () => {
    expect(quantumCell(circular(0), limits)).toEqual({ color: null, label: "reads Quantum" });
  });

  it("keeps the light for a real comparison and for no row", () => {
    expect(quantumCell(rows.find((r) => r.name === "Cloudstrike")!, limits).color).toBe("green");
    expect(quantumCell(rows.find((r) => r.name === "Hawkmoon")!, limits).color).toBe("red");
    expect(quantumCell(rows.find((r) => r.name === "Black Talon")!, limits)).toEqual({ color: null, label: "no row" });
  });

  it("the real file: no weapon that reads its row is green any more", () => {
    const reading = rows.filter((r) => r.quantum?.circular);
    expect(reading.length).toBeGreaterThan(0);
    for (const r of reading) expect(quantumCell(r, limits).color, r.name).toBeNull();
  });
});

describe("the column Why off", () => {
  it("has a label for every class of the file and sorts by it", () => {
    for (const r of rows) expect(causeLabel(r), r.name).not.toBe("");
    const sorted = rankWeapons(rows, { sort: "cause", time: "s30", ascending: true }).map(causeLabel);
    expect(sorted).toEqual([...sorted].sort((a, b) => a.localeCompare(b)));
  });

  it("names the classes in plain words", () => {
    const of = (name: string) => causeLabel(rows.find((r) => r.name === name)!);
    expect(of("Duality")).toBe("Counting");
    expect(of("Thorn")).toBe("Rule too strong");
    expect(of("Divinity")).toBe("Wrong row or variant");
    expect(of("Hawkmoon")).toBe("Mechanic missing");
    expect(of("The Colony")).toBe("Reads Quantum");
    expect(of("Black Talon")).toBe("No check");
  });

  it("tells in the tooltip when Quantum has only the catalyst row", () => {
    const hawkmoon = rows.find((r) => r.name === "Hawkmoon")!;
    expect(quantumTitle(hawkmoon)).toContain("catalyst");
    expect(quantumTitle(rows.find((r) => r.name === "Cloudstrike")!)).not.toContain("only the catalyst");
    expect(quantumTitle(rows.find((r) => r.name === "Black Talon")!)).toBeUndefined();
  });
});

describe("cells", () => {
  it("shows the largest Aegis deviation, or why there is no check", () => {
    expect(aegisCell(small[0]).text).toBe("+5.0 %");
    expect(aegisCell(small[1])).toEqual({ text: "-10.0 % (2 rows)", deviation: -0.1 });
    expect(aegisCell(small[2])).toEqual({ text: "no independent check", deviation: null });
    expect(aegisCell(make("X", "partial", 1, 1, 1, { aegis: { check: "no row", rows: [] } })).text).toBe("no row");
  });

  it("counts open sentences and names the block that brings a weapon", () => {
    expect(openCount(small[2])).toBe(2);
    expect(comesIn(make("X", "partial", 1, 1, 1, { planBlock: "M3" }))).toBe("Comes in M3");
    expect(comesIn(make("X", "partial", 1, 1, 1, { planBlock: null }))).toBeNull();
  });

  it("the real file shows 'no independent check' for a weapon that only has fitted rows", () => {
    const texts = rows.map((r) => aegisCell(r).text);
    expect(texts).toContain("no independent check");
  });
});

describe("coverage of the table", () => {
  it("has a row for every exotic weapon of the game data", () => {
    expect(rows.map((r) => r.id).sort()).toEqual(weapons.map((w) => w.id).sort());
  });

  it("shows 'Comes in <block>' for every weapon that an open block of the plan names", () => {
    const plan = readFileSync(new URL("../docs/plans/current.md", import.meta.url), "utf8");
    const names = rows.map((r) => r.name);
    for (const line of plan.split("\n").filter((l) => l.startsWith("- [ ] "))) {
      for (const name of namedWeapons(line, names)) {
        expect(comesIn(rows.find((r) => r.name === name)!)).not.toBeNull();
      }
    }
  });
});
