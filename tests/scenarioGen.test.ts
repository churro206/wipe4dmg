import { describe, expect, it } from "vitest";
import type { Ability, AegisTotalRow, AegisWeaponRow, ExoticArmorEntry, Weapon } from "../src/data/schema";
import {
  fnv1a,
  generateScenarios,
  generateTotalScenarios,
  lotOf,
  STANDARD_ABILITY_EFFECTS,
  STANDARD_WEAPON_EFFECTS,
  STANDING_BY_WEAPON,
  type GenData,
  type TotalGenData,
} from "./lib/scenarioGen";

const row = (id: string, name: string, assumptions: string[]): AegisWeaponRow =>
  ({
    id,
    name,
    assumptions,
    wipe: 1000,
    shots: 4,
    fullModifiers: 2,
    perShot: 125,
  }) as AegisWeaponRow;

const weapon = {
  id: "truth",
  name: "Truth",
  intrinsics: [{ name: "Prototype Truthseeker" }],
  options: [
    { name: "Reaper's Tithe x4", kind: "catalyst" },
    { name: "Particle Reconstruction", kind: "perk" },
  ],
  catalyst: { name: "Reaper's Tithe" },
} as unknown as Weapon;

const data: GenData = {
  weapons: [weapon],
  effects: [
    { id: "ember-of-ashes", name: "Ember of Ashes" },
    { id: "lumina", name: "Lumina (Blessing of the Sky)" },
  ],
  exoticArmor: [
    { id: "lion-rampants", name: "Lion Rampant", kind: "buff", intrinsic: "Rampant" },
    { id: "own", name: "Own Damage Helm", kind: "ownDamage" },
  ] as unknown as ExoticArmorEntry[],
  ignored: { "Odd Note": "no effect" },
};

describe("scenario generator", () => {
  it("maps catalyst, effect, armor and execution to switches", () => {
    const { scenarios, missing } = generateScenarios(
      [
        row("a", "Truth", ["average", "Prototype Truthseeker", "Reaper's Tithe x4", "Ember of Ashes", "Lumina"]),
        row("b", "Truth", ["Lion Rampant", "Odd Note", "3L1H1R"]),
        row("c", "Truth", ["Rampant x6"]),
      ],
      data,
      new Set(),
    );
    expect(missing).toEqual([]);
    const [a, b, c] = scenarios;
    expect(a.build).toEqual({
      weaponId: "truth",
      catalyst: true,
      effectIds: ["ember-of-ashes", "lumina"],
    });
    expect(a.playstyle).toEqual(["average", "Prototype Truthseeker", "Reaper's Tithe x4", "Ember of Ashes", "Lumina"]);
    expect([a.aegisRow, a.shots, a.wipe, a.fullModifiers, a.system]).toEqual(["a", 4, 1000, 2, "generated"]);
    expect(b.build).toEqual({ weaponId: "truth", exoticArmorId: "lion-rampants" });
    expect(c.build).toEqual({ weaponId: "truth", exoticArmorId: "lion-rampants", exoticPreBuilt: true });
  });

  it("lists a perk of the weapon and damage of armor as missing switches, not as scenarios", () => {
    const { scenarios, missing } = generateScenarios(
      [row("p", "Truth", ["Particle Reconstruction"]), row("o", "Truth", ["Own Damage Helm"]), row("x", "Truth", ["average"])],
      data,
      new Set(),
    );
    expect(scenarios.map((s) => s.aegisRow)).toEqual(["x"]);
    expect(missing.map((m) => [m.row.id, m.unmapped])).toEqual([
      ["p", ["Particle Reconstruction"]],
      ["o", ["Own Damage Helm (ownDamage)"]],
    ]);
  });

  it("leaves out rows of other items and rows a scenario by hand covers", () => {
    const { scenarios, skipped } = generateScenarios(
      [row("h", "Truth", []), row("l", "Adaptive frame", ["average"])],
      data,
      new Set(["h"]),
    );
    expect(scenarios).toEqual([]);
    expect(skipped.map((s) => s.row.id)).toEqual(["l"]);
  });
});

const totalRow = (
  id: string,
  tab: "sustained" | "swap",
  name: string,
  assumptions: string[],
  fields: Partial<AegisTotalRow> = {},
): AegisTotalRow => ({
  id,
  tab,
  name,
  assumptions,
  type: tab === "swap" ? "super" : "power",
  family: null,
  rateSeconds: null,
  shots: 1,
  base: 100,
  perk: null,
  surge: tab === "sustained" ? 1.22 : null,
  buff: 1.35,
  debuff: 1.3,
  stat: 1.1,
  total: 5000,
  ...fields,
});

