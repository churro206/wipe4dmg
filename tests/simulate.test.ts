import fc from "fast-check";
import { describe, expect, it } from "vitest";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";
import type { ImportPart } from "../scripts/lib/partRules";
import { shotsOnly as shotsOnlyOf, withPartRules } from "./support/testWeapon";

// Without scorch, ignition and seekers: these tests check the damage of the shots only.
const weapon = shotsOnlyOf(loadWeapon(raw));
const shotsOnly = weapon;
// Expected values come from the data files, so the tests contain no game values.
const chargeTimeMs = weapon.chargeTimeMs.value!;
const shotIntervalMs = 60_000 / weapon.fireRateRpm.value!;
const magazine = weapon.magazine.value!;
const totalShots = weapon.totalShots.value!;
const reloadTimeMs = weapon.reloadTimeMs.value!;

// Long enough to fire every shot.
const LONG_DAMAGE_PHASE_SECONDS = 600;

describe("simulate: shots", () => {
  it("returns nothing for a damage phase of 0 seconds", () => {
    expect(simulate(weapon, 0)).toEqual({
      shots: [],
      reloadsMs: [],
      refillsMs: [],
      damageInstances: [],
      superWindows: [],
      totalDamage: 0,
      dps: 0,
    });
  });

  it("fires the first shot after the charge time", () => {
    const { shots } = simulate(weapon, LONG_DAMAGE_PHASE_SECONDS);
    expect(shots[0].timeMs).toBe(chargeTimeMs);
  });

  it("spaces shots within a magazine by the shot interval", () => {
    const { shots } = simulate(weapon, LONG_DAMAGE_PHASE_SECONDS);
    for (let i = 1; i < magazine; i++) {
      expect(shots[i].timeMs - shots[i - 1].timeMs).toBeCloseTo(shotIntervalMs);
    }
  });

  it("reloads after the last shot of a magazine", () => {
    const { shots } = simulate(weapon, LONG_DAMAGE_PHASE_SECONDS);
    expect(shots[magazine].timeMs - shots[magazine - 1].timeMs).toBeCloseTo(
      shotIntervalMs + reloadTimeMs,
    );
  });

  it("never fires more than the total shots", () => {
    const { shots } = simulate(weapon, LONG_DAMAGE_PHASE_SECONDS);
    expect(shots).toHaveLength(totalShots);
  });

  it("ends the shots at the shot limit, also for primary ammo", () => {
    const limit = magazine + 1;
    const { shots } = simulate(weapon, LONG_DAMAGE_PHASE_SECONDS, [], [], {
      shotLimit: limit,
    });
    expect(shots).toHaveLength(limit);
    const primary = { ...weapon, ammo: "primary" as const };
    expect(
      simulate(primary, LONG_DAMAGE_PHASE_SECONDS, [], [], { shotLimit: limit })
        .shots,
    ).toHaveLength(limit);
    expect(
      simulate(weapon, LONG_DAMAGE_PHASE_SECONDS, [], [], {
        shotLimit: totalShots + 1,
      }).shots,
    ).toHaveLength(totalShots);
  });

  it.each([0.5, 1, 4, 7.47, 20, 120])(
    "keeps every shot and damage instance inside a damage phase of %s seconds",
    (damagePhaseSeconds) => {
      const result = simulate(weapon, damagePhaseSeconds);
      for (const event of [...result.shots, ...result.damageInstances]) {
        expect(event.timeMs).toBeGreaterThanOrEqual(0);
        expect(event.timeMs).toBeLessThanOrEqual(damagePhaseSeconds * 1000);
      }
    },
  );

  it("never returns fewer shots or less total damage for a longer damage phase", () => {
    const seconds = fc.double({ min: 0, max: 60, noNaN: true });
    fc.assert(
      fc.property(seconds, seconds, (a, b) => {
        const shorter = simulate(weapon, Math.min(a, b));
        const longer = simulate(weapon, Math.max(a, b));
        return (
          shorter.shots.length <= longer.shots.length &&
          shorter.totalDamage <= longer.totalDamage
        );
      }),
    );
  });
});

