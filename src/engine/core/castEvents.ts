// Events planned in advance, until the strategy stage (ADR 0018, B3): hits of ability casts, the ticks
// of periodic rules of effects and the super windows. Weapon shots are not planned here; the actor makes them.

import type { AbilityComponent } from "../../data/schema";
import { productOf, type Factors } from "../effectParts";
import type { RunEvent, TargetState } from "../eventRun";
import { requireValue } from "../requireValue";
import { superWindowMs } from "../superWindow";
import type { RuleEvent } from "./rules";
import type { AbilityCast, SuperWindow } from "./types";

// Order of events at equal times in the event run (eventRun.ts).
export const EVENT_GROUP = {
  weaponHit: 0,
  threshold: 1,
  damageOverTime: 2,
  abilityHit: 3,
  periodic: 4,
} as const;

/** Super windows of all super casts with usage data, sorted by start. */
export function superWindowsOf(casts: AbilityCast[]): SuperWindow[] {
  return casts
    .flatMap(({ ability, castsMs }) => {
      if (ability.kind !== "super" || !ability.usage) return [];
      const { durationMs, exact } = superWindowMs(ability.usage);
      return castsMs.map((startMs) => ({
        abilityId: ability.id,
        startMs,
        endMs: startMs + durationMs,
        exact,
      }));
    })
    .sort((a, b) => a.startMs - b.startMs);
}

/** Hits of all components of an ability after each cast: delay, then ticks. */
export function abilityHitEvents(
  { ability, castsMs }: AbilityCast,
  isInPhase: (timeMs: number) => boolean,
  multiplierAt: (timeMs: number, component: AbilityComponent) => Factors,
): RunEvent[] {
  const components = ability.components.map((component) => ({
    id: `${ability.id}.${component.id}`,
    component,
    delayMs: requireValue(component.delayMs, "delayMs"),
    damage: requireValue(component.damagePerTick, "damagePerTick"),
    ticks: requireValue(component.ticks, "ticks"),
    tickIntervalMs: requireValue(component.tickIntervalMs, "tickIntervalMs"),
  }));
  const result: RunEvent[] = [];
  for (const castMs of castsMs) {
    for (const component of components) {
      for (let tick = 0; tick < component.ticks; tick++) {
        const timeMs =
          castMs + component.delayMs + tick * component.tickIntervalMs;
        if (!isInPhase(timeMs)) continue;
        result.push({
          timeMs,
          group: EVENT_GROUP.abilityHit,
          handle: (_, emit) => {
            const factors = multiplierAt(timeMs, component.component);
            emit({
              id: component.id,
              timeMs,
              damage: component.damage * productOf(factors),
              damageSource: ability.kind,
              element: ability.element,
              abilityId: ability.id,
              ...(component.component.delivery
                ? { delivery: component.component.delivery }
                : {}),
              factors,
            });
          },
        });
      }
    }
  }
  return result;
}

/**
 * The ticks of a rule with `timer everyMs` in one window of its owner: one interval after the window
 * start, then every interval. Each tick fires the rule; what it does is up to its actions.
 */
export function periodicEvents(
  ownerId: string,
  ruleId: string,
  intervalMs: number,
  window: { startMs: number; endMs: number },
  isInPhase: (timeMs: number) => boolean,
  fire: (
    event: RuleEvent,
    target: TargetState,
    schedule: (event: RunEvent) => void,
  ) => void,
): RunEvent[] {
  if (intervalMs <= 0) {
    throw new Error(`intervalMs must be positive, got ${intervalMs}`);
  }
  const result: RunEvent[] = [];
  for (
    let timeMs = window.startMs + intervalMs;
    timeMs < window.endMs && isInPhase(timeMs);
    timeMs += intervalMs
  ) {
    const atMs = timeMs;
    result.push({
      timeMs: atMs,
      group: EVENT_GROUP.periodic,
      handle: (target, _, schedule) =>
        fire({ on: "timer", timeMs: atMs, ownerId, ruleId }, target, schedule),
    });
  }
  return result;
}
