// A made-up second weapon for tests only (ADR 0012): no scorch, no catalyst, another weapon
// type and element. It checks that the engine does not depend on One Thousand Voices.
// Its numbers are not game values and never leave the tests.

import type { SourcedNumber, Weapon } from "../../src/data/schema";
import { partRules } from "../../scripts/lib/partRules";

const testValue = (value: number): SourcedNumber => ({
  value,
  source: {
    name: "Test fixture, not a game value",
    retrieved: "2026-10-20",
    status: "unverified",
  },
});

/** The weapon with the rules that set off its parts, like the import writes them (partRules). */
export const withPartRules = (weapon: Weapon): Weapon => ({
  ...weapon,
  rules: weapon.damageInstances.flatMap(partRules),
});

export const testWeapon: Weapon = {
  id: "test-rocket",
  code: 999,
  name: "Test Rocket",
  manifestHash: 0,
  gameVersion: "test",
  weaponType: "rocketLauncher",
  element: "arc",
  ammo: "heavy",
  chargeTimeMs: testValue(0),
  fireRateRpm: testValue(60),
  magazine: testValue(1),
  totalShots: testValue(3),
  reloadTimeMs: testValue(2000),
  damageInstances: [
    {
      id: "shot",
      name: "Rocket",
      delayMs: testValue(0),
      damagePerTick: testValue(1000),
      ticks: testValue(1),
      tickIntervalMs: testValue(0),
      canPrecision: false,
      requiresCatalyst: false,
    },
  ],
  rules: [{ id: "shot", on: { on: "shot" }, do: [{ type: "spawn", part: "shot" }] }],
  intrinsicParts: [],
  intrinsics: [],
};
