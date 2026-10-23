import { describe, expect, it } from "vitest";
import rawAbilityStats from "../src/data/ability-stats.json";
import rawAbilities from "../src/data/abilities.json";
import rawRows from "../src/data/aegis-abilities.json";
import { hasQuote } from "../scripts/lib/compendiumAbilities";
import rawSnapshot from "../src/data/compendium-abilities.json";
import rawEffects from "../src/data/effects.json";
import rawManifest from "../src/data/manifest-abilities.json";
import {
  AegisAbilityRow,
  CompendiumSnapshot,
  ManifestAbilities,
  type ManifestAbility,
  type AegisAbilityRow as Row,
  type Source,
} from "../src/data/schema";
import { loadAbilities } from "../src/engine/loadAbilities";
import { loadAbilityStats } from "../src/engine/loadData";

const rows = AegisAbilityRow.array().parse(rawRows);
const abilityStats = loadAbilityStats(rawAbilityStats);

const source = {
  name: "test",
  retrieved: "2026-10-19",
  status: "verified",
} as const;
// Test rows in the format of the Aegis import; values are test inputs, not game values.
const row = (
  id: string,
  stat100: number,
  stat200: number | null,
  includedEffectIds: string[] = [],
): Row => ({
  id,
  category: "melee",
  name: id,
  assumptions: [],
  includedEffectIds,
  primaryTick: "",
  secondaryTicks: "",
  perUseStat100: { value: stat100, source },
  perUseStat200:
    stat200 === null
      ? { value: null, source: { ...source, status: "missing" } }
      : { value: stat200, source },
  gameVersion: "9.7.0.3",
});
const packageAbility = (aegisRowId: string) => ({
  id: "test-melee",
  code: 1,
  name: "Test Melee",
  kind: "melee",
  element: "solar",
  providers: [{ kind: "subclass" }],
  aegisRowId,
  package: true,
});
const meleePerPoint = abilityStats.find((s) => s.kind === "melee")!
  .damagePerPoint.value!;
const componentsOf = (testRows: Row[], aegisRowId: string) =>
  loadAbilities([packageAbility(aegisRowId)], testRows, abilityStats)[0]
    .components;

describe("loadAbilities with an Aegis package", () => {
  it("takes the value per use at stat 100 and the included effects from the Aegis row", () => {
    const components = componentsOf(
      [row("full", 1000, 1300, ["radiant"])],
      "full",
    );
    const total = components.reduce(
      (sum, c) => sum + c.damagePerTick.value!,
      0,
    );
    expect(total).toBeCloseTo(1000);
    for (const component of components) {
      expect(component.includedEffectIds).toEqual(["radiant"]);
      expect(component.delayMs.value).toBe(0);
      expect(component.ticks.value).toBe(1);
    }
  });

  it("adds effects that the Aegis import could not recognise to the included effects", () => {
    const ability = {
      ...packageAbility("tagged"),
      extraIncludedEffectIds: ["moebius-tether"],
    };
    const [loaded] = loadAbilities(
      [ability],
      [row("tagged", 1000, 1300, ["radiant"])],
      abilityStats,
    );
    expect(loaded.components[0].includedEffectIds).toEqual([
      "radiant",
      "moebius-tether",
    ]);
  });

  it("lets the whole package scale if Aegis measured the full stat factor", () => {
    const components = componentsOf(
      [row("full", 1000, 1000 * (1 + 100 * meleePerPoint))],
      "full",
    );
    expect(
      components
        .filter((c) => c.scalesWithAbilityStat)
        .map((c) => c.damagePerTick.value),
    ).toEqual([expect.closeTo(1000)]);
  });

  it("splits the package so that stat 100 and stat 200 match the Aegis values", () => {
    // Factor 1.1 instead of 1.3: only a third scales, e.g. a melee whose ignition does not scale.
    const components = componentsOf([row("partial", 1000, 1100)], "partial");
    const atStat = (stat: number) =>
      components.reduce(
        (sum, c) =>
          sum +
          c.damagePerTick.value! *
            (c.scalesWithAbilityStat ? 1 + meleePerPoint * (stat - 100) : 1),
        0,
      );
    expect(atStat(100)).toBeCloseTo(1000);
    expect(atStat(200)).toBeCloseTo(1100);
  });

  it("lets nothing scale if Aegis measured less damage at stat 200", () => {
    const components = componentsOf([row("lower", 1000, 950)], "lower");
    expect(components.every((c) => !c.scalesWithAbilityStat)).toBe(true);
  });

  it("lets the package scale fully if the value at stat 200 is missing, marked unverified", () => {
    const components = componentsOf([row("no200", 1000, null)], "no200");
    expect(components).toHaveLength(1);
    expect(components[0].scalesWithAbilityStat).toBe(true);
    expect(components[0].damagePerTick.source.status).toBe("unverified");
  });

  it("fails for an unknown Aegis row or a row without a value", () => {
    expect(() => componentsOf([], "nope")).toThrow(/nope/);
    const empty = {
      ...row("empty", 0, 0),
      perUseStat100: {
        value: null,
        source: { ...source, status: "missing" as const },
      },
    };
    expect(() => componentsOf([empty], "empty")).toThrow(/empty/);
  });

  it("rejects an ability with both a package and components, or neither", () => {
    const both = {
      ...packageAbility("full"),
      components: componentsOf([row("full", 1, 1.3)], "full"),
    };
    expect(() => loadAbilities([both], rows, abilityStats)).toThrow();
    const neither = { ...packageAbility("full"), package: undefined };
    expect(() => loadAbilities([neither], rows, abilityStats)).toThrow();
  });
});

