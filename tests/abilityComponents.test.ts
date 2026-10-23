// Ability components from the Compendium texts (ADR 0009, U9): rules R1 to R3 and the generated files.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadAbilityComponentInputs } from "../scripts/lib/abilityComponentInputs";
import {
  COMPONENT_ABILITY_IDS,
  abilityComponentRows,
  abilityComponentsData,
  parseComponents,
  renderAbilityImport,
} from "../scripts/lib/abilityComponents";
import type { CompendiumEntry } from "../src/data/schema";

const entry = (name: string, text: string): CompendiumEntry => ({
  tab: "Test",
  section: "Super Abilities",
  name,
  text,
  extra: "",
});
const summary = (e: CompendiumEntry) =>
  parseComponents(e, "2026-10-23").map((c) => ({
    id: c.id,
    damage: c.damagePerTick.value,
    delayMs: c.delayMs.value,
    ticks: c.ticks.value,
    intervalMs: c.tickIntervalMs.value,
  }));

describe("parseComponents", () => {
  it("R1: one component per damage value, PvP values in brackets ignored", () => {
    expect(
      summary(
        entry(
          "Fusion Grenade",
          "Explosion deals up to 738 [130] damage and inflict x40+20 Scorch over 6 meters on detonation.",
        ),
      ),
    ).toEqual([{ id: "hit", damage: 738, delayMs: 0, ticks: 1, intervalMs: 0 }]);
  });

  it("R4: 'every X seconds up to N times' gives N ticks, the first number of 'N+M'", () => {
    expect(
      summary(
        entry(
          "Vortex Grenade",
          "Deals 78 [20] damage every 0.267 seconds up to 12+7 times over its 4+1 second duration.",
        ),
      ),
    ).toEqual([{ id: "hit", damage: 78, delayMs: 0, ticks: 12, intervalMs: 267 }]);
  });

  it("R5: a stated total replaces the alternatives before it; Guardians sentences are PvP", () => {
    expect(
      summary(
        entry(
          "Magnetic Grenade",
          "Each explosion deals up to 472 [75] damage over 5 meters.\n\nDeals up to 946 [150] damage with both explosions.\n\nGuardians can only be hurt once, for a maximum of 120 damage.",
        ),
      ),
    ).toEqual([{ id: "hit", damage: 946, delayMs: 0, ticks: 1, intervalMs: 0 }]);
  });

  it("R1 to R3: impact, explosion and delayed aftershock ticks; collision does not count", () => {
    expect(
      summary(
        entry(
          "Thundercrash",
          "Enemies that are very close when flying receive 150 [?] Collision Damage.\n\nDetonates on impact with a surface or enemy, dealing 180 [?] impact damage, as well as up to 8,260 [?] explosive damage over 10 meters.\nExplosion releases aftershocks 0.75 seconds after impact, dealing up to 108 [?] damage every second for 4 seconds.",
        ),
      ),
    ).toEqual([
      { id: "impact", damage: 180, delayMs: 0, ticks: 1, intervalMs: 0 },
      { id: "explosive", damage: 8260, delayMs: 0, ticks: 1, intervalMs: 0 },
      { id: "hit", damage: 108, delayMs: 750, ticks: 4, intervalMs: 1000 },
    ]);
  });

  it("every value quotes its sentence", () => {
    const [component] = parseComponents(
      entry("Test", "Explosion deals up to 738 [130] damage."),
      "2026-10-23",
    );
    expect(component.damagePerTick.source).toMatchObject({
      status: "verified",
      quote: "Explosion deals up to 738 damage.",
    });
  });
});

describe("generated files", () => {
  const rows = abilityComponentRows(loadAbilityComponentInputs());

  it("every enabled ability passes the gate", () => {
    expect(rows.filter((r) => r.used).map((r) => r.abilityId).sort()).toEqual(
      [...COMPONENT_ABILITY_IDS].sort(),
    );
  });

  it("ability-components.json and docs/ability-import.md are current (npm run build:abilities)", () => {
    expect(
      JSON.parse(readFileSync("src/data/ability-components.json", "utf8")),
    ).toEqual(abilityComponentsData(rows));
    expect(
      readFileSync("docs/ability-import.md", "utf8").replace(/\r\n/g, "\n"),
    ).toBe(renderAbilityImport(rows));
  });
});
