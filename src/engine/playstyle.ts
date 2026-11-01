// Playstyles of a weapon (Build.playstyle, ADR 0017, ADR 0018 B3a step 2): the weapon lists the ones
// the picker offers (Weapon.playstyles, the first is the plain shot); what they change is in its
// rules (condition `playstyle`, `modifyStat`).

import type { Weapon } from "../data/schema";

/** The playstyles the build picker offers besides the plain shot, in the order of the weapon's list. */
export function playstylesOf(
  weapon: Pick<Weapon, "playstyles">,
): { id: string; name: string }[] {
  return (weapon.playstyles ?? []).slice(1).map((p) => ({ id: p.id, name: p.label }));
}

/**
 * Whether the rules of the weapon read an assumption of the build (condition `playstyle`), e.g.
 * "pre-stacked" for the charges of a setup. The build offers a switch only for such a weapon.
 */
export const readsAssumption = (
  weapon: Pick<Weapon, "rules">,
  id: string,
): boolean =>
  (weapon.rules ?? []).some((rule) =>
    (rule.if ?? []).some((c) => c.type === "playstyle" && c.id === id),
  );

/** What the picker calls the plain shot, e.g. "Full charge". */
export const plainShotLabel = (weapon: Pick<Weapon, "playstyles">): string | undefined =>
  weapon.playstyles?.[0]?.label;