const totalData: TotalGenData = {
  ...data,
  effects: [
    ...data.effects,
    { id: "limit-break", name: "Limit Break" },
    { id: "radiant", name: "Radiant" },
  ],
  abilities: [
    { id: "gathering-storm", name: "Gathering Storm", kind: "super", providers: [{ kind: "subclass", classes: ["hunter"], subclasses: ["arc"] }] },
  ] as unknown as Ability[],
  artifactPerks: [{ name: "Combination Argent Blade", tier: 3, effectId: "ember-of-ashes" }],
};

describe("scenario generator for the tabs Sustained and Swap", () => {
  it("gives a weapon the standard factors of Aegis as switches and the Weapons stat 200", () => {
    const { scenarios, missing } = generateTotalScenarios(
      [totalRow("s1", "sustained", "Truth", ["Reaper's Tithe x4", "Radiant"])],
      totalData,
      new Set(),
    );
    expect(missing).toEqual([]);
    expect(scenarios).toHaveLength(1);
    expect(scenarios[0]).toMatchObject({
      id: "gen-s1",
      tab: "sustained",
      aegisRow: "s1",
      wipe: 5000,
      fullModifiers: 1,
      system: "generated",
      playstyle: ["Reaper's Tithe x4", "Radiant"],
      build: {
        weaponId: "truth",
        catalyst: true,
        weaponsStat: 200,
        effectIds: [...STANDARD_WEAPON_EFFECTS, "radiant"],
      },
    });
    expect(scenarios[0].shots).toBeUndefined();
  });

  it("takes no Weapons stat bonus where the row has none", () => {
    const { scenarios } = generateTotalScenarios(
      [totalRow("s2", "sustained", "Truth", [], { stat: 1 })],
      totalData,
      new Set(),
    );
    expect(scenarios[0].build.weaponsStat).toBe(100);
  });

  it("makes Limit Break and an artifact perk by name a switch, not a removed factor", () => {
    const { scenarios } = generateTotalScenarios(
      [totalRow("w1", "swap", "Gathering Storm", ["Limit Break", "Combination Argent Blade"], { shots: 1, surge: null })],
      totalData,
      new Set(),
    );
    expect(scenarios[0].build).toEqual({
      weaponId: STANDING_BY_WEAPON,
      guardianClass: "hunter",
      subclass: "arc",
      abilityId: "gathering-storm",
      abilityStat: 200,
      effectIds: [...STANDARD_ABILITY_EFFECTS, "limit-break", "ember-of-ashes"],
    });
    expect(scenarios[0].tab).toBe("swap");
  });

  it("reports an assumption without a switch, and leaves out other rows, INF and other factors", () => {
    const { scenarios, missing, skipped } = generateTotalScenarios(
      [
        totalRow("m", "sustained", "Truth", ["Particle Reconstruction"]),
        totalRow("o", "sustained", "Legendary Thing", []),
        totalRow("i", "sustained", "Truth", [], { total: null }),
        totalRow("f", "sustained", "Truth", [], { buff: 1.2 }),
        totalRow("h", "sustained", "Truth", []),
        totalRow("b", "swap", "Gathering Storm", [], { type: "burst" }),
      ],
      totalData,
      new Set(["h"]),
    );
    expect(scenarios).toEqual([]);
    expect(missing.map((m) => [m.row.id, m.unmapped])).toEqual([["m", ["Particle Reconstruction"]]]);
    expect(skipped.map((s) => [s.row.id, s.reason])).toEqual([
      ["i", "no total (INF)"],
      ["f", "factors differ from the standard of Aegis"],
    ]);
  });
});

describe("fixed lot", () => {
  it("is FNV-1a of the row id: the same row always falls into the same set", () => {
    expect(fnv1a("")).toBe(0x811c9dc5);
    expect(fnv1a("a")).toBe(0xe40c292c);
    expect(lotOf("rocket-launcher-truth")).toBe(lotOf("rocket-launcher-truth"));
  });

  it("puts about 70 % into the calibration set", () => {
    const ids = Array.from({ length: 1000 }, (_, i) => `row-${i}`);
    const share = ids.filter((id) => lotOf(id) === "calibration").length / ids.length;
    expect(share).toBeGreaterThan(0.65);
    expect(share).toBeLessThan(0.75);
  });
});
