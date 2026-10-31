import { describe, expect, it } from "vitest";
import type { AegisWeaponRow, ExoticArmorEntry, Weapon } from "../src/data/schema";
import { fnv1a, generateScenarios, lotOf, type GenData } from "./lib/scenarioGen";

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
