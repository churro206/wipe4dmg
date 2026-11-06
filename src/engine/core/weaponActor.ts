// Layer 4 of the core (ADR 0017): the state of one weapon (magazine, reload, charge, held draw)
// as a state machine. Each call of next() makes the next shot from the state the last one
// left; timing rules are those of simulate.ts (ADR 0001), so both cores plan the same shots.

import type { StatModifier, Weapon } from "../../data/schema";
import { appliesToWeaponType } from "../effectParts";
import { refillsOnCast } from "../effectRules";
import { requireValue } from "../requireValue";
import type { AbilityCast, SuperWindow } from "./types";
import { MS_PER_SECOND } from "../units";

const MS_PER_MINUTE = 60_000;

export type PlannedShot = {
  index: number; // 0 for the first shot of the weapon
  timeMs: number;
  holdFactor: number;
};

/** What one step makes: the start of a full reload before the shot, and the shot if it is in the phase. */
export type ActorStep = { reloadStartMs?: number; shot?: PlannedShot };

export type ActorInput = {
  weapon: Weapon;
  catalyst: boolean;
  totalShotsLimit?: number;
  damagePhaseSeconds: number;
  abilities: AbilityCast[];
  superWindows: SuperWindow[];
  // The stat modifiers on at a time: those of the active effects, then those of the weapon's rules
  // (e.g. the rate of a playstyle)
  statModifiersAt?: (timeMs: number) => StatModifier[];
};

