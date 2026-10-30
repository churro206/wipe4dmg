// Layer 4 of the core (ADR 0017): the state of one weapon (magazine, reload, charge, held draw,
// setup) as a state machine. Each call of next() makes the next shot from the state the last one
// left; timing rules are those of simulate.ts (ADR 0001), so both cores plan the same shots.

import type { Weapon } from "../../data/schema";
import { appliesToWeaponType, type ActiveParts } from "../effectParts";
import { requireValue } from "../requireValue";
import type { AbilityCast, SuperWindow } from "../simulate";
import { MS_PER_SECOND } from "../units";

const MS_PER_MINUTE = 60_000;

export type PlannedShot = {
  index: number; // 0 for the first shot of the weapon
  timeMs: number;
  holdFactor: number;
  withSetup: boolean; // the shot works with a deployed setup (WeaponSetup)
};

/** What one step makes: the start of a full reload before the shot, and the shot if it is in the phase. */
export type ActorStep = { reloadStartMs?: number; shot?: PlannedShot };

export type ActorInput = {
  weapon: Weapon;
  catalyst: boolean;
  totalShotsLimit?: number;
  setupPreBuilt?: boolean;
  damagePhaseSeconds: number;
  abilities: AbilityCast[];
  superWindows: SuperWindow[];
  partsAt: (timeMs: number) => ActiveParts;
};

