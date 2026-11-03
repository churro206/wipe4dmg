// The scaffold of the weapon items (ADR 0019, Q1): one item file per exotic from its Quantum base
// row. Fixtures here; the generated files are checked in tests/itemFiles.test.ts.

import { describe, expect, it } from "vitest";
import type {
  ClarityEntry,
  ManifestWeapon,
  QuantumWeaponRow,
} from "../src/data/schema";
import { clarityEntry, type ItemSources } from "../scripts/lib/items/refs";
import { scaffoldWeaponItems } from "../scripts/lib/weaponScaffold";

const row = (over: Partial<QuantumWeaponRow>): QuantumWeaponRow => ({
  id: "specials-shotgun-test-gun",
  tab: "specials",
  weaponType: "shotgun",
  name: "Test Gun",
  variant: "",
  totalDamage: 1000,
  magDamage: 400,
  magazine: 4,
  totalShots: 20,
  rpm: 300,
  reloadSeconds: 0.5,
  timeToEmptySeconds: 12,
  bodyDamage: 100,
  precisionDamage: 120,
  textCells: {},
  note: "",
  ...over,
});

const manifest = (over: Partial<ManifestWeapon> = {}): ManifestWeapon => ({
  hash: 1,
  name: "Test Gun",
  weaponType: "shotgun",
  element: "arc",
  ammo: "special",
  intrinsics: [],
  perks: [],
  mods: [],
  catalyst: null,
  description: "",
  stats: {},
  ...over,
});

const clarity = (name: string, type: string, text: string, itemName = "Test Gun"): ClarityEntry => ({
  hash: 1,
  name,
  type,
  itemName,
  text,
});

const scaffold = (
  rows: QuantumWeaponRow[],
  weapons: ManifestWeapon[] = [manifest()],
  entries: ClarityEntry[] = [clarity("Frame", "Weapon Frame Exotic", "Fires at 300 RPM.")],
  extra: { aliases?: Record<string, string>; existingIds?: string[] } = {},
) =>
  scaffoldWeaponItems({
    quantum: rows,
    manifest: weapons,
    clarity: entries,
    aliases: extra.aliases ?? {},
    existingIds: new Set(extra.existingIds ?? []),
    retrieved: "2026-11-03",
  });

describe("clarityEntry", () => {
  const sources = (entries: ClarityEntry[]) => ({ clarity: { entries } }) as unknown as ItemSources;

  it("takes one entry where Clarity lists a perk once per socket with the same text", () => {
    const entry = clarity("Trinary Vision", "Weapon Trait Exotic", "same");
    expect(clarityEntry(sources([entry, entry, entry]), "Trinary Vision", "Test Gun").text).toBe("same");
  });

  it("still fails where the texts of one name differ", () => {
    const entries = [clarity("Perk", "a", "one"), clarity("Perk", "a", "two")];
    expect(() => clarityEntry(sources(entries), "Perk", "Test Gun")).toThrow(/2 Clarity entries/);
  });
});

