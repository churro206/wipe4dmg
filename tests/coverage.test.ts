import { describe, expect, it } from "vitest";
import { coverageMarkdown } from "./support/coverageMarkdown";
import rawSnapshot from "../src/data/compendium-abilities.json";
import rawGaps from "../src/data/ability-gaps.json";
import {
  Ability,
  AbilityGap,
  AegisAbilityRow,
  CompendiumSnapshot,
  type CompendiumEntry,
} from "../src/data/schema";
import { abilityCoverage } from "../src/engine/coverage";
import { abilities, aegisRows, effects } from "../src/ui/data";

const source = {
  name: "test",
  retrieved: "2026-10-19",
  status: "verified",
} as const;
const n = (value: number | null) => ({
  value,
  source: value === null ? { ...source, status: "missing" as const } : source,
});
const entry = (
  name: string,
  section: string,
  extra = "Base Cooldown: 100 seconds",
): CompendiumEntry => ({
  tab: "Solar",
  section,
  name,
  text: "Some text of this entry.",
  extra,
});
const aegisRow = (
  name: string,
  status: "verified" | "unverified",
): AegisAbilityRow => ({
  id: `super-${name.toLowerCase().replace(/\W+/g, "-")}`,
  category: "super",
  name,
  assumptions: [],
  includedEffectIds: [],
  primaryTick: "",
  secondaryTicks: "",
  perUseStat100: { value: 1000, source: { ...source, status } },
  perUseStat200: { value: 1450, source: { ...source, status } },
  gameVersion: "9.7.0.3",
});
// Test abilities; values are test inputs, not game values.
const ability = (
  id: string,
  name: string,
  extra: Partial<Ability> = {},
): Ability =>
  Ability.parse({
    id,
    code: 1,
    name,
    kind: "super",
    element: "solar",
    providers: [{ kind: "subclass" }],
    compendium: { tab: "Solar", entry: name },
    components: [
      {
        id: "hit",
        name: "Hit",
        delayMs: n(0),
        damagePerTick: n(1000),
        ticks: n(1),
        tickIntervalMs: n(0),
        scalesWithAbilityStat: true,
      },
    ],
    ...extra,
  });

describe("abilityCoverage", () => {
  const entries = [
    entry("Blade Barrage", "Super Abilities", "Tier 4 Super"),
    entry("Hammer of Sol", "Super Abilities", "Tier 2 Super"),
    entry("Golden Gun: Marksman", "Super Abilities", "Tier 3 Super"),
    entry("Song of Flame", "Super Abilities", "Tier 3 Super"),
    entry("Well of Radiance", "Super Abilities", "Tier 1 Super"),
    entry("Daybreak", "Super Abilities", "Tier 3 Super"),
    entry("Fusion Grenade", "Grenade Abilities"),
    entry("Touch of Flame", "Grenade Abilities", ""), // aspect enhancement, not an ability
    entry("Ember of Ashes", "Fragments"),
  ];
  const abilities = [
    ability("blade-barrage", "Blade Barrage"),
    ability("hammer-of-sol", "Hammer of Sol", {
      package: true,
      aegisRowId: "super-hammer-of-sol",
      usage: {
        type: "drain",
        baseDurationMs: n(21_000),
        drainPerAttack: n(0.12),
        attackIntervalMs: n(1500),
      },
    }),
    ability("golden-gun-marksman", "Golden Gun: Marksman", {
      usage: {
        type: "shots",
        shots: n(3),
        shotIntervalMs: n(null),
        baseDurationMs: n(12_000),
      },
    }),
    ability("well-of-radiance", "Well of Radiance", {
      components: [],
      grantsEffectIds: ["well-of-radiance"],
    }),
  ];
  const rows = [
    aegisRow("Song of Flame", "unverified"),
    aegisRow("Daybreak", "verified"),
  ];
  const coverage = abilityCoverage(entries, abilities, rows);
  const byName = (name: string) => coverage.find((c) => c.name === name)!;

  it("lists every ability of the Compendium once, without aspect enhancements and other sections", () => {
    expect(coverage.map((c) => c.name)).toEqual([
      "Blade Barrage",
      "Hammer of Sol",
      "Golden Gun: Marksman",
      "Song of Flame",
      "Well of Radiance",
      "Daybreak",
      "Fusion Grenade",
    ]);
    expect(byName("Fusion Grenade")).toMatchObject({
      kind: "grenade",
      element: "Solar",
    });
  });

  it("tells components, packages and effect-only supers apart", () => {
    expect(byName("Blade Barrage")).toMatchObject({
      status: "components",
      abilityId: "blade-barrage",
    });
    expect(byName("Hammer of Sol")).toMatchObject({
      status: "package",
      aegisRowId: "super-hammer-of-sol",
    });
    expect(byName("Well of Radiance").status).toBe("effectOnly");
  });

  it("rates the super window of supers", () => {
    expect(byName("Hammer of Sol").superWindow).toBe("exact");
    expect(byName("Golden Gun: Marksman").superWindow).toBe("estimate");
    expect(byName("Blade Barrage").superWindow).toBe("none");
    expect(byName("Fusion Grenade").superWindow).toBeUndefined();
  });

  it("gives a reason for every missing ability", () => {
    expect(byName("Song of Flame")).toMatchObject({
      status: "missing",
      reason: "aegisNotNormalised",
    });
    expect(byName("Daybreak")).toMatchObject({
      status: "missing",
      reason: "notYetModelled",
    });
    expect(byName("Fusion Grenade")).toMatchObject({
      status: "missing",
      reason: "noAegisRow",
    });
  });

  it("takes the reason of a known gap from the gaps data file", () => {
    const gaps = [
      {
        compendium: { tab: "Solar", entry: "Daybreak" },
        reason: "aegisOnlyWithUnmodelledBuffs" as const,
        note: "test",
      },
    ];
    const withGaps = abilityCoverage(entries, abilities, rows, gaps);
    expect(withGaps.find((c) => c.name === "Daybreak")!.reason).toBe(
      "aegisOnlyWithUnmodelledBuffs",
    );
  });

  it("fails for a gap that is modelled or not in the Compendium", () => {
    const gap = (entry: string) => [
      {
        compendium: { tab: "Solar", entry },
        reason: "noUsableData" as const,
        note: "test",
      },
    ];
    expect(() =>
      abilityCoverage(entries, abilities, rows, gap("Blade Barrage")),
    ).toThrow(/Blade Barrage/);
    expect(() =>
      abilityCoverage(entries, abilities, rows, gap("Nope")),
    ).toThrow(/Nope/);
  });

  it("fails if an ability links to an unknown Compendium entry", () => {
    const orphan = ability("orphan", "Orphan Super");
    expect(() => abilityCoverage(entries, [orphan], rows)).toThrow(
      /Orphan Super/,
    );
  });
});

describe("docs/coverage.md", () => {
  it("is up to date; run npm run coverage after changing data files", async () => {
    // The same data as the website: abilities from Compendium parts and all effects of the model.
    const snapshot = CompendiumSnapshot.parse(rawSnapshot);
    const expected = coverageMarkdown(
      abilityCoverage(
        snapshot.entries,
        abilities,
        aegisRows,
        AbilityGap.array().parse(rawGaps),
      ),
      effects,
    );
    await expect(expected).toMatchFileSnapshot("../docs/coverage.md");
  });
});
