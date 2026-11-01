// Playstyles of a weapon (Build.playstyle, ADR 0017): the damage instances of a playstyle take the
// place of those they replace, and the weapon may fire at the playstyle's own rate.

import type { Weapon } from "../data/schema";

/** The weapon as it is played in the playstyle; without one (or an unknown one) the plain shot. */
export function withPlaystyle(weapon: Weapon, playstyle?: string): Weapon {
  const active = weapon.damageInstances.filter(
    (instance) => instance.playstyle !== undefined && instance.playstyle.id === playstyle,
  );
  const replaced = active.flatMap((instance) => instance.playstyle?.replaces ?? []);
  const fireRateRpm = active.find((instance) => instance.playstyle?.fireRateRpm)?.playstyle
    ?.fireRateRpm;
  const damageInstances = weapon.damageInstances.filter((instance) =>
    instance.playstyle ? active.includes(instance) : !replaced.includes(instance.id),
  );
  const kept = new Set(damageInstances.map((instance) => instance.id));
  // A rule that spawns a part of another playstyle is dropped with it (step 2 makes it a condition)
  const rules = weapon.rules?.filter((rule) =>
    rule.do.every((action) => action.type !== "spawn" || kept.has(action.part)),
  );
  return {
    ...weapon,
    ...(fireRateRpm ? { fireRateRpm } : {}),
    damageInstances,
    ...(rules ? { rules } : {}),
  };
}

/** The playstyles the build picker offers, in the order of the damage instances. */
export function playstylesOf(
  weapon: Pick<Weapon, "damageInstances">,
): { id: string; name: string }[] {
  return weapon.damageInstances.flatMap((instance) =>
    instance.playstyle?.selectable ? [{ id: instance.playstyle.id, name: instance.name }] : [],
  );
}
