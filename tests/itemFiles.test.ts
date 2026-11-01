// The item files under src/data/items/weapons (docs/architecture.md section 5, B4a step 5): each
// file resolves against the real snapshots, its name is its id, the weapon import takes the item in
// place of a package and no override is left for a weapon that has an item.

import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import rawPackages from "../src/data/weapon-packages.json";
import { Weapon } from "../src/data/schema";
import { ITEM_WEAPONS_DIR } from "../scripts/lib/items/loadItems";
import { loadWeaponImportInputs } from "../scripts/lib/weaponImportInputs";
import { buildWeaponImport } from "../scripts/lib/weaponPackages";

const inputs = loadWeaponImportInputs();
const result = buildWeaponImport(inputs);
const files = readdirSync(ITEM_WEAPONS_DIR).filter((f) => f.endsWith(".json"));
const packages = Weapon.array().parse(rawPackages);

describe("item files", () => {
  it("every file resolves to a weapon with its file name as id", () => {
    expect(files.length).toBeGreaterThan(0);
    expect(inputs.items.map((i) => `${i.weapon.id}.json`).sort()).toEqual([...files].sort());
  });

  it("no override names a weapon that has an item", () => {
    const names = new Set(inputs.items.map((i) => i.weapon.name));
    expect(inputs.overrides.filter((o) => names.has(o.weapon)).map((o) => o.weapon)).toEqual([]);
  });

  it("the import puts the item in place of the package, once, with a stable code", () => {
    for (const { weapon } of inputs.items) {
      const built = result.packages.filter((p) => p.id === weapon.id);
      expect(built).toHaveLength(1);
      expect(built[0].code).toBe(weapon.code);
      expect(built[0].damageInstances).toEqual(weapon.damageInstances);
      expect(built[0].rules).toEqual(weapon.rules);
      expect(result.gaps.map((g) => g.name)).not.toContain(weapon.name);
      expect(result.report.weapons.find((w) => w.name === weapon.name)?.status).toBe("item");
    }
  });

  it("weapon-packages.json holds the built items (run npm run build:weapons)", () => {
    for (const { weapon } of inputs.items)
      expect(packages.find((p) => p.id === weapon.id)).toEqual(
        result.packages.find((p) => p.id === weapon.id),
      );
  });
});

describe("Polaris Lance as an item", () => {
  // The built package: the import adds the Rally reload factor that every source's reload contains
  const polaris = result.packages.find((p) => p.id === "polaris-lance")!;

  it("shoots from Quantum and reloads: a precision hit refills, there is no noReloads", () => {
    const [shot, fifth] = polaris.damageInstances;
    expect(shot).toMatchObject({ id: "shot", canPrecision: true });
    expect(shot.damagePerTick.value).toBe(97);
    expect(shot.damagePerTick.source.status).toBe("verified");
    expect(fifth).toMatchObject({ id: "perfect-fifth", canPrecision: false, scale: "aegisVisual" });
    expect(fifth.damagePerTick.value).toBe(93.656);
    expect(fifth.damagePerTick.source.status).toBe("fitted");
    expect(polaris.fireRateRpm.value).toBe(150);
    expect(polaris.magazine.value).toBe(14);
    expect(polaris.reloadTimeMs.value).toBe(1240);
    expect(polaris.totalShots.value).toBeNull();
    expect(polaris.reloadDurationIncluded?.value).toBe(0.9);
    const refill = polaris.rules?.find((r) => r.do.some((a) => a.type === "refill"));
    expect(refill?.on).toEqual({ on: "hit", part: "shot", precision: true });
  });

  it("every fifth precision hit sets off the Perfect Fifth after 0.5 s with 40 scorch", () => {
    const rules = polaris.rules ?? [];
    const fire = rules.find((r) => r.do.some((a) => a.type === "spawn" && a.part === "perfect-fifth"));
    const spawn = fire?.do.find((a) => a.type === "spawn");
    expect(spawn?.type === "spawn" && spawn.delayMs?.value).toBe(500);
    const counter = fire?.if?.find((c) => c.type === "counter");
    expect(counter?.type === "counter" && counter.value.value).toBe(4);
    const scorch = rules.find((r) => r.do.some((a) => a.type === "applyStatus"));
    const apply = scorch?.do.find((a) => a.type === "applyStatus");
    expect(apply?.type === "applyStatus" && apply.stacks?.value).toBe(40);
  });
});
