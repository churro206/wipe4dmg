// The rules that set off the parts of a weapon (docs/architecture.md section 6, ADR 0018 B3a step 3):
// on every shot a `spawn` per part, with the times in the action. A part with `everyNthShot` counts
// the shots in a counter of its own, a part that needs the catalyst has the condition `hasItem
// catalyst`, and a part with a factor per tick spawns once per tick.

import type {
  Condition,
  DamageInstance,
  Rule,
  SourcedNumber,
} from "../../src/data/schema.ts";

const sameNumber = (value: number | null, from: SourcedNumber): SourcedNumber => ({
  value,
  source: from.source,
});

/**
 * Where a part belongs to a playstyle (Weapon.playstyles): `only` is the playstyle whose shot it is,
 * `except` the playstyles whose parts take its place.
 */
export type PartPlaystyle = { only?: string; except?: string[] };

/** The rate of a playstyle: a stat modifier from the start of the phase on, only in that playstyle. */
export function playstyleRateRule(id: string, rpm: SourcedNumber): Rule {
  return {
    id: `${id}-rate`,
    on: { on: "phaseStart" },
    if: [{ type: "playstyle", id }],
    do: [{ type: "modifyStat", modifier: { type: "stat", stat: "rpm", value: rpm } }],
  };
}

/** The rules for one part; the shot is the trigger, so a part is set off by the shot of its weapon. */
export function partRules(part: DamageInstance, playstyle: PartPlaystyle = {}): Rule[] {
  const inPlaystyle: Condition[] = [
    ...(playstyle.only ? [{ type: "playstyle" as const, id: playstyle.only }] : []),
    ...(playstyle.except ?? []).map((id) => ({
      type: "playstyle" as const,
      id,
      not: true,
    })),
  ];
  const delay = part.delayMs;
  const interval = part.tickIntervalMs;
  const nth = part.everyNthShot?.value ?? 1;
  const spawn =
    part.tickFactors !== undefined
      ? part.tickFactors.map((factor, tick) => ({
          type: "spawn" as const,
          part: part.id,
          // A gap in the part stays a gap in the rule (the engine refuses it)
          delayMs: sameNumber(
            delay.value === null || interval.value === null
              ? null
              : delay.value + tick * interval.value,
            delay,
          ),
          factor,
        }))
      : [
          {
            type: "spawn" as const,
            part: part.id,
            ...(delay.value === 0 ? {} : { delayMs: delay }),
            ...(part.ticks.value !== 1 || interval.value === null
              ? { count: part.ticks, intervalMs: interval }
              : {}),
          },
        ];
  const catalyst = part.requiresCatalyst
    ? [{ type: "hasItem" as const, id: "catalyst" }]
    : [];
  const on = { on: "shot" as const };
  if (nth <= 1) {
    const conditions = [...inPlaystyle, ...catalyst];
    return [{ id: part.id, on, ...(conditions.length > 0 ? { if: conditions } : {}), do: spawn }];
  }
  // The conditions of a rule see the counter before the event: the first N-1 shots count, the Nth fires
  const counter = `${part.id}-shots`;
  return [
    {
      id: `${part.id}-count`,
      on,
      if: [
        ...inPlaystyle,
        { type: "counter", id: counter, op: "<", value: sameNumber(nth - 1, part.everyNthShot!) },
      ],
      do: [{ type: "addStacks", counter }],
    },
    {
      id: part.id,
      on,
      if: [
        ...inPlaystyle,
        { type: "counter", id: counter, op: "=", value: sameNumber(nth - 1, part.everyNthShot!) },
        ...catalyst,
      ],
      do: [{ type: "resetCounter", counter }, ...spawn],
    },
  ];
}
