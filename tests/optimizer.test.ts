import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { shotsOnly } from "./support/testWeapon";
import { optimize, type OptimizerInput } from "../src/engine/optimizer";
import { canProvide } from "../src/engine/providers";
import { simulate } from "../src/engine/simulate";

const weapon = shotsOnly(loadWeapon(raw));
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const byId = (id: string) => effects.find((e) => e.id === id)!;

const input: OptimizerInput = {
  weapon,
  buckets,
  effects,
  guardianClass: "warlock",
  fixedSelections: [
    { effectId: "tractor-cannon", provider: "fireteamSupport" },
  ],
  fixedWindows: { "tractor-cannon": { startMs: 0 } },
  catalyst: true,
  damagePhaseSeconds: 30,
  limit: 15,
};
const results = optimize(input);
const totalOf = (entry: (typeof results)[number]) =>
  simulate(
    weapon,
    input.damagePhaseSeconds,
    entry.selections.map((s) => byId(s.effectId)),
    buckets,
    { catalyst: input.catalyst, effectWindows: input.fixedWindows },
  ).totalDamage;

describe("optimize", () => {
  it("returns at most the limit, best first", () => {
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(input.limit);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].totalDamage).toBeLessThanOrEqual(
        results[i - 1].totalDamage,
      );
    }
  });

  it("reports the total damage the simulator gives for each build", () => {
    for (const entry of results) {
      expect(entry.totalDamage).toBeCloseTo(totalOf(entry));
    }
  });

  it("keeps the fixed fireteam support in every build", () => {
    for (const entry of results) {
      expect(entry.selections).toContainEqual(input.fixedSelections[0]);
    }
  });

  it("uses only own effects the class and subclass can provide", () => {
    for (const entry of results) {
      for (const s of entry.selections.filter(
        (s) => s.provider !== "fireteamSupport",
      )) {
        expect(
          canProvide(
            byId(s.effectId),
            s.provider,
            input.guardianClass,
            entry.subclass,
          ),
        ).toBe(true);
      }
    }
  });

  it("chooses at most one own effect per exclusive group", () => {
    for (const entry of results) {
      const groups = entry.selections
        .filter((s) => s.provider !== "fireteamSupport")
        .map((s) => byId(s.effectId).exclusiveGroup)
        .filter((g) => g !== undefined);
      expect(new Set(groups).size).toBe(groups.length);
    }
  });

  it("leaves out own effects that add nothing", () => {
    for (const entry of results) {
      const own = entry.selections.filter(
        (s) => s.provider !== "fireteamSupport",
      );
      for (const removed of own) {
        const smaller = {
          ...entry,
          selections: entry.selections.filter((s) => s !== removed),
        };
        expect(totalOf(smaller)).toBeLessThan(entry.totalDamage - 1e-6);
      }
    }
  });

  it("finds a build at least as good as a hand-made one", () => {
    const handMade = simulate(
      weapon,
      input.damagePhaseSeconds,
      ["tractor-cannon", "well-of-radiance", "surge-3x"].map(byId),
      buckets,
      { catalyst: true, effectWindows: input.fixedWindows },
    ).totalDamage;
    expect(results[0].totalDamage).toBeGreaterThanOrEqual(handMade);
  });
});

describe("optimize with an artifact", () => {
  // Two artifacts with one slot per tier: the perks of A share a tier, so they never come together.
  const source = { name: "test", retrieved: "2026-10-24", status: "verified" as const };
  const slot = { value: 1, source };
  const artifacts = {
    slots: [slot, slot, slot],
    artifacts: [
      {
        id: "a",
        code: 1,
        name: "A",
        season: "Test",
        perks: [
          { name: "Particle Reconstruction", tier: 2, effectId: "particle-reconstruction" },
          { name: "Elemental Overdrive", tier: 2, effectId: "elemental-overdrive-solar" },
        ],
      },
      {
        id: "b",
        code: 2,
        name: "B",
        season: "Test",
        perks: [
          { name: "Elemental Overdrive", tier: 1, effectId: "elemental-overdrive-solar" },
        ],
      },
    ],
  };
  const limited = optimize({ ...input, artifacts, limit: 200 });

  it("never combines perks that the slots of one artifact do not allow", () => {
    for (const entry of limited) {
      const perks = entry.selections.filter((s) => s.provider === "artifact");
      expect(perks.length).toBeLessThanOrEqual(1);
      if (perks.length > 0) expect(entry.artifactId).toBeDefined();
    }
  });

  it("names the artifact of the perks it uses", () => {
    const withPerk = limited.filter((e) =>
      e.selections.some((s) => s.provider === "artifact"),
    );
    expect(withPerk.length).toBeGreaterThan(0);
    for (const entry of withPerk) {
      const ids = entry.selections.filter((s) => s.provider === "artifact").map((s) => s.effectId);
      const artifact = artifacts.artifacts.find((a) => a.id === entry.artifactId)!;
      expect(ids.every((id) => artifact.perks.some((p) => p.effectId === id))).toBe(true);
    }
  });
});

describe("canProvide with subclass", () => {
  it("lets only a Solar Warlock provide Well of Radiance itself", () => {
    const well = byId("well-of-radiance");
    expect(canProvide(well, "subclass", "warlock", "solar")).toBe(true);
    expect(canProvide(well, "subclass", "warlock", "void")).toBe(false);
  });

  it("ignores the subclass for armor and fireteam support", () => {
    expect(canProvide(byId("surge-3x"), "armor", "hunter", "arc")).toBe(true);
    expect(
      canProvide(byId("well-of-radiance"), "fireteamSupport", "hunter", "arc"),
    ).toBe(true);
  });
});
