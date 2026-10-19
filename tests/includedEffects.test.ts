import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import raw from "../src/data/weapons/one-thousand-voices.json";
import { Ability } from "../src/data/schema";
import { grantedEffectWindows } from "../src/engine/grantedEffects";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

const weapon = { ...loadWeapon(raw), intrinsicParts: [] };
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const byId = (id: string) => effects.find((e) => e.id === id)!;
const multiplierOf = (id: string) => {
  const part = byId(id).parts.find((p) => p.type === "multiplier");
  if (!part || part.type !== "multiplier")
    throw new Error(`No multiplier in ${id}`);
  return part.multiplier.value!;
};

const source = {
  name: "test",
  retrieved: "2026-10-19",
  status: "verified",
} as const;
const n = (value: number) => ({ value, source });
const component = (id: string, includedEffectIds?: string[]) => ({
  id,
  name: id,
  delayMs: n(0),
  damagePerTick: n(1000),
  ticks: n(1),
  tickIntervalMs: n(0),
  scalesWithAbilityStat: true,
  ...(includedEffectIds ? { includedEffectIds } : {}),
});

// Test super: a package that Aegis measured with Weaken inside, and a part without it.
// Values are test inputs, not game values.
const testSuper = Ability.parse({
  id: "test-super",
  code: 1,
  name: "Test Super",
  kind: "super",
  element: "void",
  providers: [{ kind: "subclass" }],
  grantsEffectIds: ["moebius-tether"],
  components: [component("package", ["weaken"]), component("extra")],
});

describe("included effects", () => {
  const damageOf = (selected: string[]) => {
    const result = simulate(weapon, 10, selected.map(byId), buckets, {
      abilities: [{ ability: testSuper, castsMs: [0] }],
    });
    const of = (id: string) =>
      result.damageInstances.find((d) => d.id === `test-super.${id}`)!.damage;
    return { package: of("package"), extra: of("extra") };
  };

  it("does not apply an included effect to the component again", () => {
    const damage = damageOf(["weaken"]);
    expect(damage.package).toBe(1000);
    expect(damage.extra).toBeCloseTo(1000 * multiplierOf("weaken"));
  });

  it("still applies other effects to the component", () => {
    const damage = damageOf(["tractor-cannon"]);
    expect(damage.package).toBeCloseTo(1000 * multiplierOf("tractor-cannon"));
  });
});

describe("grantedEffectWindows", () => {
  it("starts every granted effect at the first cast of its ability", () => {
    expect(
      grantedEffectWindows(
        [{ ability: testSuper, castsMs: [5000, 2000] }],
        effects,
      ),
    ).toEqual({
      "moebius-tether": {
        startMs: 2000,
        durationMs: byId("moebius-tether").durationMs!.value,
      },
    });
  });

  it("keeps the duration of the granted effect from its data", () => {
    const well = Ability.parse({
      ...testSuper,
      grantsEffectIds: ["well-of-radiance"],
    });
    expect(
      grantedEffectWindows([{ ability: well, castsMs: [1000] }], effects),
    ).toEqual({
      "well-of-radiance": {
        startMs: 1000,
        durationMs: byId("well-of-radiance").durationMs!.value,
      },
    });
  });

  it("fails for an unknown granted effect", () => {
    const broken = Ability.parse({ ...testSuper, grantsEffectIds: ["nope"] });
    expect(() =>
      grantedEffectWindows([{ ability: broken, castsMs: [0] }], effects),
    ).toThrow(/nope/);
  });

  it("grants nothing without casts or grants", () => {
    expect(
      grantedEffectWindows([{ ability: testSuper, castsMs: [] }], effects),
    ).toEqual({});
    const plain = Ability.parse({ ...testSuper, grantsEffectIds: undefined });
    expect(
      grantedEffectWindows([{ ability: plain, castsMs: [0] }], effects),
    ).toEqual({});
  });

  it("lets a granted debuff buff the weapon from the cast for its duration", () => {
    const castMs = 5000;
    const endMs = castMs + byId("moebius-tether").durationMs!.value!;
    const casts = [{ ability: testSuper, castsMs: [castMs] }];
    const result = simulate(weapon, 20, [byId("moebius-tether")], buckets, {
      abilities: casts,
      effectWindows: grantedEffectWindows(casts, effects),
    });
    const shots = result.damageInstances.filter(
      (d) => d.damageSource === "weapon",
    );
    const base = weapon.damageInstances[0].damagePerTick.value!;
    for (const shot of shots) {
      const buffed = shot.timeMs >= castMs && shot.timeMs < endMs;
      const expected = buffed ? base * multiplierOf("moebius-tether") : base;
      expect(shot.damage, `${shot.timeMs} ms`).toBeCloseTo(expected);
    }
    expect(shots.some((s) => s.timeMs < castMs)).toBe(true);
    expect(shots.some((s) => s.timeMs >= castMs && s.timeMs < endMs)).toBe(
      true,
    );
    expect(shots.some((s) => s.timeMs >= endMs)).toBe(true);
  });
});
