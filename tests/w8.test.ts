// W8 (Plan W): missing mechanics over 2 %, one part per type. Each weapon is checked against a
// measured row it does not come from (Quantum or Aegis); a gap that stays is a finding in
// docs/known-inaccuracies.md.

import { describe, expect, it } from "vitest";
import rawStatus from "../src/data/weapon-status.json";
import { simulate, type SimulationResult } from "../src/engine/simulate";
import { buckets, weaponById } from "../src/ui/data";
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
  // (the next test)
  it("Whisper of the Worm: the Sustained row lies within 2 % too", () => {
    const r = aegisRow("whisper-of-the-worm", "sustained-whisper-of-the-worm-whispered-breathing-sniper-s-meditation");
    expect(Math.abs(r.deviation!)).toBeLessThan(0.02);
  });
  it("Whisper of the Worm: White Nail keeps firing without a reload", () => {
    const perShot = 850; // Quantum precision damage of the plain row
    expect(statusOf("whisper-of-the-worm").damage.base.s30).toBeGreaterThanOrEqual(36 * perShot);
  });
});

describe("W8 part 2: super energy spent by a weapon", () => {
  // Will Given Form (catalyst, full super bar before the phase): the magazine of 97 overfills to
  // Quantum's 194, every hit +80 % (Clarity) until it is empty; then the reload and plain shots of 38.
  it("Ager's Scepter: 194 shots at x1.8, then the reload and plain shots", () => {
    const run = bareWeaponRun(weaponById("ager-s-scepter"), true, 120, 195);
    const hits = [...run.damageInstances].sort((a, b) => a.timeMs - b.timeMs);
    expect(hits).toHaveLength(195);
    expect(hits[193]!.damage).toBeCloseTo(38 * 1.8, 6);
    expect(hits[194]!.damage).toBeCloseTo(38, 6);
    expect(run.reloadsMs[0]).toBeLessThan(hits[194]!.timeMs);
  });

  it("Ager's Scepter: without the catalyst the magazine stays 97", () => {
    const run = bareWeaponRun(weaponById("ager-s-scepter"), false, 120, 98);
    expect(run.reloadsMs).toHaveLength(1);
    expect(run.totalDamage).toBeCloseTo(98 * 38, 6);
  });

  // Finding (known-inaccuracies): Aegis and Quantum both count about 20 to 30 % more per magazine
  it("Ager's Scepter: the Aegis row with Will Given Form lies 14 % above the model (finding)", () => {
    const r = aegisRow("ager-s-scepter", "trace-rifle-ager-s-scepter-average-will-given-form");
    expect(r.deviation).toBeCloseTo(-0.145, 2);
  });
});

describe("W8 part 3: states of the target and of the player", () => {
  const sorted = (run: SimulationResult) => [...run.damageInstances].sort((a, b) => a.timeMs - b.timeMs);

  // Repulsor Force: a higher tier Weaken (30 %, Strong Weaken) for 10 s on hit; the first hit lands before it
  it("Tractor Cannon: from the second shot on, every hit is weakened by 30 %", () => {
    const hits = sorted(bareWeaponRun(weaponById("tractor-cannon"), false, 30, 3));
    expect(hits[1]!.damage / hits[0]!.damage).toBeCloseTo(1.3, 6);
    expect(hits[2]!.damage / hits[0]!.damage).toBeCloseTo(1.3, 6);
  });

  // Phase Converter: ADS is a Rapid-Fire Pulse Rifle (Quantum's ADS row 48 at 540 RPM against 25 at 900)
  it("Lodestar: ADS is the default playstyle and lies within 2 % of Aegis' ADS burst row", () => {
    expect(weaponById("lodestar").playstyles?.[0]?.id).toBe("ads");
    const r = aegisRow("lodestar", "trace-rifle-lodestar-ads-burst");
    expect(Math.abs(r.deviation!)).toBeLessThan(0.02);
  });

  // Ravenous Beast, built before: Quantum's beast row (57, 900 RPM) for 8 s ÷ (1 − 1.75 ÷ 3.28) = 17.2 s,
  // then 50 plain hits (2 % each) charge it again
  it("Tarrabah: the beast holds about 17 s, then 50 plain shots charge the next", () => {
    const hits = sorted(bareWeaponRun(weaponById("tarrabah"), false, 60));
    const beast = hits.filter((h) => h.id === "shot-beast");
    const firstPlain = hits.findIndex((h) => h.id === "shot");
    expect(hits[0]!.damage).toBe(57);
    expect(hits[firstPlain]!.timeMs / 1000).toBeGreaterThan(17);
    expect(hits[firstPlain]!.timeMs / 1000).toBeLessThan(17.4);
    expect(hits.slice(firstPlain).findIndex((h) => h.id === "shot-beast")).toBe(50);
    expect(beast.every((h) => h.damage === 57)).toBe(true);
  });

  // Superconductor while Arc Conductor: +10 % and a 33 % chance per shot to refill (so no reload)
  it("Riskrunner: Arc Conductor gives x1.1 per hit and no reload", () => {
    const riskrunner = weaponById("riskrunner");
    const plain = simulate(riskrunner, 10, [], buckets);
    const conductor = simulate(riskrunner, 10, [], buckets, { playstyle: "arc-conductor" });
    expect(plain.reloadsMs.length).toBeGreaterThan(0);
    expect(conductor.reloadsMs).toHaveLength(0);
    expect(sorted(conductor)[0]!.damage / sorted(plain)[0]!.damage).toBeCloseTo(1.1, 6);
  });
});

describe("W8 part 4: extra parts", () => {
  // Excavation: 3 cluster bombs per grenade; Quantum's rows with and without them: (1080 − 675) ÷ 3
  it("The Prospector: every grenade adds 3 cluster bombs of 135", () => {
    const run = bareWeaponRun(weaponById("the-prospector"), false, 30, 1);
    const clusters = run.damageInstances.filter((d) => d.id === "cluster");
    expect(clusters).toHaveLength(3);
    for (const c of clusters) expect(c.damage).toBeCloseTo(135, 6);
  });

  // Vorpal Weapon (catalyst): +20 % for a primary against a boss
  it("Graviton Lance: the catalyst adds 20 % to every hit", () => {
    const plain = bareWeaponRun(weaponById("graviton-lance"), false, 10, 1);
    const vorpal = bareWeaponRun(weaponById("graviton-lance"), true, 10, 1);
    expect(vorpal.totalDamage / plain.totalDamage).toBeCloseTo(1.2, 6);
  });
});
