import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { collectIconRefs, iconFileName } from "../scripts/lib/bungieIcons";
import rawEffects from "../src/data/effects.json";
import rawIconRefs from "../src/data/icon-refs.json";
import rawIcons from "../src/data/icons.json";
import { IconIndex, IconRef } from "../src/data/schema";
import raw from "../src/data/weapons/one-thousand-voices.json";
import { loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";

const effects = loadEffects(rawEffects);
const weapons = [loadWeapon(raw)];
const extras = IconRef.array().parse(rawIconRefs);

describe("collectIconRefs", () => {
  const refs = collectIconRefs(effects, weapons, extras);

  it("collects effects, weapons and extras under their keys", () => {
    const keys = refs.map((r) => r.key);
    expect(keys).toContain("effect:well-of-radiance");
    expect(keys).toContain("weapon:one-thousand-voices");
    expect(keys).toContain("subclass:warlock:solar");
  });

  it("uses the inventory item table for weapons", () => {
    const weapon = refs.find((r) => r.key === "weapon:one-thousand-voices")!;
    expect(weapon.manifestRef).toEqual({
      table: "DestinyInventoryItemDefinition",
      hash: weapons[0].manifestHash,
    });
  });

  it("rejects duplicate keys", () => {
    expect(() =>
      collectIconRefs(effects, weapons, [...extras, extras[0]]),
    ).toThrow(extras[0].key);
  });
});

describe("iconFileName", () => {
  it("names the file after table and hash and keeps the extension", () => {
    expect(
      iconFileName(
        { table: "DestinyInventoryItemDefinition", hash: 123 },
        "/common/destiny2_content/icons/abc.png",
      ),
    ).toBe("icons/item-123.png");
    expect(
      iconFileName(
        { table: "DestinyTraitDefinition", hash: 7 },
        "/common/destiny2_content/icons/def.jpg",
      ),
    ).toBe("icons/trait-7.jpg");
  });

  it("rejects an icon path without a known image type", () => {
    expect(() =>
      iconFileName({ table: "DestinyStatDefinition", hash: 1 }, "/icons/x.gif"),
    ).toThrow();
  });
});

describe("icons data file", () => {
  const index = IconIndex.parse(rawIcons);

  it("has an icon for every effect, weapon and extra", () => {
    for (const ref of collectIconRefs(effects, weapons, extras)) {
      expect(index.icons[ref.key], ref.key).toBeDefined();
    }
  });

  it("points only to files in public/icons", () => {
    for (const path of Object.values(index.icons)) {
      expect(existsSync(`public/${path}`), path).toBe(true);
    }
  });
});
