import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawArmor from "../src/data/exotic-armor.json";
import type {
  Ability,
  Effect,
  ExoticArmorEffect,
  ExoticArmorEntry,
  MultiplierPart,
} from "../src/data/schema";
import rawGenerated from "../src/data/exotic-armor-effects.json";
import rawEnergy from "../src/data/ability-energy.json";
import {
  Build,
  EnergyData,
  ExoticArmorEffect as ExoticArmorEffectSchema,
  ExoticArmorEntry as ExoticArmorEntrySchema,
} from "../src/data/schema";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { abilitySimulation } from "../src/engine/buildAbilities";
import {
  exoticArmorEffects,
  exoticArmorFor,
  exoticArmorOf,
} from "../src/engine/exoticArmor";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { abilitiesFor } from "../src/engine/providers";
import { simulate } from "../src/engine/simulate";

const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const armor = ExoticArmorEntrySchema.array().parse(rawArmor);
const weapon = { ...loadWeapon(raw), intrinsicParts: [] }; // solar fusion rifle
const DAMAGE_PHASE_SECONDS = 600;
const source = {
  name: "test",
  retrieved: "2026-10-21",
  status: "verified" as const,
};

/** Exotic armor entry for tests; not game data. */
const entry = (fields: Partial<ExoticArmorEntry>): ExoticArmorEntry => ({
  id: "test-exotic",
  hash: 1,
  name: "Test Exotic",
  guardianClass: "titan",
  slot: "chest",
  intrinsic: null,
  kind: "damageBuff",
  rule: 2,
  reason: "test",
  aegisRowIds: [],
  courtBuffs: [],
  bonuses: [],
  bonusBucket: null,
  grantsEffectIds: [],
  timing: null,
  ...fields,
});

/** Abilities for tests; not game data. */
const ability = (fields: Partial<Ability>): Ability => ({
  id: "test-super",
  code: 9001,
  name: "Test Super",
  kind: "super",
  element: "arc",
  providers: [{ kind: "subclass", classes: ["titan"], subclasses: ["arc"] }],
  components: [],
  ...fields,
});

describe("exotic armor of a build", () => {
  it("the build may name one exotic armor piece", () => {
    expect(Build.shape.exoticArmorId.parse("cuirass-of-the-falling-star")).toBe(
      "cuirass-of-the-falling-star",
    );
  });

  it("offers only exotics of the class that change damage in the model", () => {
    const titan = exoticArmorFor(armor, "titan");
    expect(titan.map((e) => e.name)).toContain("Cuirass of the Falling Star");
    expect(titan.every((e) => e.guardianClass !== "hunter")).toBe(true);
    expect(titan.map((e) => e.kind)).not.toContain("noDamage");
    expect(titan.map((e) => e.kind)).not.toContain("gap");
  });

  it("rejects an exotic of another class, an unknown one and one without effect", () => {
    expect(exoticArmorOf(undefined, armor, "titan")).toBeUndefined();
    expect(
      exoticArmorOf("cuirass-of-the-falling-star", armor, "titan")?.name,
    ).toBe("Cuirass of the Falling Star");
    expect(() =>
      exoticArmorOf("cuirass-of-the-falling-star", armor, "hunter"),
    ).toThrow(/class/);
    expect(() => exoticArmorOf("no-such-exotic", armor, "titan")).toThrow(
      /Unknown/,
    );
    expect(() => exoticArmorOf("helm-of-saint-14", armor, "titan")).toThrow(
      /not selectable/,
    );
  });

  it("offers exotics that only change ability energy (block 3)", () => {
    const energy = EnergyData.parse(rawEnergy);
    const starfire = armor.find((e) => e.id === "starfire-protocol")!;
    expect(starfire.kind).toBe("energyOnly");
    expect(exoticArmorFor(armor, "warlock").map((e) => e.id)).not.toContain(starfire.id);
    expect(exoticArmorFor(armor, "warlock", energy).map((e) => e.id)).toContain(starfire.id);
    expect(exoticArmorOf(starfire.id, armor, "warlock", energy)?.id).toBe(starfire.id);
  });
});

describe("ability variants with exotic armor", () => {
  const base = ability({});
  const variant = ability({
    id: "test-super-with-exotic",
    code: 9002,
    variantOf: "test-super",
    exoticArmorId: "test-exotic",
  });
  const abilities = [base, variant];
  const build = (exoticArmorId?: string) => ({
    abilities: [{ abilityId: "test-super", castsMs: [0] }],
    exoticArmorId,
  });

  it("uses the variant while the exotic is worn, the base ability otherwise", () => {
    expect(
      abilitySimulation(build("test-exotic"), abilities, [], effects).casts[0]
        .ability.id,
    ).toBe("test-super-with-exotic");
    expect(
      abilitySimulation(build(), abilities, [], effects).casts[0].ability.id,
    ).toBe("test-super");
  });

  it("does not offer variants as abilities of their own", () => {
    expect(
      abilitiesFor(abilities, "super", "titan", "arc").map((a) => a.id),
    ).toEqual(["test-super"]);
  });
});

