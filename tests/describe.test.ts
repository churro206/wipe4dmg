// Plain English texts of the hover cards (U8): what an item does, without sources.

import { describe, expect, it } from "vitest";
import rawEffects from "../src/data/effects.json";
import rawGenerated from "../src/data/exotic-armor-effects.json";
import rawSubclass from "../src/data/subclass-effects.json";
import { ExoticArmorEffect } from "../src/data/schema";
import { loadEffects, loadSubclassEffects } from "../src/engine/loadData";
import {
  describeCatalyst,
  describeEffect,
  describeDuration,
} from "../src/ui/describe";
import { weaponById } from "../src/ui/data";

const effects = [
  ...loadEffects(rawEffects),
  ...loadSubclassEffects(rawSubclass, { preBuilt: true }),
  ...ExoticArmorEffect.array()
    .parse(rawGenerated)
    .map((g) => g.effect),
];
const effect = (id: string) => effects.find((e) => e.id === id)!;

describe("catalyst hover card", () => {
  it("names the timing it changes, in game words", () => {
    expect(describeCatalyst(weaponById("telesto"))).toContain(
      "Magazine 4 → 7, ammo 16 → 19",
    );
  });

  it("names the damage bonus without the internal option id", () => {
    const lines = describeCatalyst(weaponById("one-thousand-voices"));
    expect(lines).toContain("+45% weapon damage");
    expect(lines.join(" ")).not.toContain("catalyst ×");
  });

  it("says when a catalyst does nothing against one boss, or is not modelled yet", () => {
    expect(describeCatalyst(weaponById("winterbite"))).toContain(
      "No effect against one boss without adds",
    );
    expect(describeCatalyst(weaponById("izanagi-s-burden"))).toContain(
      "Not in the calculator yet: no source measured it",
    );
  });

  it("shows the whole game text, not only its first line", () => {
    const lines = describeCatalyst(weaponById("hierarchy-of-needs"));
    expect(lines).toContain(
      "In game: Deploying a Guidance Ring or Guidance Seeker Hits grants the following benefits for 5 seconds:",
    );
    expect(lines).toContain("• 50% decreased Draw Time");
  });
});

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

  it("names the abilities an aspect changes, with damage per cast", () => {
    expect(describeEffect(effect("knock-em-down"))).toEqual([
      expect.stringMatching(
        /^Blade Barrage: [\d,]+ instead of [\d,]+ damage per cast$/,
      ),
    ]);
  });

  it("names conditions in words", () => {
    expect(describeEffect(effect("exotic-armor:no-backup-plans"))[0]).toMatch(
      /Shotgun.*while you have Amplified, Frost Armor/,
    );
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