describe("simulate: damage", () => {
  it("creates the damage instances of each shot at the shot time plus delay", () => {
    const withDelay = structuredClone(shotsOnly);
    withDelay.damageInstances[0].delayMs.value = 500;
    const { shots, damageInstances } = simulate(
      withPartRules(withDelay),
      LONG_DAMAGE_PHASE_SECONDS,
    );
    expect(damageInstances).toHaveLength(shots.length);
    damageInstances.forEach((instance, i) => {
      expect(instance.timeMs).toBe(shots[i].timeMs + 500);
      expect(instance.damage).toBe(
        weapon.damageInstances[0].damagePerTick.value,
      );
    });
  });

  it("creates one damage instance per tick", () => {
    const withTicks = structuredClone(shotsOnly);
    withTicks.damageInstances[0].ticks.value = 3;
    withTicks.damageInstances[0].tickIntervalMs.value = 250;
    const { shots, damageInstances } = simulate(
      withPartRules(withTicks),
      LONG_DAMAGE_PHASE_SECONDS,
    );
    expect(damageInstances).toHaveLength(shots.length * 3);
    expect(damageInstances.slice(0, 3).map((d) => d.timeMs)).toEqual([
      shots[0].timeMs,
      shots[0].timeMs + 250,
      shots[0].timeMs + 500,
    ]);
  });

  it("counts a shot whose delayed damage falls after the damage phase, but not its damage", () => {
    const withDelay = structuredClone(shotsOnly);
    withDelay.damageInstances[0].delayMs.value = 500;
    const result = simulate(withPartRules(withDelay), chargeTimeMs / 1000);
    expect(result.shots).toHaveLength(1);
    expect(result.damageInstances).toEqual([]);
    expect(result.totalDamage).toBe(0);
  });

  it("computes the DPS as total damage per second of the damage phase", () => {
    const result = simulate(weapon, 20);
    expect(result.dps).toBeCloseTo(result.totalDamage / 20);
  });

  it("sums all damage instances into the total damage", () => {
    const { damageInstances, totalDamage } = simulate(weapon, 10);
    const sum = damageInstances.reduce((total, d) => total + d.damage, 0);
    expect(totalDamage).toBe(sum);
    expect(totalDamage).toBeGreaterThan(0);
  });

  it("ignores damage instances that require the catalyst", () => {
    const withCatalystInstance = structuredClone(weapon);
    const catalystOnly: ImportPart = {
      ...structuredClone(weapon.damageInstances[0]),
      id: "catalystOnly",
      requiresCatalyst: true,
    };
    withCatalystInstance.damageInstances.push(catalystOnly);
    expect(simulate(withPartRules(withCatalystInstance), 10)).toEqual(
      simulate(weapon, 10),
    );
  });

  it("includes damage instances that require the catalyst when it is selected", () => {
    const withCatalystInstance = structuredClone(shotsOnly);
    const catalystOnly: ImportPart = {
      ...structuredClone(weapon.damageInstances[0]),
      id: "catalystOnly",
      requiresCatalyst: true,
    };
    withCatalystInstance.damageInstances.push(catalystOnly);
    const { damageInstances } = simulate(withPartRules(withCatalystInstance), 10, [], [], {
      catalyst: true,
    });
    expect(damageInstances.some((d) => d.id === "catalystOnly")).toBe(true);
  });
});

describe("simulate: invalid data", () => {
  it.each([
    "chargeTimeMs",
    "fireRateRpm",
    "magazine",
    "totalShots",
    "reloadTimeMs",
  ] as const)("rejects a weapon whose %s is missing", (field) => {
    const incomplete = structuredClone(weapon);
    incomplete[field].value = null;
    expect(() => simulate(incomplete, 30)).toThrow(field);
  });

  it.each(["delayMs", "damagePerTick", "ticks", "tickIntervalMs"] as const)(
    "rejects a damage instance whose %s is missing",
    (field) => {
      const incomplete = structuredClone(weapon);
      incomplete.damageInstances[0][field].value = null;
      expect(() => simulate(withPartRules(incomplete), 30)).toThrow(field);
    },
  );

  it.each([
    ["fireRateRpm", 0],
    ["magazine", 0],
    ["magazine", 1.5],
    ["totalShots", -1],
    ["totalShots", 1.5],
  ] as const)("rejects a weapon with %s = %s", (field, value) => {
    const invalid = structuredClone(weapon);
    invalid[field].value = value;
    expect(() => simulate(invalid, 30)).toThrow(field);
  });
});
