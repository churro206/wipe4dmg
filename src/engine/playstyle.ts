// Playstyles of a weapon (Build.playstyle, ADR 0017, ADR 0018 B3a step 2): the weapon lists them
// (Weapon.playstyles); what they change is in its rules (condition `playstyle`, `modifyStat`).

import { PLAIN_SHOT_ID, type Weapon } from "../data/schema";

/** The playstyles the build picker offers, in the order of the weapon's list. */
export function playstylesOf(
  weapon: Pick<Weapon, "playstyles">,
): { id: string; name: string }[] {
  return (weapon.playstyles ?? []).flatMap((p) =>
    p.selectable && p.id !== PLAIN_SHOT_ID ? [{ id: p.id, name: p.label }] : [],
  );
}

/** What the picker calls the plain shot, e.g. "Full charge". */
export const plainShotLabel = (weapon: Pick<Weapon, "playstyles">): string | undefined =>
  weapon.playstyles?.find((p) => p.id === PLAIN_SHOT_ID)?.label;
