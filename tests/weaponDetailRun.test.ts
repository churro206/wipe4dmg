// V3: the expanded row of the weapon table and the table itself run one build (titan, arc, no
// selections) through buildSimulation, so the curve ends where the table's number is.

import { describe, expect, it } from "vitest";
import rawStatus from "../src/data/weapon-status.json";
import { WeaponStatusFile } from "../src/data/schema";
import { damageCurve } from "../src/engine/analysis";
import { weapons } from "../src/ui/data";
import { buffRows, magazineChain } from "../src/ui/weaponTimeline";
import { damageOf, damageRanks, rankWeapons } from "../src/ui/weaponRanking";
import { bareWeaponRun } from "../src/ui/weaponBuild";

const status = WeaponStatusFile.parse(rawStatus).weapons;
const weaponOf = (id: string) => weapons.find((w) => w.id === id)!;

describe("the run behind an expanded weapon row", () => {
  it("Vex Mythoclast shows the magazine chain 25, 20, 16, 13, 11, 9, 8 (through buildSimulation)", () => {
    const run = bareWeaponRun(weaponOf("vex-mythoclast"), false, 30);
    expect(run.refillsMs.length).toBeGreaterThanOrEqual(6);
    expect(magazineChain(run).slice(0, 7)).toEqual([25, 20, 16, 13, 11, 9, 8]);
  });

  for (const id of ["vex-mythoclast", "truth"]) {
    for (const catalyst of [false, true]) {
      for (const [key, seconds] of [["s10", 10], ["s30", 30], ["s60", 60]] as const) {
        it(`${id}: the end of the curve in ${seconds} s is the table value (catalyst ${catalyst ? "on" : "off"})`, () => {
          const run = bareWeaponRun(weaponOf(id), catalyst, seconds);
          const curve = damageCurve(run, seconds);
          const damage = status.find((w) => w.id === id)!.damage;
          const table = (catalyst ? damage.catalyst! : damage.base)[key];
          expect(Math.round(curve[curve.length - 1].totalDamage * 10) / 10).toBeCloseTo(table, 1);
        });
      }
    }
  }

  it("a weapon without a catalyst shows the same value in both positions", () => {
    const row = status.find((w) => w.damage.catalyst === null)!;
    expect(row).toBeDefined();
    expect(damageOf(row, "s30", true)).toBe(damageOf(row, "s30", false));
    const vex = status.find((w) => w.id === "vex-mythoclast")!;
    expect(damageOf(vex, "s30", true)).toBe(vex.damage.catalyst!.s30);
    expect(damageOf(vex, "s30", false)).toBe(vex.damage.base.s30);
  });

  it("the Catalyst switch ranks by the catalyst values", () => {
    const ranked = rankWeapons(status, { sort: "damage", time: "s30", catalyst: true });
    const values = ranked.map((r) => damageOf(r, "s30", true));
    expect(values).toEqual([...values].sort((a, b) => b - a));
    expect(damageRanks(status, "s30", true).get(ranked[0].id)).toBe(1);
  });

  it("Vex with the catalyst has a Calculated Balance row on the timeline, without it none", () => {
    const rowsOf = (catalyst: boolean) => buffRows(bareWeaponRun(weaponOf("vex-mythoclast"), catalyst, 30).buffLog, 30);
    expect(rowsOf(true).some((r) => r.label.startsWith("Calculated Balance"))).toBe(true);
    expect(rowsOf(false)).toEqual([]);
  });
});
