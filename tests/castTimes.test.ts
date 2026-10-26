// Cast times: a cast keeps the player busy. The next cast starts after it (also after a super
// window) and the weapon does not fire meanwhile (block "Cast-Zeiten", 2026-10-24).

import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import type { Ability, Build, CastTimes } from "../src/data/schema";
import { spaceCasts } from "../src/engine/castTimes";
import { buildSimulation, nextCastFor } from "../src/engine/buildSimulation";
import { loadBuckets } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";
import { gameData, weaponById, weapons } from "../src/ui/data";
import raw from "./fixtures/one-thousand-voices-hand-model.json";

const buckets = loadBuckets(rawBuckets);
const source = { name: "test", retrieved: "2026-10-24", status: "unverified" as const };
const times: CastTimes = {
  defaultMs: { value: 1000, source },
  abilities: [{ abilityId: "slow", castMs: { value: 1550, source } }],
};
const ability = (id: string, kind: Ability["kind"], fields: Partial<Ability> = {}): Ability => ({
  id,
  code: 9000,
  name: id,
  kind,
  element: "solar",
  providers: [{ kind: "subclass" }],
  components: [],
  ...fields,
});
const grenade = ability("grenade", "grenade");
const melee = ability("slow", "melee");
const nova = ability("nova", "super", {
  usage: { type: "cast", castMs: { value: 2500, source } },
});

describe("spaceCasts", () => {
  it("moves the second of two casts at 0 s behind the first", () => {
    const [cast] = spaceCasts([{ ability: grenade, castsMs: [0, 0] }], times);
    expect(cast.castsMs).toEqual([0, 1000]);
    expect(cast.castMs).toBe(1000);
  });

  it("spaces casts of different abilities by the cast time of the earlier one", () => {
    const result = spaceCasts(
      [
        { ability: grenade, castsMs: [0] },
        { ability: melee, castsMs: [500, 1000] },
      ],
      times,
    );
    expect(result[0].castsMs).toEqual([0]);
    expect(result[1].castsMs).toEqual([1000, 2550]);
    expect(result[1].castMs).toBe(1550);
  });

  it("leaves casts that are far enough apart where they are", () => {
    const [cast] = spaceCasts([{ ability: grenade, castsMs: [0, 5000] }], times);
    expect(cast.castsMs).toEqual([0, 5000]);
  });

  it("moves a cast inside a super window behind the window", () => {
    const result = spaceCasts(
      [
        { ability: nova, castsMs: [0] },
        { ability: grenade, castsMs: [1000] },
      ],
      times,
    );
    expect(result[1].castsMs).toEqual([2500]);
    expect(result[0].castMs).toBeUndefined(); // the super window blocks the weapon, not the cast
  });

  it("drops a cast that no longer fits into the damage phase", () => {
    const [cast] = spaceCasts([{ ability: grenade, castsMs: [0, 0, 0] }], times, 1500);
    expect(cast.castsMs).toEqual([0, 1000]);
  });
});

