// Effects of the Court buffs, debuffs, mods and artifact perks by rule (block "all buffs", 2026-10-23).

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import rawGenerated from "../src/data/buff-effects.json";
import { Effect } from "../src/data/schema";
import { loadBuffInputs } from "../scripts/lib/buffInputs";
import {
  BUFF_SPECS,
  buffEffects,
  durationSeconds,
  percentLines,
  renderBuffs,
} from "../scripts/lib/buffs";

const inputs = loadBuffInputs();
const result = buffEffects(inputs);
const effectOf = (id: string) => result.effects.find((e) => e.id === id)!;
const verdictOf = (name: string) =>
  result.rows.filter((r) => r.name === name).map((r) => r.verdict);

describe("values of a Court row", () => {
  it("the last percentage of each line is the highest stage", () => {
    expect(percentLines("10%\n17%\n22%\n25%")).toEqual([10, 17, 22, 25]);
    expect(percentLines("2.8%\n5.7%\n9%\n12%\n15%")).toEqual([2.8, 5.7, 9, 12, 15]);
    expect(percentLines("35%\nPrimaries\n\n25%\nHeavies")).toEqual([35, 25]);
  });

  it("an improving row gives the value after the arrow", () => {
    expect(percentLines("15%->25%\n30%->35%\n35%->40%")).toEqual([25, 35, 40]);
  });

  it("the duration is the first time; a tilde or infinity has none", () => {
    expect(durationSeconds("4.5s")).toBe(4.5);
    expect(durationSeconds("~\nlasts duration of Blind")).toBeUndefined();
    expect(durationSeconds("∞")).toBeUndefined();
    expect(durationSeconds(null)).toBeUndefined();
  });
});

describe("effects from the Court rows", () => {
  it("every spec becomes one effect with the Court value in its source", () => {
    expect(result.effects.map((e) => e.id)).toEqual([
      ...BUFF_SPECS.map((s) => s.id),
      "banner-of-war",
    ]);
    for (const effect of result.effects) {
      for (const part of effect.modifiers) {
        if (part.type !== "multiplier") continue;
        expect(part.multiplier.source.status).toBe("verified");
        expect(part.multiplier.source.quote).toBeTruthy();
      }
    }
  });

  it.each([
    ["argent-blade", "amplification", 1.15, 5000],
    ["argent-ordnance", "amplification", 1.15, 4500],
    ["argent-quiver", "amplification", 1.35, undefined],
    ["sniper-meditation", "amplification", 1.15, 7000],
    ["targeting-autoloader", "amplification", 1.2, 15000],
    ["void-weapon-channelling", "surge", 1.25, 11000],
    ["precision-equity", "surge", 1.17, 11000],
    ["weapons-of-light", "empowering", 1.25, 15000],
    ["debilitating-wave", "debuff", 1.15, 6000],
    ["banner-of-war", "amplification", 1.1, undefined],
  ])("%s: %s ×%s for %s ms", (id, bucketId, factor, durationMs) => {
    const effect = effectOf(id);
    const part = effect.modifiers[0];
    expect(part.type === "multiplier" && part.bucketId).toBe(bucketId);
    expect(part.type === "multiplier" && part.multiplier.value).toBe(factor);
    expect(effect.durationMs?.value).toBe(durationMs);
  });

  it("Radiant from a perk gives Golden Gun the same value as the weapon", () => {
    const parts = effectOf("radiant-orbs").modifiers;
    expect(parts).toHaveLength(2);
    expect(parts[1]).toMatchObject({
      damageSources: ["super"],
      abilityIds: ["golden-gun-deadshot", "golden-gun-marksman"],
    });
  });

  it("Expanding Abyss raises Weaken, the tethers and Deadfall, for Void only", () => {
    const parts = effectOf("expanding-abyss").modifiers.flatMap((p) =>
      p.type === "multiplier"
        ? [[p.requiresEffectIds, p.multiplier.value, p.elements]]
        : [],
    );
    expect(parts).toEqual([
      [["weaken"], 1.25, ["void"]],
      [["tractor-cannon", "moebius-tether"], 1.35, ["void"]],
      [["deadfall-tether"], 1.4, ["void"]],
    ]);
  });

  it("every effect is offered where a build can pick it", () => {
    expect(effectOf("heart-of-the-flame").providers.map((p) => p.kind)).toEqual([
      "artifact",
      "fireteamSupport",
    ]);
    expect(effectOf("remote-shield").providers).toEqual([{ kind: "fireteamSupport" }]);
  });
});

describe("every Court row has a verdict", () => {
  it("none is left unclassified", () => {
    expect(result.rows.filter((r) => r.verdict === "unclassified")).toEqual([]);
  });

  it.each([
    ["Expanding Abyss", "imported"],
    ["Combination Argent Blade", "covered"],
    ["Elemental Overdrive", "covered"],
    ["Chromatic Fire", "exotic"],
    ["Nova Warp", "weaken"],
    ["Snare Bomb", "weaken"],
    ["Gyrfalcon's Hauberk", "exotic"],
    ["Mask of Bakris", "exotic"],
    ["Torch", "skipped"],
    ["Sect of Force Mod", "skipped"],
    ["Vexcalibur", "weapon"],
  ])("%s → %s", (name, verdict) => {
    expect(verdictOf(name)).toContain(verdict);
  });
});

describe("generated files are current (run npm run build:buffs)", () => {
  it("buff-effects.json matches the Court snapshot", () => {
    expect(Effect.array().parse(rawGenerated)).toEqual(result.effects);
  });

  it("docs/buff-import.md matches", () => {
    expect(renderBuffs(result.rows)).toBe(
      readFileSync("docs/buff-import.md", "utf8").replace(/\r\n/g, "\n"),
    );
  });

  it("codes are unique across all effects", () => {
    const codes = result.effects.map((e) => e.code);
    expect(new Set(codes).size).toBe(codes.length);
    // hand-written effects may take codes after the generated block, so only the upper bound holds
    expect(Math.max(...codes)).toBeLessThan(inputs.nextCode);
  });
});
