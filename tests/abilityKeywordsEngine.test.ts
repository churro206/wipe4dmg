// Abilities apply their keywords in the engine (ADR 0015, U5): loading takes the keyword damage Aegis
// counted into a package out, the keyword run adds it back. Nothing counts twice.

import { describe, expect, it } from "vitest";
import rawAbilityKeywords from "../src/data/ability-keywords.json";
import rawAbilityStats from "../src/data/ability-stats.json";
import rawAbilities from "../src/data/abilities.json";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawKeywords from "../src/data/keywords.json";
import rawManifest from "../src/data/manifest-abilities.json";
import {
  AbilityKeyword,
  AegisAbilityRow,
  ManifestAbilities,
} from "../src/data/schema";
import { loadAbilities } from "../src/engine/loadAbilities";
import {
  loadAbilityStats,
  loadBuckets,
  loadEffects,
} from "../src/engine/loadData";
import { loadKeywords } from "../src/engine/loadKeywords";
import { simulate } from "../src/engine/simulate";
import { testWeapon } from "./support/testWeapon";

const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const rows = AegisAbilityRow.array().parse(rawRows);
const abilityKeywords = AbilityKeyword.array().parse(rawAbilityKeywords);
const keywords = loadKeywords(rawKeywords, rows);
const load = (withKeywords: boolean) =>
  loadAbilities(
    rawAbilities,
    rows,
    loadAbilityStats(rawAbilityStats),
    ManifestAbilities.parse(rawManifest).abilities,
    { effects, buckets },
    withKeywords ? abilityKeywords : undefined,
  );
const withKeywords = load(true);
const without = load(false);
const ability = (list: typeof withKeywords, id: string) =>
  list.find((a) => a.id === id)!;
const packageValue = (list: typeof withKeywords, id: string) =>
  ability(list, id).components.reduce(
    (sum, c) => sum + (c.damagePerTick.value ?? 0),
    0,
  );
const weapon = { ...testWeapon, totalShots: { ...testWeapon.totalShots, value: 0 } };

describe("loading abilities with their keywords", () => {
  it("takes the ignition Aegis counted in out of the package", () => {
    // Fusion: 1 ignition of 1592 in 2 uses at Full Modifiers 2.30
    expect(packageValue(withKeywords, "fusion-grenade")).toBeCloseTo(
      packageValue(without, "fusion-grenade") - 1592 / (2 * 2.3),
      3,
    );
  });

  it("keeps a package without keyword damage as it is", () => {
    expect(packageValue(withKeywords, "hammer-strike")).toBeCloseTo(
      packageValue(without, "hammer-strike"),
    );
  });

  it("gives the ability a rule for the hits of its first component", () => {
    const fusion = ability(withKeywords, "fusion-grenade");
    expect(fusion.rules).toMatchObject([
      {
        on: { on: "hit", part: fusion.components[0].id },
        do: [{ type: "applyStatus", status: "scorch", stacks: { value: 40 } }],
      },
    ]);
  });
});

describe("abilities apply keywords in the simulation", () => {
  const ignitions = (castsMs: number[], selected = [] as typeof effects) =>
    simulate(weapon, 60, selected, buckets, {
      keywords,
      abilities: [
        { ability: ability(withKeywords, "fusion-grenade"), castsMs },
      ],
    }).damageInstances.filter((d) => d.keywordId === "ignition" && d.id !== "burn");

  // Scorch stacks fall after 2.3 s without new ones (burn, ADR 0017 S2): the casts follow each other
  // 1500 ms apart, after the Ignition cooldown of 1.3 s.
  it("fusion grenades (x40 each) ignite with the third one", () => {
    expect(ignitions([0, 1500])).toHaveLength(0);
    expect(ignitions([0, 1500, 3000]).map((d) => d.timeMs)).toEqual([3000]);
  });

  it("with Ember of Ashes (x60 each) the second one ignites, as in the Aegis measurement", () => {
    const ember = effects.filter((e) => e.id === "ember-of-ashes");
    expect(ignitions([0, 1500], ember).map((d) => d.timeMs)).toEqual([1500]);
  });

  it("stacks of grenades that are further apart fall away before the next one", () => {
    expect(ignitions([0, 5000, 10000])).toHaveLength(0);
  });

  it("the ignition of a grenade grows with the grenade stat (Aegis: stat 200 / stat 100)", () => {
    const fusion = ability(withKeywords, "fusion-grenade");
    const scaling = loadAbilityStats(rawAbilityStats).find(
      (s) => s.kind === "grenade",
    )!;
    const ignition = (stat: number) =>
      simulate(weapon, 60, [], buckets, {
        keywords,
        abilities: [{ ability: fusion, castsMs: [0, 1500, 3000] }],
        abilityStats: [{ scaling, value: stat }],
      }).damageInstances.find((d) => d.keywordId === "ignition" && d.id !== "burn")!.damage;
    const statFactor =
      1 + scaling.damagePerPoint.value! * (scaling.maxStat - scaling.bonusFromStat);
    expect(ignition(200) / ignition(100)).toBeCloseTo(statFactor);
  });

  it("takes the ignition of a melee out without the stat bonus (melee buffs do not scale it)", () => {
    // Knife Trick: 1 ignition of 1553 in 2 uses; Aegis stat 200 matches exactly this way
    const knife = ability(withKeywords, "knife-trick");
    const plain = ability(without, "knife-trick");
    const at = (a: typeof knife) =>
      a.components.reduce((s, c) => s + (c.damagePerTick.value ?? 0), 0);
    expect(at(knife)).toBeCloseTo(at(plain) - 1553 / (2 * 2.3), 3);
  });

  it("applies the keyword once per cast, also for a package split in two parts", () => {
    const split = ability(withKeywords, "golden-gun-marksman");
    const hits = simulate(weapon, 60, [], buckets, {
      keywords,
      abilities: [{ ability: split, castsMs: [0] }],
    }).damageInstances;
    // x120 per cast: exactly one ignition
    expect(
      hits.filter((d) => d.keywordId === "ignition" && d.id !== "burn"),
    ).toHaveLength(1);
  });
});
