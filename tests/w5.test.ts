// W5 (Plan W): restored behaviour of weapons that Q1 switched off, one rule per category.
// Values by hand from the Clarity catalyst texts ("Increases Magazine Size by N (a🠚b)").

import { describe, expect, it } from "vitest";
import rawStatus from "../src/data/weapon-status.json";
import { weaponById } from "../src/ui/data";

// Quantum measures these weapons only with the catalyst magazine b (a "cata" row, or a plain row
// that assumes the catalyst); without the catalyst the magazine is a. The total ammo stays: Quantum's
// only weapon measured both ways, The Fourth Horseman, has 20 shots with magazine 4 and with 5.
const MAGAZINE_CATALYSTS: [id: string, without: number, withCatalyst: number][] = [
  ["arbalest", 5, 6],
  ["duality", 6, 8],
  ["eriana-s-vow", 6, 9],
  ["gjallarhorn", 1, 2],
  ["hawkmoon", 8, 9],
  ["telesto", 4, 7],
  ["the-fourth-horseman", 4, 5],
  ["tractor-cannon", 4, 7],
  ["traveler-s-chosen", 15, 17],
];

describe("W5: a catalyst that grows the magazine (Clarity a🠚b)", () => {
  it.each(MAGAZINE_CATALYSTS)("%s: magazine %i without, %i with the catalyst, same total ammo", (id, without, withCatalyst) => {
    const w = weaponById(id);
    expect(w.magazine.value).toBe(without);
    expect(w.catalyst?.effect).toBe("timing");
    const timing = w.catalyst!.timing!;
    expect(timing.magazine.value).toBe(withCatalyst);
    expect(timing.totalShots.value).toBe(w.totalShots.value);
  });
});

// Q1 dropped the package check "Aegis measures a whole burst" (Bad Juju 3 bullets, Vigilance Wing 5).
// The items fire bullet by bullet; the Aegis burst row is an independent check of the count.
describe("W5: burst primaries are counted bullet by bullet", () => {
  it.each([
    ["bad-juju", "pulse-rifle-bad-juju-burst"],
    ["vigilance-wing", "pulse-rifle-vigilance-wing-burst"],
  ])("%s lies within 2 %% of the Aegis burst row", (id, row) => {
    const w = rawStatus.weapons.find((x) => x.id === id)!;
    const r = w.aegis.rows.find((x) => x.row === row)!;
    expect(Math.abs(r.deviation!)).toBeLessThan(0.02);
  });
});

// Wish-Ender's twin is back in plausibility.test.ts ("3 Separate Enemies", ADR 0015).
describe("W5: catalysts without effect against one boss", () => {
  it("Vigilance Wing: Ensemble gives Handling and Reload Speed near an ally; the reload stat is 100 already (K1)", () => {
    expect(weaponById("vigilance-wing").catalyst!.effect).toBe("none");
  });
});
