// Plain English texts of the hover cards (U8): what an item does, without sources.

import { describe, expect, it } from "vitest";
import rawEffects from "../src/data/effects.json";
import rawGenerated from "../src/data/exotic-armor-effects.json";
import rawSubclass from "../src/data/subclass-effects.json";
import { ExoticArmorEffect } from "../src/data/schema";
import { loadEffects, loadSubclassEffects } from "../src/engine/loadData";
import { describeEffect, describeDuration } from "../src/ui/describe";

const effects = [
  ...loadEffects(rawEffects),
  ...loadSubclassEffects(rawSubclass, { preBuilt: true }),
  ...ExoticArmorEffect.array()
    .parse(rawGenerated)
    .map((g) => g.effect),
];
const effect = (id: string) => effects.find((e) => e.id === id)!;

describe("hover card texts", () => {
  it("names the bonus, its target and its kind", () => {
    expect(describeEffect(effect("weaken"))).toEqual([
      "+15% damage from all sources (Debuff)",
    ]);
    expect(describeEffect(effect("surge-3x"))).toEqual([
      "+22% weapon damage (Surge)",
    ]);
  });

  it("explains keywords, scorch and states", () => {
    expect(describeEffect(effect("spark-of-shock"))).toEqual([
      "Applies Jolt on hits from Arc Grenades",
    ]);
    expect(describeEffect(effect("ember-of-ashes"))).toEqual([
      "+50% Scorch stacks",
    ]);
    expect(describeEffect(effect("ascension"))).toEqual(["Grants Amplified"]);
  });

  it("names conditions in words", () => {
    expect(
      describeEffect(effect("exotic-armor:no-backup-plans"))[0],
    ).toMatch(/Shotgun.*while you have Amplified, Frost Armor/);
  });

  it("explains when the effect is active", () => {
    expect(describeDuration(effect("weaken"))).toBe("the whole Damage Phase");
    expect(describeDuration(effect("echo-of-undermining"))).toBe(
      "5 s after each hit of a Void Grenade",
    );
    expect(describeDuration(effect("exotic-armor:star-eater-scales"))).toBe(
      "14 s after each Super cast",
    );
    expect(describeDuration(effect("exotic-armor:doom-fang-pauldron"))).toBe(
      "from the start of the Damage Phase for 11 s",
    );
  });

  it("never names a source", () => {
    for (const e of effects)
      expect([...describeEffect(e), describeDuration(e)].join(" ")).not.toMatch(
        /Court|Compendium|Aegis|Clarity|Quantum/,
      );
  });
});
