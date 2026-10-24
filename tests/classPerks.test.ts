// Spirit perks of the Prismatic Exotic Class Item (ADR 0015, U6-3): two perks, only with Prismatic,
// instead of an exotic piece; each perk is an exotic armor entry of the slot "classPerk".

import { describe, expect, it } from "vitest";
import type { Build } from "../src/data/schema";
import { decodeLink, encodeLink } from "../src/engine/buildLink";
import { buildSimulation } from "../src/engine/buildSimulation";
import {
  classPerksFor,
  classPerksOf,
  exoticArmorFor,
  exoticArmorOf,
} from "../src/engine/exoticArmor";
import { gameData, linkRegistry } from "../src/ui/data";

const build = (fields: Partial<Build>): Build => ({
  weaponId: "one-thousand-voices",
  guardianClass: "titan",
  subclass: "prismatic",
  catalyst: false,
  selections: [],
  effectWindows: {},
  damagePhaseSeconds: 30,
  ...fields,
});
const perks = gameData.exoticArmor;

describe("class perks", () => {
  it("offers the perks of the class and the class-agnostic ones that change damage", () => {
    const names = classPerksFor(perks, "titan").map((e) => e.name);
    expect(names).toContain("Spirit of the Eternal Warrior"); // Titan
    expect(names).toContain("Spirit of the Star-Eater"); // any class
    expect(names).not.toContain("Spirit of the Foetracer"); // Hunter
    expect(names).not.toContain("Spirit of the Assassin"); // no damage
    expect(names).not.toContain("Spirit of the Horn"); // own damage
  });

  it("keeps the perks out of the list of exotic pieces", () => {
    const names = exoticArmorFor(perks, "titan").map((e) => e.name);
    expect(names.filter((n) => n.startsWith("Spirit of"))).toEqual([]);
    expect(() => exoticArmorOf("spirit-of-the-eternal-warrior", perks, "titan")).toThrow(
      /class perk/,
    );
  });

  it("works only with Prismatic, two different perks and no exotic piece", () => {
    const two = ["spirit-of-the-eternal-warrior", "spirit-of-the-star-eater"];
    expect(classPerksOf(build({ classPerkIds: two }), perks)).toHaveLength(2);
    expect(() => classPerksOf(build({ subclass: "arc", classPerkIds: two }), perks)).toThrow(
      /Prismatic/,
    );
    expect(() =>
      classPerksOf(build({ classPerkIds: two, exoticArmorId: "lucky-pants" }), perks),
    ).toThrow(/one exotic/);
    expect(() =>
      classPerksOf(build({ classPerkIds: [two[0], two[0]] }), perks),
    ).toThrow(/differ/);
    expect(() =>
      classPerksOf(build({ classPerkIds: ["spirit-of-the-foetracer"] }), perks),
    ).toThrow(/not selectable for titan/);
    expect(classPerksOf(build({}), perks)).toEqual([]);
  });

  it("takes one perk per column of the class item (Compendium: Star-Eater and Verity are both right)", () => {
    const column = (id: string) => perks.find((e) => e.id === id)?.column;
    expect(column("spirit-of-the-eternal-warrior")).toBe(1);
    expect(column("spirit-of-the-star-eater")).toBe(2);
    expect(column("spirit-of-verity")).toBe(2);
    expect(() =>
      classPerksOf(
        build({ classPerkIds: ["spirit-of-the-star-eater", "spirit-of-verity"] }),
        perks,
      ),
    ).toThrow(/column/);
  });

  it("adds the effects of both perks to the build", () => {
    const { selected } = buildSimulation(
      build({
        classPerkIds: ["spirit-of-the-eternal-warrior", "spirit-of-the-star-eater"],
      }),
      gameData,
    );
    expect(selected.map((e) => e.id)).toEqual(
      expect.arrayContaining([
        "exotic-armor:spirit-of-the-eternal-warrior",
        "exotic-armor:spirit-of-the-star-eater",
      ]),
    );
  });

  it("a build link carries the perks", () => {
    const original = build({
      classPerkIds: ["spirit-of-the-eternal-warrior", "spirit-of-the-star-eater"],
    });
    const decoded = decodeLink(encodeLink({ build: original }, linkRegistry), linkRegistry);
    expect(decoded.build.classPerkIds).toEqual(original.classPerkIds);
    expect(decoded.unknownExoticArmorHashes).toEqual([]);
  });

  it("a perk hash of a newer version is skipped", () => {
    const original = build({ classPerkIds: ["spirit-of-the-eternal-warrior"] });
    const link = encodeLink({ build: original }, linkRegistry);
    const without = {
      ...linkRegistry,
      exoticArmor: linkRegistry.exoticArmor?.filter(
        (e) => e.id !== "spirit-of-the-eternal-warrior",
      ),
    };
    const decoded = decodeLink(link, without);
    expect(decoded.build.classPerkIds).toBeUndefined();
    expect(decoded.unknownExoticArmorHashes).toHaveLength(1);
  });
});