describe("scaffoldWeaponItems", () => {
  it("builds the hit, the timing and the shot rule from the base row", () => {
    const { items, skipped } = scaffold([row({})]);
    expect(skipped).toEqual([]);
    const [item] = items as Record<string, any>[];
    expect(item).toMatchObject({
      id: "test-gun",
      kind: "exoticWeapon",
      name: "Test Gun",
      fireRateRpm: "$quantum[specials-shotgun-test-gun].timing.fireRateRpm",
      magazine: "$quantum[specials-shotgun-test-gun].timing.magazine",
      totalShots: "$quantum[specials-shotgun-test-gun].timing.totalShots",
      reloadTimeMs: "$quantum[specials-shotgun-test-gun].timing.reloadTimeMs",
      parts: {
        shot: {
          name: "Shot",
          damage: "$quantum[specials-shotgun-test-gun].precisionDamage",
          precision: true,
          delivery: "impact",
        },
      },
      rules: [{ id: "shot", on: { on: "shot" }, do: [{ type: "spawn", part: "shot" }] }],
    });
    expect(item.texts).toEqual([
      { source: "clarity", entry: "Frame", hash: expect.stringMatching(/^[0-9a-f]{8}$/) },
    ]);
    expect(item.catalyst).toBeUndefined();
    expect(item.chargeTimeMs).toMatchObject({ value: 0, source: { status: "derived" } });
  });

  it("takes the body damage where the weapon has no precision hit", () => {
    const { items } = scaffold([row({ precisionDamage: null })]);
    const part = (items[0] as any).parts.shot;
    expect(part.damage).toBe("$quantum[specials-shotgun-test-gun].bodyDamage");
    expect(part.precision).toBeUndefined();
  });

  it("takes the charge of a fusion rifle or bow from the manifest", () => {
    const { items } = scaffold(
      [row({ weaponType: "fusionRifle" })],
      [manifest({ weaponType: "fusionRifle", stats: { "Charge Time": 600 } })],
    );
    expect((items[0] as any).chargeTimeMs).toBe('$manifest[Test Gun].stat("Charge Time")');
  });

  it("takes the catalyst timing from the cata row", () => {
    const cata = row({
      id: "specials-shotgun-test-gun-cata",
      variant: "cata",
      magazine: 5,
      reloadSeconds: 0.3,
    });
    const { items } = scaffold([row({}), cata], [manifest({ catalyst: { name: "Test Catalyst", hash: 2, perks: ["Big Mag"], stats: {} } })], [
      clarity("Frame", "Weapon Frame Exotic", "Fires at 300 RPM."),
      clarity("Test Gun Catalyst", "Weapon Catalyst Exotic", "Increases Magazine Size by 1 (4🠚5)"),
    ]);
    const catalyst = (items[0] as any).catalyst;
    expect(catalyst).toMatchObject({
      name: "Big Mag, Test Gun Catalyst",
      effect: "timing",
      timing: {
        magazine: "$quantum[specials-shotgun-test-gun-cata].timing.magazine",
        totalShots: "$quantum[specials-shotgun-test-gun-cata].timing.totalShots",
        reloadTimeMs: "$quantum[specials-shotgun-test-gun-cata].timing.reloadTimeMs",
      },
    });
  });

  it("leaves the effect unknown where the cata row differs in damage or not at all", () => {
    const damage = row({ id: "specials-shotgun-test-gun-cata", variant: "cata", precisionDamage: 150 });
    expect((scaffold([row({}), damage]).items[0] as any).catalyst.effect).toBe("unknown");
    const same = row({ id: "specials-shotgun-test-gun-cata", variant: "cata" });
    expect((scaffold([row({}), same]).items[0] as any).catalyst.effect).toBe("unknown");
    expect((scaffold([row({}), same]).items[0] as any).catalyst.timing).toBeUndefined();
  });

  it("a catalyst without a cata row is unknown, a weapon without a catalyst has none", () => {
    const withCatalyst = scaffold(
      [row({})],
      [manifest({ catalyst: { name: "Test Catalyst", hash: 2, perks: [], stats: {} } })],
    );
    expect((withCatalyst.items[0] as any).catalyst).toMatchObject({ effect: "unknown" });
    expect((withCatalyst.items[0] as any).catalyst.timing).toBeUndefined();
  });

  it("a weapon with only a cata row has the catalyst built in: that row is the base", () => {
    const { items } = scaffold([row({ id: "specials-shotgun-test-gun-cata", variant: "cata" })]);
    const item = items[0] as any;
    expect(item.fireRateRpm).toBe("$quantum[specials-shotgun-test-gun-cata].timing.fireRateRpm");
    expect(item.catalyst).toBeUndefined();
  });

  it("finds a weapon under a spelling of the alias file and skips existing items", () => {
    const aliased = row({ name: "Tesselation", id: "specials-fusion-rifle-tesselation" });
    const weapons = [manifest({ name: "Tessellation" }), manifest({ name: "Done Gun" })];
    const entries = [clarity("Frame", "Weapon Frame Exotic", "x", "Tessellation")];
    const { items, skipped } = scaffold([aliased, row({ name: "Done Gun" })], weapons, entries, {
      aliases: { tesselation: "Tessellation" },
      existingIds: ["done-gun"],
    });
    expect(items.map((i) => (i as any).id)).toEqual(["tessellation"]);
    expect(skipped).toEqual([]);
  });

  it("names what it skips and why", () => {
    const noBase = row({ variant: "direct impact" });
    const noHit = row({ id: "b", name: "No Hit", bodyDamage: null, precisionDamage: null });
    const noTiming = row({ id: "c", name: "No Timing", timeToEmptySeconds: null, rpm: null });
    const noText = row({ id: "d", name: "No Text" });
    const weapons = ["Test Gun", "No Hit", "No Timing", "No Text", "No Row"].map((name) =>
      manifest({ name }),
    );
    const entries = ["Test Gun", "No Hit", "No Timing"].map((name) =>
      clarity("Frame", "Weapon Frame Exotic", "x", name),
    );
    const { items, skipped } = scaffold([noBase, noHit, noTiming, noText], weapons, entries);
    expect(items).toEqual([]);
    expect(skipped.map((s) => s.name)).toEqual(["Test Gun", "No Hit", "No Timing", "No Text", "No Row"]);
    expect(skipped.map((s) => s.reason)).toEqual([
      expect.stringContaining("no base row"),
      expect.stringContaining("no hit damage"),
      expect.stringContaining("timing"),
      expect.stringContaining("no Clarity text"),
      expect.stringContaining("no Quantum row"),
    ]);
  });
});