describe("effects of exotic armor", () => {
  it("grants the effects its texts name, e.g. Radiant from Rain of Fire", () => {
    const rainOfFire = armor.find((e) => e.name === "Rain of Fire")!;
    expect(exoticArmorEffects(rainOfFire, effects).map((e) => e.id)).toEqual([
      "radiant",
    ]);
  });

  it("adds its generated effects, prebuilt ones only with the option (ADR 0015, U6-1)", () => {
    const generated = (activation: ExoticArmorEffect["activation"], id: string) => ({
      exoticArmorId: "test-exotic",
      activation,
      effect: { ...effects.find((e) => e.id === "weaken")!, id },
    });
    const all = [
      generated("always", "test-always"),
      generated("preBuilt", "test-prebuilt"),
      { ...generated("always", "other"), exoticArmorId: "other-exotic" },
    ];
    const ids = (preBuilt?: boolean) =>
      exoticArmorEffects(entry({}), effects, all, { preBuilt }).map((e) => e.id);
    expect(ids()).toEqual(["test-always"]);
    expect(ids(true)).toEqual(["test-always", "test-prebuilt"]);
  });

  it("Star-Eater Scales: super damage +70 % for 14 s after each super cast", () => {
    const starEater = armor.find((e) => e.id === "star-eater-scales")!;
    const selected = exoticArmorEffects(
      starEater,
      effects,
      ExoticArmorEffectSchema.array().parse(rawGenerated),
    );
    const hit = (delayMs: number) => ({
      id: `hit-${delayMs}`,
      name: "Hit",
      delayMs: { value: delayMs, source },
      damagePerTick: { value: 1000, source },
      ticks: { value: 1, source },
      tickIntervalMs: { value: 0, source },
      scalesWithAbilityStat: false,
    });
    const superDamage = (withExotic: boolean) =>
      simulate(weapon, 60, withExotic ? selected : [], buckets, {
        abilities: [
          {
            ability: ability({ components: [hit(0), hit(20000)] }),
            castsMs: [0],
          },
        ],
      })
        .damageInstances.filter((d) => d.damageSource === "super")
        .map((d) => d.damage);
    const plain = superDamage(false);
    expect(superDamage(true).map((d, i) => d / plain[i])).toEqual([1.7, 1]);
  });

  it("turns a quoted reload duration multiplier into a timing part", () => {
    const [effect] = exoticArmorEffects(
      entry({
        kind: "weaponTiming",
        timing: {
          change: "reloadDuration",
          factor: 0.9,
          quote: "0.9x Reload Duration Multiplier",
          source: "compendium",
        },
      }),
      effects,
    );
    expect(effect.parts).toMatchObject([
      { type: "timing", change: "reloadDuration", factor: 0.9 },
    ]);
  });
});

describe("simulate: reload duration", () => {
  const reloadEffect = (factor: number, id = "test-reload"): Effect => ({
    id,
    name: "test",
    code: 9003,
    shortName: "test",
    providers: [{ kind: "fireteamSupport" }],
    parts: [{ type: "timing", change: "reloadDuration", factor, source }],
  });
  const magazine = weapon.magazine.value!;
  const reloadGap = (selected: Effect[]) => {
    const { shots } = simulate(weapon, DAMAGE_PHASE_SECONDS, selected, buckets);
    return shots[magazine].timeMs - shots[magazine - 1].timeMs;
  };
  const shotIntervalMs = 60_000 / weapon.fireRateRpm.value!;
  const reloadTimeMs = weapon.reloadTimeMs.value!;

  it("shortens the reload by the factor", () => {
    expect(reloadGap([reloadEffect(0.9)])).toBeCloseTo(
      shotIntervalMs + reloadTimeMs * 0.9,
    );
  });

  it("uses only the strongest of several factors (no source for stacking)", () => {
    expect(
      reloadGap([reloadEffect(0.9), reloadEffect(0.8, "test-reload-2")]),
    ).toBeCloseTo(shotIntervalMs + reloadTimeMs * 0.8);
  });
});

describe("simulate: weapon matches super element", () => {
  const surge = (condition?: MultiplierPart["condition"]): Effect => ({
    id: "test-surge",
    name: "test",
    code: 9004,
    shortName: "test",
    providers: [{ kind: "fireteamSupport" }],
    parts: [
      {
        type: "multiplier",
        bucketId: "surge",
        multiplier: { value: 1.25, source },
        damageSources: ["weapon"],
        ...(condition ? { condition } : {}),
      },
    ],
  });
  const superOf = (element: Ability["element"]) => [
    { ability: ability({ element }), castsMs: [] },
  ];
  const total = (selected: Effect[], element?: Ability["element"]) =>
    simulate(weapon, DAMAGE_PHASE_SECONDS, selected, buckets, {
      abilities: element ? superOf(element) : [],
    }).totalDamage;
  const base = total([]);

  it("applies with a super of the weapon element", () => {
    expect(total([surge("weaponMatchesSuperElement")], "solar")).toBeCloseTo(
      base * 1.25,
    );
  });

  it("does not apply with a super of another element or without a super", () => {
    expect(total([surge("weaponMatchesSuperElement")], "arc")).toBeCloseTo(
      base,
    );
    expect(total([surge("weaponMatchesSuperElement")])).toBeCloseTo(base);
  });
});
