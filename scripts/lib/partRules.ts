// The rules that set off the parts of a weapon (docs/architecture.md section 6, ADR 0018 B3a step 3):
// on every shot a `spawn` per part, with the times in the action. A part with `everyNthShot` counts
// the shots in a counter of its own, a part that needs the catalyst has the condition `hasItem
// catalyst`, and a part with a factor per tick spawns once per tick. A setup that the shots build
// and deploy (Guidance Ring) is a counter and a mode (setupRules).

import type {
  BuffDefinition,
  Condition,
  DamageInstance,
  Rule,
  SourcedNumber,
  WeaponOption,
} from "../../src/data/schema.ts";

const sameNumber = (value: number | null, from: SourcedNumber): SourcedNumber => ({
  value,
  source: from.source,
});

/**
 * Where a part belongs to a playstyle (Weapon.playstyles): `only` is the playstyle whose shot it is,
 * `except` the playstyles whose parts take its place.
 */
export type PartPlaystyle = {
  only?: string;
  except?: string[];
  // The part is dealt only while a mode of the weapon has this value, e.g. the seekers while the ring stands
  mode?: { id: string; is: string };
};

/** Assumptions of a build or scenario that a setup reads (condition `playstyle`). */
export const PRE_STACKED = "pre-stacked";
export const SETUP_STANDS = "setup-stands";
/** The value of the mode of a setup while it stands. */
export const SETUP_UP = "up";

export type SetupRuleInput = {
  mode: string; // id of the mode and prefix of the rules, e.g. "guidance-ring"
  shotsBefore: SourcedNumber; // shots until it stands, the deploying shot included
  shotsBeforePreBuilt: SourcedNumber; // the same with the charges built before the phase
  durationMs: SourcedNumber;
  catalystRpm?: SourcedNumber; // the catalyst's rate once it stands
};

/**
 * The rules of a setup that the shots build and deploy, e.g. a Guidance Ring: the first N-1 shots count
 * in a counter, the next shot sets the mode for its duration, and again whenever the mode has run
 * out (the counter stays full). "Pre-stacked" fills the counter, "setup stands" fills it and sets the
 * mode at the start of the phase. The catalyst's rate holds from the first deployment on.
 */
export function setupRules(setup: SetupRuleInput): Rule[] {
  const { mode, shotsBefore, shotsBeforePreBuilt, durationMs, catalystRpm } = setup;
  const counter = `${mode}-shots`;
  const full = sameNumber(
    shotsBefore.value === null ? null : shotsBefore.value - 1,
    shotsBefore,
  );
  const preStacked = sameNumber(
    shotsBefore.value === null || shotsBeforePreBuilt.value === null
      ? null
      : shotsBefore.value - shotsBeforePreBuilt.value,
    shotsBeforePreBuilt,
  );
  const up = { type: "mode" as const, id: mode, is: SETUP_UP };
  const setUp = { type: "setMode" as const, mode, to: SETUP_UP, durationMs };
  const catalyst = { type: "hasItem" as const, id: "catalyst" };
  const rate = catalystRpm
    ? [
        {
          type: "modifyStat" as const,
          modifier: { type: "stat" as const, stat: "rpm" as const, value: catalystRpm },
        },
      ]
    : [];
  const deploys: Condition[] = [
    { type: "counter", id: counter, op: ">=", value: full },
    { ...up, not: true },
  ];
  return [
    {
      id: `${mode}-pre-stacked`,
      on: { on: "phaseStart" },
      if: [{ type: "playstyle", id: PRE_STACKED }],
      do: [{ type: "addStacks", counter, by: preStacked }],
    },
    {
      id: `${mode}-stands`,
      on: { on: "phaseStart" },
      if: [{ type: "playstyle", id: SETUP_STANDS }],
      do: [{ type: "addStacks", counter, by: full }, setUp],
    },
    ...(rate.length > 0
      ? [
          {
            id: `${mode}-stands-rate`,
            on: { on: "phaseStart" as const },
            if: [{ type: "playstyle" as const, id: SETUP_STANDS }, catalyst],
            do: rate,
          },
        ]
      : []),
    {
      id: `${mode}-count`,
      on: { on: "shot" },
      if: [{ type: "counter", id: counter, op: "<", value: full }],
      do: [{ type: "addStacks", counter }],
    },
    { id: `${mode}-deploy`, on: { on: "shot" }, if: deploys, do: [setUp] },
    ...(rate.length > 0
      ? [
          {
            id: `${mode}-deploy-rate`,
            on: { on: "shot" as const },
            if: [...deploys, catalyst],
            do: rate,
          },
        ]
      : []),
  ];
}

/**
 * The window of a catalyst option ("for 15 seconds, the timer starts after firing"): the first shot
 * grants a buff of the window's length that holds the option's factor. The buff has the id of the
 * option, which tells the engine not to count the option for the whole phase as well. A counter lets
 * only the first shot start it; the buff is active while t < end, like every buff.
 */
export function catalystWindowRules(
  option: WeaponOption,
  windowMs: SourcedNumber,
): { buff: BuffDefinition; rules: Rule[] } {
  const started = `${option.id}-started`;
  return {
    buff: {
      id: option.id,
      name: option.name,
      modifiers: [
        {
          type: "multiplier",
          bucketId: option.bucketId,
          multiplier: option.factor,
          damageSources: ["weapon"],
        },
      ],
      durationMs: windowMs,
    },
    rules: [
      {
        id: `${option.id}-window`,
        on: { on: "shot" },
        if: [
          { type: "hasItem", id: "catalyst" },
          { type: "counter", id: started, op: "<", value: sameNumber(1, windowMs) },
        ],
        do: [
          { type: "addStacks", counter: started },
          { type: "grantBuff", buff: option.id },
        ],
      },
    ],
  };
}

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
    ...(playstyle.mode
      ? [{ type: "mode" as const, id: playstyle.mode.id, is: playstyle.mode.is }]
      : []),
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
