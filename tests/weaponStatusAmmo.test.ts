// V1: "vs Quantum" runs the weapon until its total shots are fired, within a fixed 120 s. The limit must
// not cut shots off, or the model total would be too low (a false negative against Quantum). The guard:
// a phase of 3600 s fires no further shot for any weapon with a Quantum row. (Choir of One and Truth fire
// fewer shots than Quantum's total in both phases: that is not the limit.)

import { describe, expect, it } from "vitest";
import rawQuantum from "../src/data/quantum-weapons.json";
import { QuantumWeaponSnapshot } from "../src/data/schema";
import { weapons } from "../src/ui/data";
import { bareWeaponRun } from "../src/ui/weaponBuild";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const quantum = QuantumWeaponSnapshot.parse(rawQuantum).rows;

describe("the run of the weapon status against Quantum", () => {
  it("is not cut by the time limit of 120 s for any weapon", () => {
    const cut: string[] = [];
    for (const w of weapons) {
      const q = quantum.find(
        (r) => norm(r.name) === norm(w.name) && r.variant === "" && r.totalDamage !== null && r.totalShots,
      );
      if (!q) continue;
      const short = bareWeaponRun(w, false, 120, q.totalShots!);
      const long = bareWeaponRun(w, false, 3600, q.totalShots!);
      if (long.shots.length !== short.shots.length) cut.push(`${w.name}: ${short.shots.length} of ${long.shots.length}`);
    }
    expect(cut).toEqual([]);
  });
});