describe("loadAbilities with providers from the manifest", () => {
  // Manifest items in the format of manifest-abilities.json; hashes are test inputs.
  const manifest: ManifestAbility[] = [
    {
      name: "Silence and Squall",
      kind: "super",
      guardianClass: "hunter",
      subclass: "stasis",
      hash: 1,
    },
    {
      name: "Silence and Squall",
      kind: "super",
      guardianClass: "hunter",
      subclass: "prismatic",
      hash: 2,
    },
    {
      name: "Slicewire Grenade",
      kind: "grenade",
      guardianClass: null,
      subclass: "strand",
      hash: 3,
    },
    {
      name: "Slicewire Grenade",
      kind: "grenade",
      guardianClass: "titan",
      subclass: "prismatic",
      hash: 4,
    },
    {
      name: "Slicewire Grenade",
      kind: "grenade",
      guardianClass: "warlock",
      subclass: "prismatic",
      hash: 5,
    },
  ];
  const ability = (name: string, kind: string, element: string) => ({
    id: "test",
    code: 1,
    name,
    kind,
    element,
    aegisRowId: "full",
    package: true,
  });
  const load = (name: string, kind: string, element: string) =>
    loadAbilities(
      [ability(name, kind, element)],
      [row("full", 1000, 1300)],
      abilityStats,
      manifest,
    )[0];

  it("gives a class ability its class with element and Prismatic, despite other spelling", () => {
    expect(load("Silence & Squall", "super", "stasis").providers).toEqual([
      {
        kind: "subclass",
        classes: ["hunter"],
        subclasses: ["stasis", "prismatic"],
      },
    ]);
  });

  it("gives a shared grenade every class of its element and the Prismatic classes", () => {
    expect(load("Slicewire", "grenade", "strand").providers).toEqual([
      { kind: "subclass", subclasses: ["strand"] },
      {
        kind: "subclass",
        classes: ["titan", "warlock"],
        subclasses: ["prismatic"],
      },
    ]);
  });

  it("takes the manifest hash of the element item for the icon", () => {
    expect(load("Silence & Squall", "super", "stasis").manifestHash).toBe(1);
  });

  it("fails if the manifest does not know the ability", () => {
    expect(() => load("Nope", "super", "stasis")).toThrow(/Nope/);
  });

  it("keeps providers that the data file sets itself", () => {
    expect(componentsOf([row("full", 1000, 1300)], "full")).toHaveLength(1);
  });
});

