// Rule sets for the engine tests of modes and buff windows (tests/weaponSetup.test.ts,
// tests/catalystWindow.test.ts). No Data File is built with them any more: Hierarchy of Needs and
// the catalyst windows are written by hand in their item files; these builders keep the engine's
// semantics under test.

import type {
  BuffDefinition,
  Condition,
  Rule,
  SourcedNumber,
  WeaponOption,
} from "../../src/data/schema";

const sameNumber = (value: number | null, from: SourcedNumber): SourcedNumber => ({
  value,
  source: from.source,
});

/** Assumptions of a scenario that a setup reads (condition `playstyle`). */
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
