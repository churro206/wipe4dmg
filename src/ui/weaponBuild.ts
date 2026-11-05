import type { Build, Weapon } from "../data/schema";
import { buildSimulation } from "../engine/buildSimulation";
import { simulate, type SimulationResult } from "../engine/simulate";
import { buckets, gameData } from "./data";

/**
 * The one build of the weapon table (V1 numbers) and of its expanded row (V3 timeline): the weapon
 * alone, the same class and subclass for every weapon, no selections.
 */
export const bareWeaponBuild = (weaponId: string, catalyst: boolean, seconds: number): Build => ({
  weaponId,
  guardianClass: "titan",
  subclass: "arc",
  catalyst,
  selections: [],
  effectWindows: {},
  damagePhaseSeconds: seconds,
});

/** The simulation of the bare weapon, through buildSimulation (the only way from a build to a simulation). */
export function bareWeaponRun(
  weapon: Weapon,
  catalyst: boolean,
  seconds: number,
  shotLimit?: number,
): SimulationResult {
  const { selected, options } = buildSimulation(bareWeaponBuild(weapon.id, catalyst, seconds), gameData);
  return simulate(weapon, seconds, selected, buckets, {
    ...options,
    ...(shotLimit === undefined ? {} : { shotLimit }),
  });
}
