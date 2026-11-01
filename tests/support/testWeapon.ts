// A made-up second weapon for tests only (ADR 0012): no scorch, no catalyst, another weapon
// type and element. It checks that the engine does not depend on One Thousand Voices.
// Its numbers are not game values and never leave the tests.

import type { Action, SourcedNumber, Weapon } from "../../src/data/schema";
import {
  partRules,
  playstyleRateRule,
  type ImportPart,
  type PartPlaystyle,
} from "../../scripts/lib/partRules";

const testValue = (value: number): SourcedNumber => ({
  value,
  source: {
    name: "Test fixture, not a game value",
    retrieved: "2026-10-20",
    status: "unverified",
  },
});

/**
 * The weapon with the rules that set off its parts, like the import writes them (partRules).
 * `playstyles` says which parts belong to a playstyle (by part id) and the rate a playstyle fires at.
 */
export const withPartRules = (
  weapon: Weapon,
  playstyles: { parts?: Record<string, PartPlaystyle>; rates?: Record<string, number> } = {},
): Weapon => ({
  ...weapon,
  rules: [
    // The import fields (requiresCatalyst, ...) a test sets on a part are read here, like the import does
    ...(weapon.damageInstances as ImportPart[]).flatMap((part) =>
      partRules(part, playstyles.parts?.[part.id]),
    ),
    ...Object.entries(playstyles.rates ?? {}).map(([id, rpm]) =>
      playstyleRateRule(id, testValue(rpm)),
    ),
  ],
});

/** The weapon without scorch, ignition and seekers: the shots only (the part and rule "shot"). */
export const shotsOnly = (weapon: Weapon): Weapon => ({
  ...weapon,
  damageInstances: weapon.damageInstances.filter((part) => part.id === "shot"),
  rules: (weapon.rules ?? []).filter((rule) => rule.id === "shot"),
});

/** The action of type `type` in the rule `ruleId` of a weapon (for tests that change a rule's numbers). */
export function actionOf<T extends Action["type"]>(
  weapon: Weapon,
  ruleId: string,
  type: T,
  part?: string,
): Extract<Action, { type: T }> {
  const rule = weapon.rules?.find((r) => r.id === ruleId);
  const action = rule?.do.find(
    (a) => a.type === type && (part === undefined || (a.type === "spawn" && a.part === part)),
  );
  if (!action) throw new Error(`No ${type} in the rule "${ruleId}"`);
  return action as Extract<Action, { type: T }>;
}

/**
 * Copy of the hand model of One Thousand Voices with simple scorch: `applications` explosions at
 * `delayMs` after the shot, each of `stacks`. Test inputs, not game values.
 */
export function withScorchHits(
  weapon: Weapon,
  stacks: number,
  applications: number,
  delayMs = 0,
): Weapon {
  const copy = structuredClone(weapon);
  const detonations = actionOf(copy, "detonations", "spawn");
  detonations.delayMs!.value = delayMs;
  detonations.count!.value = applications;
  detonations.intervalMs!.value = 0;
  actionOf(copy, "scorch", "applyStatus").stacks!.value = stacks;
  return copy;
}

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
    },
  ],
  rules: [{ id: "shot", on: { on: "shot" }, do: [{ type: "spawn", part: "shot" }] }],
  intrinsics: [],
};
