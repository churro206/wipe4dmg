import { describe, expect, it } from "vitest";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

// Primary ammo is unlimited (Quantum "Primaries": reserves "inf"): the weapon fires with reloads
// until the end of the damage phase instead of stopping after totalShots.
const special = { ...loadWeapon(raw), intrinsicParts: [] };
const primary = {
  ...special,
  ammo: "primary" as const,
  totalShots: {
    value: null,
    source: { ...special.totalShots.source, note: "unlimited (Quantum: inf)" },
  },
};

describe("primary ammo", () => {
  it("fires until the end of the damage phase", () => {
    const limited = simulate(special, 300).shots.length;
    const unlimited = simulate(primary, 300).shots;
    expect(unlimited.length).toBeGreaterThan(limited);
    // the next shot would come after the end of the damage phase
    const last = unlimited[unlimited.length - 1].timeMs;
    expect(last).toBeLessThanOrEqual(300_000);
    expect(simulate(primary, 400).shots.length).toBeGreaterThan(unlimited.length);
  });

  it("still needs totalShots for special and heavy ammo", () => {
    expect(() =>
      simulate({ ...special, totalShots: primary.totalShots }, 10),
    ).toThrow("totalShots");
  });
});
