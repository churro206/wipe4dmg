// Effects of the exotic damage buffs by rule (ADR 0015, U6-1), checked against the review table the
// owner approved on 2026-10-22.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import rawGenerated from "../src/data/exotic-armor-effects.json";
import { ExoticArmorEffect } from "../src/data/schema";
import {
  exoticEffects,
  renderExoticEffects,
} from "../scripts/lib/exoticEffects";
import { loadExoticEffectInputs } from "../scripts/lib/exoticEffectInputs";

const result = exoticEffects(loadExoticEffectInputs());
const rowsOf = (name: string) => result.rows.filter((r) => r.name === name);
const kindsOf = (name: string) => rowsOf(name).map((r) => r.kind);
const effectOf = (id: string) =>
  result.effects.find((e) => e.exoticArmorId === id)!;

describe("rules for the exotic damage buffs", () => {
  it("classifies every damage buff", () => {
    // 42 exotic pieces and 4 Spirit perks of the Exotic Class Item (U6-3)
    expect(new Set(result.rows.map((r) => r.name)).size).toBe(46);
  });

  it.each([
    ["Antaeus Wards", "notAgainstBoss"],
    ["Citan's Ramparts", "notAgainstBoss"],
    ["Synthoceps", "notAgainstBoss"],
    ["Knucklehead Radar", "notAgainstBoss"],
    ["Mechaneer's Tricksleeves", "notAgainstBoss"],
    ["Boots of the Assembler", "notAgainstBoss"],
    ["Deimosuffusion", "ownDamage"],
    ["Doom Fang Pauldron", "preBuilt"],
    ["Eternal Warrior", "preBuilt"],
    ["Gyrfalcon's Hauberk", "preBuilt"],
    ["Sealed Ahamkara Grasps", "preBuilt"],
    ["Khepri's Sting", "preBuilt"],
    ["Hallowfire Heart", "preBuilt"],
    ["Verity's Brow", "preBuilt"],
    ["Wormhusk Crown", "preBuilt"],
    ["Wormgod Caress", "preBuilt"],
    ["Actium War Rig", "missingDuration"],
    ["Chromatic Fire", "preBuilt"],
    ["Contraverse Hold", "triggered"],
    ["Foetracer", "triggered"],
    ["Second Chance", "triggered"],
    ["Star-Eater Scales", "triggered"],
    ["Blight Ranger", "triggered"],
    ["Mantle of Battle Harmony", "triggered"],
    ["Sanguine Alchemy", "triggered"],
    ["Eternal Warrior", "triggered"],
    // stacks from hits inside the super; the package names no hit count
    ["Stormdancer's Brace", "rotation"],
    // x2 needs the class ability
    ["Heart of Inmost Light", "classAbility"],
    ["Mask of Bakris", "triggered"],
    ["Hazardous Propulsion", "classAbility"],
    ["Gwisin Vest", "triggered"],
    ["The Path of Burning Steps", "needsEffect"],
    ["No Backup Plans", "needsEffect"],
    ["Fr0st-EE5", "needsEffect"],
    ["Young Ahamkara's Spine", "always"],
    ["Cadmus Ridge Lancecap", "abilityGap"],
    ["Eunoia", "abilityGap"],
    ["Peregrine Greaves", "abilityGap"],
    ["Lucky Pants", "hitStacks"],
    ["Peacekeepers", "hitStacks"],
    ["Oathkeeper", "heldDraw"],
    // the overshield comes from not taking damage, so the bonus holds the whole damage phase
    ["Fortune's Favor", "always"],
  ])("%s → %s", (name, kind) => {
    expect(kindsOf(name)).toContain(kind);
  });

  it("Felwinter's Helm: the kill burst has no duration, the weaken comes from a melee hit", () => {
    expect(kindsOf("Felwinter's Helm").sort()).toEqual([
      "missingDuration",
      "triggered",
    ]);
    expect(effectOf("felwinters-helm").effect.trigger).toEqual({
      on: "hit",
      refresh: true,
      abilityKinds: ["melee"],
    });
  });

  it("the duration comes from the line of the chosen stage (Verity: stage 5 holds 4 s, not 8 s)", () => {
    const effect = (id: string) =>
      result.effects.filter((e) => e.exoticArmorId === id).map((e) => e.effect);
    expect(effect("veritys-brow")[0]).toMatchObject({ durationMs: { value: 4000 } });
    expect(effect("spirit-of-verity")[0]).toMatchObject({ durationMs: { value: 4000 } });
  });

  it("windows from the rotation (U6-1b)", () => {
    const effect = (id: string) =>
      result.effects.filter((e) => e.exoticArmorId === id).map((e) => e.effect);
    expect(effect("star-eater-scales")[0]).toMatchObject({
      trigger: { on: "cast", abilityKinds: ["super"] },
      durationMs: { value: 14000 },
      parts: [{ multiplier: { value: 1.7 }, damageSources: ["super"] }],
    });
    expect(effect("foetracer")[0]).toMatchObject({
      trigger: { on: "hit", refresh: false },
      durationMs: { value: 16000 },
      parts: [{ bucketId: "surge", condition: "weaponMatchesTriggerElement" }],
    });
    expect(effect("contraverse-hold")[0].trigger).toMatchObject({
      on: "hit",
      abilityKinds: ["grenade"],
      elements: ["void"],
    });
    expect(effect("second-chance")[0].trigger).toMatchObject({
      abilityIds: ["shield-throw"],
    });
    expect(effect("blight-ranger")[0].trigger).toMatchObject({
      on: "superEnd",
      abilityIds: ["arc-staff"],
    });
    expect(effect("sanguine-alchemy")[0]).toMatchObject({
      trigger: { on: "cast", abilityIds: ["well-of-radiance"] },
      durationMs: { value: 30000 },
      parts: [{ condition: "weaponMatchesSuperElement" }],
    });
    const [untilCast, superEnd] = effect("mantle-of-battle-harmony");
    expect(untilCast).toMatchObject({
      trigger: { on: "untilSuperCast" },
      durationMs: { value: 11000 },
      parts: [{ condition: "weaponMatchesSuperElement" }],
    });
    expect(superEnd.trigger).toEqual({ on: "superEnd", refresh: true });
    expect(superEnd.parts[0]).not.toHaveProperty("elements");
    expect(effect("eternal-warrior")[1]).toMatchObject({
      trigger: { on: "superEnd", abilityIds: ["fists-of-havoc"] },
      durationMs: { value: 30000 },
      parts: [{ elements: ["arc"], multiplier: { value: 1.25 } }],
    });
  });

  it("Chromatic Fire: Weaken only with a Void super", () => {
    expect(effectOf("chromatic-fire")).toMatchObject({
      activation: "preBuilt",
      effect: { parts: [{ bucketId: "debuff", superElements: ["void"] }] },
    });
  });

  it("a kill buff from Court takes the highest stage and its duration", () => {
    expect(effectOf("wormgod-caress")).toMatchObject({
      activation: "preBuilt",
      effect: {
        parts: [
          {
            bucketId: "empowering",
            multiplier: { value: 1.35 },
            damageSources: ["weapon"],
          },
        ],
        durationMs: { value: 3000 },
      },
    });
  });

  it("a surge from kills applies to weapons of its element", () => {
    expect(effectOf("doom-fang-pauldron").effect).toMatchObject({
      parts: [
        {
          bucketId: "surge",
          multiplier: { value: 1.25 },
          damageSources: ["weapon"],
          elements: ["void"],
        },
      ],
      durationMs: { value: 11000 },
    });
  });

  it("a debuff from kills applies to every damage source", () => {
    expect(effectOf("khepris-sting").effect.parts[0]).toMatchObject({
      bucketId: "debuff",
      multiplier: { value: 1.15 },
      damageSources: [
        "weapon",
        "grenade",
        "melee",
        "super",
        "classAbility",
        "keyword",
      ],
    });
  });

  it("a class ability trigger opens its window at the cast (U7)", () => {
    expect(effectOf("gwisin-vest").effect).toMatchObject({
      trigger: { on: "cast", abilityKinds: ["classAbility"] },
      durationMs: { value: 10000 },
      parts: [{ bucketId: "debuff", multiplier: { value: 1.15 } }],
    });
    expect(effectOf("mask-of-bakris").effect).toMatchObject({
      trigger: { on: "cast", abilityKinds: ["classAbility"] },
      durationMs: { value: 11000 },
      // one cast is one stack: the first of the stages 10 / 21 / 33 %
      parts: [
        { bucketId: "amplification", multiplier: { value: 1.1 }, elements: ["arc", "stasis"] },
      ],
    });
  });

  it("a kill buff from the text takes the target, element and duration from it", () => {
    expect(effectOf("hallowfire-heart").effect).toMatchObject({
      parts: [
        {
          multiplier: { value: 2.5 },
          damageSources: ["super"],
          elements: ["solar"],
        },
      ],
      durationMs: { value: 20000 },
    });
    expect(effectOf("veritys-brow").effect).toMatchObject({
      parts: [{ multiplier: { value: 2 }, damageSources: ["grenade"] }],
      durationMs: { value: 4000 },
    });
    expect(effectOf("wormhusk-crown").effect.parts[0]).toMatchObject({
      multiplier: { value: 1.15 },
      damageSources: ["grenade", "super", "classAbility"],
      elements: ["solar"],
    });
  });

  it("a bonus for one ability applies only to it, the whole damage phase", () => {
    expect(effectOf("young-ahamkaras-spine")).toMatchObject({
      activation: "always",
      effect: {
        parts: [
          {
            bucketId: "exoticIntrinsic",
            multiplier: { value: 1.14 },
            damageSources: ["grenade"],
            abilityIds: ["tripmine-grenade"],
          },
        ],
      },
    });
    expect(effectOf("young-ahamkaras-spine").effect.durationMs).toBeUndefined();
  });

  it("leaves out bonuses for heat weapons (none in the import)", () => {
    expect(effectOf("fortunes-favor").effect.parts[0]).toMatchObject({
      multiplier: { value: 1.15 },
      damageSources: ["weapon"],
    });
  });

  it("buffs that need a state of the player (U6-2)", () => {
    expect(effectOf("no-backup-plans").effect.parts[0]).toMatchObject({
      bucketId: "empowering",
      multiplier: { value: 1.35 },
      weaponTypes: ["shotgun"],
      requiresStatus: [
        "amplified",
        "frostArmor",
        "wovenMail",
        "voidOvershield",
        "restoration",
      ],
    });
    expect(effectOf("the-path-of-burning-steps").effect.parts[0]).toMatchObject({
      elements: ["solar"],
      requiresStatus: ["roaringFlames"],
    });
    // Fr0st-EE5 grants Frost Armor itself while sprinting
    expect(effectOf("fr0st-ee5").effect.parts[0]).not.toHaveProperty("requiresStatus");
  });

  it("creates effects only for the generating kinds", () => {
    expect(result.effects.map((e) => e.effect.id)).toEqual(
      result.rows
        .filter((r) =>
          [
            "always",
            "preBuilt",
            "triggered",
            "needsEffect",
            "hitStacks",
            "heldDraw",
          ].includes(r.kind),
        )
        .map((r) => r.effectId),
    );
  });

  it("stacks per weapon hit: Lucky Pants has a 6 s window, Peacekeepers refreshes per hit", () => {
    const lucky = effectOf("lucky-pants").effect;
    const pants = lucky.parts[0];
    if (pants.type !== "multiplier") throw new Error("multiplier expected");
    expect(pants.weaponTypes).toEqual(["handCannon"]);
    expect(pants.multiplier.value).toBeCloseTo(1.45, 10);
    expect(pants.hitStacks?.maxStacks.value).toBe(10);
    expect(pants.hitStacks?.bossFactor.value).toBeCloseTo(0.67, 10);
    expect(pants.hitStacks?.refreshMs).toBeUndefined();
    expect(lucky.durationMs?.value).toBe(6000);

    const keepers = effectOf("peacekeepers").effect.parts[0];
    if (keepers.type !== "multiplier") throw new Error("multiplier expected");
    expect(keepers.weaponTypes).toEqual(["submachineGun"]);
    expect(keepers.hitStacks?.maxStacks.value).toBe(20);
    expect(keepers.hitStacks?.refreshMs?.value).toBe(1000);
  });
});

describe("generated files are current (run npm run build:armor)", () => {
  it("exotic-armor-effects.json", () => {
    expect(ExoticArmorEffect.array().parse(rawGenerated)).toEqual(
      result.effects,
    );
  });

  it("docs/exotic-effects.md", () => {
    expect(
      readFileSync("docs/exotic-effects.md", "utf8").replace(/\r\n/g, "\n"),
    ).toBe(renderExoticEffects(result.rows));
  });
});
