// Rule of the meta probe by rule (tests/lib/probeAuto.ts): which assumption of Aegis becomes which switch.

import { describe, expect, it } from "vitest";
import type { AegisTotalRow, Weapon } from "../src/data/schema";
import { autoEntries } from "./lib/probeAuto";

const row = (assumptions: string[]) =>
  ({
    id: "row",
    tab: "sustained",
    name: "The Lament",
    assumptions,
    type: "power",
    surge: 1.22,
    buff: 1.35,
    debuff: 1.3,
    stat: 1.1,
    total: 100,
  }) as AegisTotalRow;
const lament = {
  id: "the-lament",
  name: "The Lament",
  options: [],
  intrinsics: [],
  catalyst: { name: "Burning Ambition, The Lament Catalyst" },
} as unknown as Weapon;

const entryOf = (assumptions: string[]) =>
  autoEntries([row(assumptions)], {
    weapons: [lament],
    abilities: [],
    effects: [{ id: "argent-blade", name: "Argent Blade" }],
    exoticArmor: [],
    artifactPerks: [{ name: "Combination Argent Blade", tier: 2, effectId: "argent-blade" }],
    ignored: {},
    covered: new Set(),
  }).entries[0];

describe("autoEntries", () => {
  it("takes the perk name of the catalyst as the catalyst switch", () => {
    const entry = entryOf(["Burning Ambition"]);
    expect(entry.build.catalyst).toBe(true);
    expect(entry.unmapped).toEqual([]);
  });

  it("takes a buff that a catalyst rule grants as the catalyst switch (item files, B4b)", () => {
    const withBuff = {
      ...lament,
      buffs: [{ id: "tithe", name: "Reaper's Tithe x4", modifiers: [] }],
      rules: [
        {
          id: "tithe",
          on: { on: "shot" },
          if: [{ type: "hasItem", id: "catalyst" }],
          do: [{ type: "grantBuff", buff: "tithe" }],
        },
      ],
    } as unknown as Weapon;
    const entry = autoEntries([row(["Reaper's Tithe x4"])], {
      weapons: [withBuff],
      abilities: [],
      effects: [],
      exoticArmor: [],
      artifactPerks: [],
      ignored: {},
      covered: new Set(),
    }).entries[0];
    expect(entry.build.catalyst).toBe(true);
    expect(entry.unmapped).toEqual([]);
  });

  it("takes an artifact perk as the effect it switches on", () => {
    const entry = entryOf(["Combination Argent Blade"]);
    expect(entry.selections).toEqual(["argent-blade"]);
    expect(entry.unmapped).toEqual([]);
  });
});