export function createWeaponActor(input: ActorInput) {
  const { weapon, catalyst, partsAt } = input;
  // A catalyst that changes magazine, ammo or reload replaces the timing while it is on.
  const timing = (catalyst && weapon.catalyst?.timing) || weapon;
  const chargeTimeMs = requireValue(weapon.chargeTimeMs, "chargeTimeMs");
  const fireRateRpm = requireValue(timing.fireRateRpm, "fireRateRpm");
  const magazine = requireValue(timing.magazine, "magazine");
  const ammoShots =
    weapon.ammo === "primary"
      ? Number.POSITIVE_INFINITY
      : requireValue(timing.totalShots, "totalShots");
  const totalShots = Math.min(
    ammoShots,
    input.totalShotsLimit ?? Number.POSITIVE_INFINITY,
  );
  const reloadTimeMs = requireValue(timing.reloadTimeMs, "reloadTimeMs");
  if (fireRateRpm <= 0) {
    throw new Error(`fireRateRpm must be positive, got ${fireRateRpm}`);
  }
  if (!Number.isInteger(magazine) || magazine < 1) {
    throw new Error(`magazine must be a positive integer, got ${magazine}`);
  }
  if (
    totalShots !== Number.POSITIVE_INFINITY &&
    (!Number.isInteger(totalShots) || totalShots < 0)
  ) {
    throw new Error(
      `totalShots must be a non-negative integer, got ${totalShots}`,
    );
  }
  const shotIntervalMs = MS_PER_MINUTE / fireRateRpm;
  const damagePhaseMs = input.damagePhaseSeconds * MS_PER_SECOND;
  const isInPhase = (timeMs: number) => timeMs <= damagePhaseMs;

  const noReloadAt = (timeMs: number) =>
    partsAt(timeMs).timingParts.some(
      (part) =>
        part.change === "noReload" &&
        appliesToWeaponType(part.weaponTypes, weapon.weaponType),
    );
  // Reload time × factor of the strongest active reloadDuration part (ADR 0014); the weapon's
  // reload may already contain a factor (K1): only the part beyond it counts.
  const includedReloadFactor = weapon.reloadDurationIncluded?.value ?? 1;
  const reloadMsAt = (timeMs: number) => {
    const factors = partsAt(timeMs)
      .timingParts.filter(
        (part) =>
          part.change === "reloadDuration" &&
          appliesToWeaponType(part.weaponTypes, weapon.weaponType),
      )
      .map((part) => {
        if (part.factor === undefined)
          throw new Error("reloadDuration needs a factor");
        return part.factor;
      });
    return (
      reloadTimeMs * Math.min(1, Math.min(1, ...factors) / includedReloadFactor)
    );
  };

  // A cast at the very time of a shot comes first and the shot waits for its end; a cast that
  // reloads the weapon (a dodge) follows a shot that empties the magazine, so the reload is skipped.
  const blockingWindows = [
    ...input.superWindows.map((w) => ({ ...w, refills: false })),
    ...input.abilities.flatMap(({ ability, castsMs, castMs = 0 }) =>
      castsMs.map((startMs) => ({
        startMs,
        endMs: startMs + castMs,
        refills: Boolean(ability.refillsMagazine),
      })),
    ),
  ]
    .filter((w) => w.endMs > w.startMs)
    .sort((a, b) => a.startMs - b.startMs);
  const afterBlockingWindows = (timeMs: number, emptiesMagazine: boolean) => {
    let result = timeMs;
    for (const window of blockingWindows) {
      const shotFirst = window.refills && emptiesMagazine;
      const started = shotFirst
        ? result > window.startMs
        : result >= window.startMs;
      if (started && result - chargeTimeMs < window.endMs) {
        result = window.endMs + chargeTimeMs;
      }
    }
    return result;
  };

  // Held draw: the number of steps with the most damage per shot cycle; 0 steps if holding does not
  // pay. Returns the extra time and the damage factor of the shot.
  const holdAt = (timeMs: number): { holdMs: number; factor: number } => {
    const none = { holdMs: 0, factor: 1 };
    if (weapon.ammo !== "primary") return none;
    // Keyword damage per shot cannot be weighed by the rate below (see simulate.ts).
    if (weapon.intrinsicParts.some((p) => p.type === "appliesKeyword"))
      return none;
    const part = partsAt(timeMs).holdDrawParts.find((p) =>
      appliesToWeaponType(p.weaponTypes, weapon.weaponType),
    );
    if (!part) return none;
    const stepMs = requireValue(part.stepMs, "stepMs");
    const stepFactor = requireValue(part.stepFactor, "stepFactor");
    const maxFactor = requireValue(part.maxFactor, "maxFactor");
    let best = none;
    let bestRate = 1 / shotIntervalMs;
    for (let steps = 1; ; steps++) {
      const factor = Math.min(1 + (stepFactor - 1) * steps, maxFactor);
      const rate = factor / (shotIntervalMs + steps * stepMs);
      if (rate > bestRate) {
        best = { holdMs: steps * stepMs, factor };
        bestRate = rate;
      }
      if (factor >= maxFactor) break;
    }
    // Only whole shots fit into the rest of the phase.
    const remainingMs = damagePhaseMs - timeMs;
    const shotsWithin = (holdMs: number) =>
      remainingMs < holdMs
        ? 0
        : Math.floor((remainingMs - holdMs) / (shotIntervalMs + holdMs)) + 1;
    return shotsWithin(best.holdMs) * best.factor > shotsWithin(0)
      ? best
      : none;
  };

  // Casts that reload the weapon at once (U7): a cast during a reload ends it, a cast while the
  // magazine is not empty fills it up. Casts before the previous shot are spent.
  const refillsMs = input.abilities
    .filter((cast) => cast.ability.refillsMagazine)
    .flatMap((cast) => cast.castsMs)
    .sort((a, b) => a - b);
  let refillIndex = 0;
  const refillBefore = (fromMs: number, untilMs: number): number | undefined => {
    while (refillIndex < refillsMs.length && refillsMs[refillIndex] < fromMs)
      refillIndex++;
    const atMs = refillsMs[refillIndex];
    if (atMs === undefined || atMs >= untilMs) return undefined;
    refillIndex++;
    return atMs;
  };

  // A setup the shots build and deploy (WeaponSetup), e.g. a Guidance Ring.
  const setup = weapon.setup;
  const setupShotsBefore = setup
    ? requireValue(
        input.setupPreBuilt ? setup.shotsBeforePreBuilt : setup.shotsBefore,
        "shotsBefore",
      )
    : 0;
  const setupDurationMs = setup
    ? requireValue(setup.durationMs, "durationMs")
    : 0;
  const ownIntervalMs =
    MS_PER_MINUTE / requireValue(weapon.fireRateRpm, "fireRateRpm");
  let deployedMs: number | undefined;
  const intervalMs = () =>
    setup?.catalystTimingOnceDeployed && deployedMs === undefined
      ? ownIntervalMs
      : shotIntervalMs;

  let index = 0;
  let shotMs = chargeTimeMs;
  let leftInMagazine = magazine;
  let done = false;

  /** The next shot, or a step without a shot once the ammo, the limit or the phase ends them. */
  function next(): ActorStep {
    if (done || index >= totalShots) {
      done = true;
      return {};
    }
    let reloadStartMs: number | undefined;
    if (index > 0) {
      const previousMs = shotMs;
      shotMs += intervalMs();
      if (leftInMagazine === 0 && !noReloadAt(previousMs)) {
        const readyMs = shotMs + reloadMsAt(previousMs);
        const refillMs = refillBefore(previousMs, readyMs);
        if (refillMs === undefined) reloadStartMs = previousMs;
        shotMs = refillMs === undefined ? readyMs : Math.max(shotMs, refillMs);
        leftInMagazine = magazine;
      } else if (
        leftInMagazine === 0 ||
        refillBefore(previousMs, shotMs) !== undefined
      ) {
        leftInMagazine = magazine;
      }
    }
    leftInMagazine--;
    const hold = holdAt(shotMs);
    shotMs = afterBlockingWindows(shotMs + hold.holdMs, leftInMagazine === 0);
    const shotIndex = index++;
    if (!isInPhase(shotMs)) {
      done = true;
      return { reloadStartMs };
    }
    let withSetup = false;
    if (setup) {
      const deploys =
        deployedMs === undefined
          ? shotIndex === setupShotsBefore - 1
          : shotMs >= deployedMs + setupDurationMs;
      if (deploys) deployedMs = shotMs;
      withSetup = !deploys && deployedMs !== undefined;
    }
    return {
      reloadStartMs,
      shot: { index: shotIndex, timeMs: shotMs, holdFactor: hold.factor, withSetup },
    };
  }

  return { next, isInPhase };
}
