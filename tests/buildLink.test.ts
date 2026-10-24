import fc from "fast-check";
import { describe, expect, it } from "vitest";
import rawAbilities from "../src/data/abilities.json";
import rawEffects from "../src/data/effects.json";
import rawArmor from "../src/data/exotic-armor.json";
import type { Build } from "../src/data/schema";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import {
  decodeLink,
  encodeLink,
  type LinkRegistry,
} from "../src/engine/buildLink";
import { loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";

const registry: LinkRegistry = {
  weapons: [loadWeapon(raw)],
  effects: loadEffects(rawEffects),
  abilities: rawAbilities.map(({ id, code }) => ({ id, code })),
  exoticArmor: rawArmor.map(({ id, hash }) => ({ id, hash })),
};

// Test inputs, not game data.
const build: Build = {
  weaponId: "one-thousand-voices",
  guardianClass: "warlock",
  subclass: "solar",
  catalyst: true,
  damagePhaseSeconds: 72,
  selections: [
    { effectId: "well-of-radiance", provider: "subclass" },
    { effectId: "ember-of-ashes", provider: "subclass" },
    { effectId: "surge-3x", provider: "armor" },
    { effectId: "particle-reconstruction", provider: "artifact" },
    { effectId: "tractor-cannon", provider: "fireteamSupport" },
  ],
  effectWindows: {
    "well-of-radiance": { startMs: 0, durationMs: 30_000 },
    "ember-of-ashes": { startMs: 0 },
    "surge-3x": { startMs: 0 },
    "particle-reconstruction": { startMs: 0 },
    "tractor-cannon": { startMs: 1500, durationMs: 10_000 },
  },
};
const comparison: Build = {
  ...build,
  catalyst: false,
  guardianClass: "hunter",
};

describe("encodeLink and decodeLink", () => {
  it("round-trips a build", () => {
    expect(decodeLink(encodeLink({ build }, registry), registry)).toEqual({
      build,
      comparison: null,
      unknownEffectCodes: [],
      unknownAbilityCodes: [],
      unknownExoticArmorHashes: [],
      replacedEffectCodes: [],
    });
  });

  it("round-trips a build with a comparison", () => {
    const decoded = decodeLink(
      encodeLink({ build, comparison }, registry),
      registry,
    );
    expect(decoded.build).toEqual(build);
    expect(decoded.comparison).toEqual(comparison);
  });

  it("keeps a typical build short (5 effects with windows in about 48 characters)", () => {
    // format 4 adds two bytes for the exotic armor, format 5 one byte for the class perks,
    // format 6 one byte for the Weapons stat
    expect(encodeLink({ build }, registry).length).toBeLessThanOrEqual(54);
  });

  it("round-trips the Weapons stat, also 0, and leaves it out when absent", () => {
    for (const weaponsStat of [0, 130, 200]) {
      const withStat: Build = { ...build, weaponsStat };
      expect(
        decodeLink(encodeLink({ build: withStat }, registry), registry).build,
      ).toEqual(withStat);
    }
    expect(
      decodeLink(encodeLink({ build }, registry), registry).build.weaponsStat,
    ).toBeUndefined();
  });

  it("writes only URL-safe characters", () => {
    expect(encodeLink({ build, comparison }, registry)).toMatch(
      /^[A-Za-z0-9_-]+$/,
    );
  });

  it("keeps milliseconds of decimal seconds", () => {
    const decimal: Build = { ...build, damagePhaseSeconds: 12.883 };
    expect(
      decodeLink(encodeLink({ build: decimal }, registry), registry).build,
    ).toEqual(decimal);
  });

  it("skips unknown effect codes and reports them", () => {
    const smaller: LinkRegistry = {
      ...registry,
      effects: registry.effects.filter((e) => e.id !== "tractor-cannon"),
    };
    const text = encodeLink({ build }, registry);
    const decoded = decodeLink(text, smaller);
    const tractorCode = registry.effects.find(
      (e) => e.id === "tractor-cannon",
    )!.code;
    expect(decoded.unknownEffectCodes).toEqual([tractorCode]);
    expect(decoded.build.selections.map((s) => s.effectId)).not.toContain(
      "tractor-cannon",
    );
    expect(decoded.build.effectWindows["tractor-cannon"]).toBeUndefined();
  });

  it.each([
    ["an empty text", ""],
    ["characters that are not base64url", "a+b/c"],
    ["a cut-off link", encodeLink({ build }, registry).slice(0, 6)],
    ["an unknown version", "BA"],
  ])("rejects %s", (_, text) => {
    expect(() => decodeLink(text, registry)).toThrow();
  });

  it("still reads links of format 2, which have no abilities", () => {
    // Written by format 2 on 2026-10-19: Well of Radiance and Tractor Cannon with windows.
    const decoded = decodeLink("AgECAQHAsgQCAQAAseoBCAPcC5FOAA", registry);
    expect(decoded.build.selections.map((s) => s.effectId)).toEqual([
      "well-of-radiance",
      "tractor-cannon",
    ]);
    expect(decoded.build.effectWindows["tractor-cannon"]).toEqual({
      startMs: 1500,
      durationMs: 10_000,
    });
    expect(decoded.build.abilities).toBeUndefined();
    expect(decoded.build.abilityStats).toBeUndefined();
  });

  describe("abilities (format 3)", () => {
    const withAbilities: Build = {
      ...build,
      abilities: [
        { abilityId: "well-of-radiance", castsMs: [0] },
        { abilityId: "fusion-grenade", castsMs: [1500, 16_000] },
        { abilityId: "celestial-fire", castsMs: [] },
      ],
      abilityStats: { super: 200, grenade: 150, melee: 100 },
    };

    it("round-trips abilities, their casts and the ability stats", () => {
      expect(
        decodeLink(encodeLink({ build: withAbilities }, registry), registry)
          .build,
      ).toEqual(withAbilities);
    });

    it("keeps such a build short", () => {
      expect(
        encodeLink({ build: withAbilities }, registry).length,
      ).toBeLessThanOrEqual(76); // format 5: one byte more for the class perks, format 6 for the stat
    });

    it("skips unknown ability codes and reports them", () => {
      const smaller: LinkRegistry = {
        ...registry,
        abilities: registry.abilities.filter((a) => a.id !== "fusion-grenade"),
      };
      const decoded = decodeLink(
        encodeLink({ build: withAbilities }, registry),
        smaller,
      );
      const fusionCode = registry.abilities.find(
        (a) => a.id === "fusion-grenade",
      )!.code;
      expect(decoded.unknownAbilityCodes).toEqual([fusionCode]);
      expect(decoded.build.abilities!.map((a) => a.abilityId)).toEqual([
        "well-of-radiance",
        "celestial-fire",
      ]);
    });

    it("rejects an unknown ability when writing", () => {
      const unknown: Build = {
        ...build,
        abilities: [{ abilityId: "nope", castsMs: [0] }],
      };
      expect(() => encodeLink({ build: unknown }, registry)).toThrow("nope");
    });
  });

  describe("exotic armor (format 4)", () => {
    const withExotic: Build = {
      ...build,
      exoticArmorId: "star-eater-scales",
      exoticPreBuilt: true,
    };

    it("round-trips the exotic and its prebuilt switch", () => {
      expect(
        decodeLink(encodeLink({ build: withExotic }, registry), registry).build,
      ).toEqual(withExotic);
      expect(
        decodeLink(encodeLink({ build }, registry), registry).build,
      ).toEqual(build);
    });

    it("skips an unknown exotic and reports its hash", () => {
      const decoded = decodeLink(encodeLink({ build: withExotic }, registry), {
        ...registry,
        exoticArmor: [],
      });
      expect(decoded.build.exoticArmorId).toBeUndefined();
      expect(decoded.unknownExoticArmorHashes).toEqual([
        registry.exoticArmor!.find((e) => e.id === "star-eater-scales")!.hash,
      ]);
    });

    it("still reads links of format 3", () => {
      // written by format 3 on 2026-10-22: Ember of Ashes, Fusion Grenade at 1.5 s, stats
      const decoded = decodeLink("AwECAQHAsgQBEQAAAAEjAdwLAcgBlgFkAA", registry);
      expect(decoded.build).toMatchObject({
        guardianClass: "warlock",
        selections: [{ effectId: "ember-of-ashes", provider: "subclass" }],
        abilities: [{ abilityId: "fusion-grenade", castsMs: [1500] }],
        abilityStats: { super: 200, grenade: 150, melee: 100 },
      });
      expect(decoded.build.exoticArmorId).toBeUndefined();
    });
  });

  it("rejects an unknown weapon", () => {
    expect(() =>
      decodeLink(encodeLink({ build }, registry), { ...registry, weapons: [] }),
    ).toThrow("weapon");
  });

  it("round-trips any build of known effects", () => {
    const effectIds = registry.effects.map((e) => e.id);
    const millis = fc.integer({ min: 0, max: 600_000 });
    const arbitraryBuild = fc
      .record({
        guardianClass: fc.constantFrom("titan", "hunter", "warlock"),
        subclass: fc.constantFrom(
          "arc",
          "solar",
          "void",
          "stasis",
          "strand",
          "prismatic",
        ),
        catalyst: fc.boolean(),
        damagePhaseMs: fc.integer({ min: 0, max: 600_000 }),
        picks: fc.uniqueArray(
          fc.record({
            effectId: fc.constantFrom(...effectIds),
            provider: fc.constantFrom(
              "subclass",
              "armor",
              "artifact",
              "fireteamSupport",
            ),
            startMs: millis,
            durationMs: fc.option(millis, { nil: undefined }),
          }),
          { selector: (p) => p.effectId, maxLength: 8 },
        ),
      })
      .map(({ picks, damagePhaseMs, ...rest }): Build => ({
        weaponId: "one-thousand-voices",
        ...rest,
        damagePhaseSeconds: damagePhaseMs / 1000,
        selections: picks.map(({ effectId, provider }) => ({
          effectId,
          provider,
        })),
        effectWindows: Object.fromEntries(
          picks.map((p) => [
            p.effectId,
            p.durationMs === undefined
              ? { startMs: p.startMs }
              : { startMs: p.startMs, durationMs: p.durationMs },
          ]),
        ),
      }));
    fc.assert(
      fc.property(arbitraryBuild, (b) => {
        expect(
          decodeLink(encodeLink({ build: b }, registry), registry).build,
        ).toEqual(b);
      }),
    );
  });
});
