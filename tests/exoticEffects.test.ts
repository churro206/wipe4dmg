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
    expect(new Set(result.rows.map((r) => r.name)).size).toBe(42);
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
    ["Chromatic Fire", "rotation"],
    ["Contraverse Hold", "rotation"],
    ["Foetracer", "rotation"],
    ["Second Chance", "rotation"],
    ["Heart of Inmost Light", "rotation"],
    ["Star-Eater Scales", "rotation"],
    ["Stormdancer's Brace", "rotation"],
    ["Blight Ranger", "rotation"],
    ["Mantle of Battle Harmony", "rotation"],
    ["Sanguine Alchemy", "rotation"],
    ["Mask of Bakris", "classAbility"],
    ["Hazardous Propulsion", "classAbility"],
    ["Gwisin Vest", "classAbility"],
    ["The Path of Burning Steps", "needsEffect"],
    ["No Backup Plans", "needsEffect"],
    ["Fr0st-EE5", "needsEffect"],
    ["Young Ahamkara's Spine", "always"],
    ["Cadmus Ridge Lancecap", "abilityGap"],
    ["Eunoia", "abilityGap"],
    ["Peregrine Greaves", "abilityGap"],
    ["Lucky Pants", "hitStacks"],
    ["Peacekeepers", "hitStacks"],
    ["Oathkeeper", "hitStacks"],
    // the overshield comes from not taking damage, so the bonus holds the whole damage phase
    ["Fortune's Favor", "always"],
  ])("%s → %s", (name, kind) => {
    expect(kindsOf(name)).toContain(kind);
  });

  it("Felwinter's Helm: the kill burst has no duration, the weaken comes from a melee hit", () => {
    expect(kindsOf("Felwinter's Helm").sort()).toEqual([
      "missingDuration",
      "rotation",
    ]);
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
      durationMs: { value: 8000 },
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

  it("creates effects only for the kinds always and preBuilt", () => {
    expect(result.effects.map((e) => e.effect.id)).toEqual(
      result.rows
        .filter((r) => r.kind === "always" || r.kind === "preBuilt")
        .map((r) => r.effectId),
    );
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
