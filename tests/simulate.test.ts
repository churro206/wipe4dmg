import fc from "fast-check";
import { describe, expect, it } from "vitest";
import raw from "../src/data/weapons/one-thousand-voices.json";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

const weapon = loadWeapon(raw);
// Expected values come from the data file, so the tests contain no game values.
const chargeTimeMs = weapon.chargeTimeMs.value!;
const magazine = weapon.magazine.value!;
const reloadTimeMs = weapon.reloadTimeMs.value!;

describe("simulate", () => {
  it("returns no shots for a damage phase of 0 seconds", () => {
    expect(simulate(weapon, 0)).toEqual([]);
  });

  it("reloads after the last shot of a magazine", () => {
    const shots = simulate(weapon, 60);
    expect(shots.length).toBeGreaterThan(magazine);

    for (let i = 1; i < magazine; i++) {
      expect(shots[i].timeMs - shots[i - 1].timeMs).toBe(chargeTimeMs);
    }
    expect(shots[magazine].timeMs - shots[magazine - 1].timeMs).toBe(
      reloadTimeMs + chargeTimeMs,
    );
  });

  it.each([0.5, 1, 4, 7.47, 30, 120])(
    "keeps every shot inside a damage phase of %s seconds",
    (damagePhaseSeconds) => {
      for (const shot of simulate(weapon, damagePhaseSeconds)) {
        expect(shot.timeMs).toBeGreaterThanOrEqual(0);
        expect(shot.timeMs).toBeLessThanOrEqual(damagePhaseSeconds * 1000);
      }
    },
  );

  it("never returns fewer shots for a longer damage phase", () => {
    const seconds = fc.double({ min: 0, max: 600, noNaN: true });
    fc.assert(
      fc.property(seconds, seconds, (a, b) => {
        const [shorter, longer] = a <= b ? [a, b] : [b, a];
        return (
          simulate(weapon, shorter).length <= simulate(weapon, longer).length
        );
      }),
    );
  });

  it.each(["chargeTimeMs", "magazine", "reloadTimeMs"] as const)(
    "rejects a weapon whose %s is missing",
    (field) => {
      const incomplete = structuredClone(weapon);
      incomplete[field].value = null;
      expect(() => simulate(incomplete, 30)).toThrow(field);
    },
  );

  it.each([
    ["chargeTimeMs", 0],
    ["magazine", 0],
    ["magazine", 1.5],
  ] as const)("rejects a weapon with %s = %s", (field, value) => {
    const invalid = structuredClone(weapon);
    invalid[field].value = value;
    expect(() => simulate(invalid, 30)).toThrow(field);
  });
});
