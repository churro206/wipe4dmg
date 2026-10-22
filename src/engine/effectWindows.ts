// Effect windows (ADR 0006, stage B): when each selected effect is active in the damage phase.
// A triggered effect opens a window at each matching event of the rotation (ADR 0015, U6-1b).

import type { Ability, Effect, Element } from "../data/schema";
import { requireValue } from "./requireValue";

const MS_PER_SECOND = 1000;

/** Start and duration of an effect in the rotation. Without a duration it lasts until the end. */
export type EffectWindowInput = {
  startMs: number;
  durationMs?: number;
};

export type EffectWindowOptions = {
  // Per effect id; replaces the default window (start 0, duration from the data file).
  effectWindows?: Record<string, EffectWindowInput>;
};

/** Events of the rotation that open the windows of triggered effects. */
export type TriggerContext = {
  casts: {
    ability: Pick<Ability, "id" | "kind" | "element" | "components">;
    castsMs: number[];
  }[];
  superWindows: { abilityId: string; startMs: number; endMs: number }[];
  weaponElement: Element;
};

export type Window = { startMs: number; endMs: number };

const NO_TRIGGERS: TriggerContext = {
  casts: [],
  superWindows: [],
  weaponElement: "kinetic",
};

/** Windows [startMs, endMs) per effect id, sorted; endMs is Infinity if the effect lasts until the end. */
export function resolveWindows(
  effects: Effect[],
  options: EffectWindowOptions,
  context: TriggerContext = NO_TRIGGERS,
): Map<string, Window[]> {
  const windows = new Map<string, Window[]>();
  for (const effect of effects) {
    const input = options.effectWindows?.[effect.id];
    const durationMs =
      effect.durationMs === undefined
        ? undefined
        : requireValue(effect.durationMs, "durationMs");
    if (input) {
      const endMs =
        input.durationMs === undefined
          ? Infinity
          : input.startMs + input.durationMs;
      windows.set(effect.id, [{ startMs: input.startMs, endMs }]);
    } else if (effect.trigger) {
      windows.set(effect.id, triggeredWindows(effect, durationMs, context));
    } else {
      windows.set(effect.id, [{ startMs: 0, endMs: durationMs ?? Infinity }]);
    }
  }
  return windows;
}

function triggeredWindows(
  effect: Effect,
  durationMs: number | undefined,
  context: TriggerContext,
): Window[] {
  const trigger = effect.trigger!;
  const lengthMs = durationMs ?? Infinity;
  const ownElement = effect.parts.some(
    (part) =>
      part.type === "multiplier" &&
      part.condition === "weaponMatchesTriggerElement",
  );
  const casts = context.casts.filter(
    ({ ability }) =>
      (trigger.abilityKinds === undefined ||
        trigger.abilityKinds.includes(ability.kind)) &&
      (trigger.abilityIds === undefined ||
        trigger.abilityIds.includes(ability.id)) &&
      (trigger.elements === undefined ||
        trigger.elements.includes(ability.element)) &&
      (!ownElement || ability.element === context.weaponElement),
  );

  if (trigger.on === "untilSuperCast") {
    const superCasts = context.casts
      .filter(({ ability }) => ability.kind === "super")
      .flatMap(({ castsMs }) => castsMs);
    return [
      {
        startMs: 0,
        endMs:
          superCasts.length > 0 ? Math.min(...superCasts) + lengthMs : Infinity,
      },
    ];
  }

  const starts = casts
    .flatMap(({ ability, castsMs }) => {
      if (trigger.on === "superEnd")
        return context.superWindows
          .filter((w) => w.abilityId === ability.id)
          .map((w) => w.endMs);
      if (trigger.on === "hit") {
        const first = ability.components[0];
        const delayMs = first ? requireValue(first.delayMs, "delayMs") : 0;
        return castsMs.map((castMs) => castMs + delayMs);
      }
      return castsMs;
    })
    .sort((a, b) => a - b);

  const result: Window[] = [];
  for (const startMs of starts) {
    const last = result[result.length - 1];
    if (last && startMs < last.endMs) {
      if (trigger.refresh) last.endMs = startMs + lengthMs;
      continue;
    }
    result.push({ startMs, endMs: startMs + lengthMs });
  }
  return result;
}

export type EffectWindow = {
  effectId: string;
  startMs: number;
  endMs: number;
  uptime: number; // share of the damage phase, 0 to 1
};

/** Windows of the effects, clipped to the damage phase, with their uptime. */
export function effectWindows(
  effects: Effect[],
  damagePhaseSeconds: number,
  options: EffectWindowOptions,
  context?: TriggerContext,
): EffectWindow[] {
  const phaseMs = damagePhaseSeconds * MS_PER_SECOND;
  const windows = resolveWindows(effects, options, context);
  return effects.flatMap((effect) =>
    windows.get(effect.id)!.map((window) => {
      const startMs = Math.min(window.startMs, phaseMs);
      const endMs = Math.min(window.endMs, phaseMs);
      return {
        effectId: effect.id,
        startMs,
        endMs,
        uptime: phaseMs > 0 ? (endMs - startMs) / phaseMs : 0,
      };
    }),
  );
}