export function createWeaponActor(input: ActorInput) {
  const { weapon, catalyst } = input;
  const statsAt = (timeMs: number) => input.statModifiersAt?.(timeMs) ?? [];
  // A catalyst that changes magazine, ammo or reload replaces the timing while it is on.
  const timing = (catalyst && weapon.catalyst?.timing) || weapon;
  const chargeTimeMs = requireValue(weapon.chargeTimeMs, "chargeTimeMs");
  // A catalyst timing without a rate leaves the weapon's own (a rule may set the catalyst's later)
  const fireRateRpm = requireValue(
    timing.fireRateRpm ?? weapon.fireRateRpm,
    "fireRateRpm",
  );
  const magazine = requireValue(timing.magazine, "magazine");
  // The rounds of the weapon in all (a shot may consume several, ammoPerShot) and the cap on shots
  const totalShots =
    weapon.ammo === "primary"
      ? Number.POSITIVE_INFINITY
      : requireValue(timing.totalShots, "totalShots");
  const shotLimit = input.totalShotsLimit ?? Number.POSITIVE_INFINITY;
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
  // The rate: the latest `rpm` modifier of the rules that is on, else the weapon's (with its catalyst)
  const rpmAt = (timeMs: number, own: number) => {
    const modifiers = statsAt(timeMs).filter(
      (m) =>
        m.stat === "rpm" && appliesToWeaponType(m.weaponTypes, weapon.weaponType),
    );
    const latest = modifiers[modifiers.length - 1];
    return latest?.stat === "rpm" ? requireValue(latest.value, "rpm") : own;
  };
  const shotIntervalMsAt = (timeMs: number) =>
    MS_PER_MINUTE / rpmAt(timeMs, fireRateRpm);
  const damagePhaseMs = input.damagePhaseSeconds * MS_PER_SECOND;
  const isInPhase = (timeMs: number) => timeMs <= damagePhaseMs;

  // The reload modifiers on at a time: factor 0 skips the reload (no reload to book)
  const reloadFactorsAt = (timeMs: number) =>
    statsAt(timeMs).flatMap((m) =>
      m.stat === "reload" && appliesToWeaponType(m.weaponTypes, weapon.weaponType)
        ? [requireValue(m.factor, "reload factor")]
        : [],
    );
  const noReloadAt = (timeMs: number) => reloadFactorsAt(timeMs).includes(0);
  // Reload time × factor of the strongest active reload modifier (ADR 0014); the weapon's
  // reload may already contain a factor (K1): only the part beyond it counts.
  const includedReloadFactor = weapon.reloadDurationIncluded?.value ?? 1;
  const latestStat = (timeMs: number, stat: "reloadMs" | "ammoPerShot") => {
    const found = statsAt(timeMs).flatMap((m) =>
      m.stat === stat && appliesToWeaponType(m.weaponTypes, weapon.weaponType)
        ? [requireValue(m.value, stat)]
        : [],
    );
    return found[found.length - 1];
  };
  const ammoPerShotAt = (timeMs: number) => latestStat(timeMs, "ammoPerShot") ?? 1;
  const reloadMsAt = (timeMs: number) => {
    const own = latestStat(timeMs, "reloadMs");
    if (own !== undefined) return own;
    const factors = reloadFactorsAt(timeMs).filter((factor) => factor > 0);
    return (
      reloadTimeMs * Math.min(1, Math.min(1, ...factors) / includedReloadFactor)
    );
  };

  // A cast at the very time of a shot comes first and the shot waits for its end; a cast that
  // reloads the weapon (a dodge, a rule `on cast → refill`) follows a shot that empties the magazine,
  // so the reload is skipped.
  const blockingWindows = [
    ...input.superWindows.map((w) => ({ ...w, refills: false })),
    ...input.abilities.flatMap(({ ability, castsMs, castMs = 0 }) =>
      castsMs.map((startMs) => ({
        startMs,
        endMs: startMs + castMs,
        refills: refillsOnCast(ability),
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
    const shotIntervalMs = shotIntervalMsAt(timeMs);
    if (weapon.ammo !== "primary") return none;
    // Keyword damage per shot cannot be weighed by the rate below (see simulate.ts).
    if (
      weapon.rules?.some((rule) =>
        rule.do.some((action) => action.type === "applyStatus"),
      )
    )
      return none;
    const part = statsAt(timeMs).find(
      (m): m is Extract<StatModifier, { stat: "drawHold" }> =>
        m.stat === "drawHold" &&
        appliesToWeaponType(m.weaponTypes, weapon.weaponType),
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

  let index = 0;
  let shotMs = chargeTimeMs;
  let leftInMagazine = magazine;
  let spent = 0; // rounds fired so far, against the rounds of the weapon in all
  let done = false;

  // The step that was planned last and the state before it, so that a refill can plan it anew
  // (generation, ADR 0018 B3b). A refill is reported at the time of its event, which is never before
  // the last shot that was handled: it falls between that shot and the planned one.
  type State = { index: number; shotMs: number; left: number; spent: number; done: boolean };
  type Refill = { atMs: number; rounds?: number };
  let before: State = { index, shotMs, left: leftInMagazine, spent, done };
  let refills: Refill[] = []; // reported since `before`
  const applyRefill = (r: Refill) => {
    leftInMagazine =
      r.rounds === undefined ? magazine : Math.min(magazine, leftInMagazine + r.rounds);
  };
  /** The first refill in [fromMs, untilMs): later ones in the same stretch of time are spent. */
  const refillBefore = (fromMs: number, untilMs: number): Refill | undefined =>
    refills.find((r) => r.atMs >= fromMs && r.atMs < untilMs);

  /**
   * A refill, by a rule: a cast that reloads the weapon at once (U7; during a reload it ends it, else
   * it fills the magazine up) or `rounds` more rounds (e.g. Polaris Lance's precision hit). Returns the
   * step planned anew if the refill changes the step that was planned last, else undefined.
   */
  function refill(atMs: number, rounds?: number): ActorStep | undefined {
    const report: Refill = { atMs, ...(rounds === undefined ? {} : { rounds }) };
    // A few more rounds while the magazine is not empty change the state, not the planned shot
    if (rounds !== undefined && before.left > 0) {
      applyRefill(report);
      before.left = Math.min(magazine, before.left + rounds);
      return undefined;
    }
    if (before.index === 0) return undefined; // nothing before the first shot
    refills.push(report);
    index = before.index;
    shotMs = before.shotMs;
    leftInMagazine = before.left;
    spent = before.spent;
    done = before.done;
    return plan();
  }

  /** The next shot, or a step without a shot once the ammo, the limit or the phase ends them. */
  function next(): ActorStep {
    refills = [];
    before = { index, shotMs, left: leftInMagazine, spent, done };
    return plan();
  }

  function plan(): ActorStep {
    if (done || index >= shotLimit || spent >= totalShots) {
      done = true;
      return {};
    }
    let reloadStartMs: number | undefined;
    if (index > 0) {
      const previousMs = shotMs;
      shotMs += shotIntervalMsAt(previousMs);
      if (leftInMagazine === 0 && !noReloadAt(previousMs)) {
        const readyMs = shotMs + reloadMsAt(previousMs);
        const refilled = refillBefore(previousMs, readyMs);
        if (refilled === undefined) {
          reloadStartMs = previousMs;
        } else {
          applyRefill(refilled);
        }
        shotMs =
          refilled === undefined ? readyMs : Math.max(shotMs, refilled.atMs);
        if (refilled === undefined) leftInMagazine = magazine;
      } else if (leftInMagazine === 0) {
        leftInMagazine = magazine;
      } else {
        const refilled = refillBefore(previousMs, shotMs);
        if (refilled !== undefined) applyRefill(refilled);
      }
    }
    const consumed = Math.min(ammoPerShotAt(shotMs), leftInMagazine, totalShots - spent);
    leftInMagazine -= consumed;
    spent += consumed;
    const hold = holdAt(shotMs);
    shotMs = afterBlockingWindows(shotMs + hold.holdMs, leftInMagazine === 0);
    const shotIndex = index++;
    if (!isInPhase(shotMs)) {
      done = true;
      return { reloadStartMs };
    }
    return {
      reloadStartMs,
      shot: { index: shotIndex, timeMs: shotMs, holdFactor: hold.factor },
    };
  }

  return { next, refill, isInPhase };
}
