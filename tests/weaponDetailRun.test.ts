// V3: the expanded row of the weapon table and the table itself run one build (titan, arc, no
// selections) through buildSimulation, so the curve ends where the table's number is.

import { describe, expect, it } from "vitest";
import rawStatus from "../src/data/weapon-status.json";
import { WeaponStatusFile } from "../src/data/schema";
import { damageCurve } from "../src/engine/analysis";
import { weapons } from "../src/ui/data";
import { magazineChain } from "../src/ui/weaponTimeline";
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
    for (const [key, seconds] of [["s10", 10], ["s30", 30], ["s60", 60]] as const) {
      it(`${id}: the end of the curve in ${seconds} s is the table value`, () => {
        const run = bareWeaponRun(weaponOf(id), false, seconds);
        const curve = damageCurve(run, seconds);
        const table = status.find((w) => w.id === id)!.damage.base[key];
        expect(Math.round(curve[curve.length - 1].totalDamage * 10) / 10).toBeCloseTo(table, 1);
      });
    }
  }
});
