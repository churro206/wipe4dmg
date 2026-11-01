// The rules that set off the parts of a weapon (ADR 0018 B3a part 2, step 1): the import writes one
// `spawn` per part on every shot, with the times in the action, and the engine has no other way to
// deal a part's damage.

import { describe, expect, it } from "vitest";
import { partRules } from "../scripts/lib/partRules";
import type { DamageInstance, SourcedNumber } from "../src/data/schema";
import { loadWeapons } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";
import { rawWeapons } from "./support/weapons";
import { testWeapon, withPartRules } from "./support/testWeapon";

const sourced = (value: number): SourcedNumber => ({
  value,
  source: { name: "test", retrieved: "2026-11-01", status: "derived" },
});
const part = (changes: Partial<DamageInstance>): DamageInstance => ({
  ...testWeapon.damageInstances[0],
  ...changes,
});

describe("partRules", () => {
  it("a plain part is one spawn on every shot", () => {
    expect(partRules(part({}))).toEqual([
      { id: "shot", on: { on: "shot" }, do: [{ type: "spawn", part: "shot" }] },
    ]);
  });

  it("puts delay, ticks and interval into the action", () => {
    const [rule] = partRules(
      part({ delayMs: sourced(500), ticks: sourced(3), tickIntervalMs: sourced(250) }),
    );
    expect(rule.do).toEqual([
      {
        type: "spawn",
        part: "shot",
        delayMs: sourced(500),
        count: sourced(3),
        intervalMs: sourced(250),
      },
    ]);
  });

  it("a part with a factor per tick spawns once per tick", () => {
    const [rule] = partRules(
      part({
        delayMs: sourced(100),
        ticks: sourced(2),
        tickIntervalMs: sourced(400),
        tickFactors: [sourced(1), sourced(1.5)],
      }),
    );
    expect(rule.do.map((a) => a.type === "spawn" && [a.delayMs?.value, a.factor?.value])).toEqual([
      [100, 1],
      [500, 1.5],
    ]);
  });

  it("a part that needs the catalyst has the condition hasItem catalyst", () => {
    const [rule] = partRules(part({ requiresCatalyst: true }));
    expect(rule.if).toEqual([{ type: "hasItem", id: "catalyst" }]);
  });

  it("every Nth shot is a counter: N-1 shots count, the Nth spawns and resets", () => {
    const rules = partRules(part({ id: "cluster", everyNthShot: sourced(3) }));
    expect(rules.map((r) => r.id)).toEqual(["cluster-count", "cluster"]);
    expect(rules[0].do).toEqual([{ type: "addStacks", counter: "cluster-shots" }]);
    expect(rules[1].do.map((a) => a.type)).toEqual(["resetCounter", "spawn"]);
  });
});

describe("parts are set off by rules only", () => {
  it("a part without a spawn rule does no damage", () => {
    const silent = { ...withPartRules(testWeapon), rules: [] };
    expect(simulate(silent, 10).damageInstances).toEqual([]);
  });

  it("the catalyst part comes only with the catalyst", () => {
    const weapon = withPartRules({
      ...testWeapon,
      damageInstances: [part({ id: "extra", requiresCatalyst: true })],
    });
    expect(simulate(weapon, 10).damageInstances).toEqual([]);
    expect(simulate(weapon, 10, [], [], { catalyst: true }).damageInstances.length).toBeGreaterThan(0);
  });

  it("every part of every weapon of the data has a spawn rule", () => {
    for (const weapon of loadWeapons(rawWeapons)) {
      const spawned = new Set(
        (weapon.rules ?? []).flatMap((rule) =>
          rule.do.flatMap((a) => (a.type === "spawn" ? [a.part] : [])),
        ),
      );
      for (const instance of weapon.damageInstances)
        expect(spawned.has(instance.id), `${weapon.id}: ${instance.id}`).toBe(true);
    }
  });
});
