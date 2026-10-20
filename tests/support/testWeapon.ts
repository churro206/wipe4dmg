// A made-up second weapon for tests only (ADR 0012): no scorch, no catalyst, another weapon
// type and element. It checks that the engine does not depend on One Thousand Voices.
// Its numbers are not game values and never leave the tests.

import type { SourcedNumber, Weapon } from "../../src/data/schema";

const testValue = (value: number): SourcedNumber => ({
  value,
  source: {
    name: "Test fixture, not a game value",
    retrieved: "2026-10-20",
    status: "unverified",
  },
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
  intrinsicParts: [],
  intrinsics: [],
};
