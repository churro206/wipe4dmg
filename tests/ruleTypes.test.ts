// I3 (docs/architecture.md, section 1 and 6): new engine code only for a new trigger, condition,
// action, modifier or status type. This test lists the allowed types; a new one is a deliberate
// change of the architecture. It also lists the special fields of the runtime schema that B3 turns
// into rules: the list shrinks with each step and is empty at the end of B3b. WeaponOverride keeps
// its fields as import input until B4 (item files).

import { describe, expect, it } from "vitest";
import {
  Ability,
  Action,
  AppliesKeywordPart,
  BuffDefinition,
  Condition,
  DamageInstance,
  IntrinsicPart,
  Modifier,
  MultiplierPart,
  PeriodicDamagePart,
  Rule,
  StatModifier,
  TargetStatusId,
  Trigger,
  Weapon,
  WeaponOption,
} from "../src/data/schema";

describe("rule types (I3)", () => {
  it("lists the allowed triggers", () => {
    expect(Trigger.options.map((o) => o.shape.on.value)).toEqual([
      "shot",
      "hit",
      "cast",
      "reload",
      "status",
      "timer",
      "phaseStart",
    ]);
  });

  it("lists the allowed conditions", () => {
    expect(Condition.options.map((o) => o.shape.type.value)).toEqual([
      "counter",
      "stacks",
      "buff",
      "actor",
      "mode",
      "playstyle",
      "hasItem",
    ]);
  });

  it("lists the allowed actions", () => {
    expect(Action.options.map((o) => o.shape.type.value)).toEqual([
      "spawn",
      "addStacks",
      "resetCounter",
      "applyStatus",
      "grantBuff",
      "refill",
      "modifyStat",
      "setMode",
      "addResource",
      "modifyAction",
      "damage",
    ]);
  });

  it("lists the allowed modifiers and stats", () => {
    const [multiplier, stat, action] = Modifier.options;
    expect([
      multiplier.shape.type.value,
      "stat",
      action.shape.type.value,
    ]).toEqual(["multiplier", "stat", "action"]);
    expect(stat).toBe(StatModifier);
    expect(StatModifier.options.map((o) => o.shape.stat.value)).toEqual([
      "rpm",
      "reload",
      "chargeMs",
      "drawHold",
    ]);
  });

  it("lists the statuses of the status container", () => {
    expect(TargetStatusId.options).toEqual([
      "scorch",
      "volatile",
      "jolt",
      "unravel",
      "boltCharge",
      "weaken",
    ]);
  });
});

// Special fields of the runtime schema (docs/plans/ground-up-model.md, B3). Each becomes a rule or a
// modifier; remove an entry from REMAINING when its field is gone.
const SPECIAL_FIELDS = [
  "Weapon.intrinsicParts",
  "DamageInstance.requiresCatalyst",
  "DamageInstance.everyNthShot",
  "DamageInstance.tickFactors",
  "Ability.refillsMagazine",
  "Ability.keywordParts",
  "EffectPart.appliesKeyword",
  "EffectPart.periodicDamage",
  "IntrinsicPart.counter",
  "IntrinsicPart.threshold",
  "IntrinsicPart.damageOverTime",
];

// B3a removes the weapon side, B3b the effect and ability side; empty at the end of B3.
const REMAINING = SPECIAL_FIELDS;

const present = (): string[] => {
  const fields: Record<string, string[]> = {
    Weapon: Object.keys(Weapon.shape),
    DamageInstance: Object.keys(DamageInstance.shape),
    WeaponOption: Object.keys(WeaponOption.shape),
    MultiplierPart: Object.keys(MultiplierPart.shape),
    Ability: Object.keys(Ability.shape),
    // what Effect.modifiers still carries beside the Modifier types (until B3b step 3)
    EffectPart: [AppliesKeywordPart, PeriodicDamagePart].map((o) => o.shape.type.value),
    IntrinsicPart: IntrinsicPart.options.map((o) => o.shape.type.value),
  };
  return SPECIAL_FIELDS.filter((entry) => {
    const [schema, field] = entry.split(".");
    return fields[schema].includes(field);
  });
};

describe("special fields (B3)", () => {
  it("has only the special fields still to migrate", () => {
    expect(present()).toEqual(REMAINING);
  });
});

describe("golden example (architecture section 5.4)", () => {
  const source = {
    name: "docs/architecture.md, section 5.4",
    retrieved: "2026-10-31",
    status: "unverified" as const,
  };
  const n = (value: number) => ({ value, source });

  it("expresses Polaris Lance's Perfect Fifth as rules", () => {
    const precisionHit = { on: "hit", part: "shot", precision: true } as const;
    const rules = [
      { id: "refill", on: precisionHit, do: [{ type: "refill", rounds: n(1) }] },
      {
        id: "count",
        on: precisionHit,
        if: [{ type: "counter", id: "fifth", op: "<", value: n(4) }],
        do: [{ type: "addStacks", counter: "fifth" }],
      },
      {
        id: "fifth",
        on: precisionHit,
        if: [{ type: "counter", id: "fifth", op: "=", value: n(4) }],
        do: [
          { type: "resetCounter", counter: "fifth" },
          { type: "spawn", part: "perfect-fifth", delayMs: n(500) },
        ],
      },
      {
        id: "scorch",
        on: { on: "hit", part: "perfect-fifth" },
        do: [{ type: "applyStatus", status: "scorch", stacks: n(40) }],
      },
    ];
    for (const rule of rules) expect(Rule.parse(rule)).toEqual(rule);
  });

  it("keeps a buff in exactly one bucket", () => {
    const multiplier = (bucketId: string) => ({
      type: "multiplier",
      bucketId,
      multiplier: n(1.1),
      damageSources: ["weapon"],
      perStack: true,
    });
    const buff = (...buckets: string[]) => ({
      id: "peacekeepers",
      name: "Peacekeepers",
      modifiers: buckets.map(multiplier),
      maxStacks: n(5),
    });
    expect(BuffDefinition.safeParse(buff("exoticIntrinsic")).success).toBe(true);
    expect(
      BuffDefinition.safeParse(buff("exoticIntrinsic", "exoticIntrinsic"))
        .success,
    ).toBe(true);
    expect(
      BuffDefinition.safeParse(buff("exoticIntrinsic", "weaponPerk")).success,
    ).toBe(false);
  });

  it("needs exactly one target for addStacks", () => {
    expect(
      Action.safeParse({ type: "addStacks", counter: "a", buff: "b" }).success,
    ).toBe(false);
    expect(Action.safeParse({ type: "addStacks", counter: "a" }).success).toBe(
      true,
    );
  });
});
