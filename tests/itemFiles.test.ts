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
    expect(fifth).toMatchObject({ id: "perfect-fifth", canPrecision: false, scale: "compendium" });
    expect(fifth.damagePerTick.value).toBe(215);
    expect(fifth.damagePerTick.source.status).not.toBe("fitted");
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

/** The Aegis rows a value of the package names (status fitted): they no longer check it (I1). */
function fittedRows(value: unknown): Set<string> {
  const rows = new Set<string>();
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v !== null && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (o.status === "fitted" && typeof o.row === "string") rows.add(o.row);
      Object.values(o).forEach(walk);
    }
  };
  walk(value);
  return rows;
}

describe("Truth as an item (B4b step 6)", () => {
  const truth = result.packages.find((p) => p.id === "truth")!;
  it("the rocket comes from Quantum, the 8 cluster munitions of every 3rd rocket from the Compendium", () => {
    const [rocket, cluster] = truth.damageInstances;
    expect(rocket).toMatchObject({ id: "shot", canPrecision: false, delivery: "splash", scale: "quantum" });
    expect(rocket.damagePerTick.value).toBe(1797);
    expect(rocket.damagePerTick.source.status).toBe("verified");
    expect(cluster).toMatchObject({ id: "cluster", canPrecision: false, delivery: "splash", scale: "compendium" });
    expect(cluster.damagePerTick.value).toBe(177);
    expect(cluster.damagePerTick.source.status).not.toBe("fitted");
    const rules = truth.rules ?? [];
    const fire = rules.find((r) => r.do.some((a) => a.type === "spawn" && a.part === "cluster"));
    const spawn = fire?.do.find((a) => a.type === "spawn");
    expect(spawn?.type === "spawn" && spawn.count?.value).toBe(8);
    const every = fire?.if?.find((c) => c.type === "counter");
    expect(every?.type === "counter" && every.value.value).toBe(2); // the 3rd rocket: counter 0, 1, 2
  });

  it("timing from Quantum's 'all bomblets hit' row: 16 rockets, rate from its time to empty", () => {
    // (14.3 s − 5 reloads × 2.35 s) / 15 intervals = 0.17 s; the cycle length fits, the split inside a magazine is Quantum's
    expect(truth.fireRateRpm.value).toBe(352.941);
    expect(truth.magazine.value).toBe(3);
    expect(truth.totalShots.value).toBe(16);
    expect(truth.reloadTimeMs.value).toBe(2350);
    expect(truth.reloadDurationIncluded?.value).toBe(0.9);
  });

  it("Reaper's Tithe x4 comes from Clarity: ×1.4 for 15 s from the first shot, with the catalyst", () => {
    const [tithe] = truth.buffs ?? [];
    expect(tithe.modifiers[0]).toMatchObject({ bucketId: "weaponPerk", damageSources: ["weapon"] });
    expect(tithe.modifiers[0].multiplier.value).toBe(1.4);
    expect(tithe.modifiers[0].multiplier.source.status).toBe("derived");
    expect(tithe.durationMs?.value).toBe(15000);
    const grant = (truth.rules ?? []).find((r) => r.do.some((a) => a.type === "grantBuff"));
    expect(grant?.on).toEqual({ on: "shot" });
    expect(grant?.if).toContainEqual({ type: "hasItem", id: "catalyst" });
    expect(truth.options).toBeUndefined();
  });

  it("the report counts the Tithe row as modelled: its one extra assumption is the catalyst buff", () => {
    const report = result.report.weapons.find((w) => w.name === "Truth")!;
    expect(report.options).toEqual([
      expect.objectContaining({
        rowId: "rocket-launcher-truth-average-prototype-truthseeker-reaper-s-tithe-x4",
        name: "Reaper's Tithe x4",
        kind: "catalyst",
        factor: 1.4,
        durationSeconds: 15,
      }),
    ]);
    expect(report.unusedRows.map((u) => u.rowId)).toEqual(["rocket-launcher-truth"]);
  });

  it("takes no value from an Aegis row: all rows are checks", () => {
    expect([...fittedRows(truth)]).toEqual([]);
  });
});

describe("Hierarchy of Needs as an item (B4b step 7)", () => {
  const hierarchy = result.packages.find((p) => p.id === "hierarchy-of-needs")!;
  const rules = hierarchy.rules ?? [];
  const actionsOf = (id: string) => rules.find((r) => r.id === id)?.do ?? [];

  it("the arrow from Quantum without the ring, 3 seekers from Quantum with ring minus without", () => {
    const [arrow, seekers, two] = hierarchy.damageInstances;
    expect(arrow).toMatchObject({ id: "shot", canPrecision: true, delivery: "impact", scale: "quantum" });
    expect(arrow.damagePerTick.value).toBe(223);
    expect(arrow.damagePerTick.source.status).toBe("verified");
    // (664 − 223) ÷ 3 (Compendium "releases 3 Seekers")
    expect(seekers).toMatchObject({ id: "seekers", canPrecision: false, delivery: "splash", scale: "quantum" });
    expect(seekers.damagePerTick.value).toBe(147);
    expect(seekers.damagePerTick.source.status).toBe("derived");
    expect(two).toMatchObject({ id: "seekers-two-rings" });
    const count = (id: string) => actionsOf(id).find((a) => a.type === "spawn");
    expect(count("seekers")?.type === "spawn" && count("seekers")?.count?.value).toBe(3);
    expect(count("seekers-two-rings")?.type === "spawn" && count("seekers-two-rings")?.count?.value).toBe(6);
    const scorch = actionsOf("scorch-seekers").find((a) => a.type === "applyStatus");
    expect(scorch?.type === "applyStatus" && scorch.stacks?.value).toBe(15);
  });

  it("timing from Quantum and the manifest, the catalyst rate once the ring stands", () => {
    expect(hierarchy.chargeTimeMs.value).toBe(800);
    expect(hierarchy.fireRateRpm.value).toBe(44);
    expect(hierarchy.magazine.value).toBe(1);
    expect(hierarchy.totalShots.value).toBeNull();
    expect(hierarchy.reloadTimeMs.value).toBe(0);
    const rate = actionsOf("guidance-ring-deploy-rate").find((a) => a.type === "modifyStat");
    expect(rate?.type === "modifyStat" && rate.modifier.value.value).toBe(61);
    expect(hierarchy.catalyst?.effect).toBe("timing");
  });

  it("the Guidance Ring: 3 stacks, the next shot deploys it for 20 s; rules as the import wrote them", () => {
    expect(rules.map((r) => r.id)).toEqual([
      "shot",
      "seekers",
      "seekers-two-rings",
      "scorch-seekers",
      "scorch-seekers-two-rings",
      "guidance-ring-pre-stacked",
      "guidance-ring-stands",
      "guidance-ring-stands-rate",
      "guidance-ring-count",
      "guidance-ring-deploy",
      "guidance-ring-deploy-rate",
    ]);
    const deploy = rules.find((r) => r.id === "guidance-ring-deploy")!;
    const full = deploy.if?.find((c) => c.type === "counter");
    expect(full?.type === "counter" && full.value.value).toBe(3);
    const setMode = deploy.do.find((a) => a.type === "setMode");
    expect(setMode?.type === "setMode" && setMode.durationMs?.value).toBe(20_000);
    expect(hierarchy.playstyles?.map((p) => p.id)).toEqual(["one-ring", "two-rings"]);
  });

  it("takes no number from an Aegis row: both rows stay checks", () => {
    expect(fittedRows(hierarchy).size).toBe(0);
  });
});