describe("simulate: the weapon during a cast", () => {
  const weapon = { ...loadWeapon(raw), intrinsicParts: [] };
  const plain = simulate(weapon, 60, [], buckets).shots.map((s) => s.timeMs);

  it("does not fire while the cast lasts", () => {
    const atMs = plain[2] - 1;
    const shots = simulate(weapon, 60, [], buckets, {
      abilities: [{ ability: grenade, castsMs: [atMs], castMs: 1000 }],
    }).shots.map((s) => s.timeMs);
    expect(shots[2]).toBeGreaterThanOrEqual(atMs + 1000);
    expect(shots.some((ms) => ms > atMs && ms < atMs + 1000)).toBe(false);
  });

  it("fires a shot at the very time of the cast first", () => {
    const shots = simulate(weapon, 60, [], buckets, {
      abilities: [{ ability: grenade, castsMs: [plain[2]], castMs: 1000 }],
    }).shots.map((s) => s.timeMs);
    expect(shots[2]).toBe(plain[2]);
    expect(shots[3]).toBeGreaterThanOrEqual(plain[2] + 1000);
  });

  it("starts with a cast at 0 s: no free shot before it", () => {
    const noCharge = { ...weapon, chargeTimeMs: { ...weapon.chargeTimeMs, value: 0 } };
    const shots = simulate(noCharge, 60, [], buckets, {
      abilities: [{ ability: grenade, castsMs: [0], castMs: 1000 }],
    }).shots.map((s) => s.timeMs);
    expect(shots[0]).toBeGreaterThanOrEqual(1000);
  });

  it("is unchanged without a cast time", () => {
    const shots = simulate(weapon, 60, [], buckets, {
      abilities: [{ ability: grenade, castsMs: [plain[2]] }],
    }).shots.map((s) => s.timeMs);
    expect(shots).toEqual(plain);
  });
});

describe("shots of a build next to its casts", () => {
  // Every weapon of the data, with a grenade, a melee and a super at close times: no shot may land
  // inside a cast or a super window (the timeline shows both as areas).
  const kindsWithUsage = ["grenade", "melee", "super"] as const;
  const picks = kindsWithUsage.map((kind) =>
    gameData.abilities.find((a) => a.kind === kind && (kind !== "super" || a.usage)),
  );

  it.each(weapons.map((w) => [w.id]))("%s", (weaponId) => {
    const abilities = picks.flatMap((ability, i) =>
      ability ? [{ abilityId: ability.id, castsMs: [2000 + i * 300, 9000 + i * 300] }] : [],
    );
    const build: Build = {
      weaponId,
      guardianClass: "hunter",
      subclass: "solar",
      catalyst: false,
      selections: [],
      effectWindows: {},
      damagePhaseSeconds: 40,
      abilities,
    };
    const { selected, options } = buildSimulation(build, gameData);
    const result = simulate(weaponById(weaponId), build.damagePhaseSeconds, selected, buckets, options);
    const windows = [
      ...result.superWindows,
      ...(options.abilities ?? []).flatMap(({ castsMs, castMs = 0 }) =>
        castsMs.map((startMs) => ({ startMs, endMs: startMs + castMs })),
      ),
    ];
    for (const shot of result.shots) {
      const inside = windows.find((w) => shot.timeMs > w.startMs && shot.timeMs < w.endMs);
      expect(inside, `shot at ${shot.timeMs}`).toBeUndefined();
    }
  });
});

describe("casts of a build", () => {
  const build = (grenadeMs: number[]): Build => ({
    weaponId: "gjallarhorn",
    guardianClass: "hunter",
    subclass: "solar",
    catalyst: false,
    selections: [],
    effectWindows: {},
    damagePhaseSeconds: 30,
    abilities: [
      { abilityId: "weighted-throwing-knife", castsMs: [0] },
      { abilityId: "solar-grenade", castsMs: grenadeMs },
    ],
  });
  const castsOf = (b: Build, id: string) =>
    buildSimulation(b, gameData).options.abilities?.find((c) => c.ability.id === id);

  it("the Weighted Knife takes 1.55 s from the Compendium, a grenade the 1 s estimate", () => {
    expect(castsOf(build([]), "weighted-throwing-knife")?.castMs).toBe(1550);
    expect(castsOf(build([]), "solar-grenade")?.castMs).toBe(1000);
  });

  it("a grenade at the same time as the knife starts after it", () => {
    expect(castsOf(build([0]), "solar-grenade")?.castsMs).toEqual([1550]);
  });

  it("the next cast of a kind starts after the cast before", () => {
    const long = { ...build([0]), damagePhaseSeconds: 120 };
    const next = nextCastFor(long, "grenade", gameData, weaponById("gjallarhorn"), buckets);
    expect(next).toBeGreaterThanOrEqual(1550 + 1000);
  });
});