describe("loadAbilities with components from the Compendium (U9)", () => {
  const component = (ticks: number) => ({
    id: "hit",
    name: "Hit",
    delayMs: { value: 100, source },
    damagePerTick: { value: 500, source },
    ticks: { value: ticks, source },
    tickIntervalMs: { value: ticks > 1 ? 1000 : 0, source },
    scalesWithAbilityStat: true,
  });
  const timing = (hits: number) => ({
    abilityId: "test-melee",
    firstHitMs: { value: 1200, source },
    hitIntervalMs: { value: 800, source },
    hits: { value: hits, source },
  });
  const load = (ticks: number, timings: ReturnType<typeof timing>[] = []) =>
    loadAbilities(
      [packageAbility("full")],
      [row("full", 1000, 1300)],
      abilityStats,
      [],
      undefined,
      [],
      [],
      timings,
      [{ abilityId: "test-melee", components: [component(ticks)] }],
    )[0];

  it("replace the package of the base ability", () => {
    const ability = load(1);
    expect(ability.package).toBeUndefined();
    expect(ability.components.map((c) => c.damagePerTick.value)).toEqual([500]);
  });

  it("start at the first hit of the super timing and repeat once per hit", () => {
    const [c] = load(1, [timing(3)]).components;
    expect([c.delayMs.value, c.ticks.value, c.tickIntervalMs.value]).toEqual([
      1300, 3, 800,
    ]);
  });

  it("keep their own ticks with a single hit, and refuse ticks over several hits", () => {
    const [c] = load(4, [timing(1)]).components;
    expect([c.delayMs.value, c.ticks.value]).toEqual([1300, 4]);
    expect(() => load(4, [timing(2)])).toThrow(/ticks per hit/);
  });

  it("fail for an ability without a package", () => {
    expect(() =>
      loadAbilities([packageAbility("full")], [row("full", 1000, 1300)], abilityStats, [], undefined, [], [], [], [
        { abilityId: "nope", components: [component(1)] },
      ]),
    ).toThrow(/nope/);
  });
});

describe("abilities.json", () => {
  const abilities = loadAbilities(
    rawAbilities,
    rows,
    abilityStats,
    ManifestAbilities.parse(rawManifest).abilities,
  );

  it("has unique ids and codes", () => {
    expect(new Set(abilities.map((a) => a.id)).size).toBe(abilities.length);
    expect(new Set(abilities.map((a) => a.code)).size).toBe(abilities.length);
  });

  it("quotes every value taken from the Compendium, and the quote is still in the snapshot", () => {
    const entries = CompendiumSnapshot.parse(rawSnapshot).entries;
    const sources = (value: unknown): Source[] =>
      value && typeof value === "object"
        ? [
            ...("retrieved" in value && "status" in value
              ? [value as Source]
              : []),
            ...Object.values(value).flatMap(sources),
          ]
        : [];
    for (const ability of rawAbilities) {
      for (const source of sources(ability)) {
        if (
          !source.name.startsWith("Destiny Data Compendium") ||
          source.status === "missing"
        )
          continue;
        expect(source.quote, `${ability.id}: ${source.name}`).toBeDefined();
        const link = ability.compendium;
        expect(
          hasQuote(entries, {
            tab: link.tab,
            entry: link.entry,
            quote: source.quote!,
          }),
          `${ability.id}: "${source.quote}"`,
        ).toBe(true);
      }
    }
  });

  it("links every ability to the Compendium and grants only known effects", () => {
    const effectIds = new Set(rawEffects.map((e) => e.id));
    for (const ability of abilities) {
      expect(ability.compendium, ability.id).toBeDefined();
      for (const id of ability.grantsEffectIds ?? []) {
        expect(effectIds, ability.id).toContain(id);
      }
      for (const component of ability.components) {
        for (const id of component.includedEffectIds ?? []) {
          expect(effectIds, ability.id).toContain(id);
        }
      }
    }
  });

  it("contains Thundercrash", () => {
    expect(abilities.find((a) => a.id === "thundercrash")).toMatchObject({
      kind: "super",
      element: "arc",
    });
  });
});
