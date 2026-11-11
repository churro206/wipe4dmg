// W8 (Plan W): missing mechanics over 2 %, one part per type. Each weapon is checked against a
// measured row it does not come from (Quantum or Aegis); a gap that stays is a finding in
// docs/known-inaccuracies.md.

import { describe, expect, it } from "vitest";
import rawStatus from "../src/data/weapon-status.json";
import { weaponById } from "../src/ui/data";
import { bareWeaponRun } from "../src/ui/weaponBuild";

const statusOf = (id: string) => rawStatus.weapons.find((w) => w.id === id)!;
const aegisRow = (id: string, row: string) => statusOf(id).aegis.rows.find((r) => r.row === row)!;

describe("W8 part 1: charge from hits", () => {
  // By hand from Clarity (Paracausal Shot): shots 2 to 8 carry 1 to 7 stacks of Paracausal Charge
  // (21 % ... 66 %), the final round of the catalyst magazine of 9 is Paracausal Shot at 7 stacks
  // (+1736 %) instead. 97 per precision hit (Quantum).
  const charge = [0, 21, 36.5, 48, 55, 60, 63, 66];
  const byHand = 97 * (charge.reduce((s, p) => s + 1 + p / 100, 0) + 1 + 1736 / 100);

  it("Hawkmoon: a catalyst magazine is 8 charged shots and one Paracausal Shot", () => {
    const run = bareWeaponRun(weaponById("hawkmoon"), true, 120, 9);
    expect(run.totalDamage / byHand).toBeCloseTo(1, 3);
  });

  it("Hawkmoon: Quantum's row (x7 Paracausal Shot) lies 4 % below the text (finding)", () => {
    expect(statusOf("hawkmoon").quantum!.rowNote).toContain("Paracausal Shot");
    expect(byHand / 2785 - 1).toBeCloseTo(0.04, 2);
  });

  it("Hawkmoon: the stacks start over after the reload", () => {
    const run = bareWeaponRun(weaponById("hawkmoon"), false, 120, 9);
    const hits = [...run.damageInstances].sort((a, b) => a.timeMs - b.timeMs);
    expect(hits[8]!.damage).toBeCloseTo(97, 0);
  });

  // Whispered Breathing (catalyst): 35 % precision damage and 10.77 % against combatants.
  it("Whisper of the Worm: Whispered Breathing lies within 2 % of the Aegis row", () => {
    const r = aegisRow("whisper-of-the-worm", "sniper-rifle-whisper-of-the-worm-whispered-breathing");
    expect(Math.abs(r.deviation!)).toBeLessThan(0.02);
  });

  // White Nail refills the magazine after 3 precision hits: no reload, 37 shots at 72 RPM in 30 s.
  it("Whisper of the Worm: White Nail keeps firing without a reload", () => {
    const perShot = 850; // Quantum precision damage of the plain row
    expect(statusOf("whisper-of-the-worm").damage.base.s30).toBeGreaterThanOrEqual(36 * perShot);
  });
});
