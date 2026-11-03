// Class abilities in the rotation (U7): casts on the energy timeline like grenades and melees.
// Marksman's Dodge reloads the weapon (Compendium: "reloads all weapons"), Rally Barricade gives
// a 0.9x Reload Duration Multiplier for its 20 s, Empowering Rift its 20 % for 15 s.

import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import type { Ability, Build } from "../src/data/schema";
import { buildSimulation, nextCastFor } from "../src/engine/buildSimulation";
import { loadBuckets } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { shotsOnly } from "./support/testWeapon";
import { simulate } from "../src/engine/simulate";
import { gameData, weaponById } from "../src/ui/data";
import raw from "./fixtures/one-thousand-voices-hand-model.json";

// Without intrinsic parts (scorch, ignition): only the shot plan matters here.
const weapon = shotsOnly(loadWeapon(raw));
const buckets = loadBuckets(rawBuckets);
const shotIntervalMs = 60_000 / weapon.fireRateRpm.value!;
const magazine = weapon.magazine.value!;
const reloadMs = weapon.reloadTimeMs.value!;
const DAMAGE_PHASE_SECONDS = 60;

/** A class ability that reloads the weapon; test input, not game data. */
const dodge: Ability = {
  id: "test-dodge",
  code: 9001,
  name: "test",
  kind: "classAbility",
  element: "kinetic",
  providers: [{ kind: "subclass" }],
  components: [],
  rules: [{ id: "refill", on: { on: "cast" }, do: [{ type: "refill" }] }],
};
const shotsWith = (castsMs: number[]) =>
  simulate(weapon, DAMAGE_PHASE_SECONDS, [], buckets, {
    abilities: [{ ability: dodge, castsMs }],
  }).shots.map((s) => s.timeMs);
const plain = shotsWith([]);
const lastOfFirstMagazine = plain[magazine - 1];

describe("simulate: a cast that refills the magazine", () => {
  it("skips the reload when cast at the last shot of a magazine", () => {
    const shots = shotsWith([lastOfFirstMagazine]);
    expect(shots[magazine] - shots[magazine - 1]).toBeCloseTo(shotIntervalMs);
  });

  it("cuts a running reload short", () => {
    const castMs = lastOfFirstMagazine + shotIntervalMs + reloadMs / 2;
    expect(shotsWith([castMs])[magazine]).toBeCloseTo(castMs);
  });

  it("tops up a magazine, so the next reload comes later", () => {
    const shots = shotsWith([plain[0]]);
    // the first magazine now holds one extra shot before its reload
    expect(shots[magazine] - shots[magazine - 1]).toBeCloseTo(shotIntervalMs);
    expect(shots[magazine + 1] - shots[magazine]).toBeGreaterThan(shotIntervalMs + 1);
  });

  it("changes nothing without casts", () => {
    expect(plain[magazine] - plain[magazine - 1]).toBeCloseTo(shotIntervalMs + reloadMs);
  });
});

const hunter = (fields: Partial<Build>): Build => ({
  weaponId: "gjallarhorn",
  guardianClass: "hunter",
  subclass: "solar",
  catalyst: false,
  selections: [],
  effectWindows: {},
  damagePhaseSeconds: 30,
  ...fields,
});
// Time of the first rocket after the first reload (Gjallarhorn: the magazine is 2 rockets).
const secondShotMs = (b: Build) => {
  const { selected, options } = buildSimulation(b, gameData);
  const gun = weaponById(b.weaponId);
  return simulate(gun, b.damagePhaseSeconds, selected, buckets, options).shots[gun.magazine.value!]
    .timeMs;
};
const byId = (id: string) => gameData.abilities.find((a) => a.id === id)!;

describe("class abilities from the data", () => {
  it("come with the cooldown from the Compendium", () => {
    const energy = gameData.energy.abilities.find((a) => a.abilityId === "marksmans-dodge");
    expect(energy?.cooldownSeconds.value).toBe(42);
  });

  it("belong to their class", () => {
    expect(byId("marksmans-dodge").providers.flatMap((p) => p.classes)).toEqual(["hunter"]);
    expect(byId("rally-barricade").providers.flatMap((p) => p.classes)).toEqual(["titan"]);
  });

  it("Marksman's Dodge is placed at the next reload and saves it", () => {
    const empty = hunter({ abilities: [{ abilityId: "marksmans-dodge", castsMs: [] }] });
    const gjallarhorn = weaponById("gjallarhorn");
    const atMs = nextCastFor(empty, "classAbility", gameData, gjallarhorn, buckets);
    const firstReload = simulate(gjallarhorn, 30).reloadsMs[0];
    expect(atMs).toBe(firstReload);
    const withDodge = hunter({ abilities: [{ abilityId: "marksmans-dodge", castsMs: [atMs!] }] });
    expect(secondShotMs(withDodge)).toBeLessThan(secondShotMs(hunter({})));
  });

  it("Rally Barricade is active for 20 s from its cast, but the reloads already contain it (K1)", () => {
    const b = hunter({
      guardianClass: "titan",
      abilities: [{ abilityId: "rally-barricade", castsMs: [0] }],
    });
    const { options } = buildSimulation(b, gameData);
    expect(options.effectWindows?.["rally-barricade"]).toEqual({ startMs: 0, durationMs: 20000 });
    // the cast at 0 s comes before the first shot and shifts the rotation by its cast time
    const castMs = gameData.castTimes.defaultMs.value!;
    expect(secondShotMs(b) - castMs).toBeCloseTo(secondShotMs(hunter({ guardianClass: "titan" })), 6);
  });

  it("Empowering Rift grants its 20 % for 15 s from the cast", () => {
    const b = hunter({
      guardianClass: "warlock",
      abilities: [{ abilityId: "empowering-rift", castsMs: [5000] }],
    });
    const { options } = buildSimulation(b, gameData);
    expect(options.effectWindows?.["empowering-rift"]).toEqual({ startMs: 5000, durationMs: 15000 });
  });
});
