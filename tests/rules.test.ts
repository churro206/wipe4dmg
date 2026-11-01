// Unit tests of the rule engine (src/engine/core/rules.ts, B3a step 1): one test per trigger,
// condition and action, including those no item uses yet (addResource, actor, modifyAction).

import { describe, expect, it } from "vitest";
import type { Action, Condition, Rule, Trigger } from "../src/data/schema";
import {
  createRuleEngine,
  type RuleContext,
  type RuleEvent,
  type RuleHost,
  type RuleOwner,
} from "../src/engine/core/rules";

const source = {
  name: "tests/rules.test.ts",
  retrieved: "2026-10-31",
  status: "unverified" as const,
};
const n = (value: number) => ({ value, source });

type Call = { kind: string; [key: string]: unknown };

/** An engine with a recording host; the context is replaceable per test. */
function setup(
  owners: RuleOwner[],
  context: Partial<RuleContext> = {},
  options: Parameters<typeof createRuleEngine>[3] = {},
) {
  const calls: Call[] = [];
  const queued: RuleEvent[] = [];
  const host: RuleHost = {
    spawn: (a) => calls.push({ kind: "spawn", ...a }),
    applyStatus: (a) => calls.push({ kind: "applyStatus", ...a }),
    refill: (a) => calls.push({ kind: "refill", ...a }),
    damage: (a) => calls.push({ kind: "damage", ...a }),
    addResource: (a) => calls.push({ kind: "addResource", ...a }),
    schedule: (e) => queued.push(e),
  };
  const full: RuleContext = {
    statusStacks: () => 0,
    actorState: () => "ready",
    hasItem: () => false,
    playstyle: () => false,
    ...context,
  };
  return { engine: createRuleEngine(owners, full, host, options), calls, queued };
}

const rule = (
  id: string,
  on: Trigger,
  doActions: Action[],
  extra: Partial<Rule> = {},
): Rule => ({ id, on, do: doActions, ...extra });
const owner = (rules: Rule[], buffs: RuleOwner["buffs"] = []): RuleOwner => ({
  id: "w",
  rules,
  buffs,
});
const refill: Action = { type: "refill" };

describe("triggers", () => {
  it("shot: without a filter only the owner's own shot", () => {
    const { engine, calls } = setup([
      owner([rule("r", { on: "shot" }, [refill])]),
      { id: "other", rules: [] },
    ]);
    engine.fire({ on: "shot", timeMs: 0, ownerId: "other" });
    expect(calls).toHaveLength(0);
    engine.fire({ on: "shot", timeMs: 0, ownerId: "w" });
    expect(calls).toHaveLength(1);
  });

  it("shot: with a filter any owner's shot that matches", () => {
    const { engine, calls } = setup([
      owner([
        rule("r", { on: "shot", filter: { weaponTypes: ["bow"] } }, [refill]),
      ]),
    ]);
    engine.fire({
      on: "shot",
      timeMs: 0,
      ownerId: "x",
      attributes: { weaponType: "handCannon" },
    });
    engine.fire({ on: "shot", timeMs: 0, ownerId: "x" });
    expect(calls).toHaveLength(0);
    engine.fire({
      on: "shot",
      timeMs: 0,
      ownerId: "x",
      attributes: { weaponType: "bow" },
    });
    expect(calls).toHaveLength(1);
  });

  it("hit: own part and precision", () => {
    const { engine, calls } = setup([
      owner([
        rule("r", { on: "hit", part: "shot", precision: true }, [refill]),
      ]),
    ]);
    engine.fire({ on: "hit", timeMs: 0, ownerId: "w", part: "shot", precision: false });
    engine.fire({ on: "hit", timeMs: 0, ownerId: "w", part: "other", precision: true });
    engine.fire({ on: "hit", timeMs: 0, ownerId: "x", part: "shot", precision: true });
    expect(calls).toHaveLength(0);
    engine.fire({ on: "hit", timeMs: 0, ownerId: "w", part: "shot", precision: true });
    expect(calls).toHaveLength(1);
  });

  it("hit: a filter on damage source and status matches hits of any owner", () => {
    const { engine, calls } = setup([
      owner([
        rule(
          "r",
          {
            on: "hit",
            filter: { damageSources: ["keyword"], statuses: ["scorch"] },
          },
          [refill],
        ),
      ]),
    ]);
    engine.fire({
      on: "hit",
      timeMs: 0,
      ownerId: "x",
      attributes: { damageSource: "keyword" },
    });
    expect(calls).toHaveLength(0);
    engine.fire({
      on: "hit",
      timeMs: 0,
      ownerId: "x",
      attributes: { damageSource: "keyword", status: "scorch" },
    });
    expect(calls).toHaveLength(1);
  });

  it("cast: by kind and by ability id", () => {
    const { engine, calls } = setup([
      owner([
        rule("kind", { on: "cast", kinds: ["grenade"] }, [refill]),
        rule("id", { on: "cast", abilityIds: ["a"] }, [refill]),
      ]),
    ]);
    engine.fire({ on: "cast", timeMs: 0, ownerId: "x", kind: "melee", abilityId: "b" });
    expect(calls).toHaveLength(0);
    engine.fire({ on: "cast", timeMs: 0, ownerId: "x", kind: "grenade", abilityId: "b" });
    expect(calls).toHaveLength(1);
    engine.fire({ on: "cast", timeMs: 0, ownerId: "x", kind: "melee", abilityId: "a" });
    expect(calls).toHaveLength(2);
  });

  it("reload: only the edge of the rule", () => {
    const { engine, calls } = setup([
      owner([rule("r", { on: "reload", edge: "end" }, [refill])]),
    ]);
    engine.fire({ on: "reload", timeMs: 0, ownerId: "w", edge: "start" });
    expect(calls).toHaveLength(0);
    engine.fire({ on: "reload", timeMs: 0, ownerId: "w", edge: "end" });
    expect(calls).toHaveLength(1);
  });

  it("status: applied or threshold of one status", () => {
    const { engine, calls } = setup([
      owner([
        rule("r", { on: "status", status: "scorch", event: "threshold" }, [refill]),
      ]),
    ]);
    engine.fire({ on: "status", timeMs: 0, status: "scorch", event: "applied" });
    engine.fire({ on: "status", timeMs: 0, status: "volatile", event: "threshold" });
    expect(calls).toHaveLength(0);
    engine.fire({ on: "status", timeMs: 0, status: "scorch", event: "threshold" });
    expect(calls).toHaveLength(1);
  });

  it("timer: a tick of its rule, and the expiry of a buff or mode", () => {
    const { engine, calls } = setup([
      owner([
        rule("tick", { on: "timer", everyMs: n(500) }, [refill]),
        rule("end", { on: "timer", expires: "ring" }, [refill]),
      ]),
    ]);
    expect(engine.periodicRules()).toEqual([
      { ownerId: "w", ruleId: "tick", everyMs: 500 },
    ]);
    engine.fire({ on: "timer", timeMs: 500, ownerId: "w", ruleId: "tick" });
    expect(calls).toHaveLength(1);
    engine.fire({ on: "timer", timeMs: 900, ownerId: "w", expires: "other" });
    expect(calls).toHaveLength(1);
    engine.fire({ on: "timer", timeMs: 900, ownerId: "w", expires: "ring" });
    expect(calls).toHaveLength(2);
  });

  it("phaseStart: at the start of the damage phase", () => {
    const { engine, calls } = setup([
      owner([rule("r", { on: "phaseStart" }, [refill])]),
    ]);
    engine.fire({ on: "phaseStart", timeMs: 0 });
    expect(calls).toHaveLength(1);
  });
});

describe("conditions", () => {
  /** Fires one shot against a rule with the condition and tells whether its action ran. */
  const runs = (
    condition: Condition,
    context: Partial<RuleContext> = {},
    before: Rule[] = [],
    owners: RuleOwner[] = [],
  ) => {
    const { engine, calls } = setup(
      [
        owner(
          [...before, rule("r", { on: "shot" }, [refill], { if: [condition] })],
          [
            {
              id: "b",
              name: "B",
              modifiers: [
                {
                  type: "multiplier",
                  bucketId: "weaponPerk",
                  multiplier: n(1.1),
                  damageSources: ["weapon"],
                },
              ],
              maxStacks: n(3),
            },
          ],
        ),
        ...owners,
      ],
      context,
    );
    engine.fire({ on: "phaseStart", timeMs: 0 });
    engine.fire({ on: "shot", timeMs: 100, ownerId: "w" });
    return calls.filter((c) => c.kind === "refill").length > 0;
  };
  const prime = (...actions: Action[]): Rule[] => [
    rule("prime", { on: "phaseStart" }, actions),
  ];

  it("counter: compares the owner's counter", () => {
    const two = prime(
      { type: "addStacks", counter: "c" },
      { type: "addStacks", counter: "c" },
    );
    const at = (op: "<" | "<=" | "=" | ">=" | ">", value: number) =>
      runs({ type: "counter", id: "c", op, value: n(value) }, {}, two);
    expect([at("<", 2), at("<=", 2), at("=", 2), at(">=", 2), at(">", 2)]).toEqual([
      false,
      true,
      true,
      true,
      false,
    ]);
  });

  it("stacks: of a status at the target and of a buff", () => {
    expect(
      runs(
        { type: "stacks", status: "scorch", op: ">=", value: n(40) },
        { statusStacks: () => 40 },
      ),
    ).toBe(true);
    expect(
      runs(
        { type: "stacks", status: "scorch", op: ">=", value: n(40) },
        { statusStacks: () => 39 },
      ),
    ).toBe(false);
    expect(
      runs(
        { type: "stacks", buff: "b", op: "=", value: n(2) },
        {},
        prime({ type: "grantBuff", buff: "b", stacks: n(2) }),
      ),
    ).toBe(true);
  });

  it("buff: active", () => {
    expect(runs({ type: "buff", id: "b" })).toBe(false);
    expect(
      runs({ type: "buff", id: "b" }, {}, prime({ type: "grantBuff", buff: "b" })),
    ).toBe(true);
  });

  it("actor: state of the owner's weapon", () => {
    expect(
      runs({ type: "actor", state: "reloading" }, { actorState: () => "reloading" }),
    ).toBe(true);
    expect(
      runs({ type: "actor", state: "reloading" }, { actorState: () => "ready" }),
    ).toBe(false);
  });

  it("mode: has the value", () => {
    const set = prime({ type: "setMode", mode: "ring", to: "up" });
    expect(runs({ type: "mode", id: "ring", is: "up" }, {}, set)).toBe(true);
    expect(runs({ type: "mode", id: "ring", is: "down" }, {}, set)).toBe(false);
    expect(runs({ type: "mode", id: "ring", is: "up" })).toBe(false);
  });

  it("playstyle: build or scenario assumption", () => {
    expect(
      runs({ type: "playstyle", id: "pre" }, { playstyle: (id) => id === "pre" }),
    ).toBe(true);
    expect(runs({ type: "playstyle", id: "pre" })).toBe(false);
  });

  it("hasItem: build contains the item", () => {
    expect(
      runs({ type: "hasItem", id: "catalyst" }, { hasItem: (id) => id === "catalyst" }),
    ).toBe(true);
    expect(runs({ type: "hasItem", id: "catalyst" })).toBe(false);
  });

  it("not inverts every condition", () => {
    expect(runs({ type: "playstyle", id: "pre", not: true })).toBe(true);
    expect(
      runs({ type: "playstyle", id: "pre", not: true }, { playstyle: () => true }),
    ).toBe(false);
  });

  it("checks all conditions before any action", () => {
    const { engine, calls } = setup([
      owner([
        rule("r", { on: "shot" }, [refill, { type: "resetCounter", counter: "c" }], {
          if: [
            { type: "counter", id: "c", op: "=", value: n(0) },
            { type: "playstyle", id: "never" },
          ],
        }),
      ]),
    ]);
    engine.fire({ on: "shot", timeMs: 0, ownerId: "w" });
    expect(calls).toHaveLength(0);
  });
});

describe("actions", () => {
  const act = (action: Action, extra: Partial<Rule> = {}, buffs: RuleOwner["buffs"] = []) => {
    const run = setup([owner([rule("r", { on: "shot" }, [action], extra)], buffs)]);
    run.engine.fire({ on: "shot", timeMs: 1000, ownerId: "w" });
    return run;
  };

  it("spawn: event time, delay, count, interval and factor; omitted ones are the part's", () => {
    const { calls } = act({
      type: "spawn",
      part: "p",
      delayMs: n(500),
      count: n(3),
      intervalMs: n(100),
      factor: n(1.5),
    });
    expect(calls).toEqual([
      { kind: "spawn", ownerId: "w", part: "p", timeMs: 1000, delayMs: 500, count: 3, intervalMs: 100, factor: 1.5 },
    ]);
    expect(act({ type: "spawn", part: "p" }).calls).toEqual([
      { kind: "spawn", ownerId: "w", part: "p", timeMs: 1000, factor: 1 },
    ]);
  });

  it("addStacks and resetCounter: a counter of the owner", () => {
    const { engine } = setup([
      owner([
        rule("add", { on: "shot" }, [{ type: "addStacks", counter: "c", by: n(2) }]),
        rule("reset", { on: "phaseStart" }, [{ type: "resetCounter", counter: "c" }]),
      ]),
    ]);
    engine.fire({ on: "shot", timeMs: 0, ownerId: "w" });
    engine.fire({ on: "shot", timeMs: 1, ownerId: "w" });
    expect(engine.counter("w", "c")).toBe(4);
    engine.fire({ on: "phaseStart", timeMs: 2 });
    expect(engine.counter("w", "c")).toBe(0);
  });

  const buff = {
    id: "b",
    name: "B",
    modifiers: [
      {
        type: "multiplier" as const,
        bucketId: "weaponPerk",
        multiplier: n(1.1),
        damageSources: ["weapon" as const],
        perStack: true,
      },
    ],
    durationMs: n(1000),
    maxStacks: n(3),
  };

  it("grantBuff and addStacks: stacks up to the maximum, only while active, refreshing", () => {
    const { engine } = setup([
      owner(
        [
          rule("grant", { on: "phaseStart" }, [{ type: "grantBuff", buff: "b" }]),
          rule("add", { on: "shot" }, [{ type: "addStacks", buff: "b" }]),
        ],
        [buff],
      ),
    ]);
    engine.fire({ on: "shot", timeMs: 0, ownerId: "w" }); // not active: nothing
    expect(engine.buffStacks("w", "b", 0)).toBe(0);
    engine.fire({ on: "phaseStart", timeMs: 0 });
    expect(engine.buffStacks("w", "b", 0)).toBe(1);
    engine.fire({ on: "shot", timeMs: 900, ownerId: "w" }); // refreshes until 1900
    engine.fire({ on: "shot", timeMs: 1800, ownerId: "w" });
    engine.fire({ on: "shot", timeMs: 2700, ownerId: "w" });
    expect(engine.buffStacks("w", "b", 2700)).toBe(3);
    expect(engine.buffStacks("w", "b", 3700)).toBe(0); // t < end: gone at the end
    expect(engine.buffStacks("w", "b", 3699)).toBe(3);
  });

  it("buffPartsAt: perStack scales 1 + (m - 1) x stacks", () => {
    const { engine } = setup([
      owner(
        [
          rule("grant", { on: "phaseStart" }, [
            { type: "grantBuff", buff: "b", stacks: n(2) },
          ]),
        ],
        [buff],
      ),
    ]);
    engine.fire({ on: "phaseStart", timeMs: 0 });
    const [part] = engine.buffPartsAt("w", 10);
    expect(part.multiplier.value).toBeCloseTo(1.2, 10);
    expect(part.bucketId).toBe("weaponPerk");
    expect(engine.buffPartsAt("w", 1000)).toEqual([]);
  });

  it("grantBuff: an own duration replaces the definition's", () => {
    const { engine } = act(
      { type: "grantBuff", buff: "b", durationMs: n(200) },
      {},
      [buff],
    );
    expect(engine.buffStacks("w", "b", 1199)).toBe(1);
    expect(engine.buffStacks("w", "b", 1200)).toBe(0);
  });

  it("applyStatus: stacks, delay and duration", () => {
    const { calls } = act({
      type: "applyStatus",
      status: "scorch",
      stacks: n(40),
      delayMs: n(500),
      durationMs: n(3000),
    });
    expect(calls).toEqual([
      { kind: "applyStatus", ownerId: "w", status: "scorch", stacks: 40, durationMs: 3000, timeMs: 1500 },
    ]);
    expect(act({ type: "applyStatus", status: "jolt" }).calls[0]).toMatchObject({
      stacks: 1,
      timeMs: 1000,
    });
  });

  it("refill: rounds or full", () => {
    expect(act({ type: "refill", rounds: n(1) }).calls).toEqual([
      { kind: "refill", ownerId: "w", rounds: 1, timeMs: 1000 },
    ]);
    expect(act({ type: "refill" }).calls).toEqual([
      { kind: "refill", ownerId: "w", timeMs: 1000 },
    ]);
  });

  it("modifyStat: active for its duration, else until the end of the phase", () => {
    const rpm = { type: "stat" as const, stat: "rpm" as const, value: n(300) };
    const timed = act({ type: "modifyStat", modifier: rpm, durationMs: n(500) });
    expect(timed.engine.statModifiersAt("w", 1499)).toEqual([rpm]);
    expect(timed.engine.statModifiersAt("w", 1500)).toEqual([]);
    const open = act({ type: "modifyStat", modifier: rpm });
    expect(open.engine.statModifiersAt("w", 1e9)).toEqual([rpm]);
  });

  it("setMode: a value until its duration ends, and an expiry event for a rule that listens", () => {
    const { engine, queued } = setup([
      owner([
        rule("set", { on: "shot" }, [
          { type: "setMode", mode: "ring", to: "up", durationMs: n(1000) },
        ]),
        rule("end", { on: "timer", expires: "ring" }, [refill]),
      ]),
    ]);
    engine.fire({ on: "shot", timeMs: 0, ownerId: "w" });
    expect(engine.modeOf("w", "ring", 999)).toBe("up");
    expect(engine.modeOf("w", "ring", 1000)).toBeUndefined();
    expect(queued).toEqual([
      { on: "timer", timeMs: 1000, ownerId: "w", expires: "ring" },
    ]);
  });

  it("addResource: energy of an ability kind", () => {
    expect(
      act({ type: "addResource", resource: "grenade", amount: n(0.1) }).calls,
    ).toEqual([
      { kind: "addResource", ownerId: "w", resource: "grenade", amount: 0.1, timeMs: 1000 },
    ]);
  });

  it("modifyAction: scales applyStatus, rounded up (Ember of Ashes)", () => {
    const { engine, calls } = setup([
      owner([
        rule("ember", { on: "phaseStart" }, [
          {
            type: "modifyAction",
            modifier: {
              type: "action",
              action: "applyStatus",
              status: "scorch",
              factor: n(1.5),
            },
            durationMs: n(5000),
          },
        ]),
        rule("scorch", { on: "shot" }, [
          { type: "applyStatus", status: "scorch", stacks: n(40) },
          { type: "applyStatus", status: "jolt", stacks: n(3) },
        ]),
      ]),
    ]);
    engine.fire({ on: "phaseStart", timeMs: 0 });
    engine.fire({ on: "shot", timeMs: 100, ownerId: "w" });
    engine.fire({ on: "shot", timeMs: 5000, ownerId: "w" }); // modifier ended
    expect(calls.map((c) => [c.status, c.stacks])).toEqual([
      ["scorch", 60],
      ["jolt", 3],
      ["scorch", 40],
      ["jolt", 3],
    ]);
  });

  it("passive action modifiers of an item count in their own window", () => {
    const { engine, calls } = setup(
      [owner([rule("s", { on: "shot" }, [{ type: "applyStatus", status: "scorch", stacks: n(15) }])])],
      {},
      {
        passiveActionModifiers: [
          {
            modifier: { type: "action", action: "applyStatus", status: "scorch", factor: n(1.5) },
            activeAt: (t) => t < 1000,
          },
        ],
      },
    );
    engine.fire({ on: "shot", timeMs: 0, ownerId: "w" });
    engine.fire({ on: "shot", timeMs: 1000, ownerId: "w" });
    expect(calls.map((c) => c.stacks)).toEqual([23, 15]); // 22.5 rounded up
  });

  it("damage: of its own without a weapon part", () => {
    expect(
      act({
        type: "damage",
        id: "discharge",
        damage: n(120),
        element: "arc",
        damageSource: "keyword",
        delivery: "splash",
      }).calls,
    ).toEqual([
      {
        kind: "damage",
        ownerId: "w",
        id: "discharge",
        damage: 120,
        element: "arc",
        damageSource: "keyword",
        delivery: "splash",
        timeMs: 1000,
      },
    ]);
  });
});

describe("rule order and cooldown", () => {
  it("runs the rules of one event in file order, owners first", () => {
    const { engine, calls } = setup([
      owner([
        rule("a", { on: "shot" }, [{ type: "spawn", part: "first" }]),
        rule("b", { on: "shot" }, [{ type: "spawn", part: "second" }]),
      ]),
    ]);
    engine.fire({ on: "shot", timeMs: 0, ownerId: "w" });
    expect(calls.map((c) => c.part)).toEqual(["first", "second"]);
  });

  it("a later rule checks its conditions against the state before the event", () => {
    const { engine, calls } = setup([
      owner([
        rule("count", { on: "shot" }, [{ type: "addStacks", counter: "c" }]),
        rule("see", { on: "shot" }, [refill], {
          if: [{ type: "counter", id: "c", op: "=", value: n(1) }],
        }),
        rule("see-before", { on: "shot" }, [refill], {
          if: [{ type: "counter", id: "c", op: "=", value: n(0) }],
        }),
      ]),
    ]);
    engine.fire({ on: "shot", timeMs: 0, ownerId: "w" });
    expect(calls).toHaveLength(1); // only the rule that sees the counter at 0
    engine.fire({ on: "shot", timeMs: 1, ownerId: "w" });
    expect(calls).toHaveLength(2); // now `see` sees 1, `see-before` no longer 0
  });

  it("cooldown: the rule does not fire again within the time", () => {
    const { engine, calls } = setup([
      owner([rule("r", { on: "shot" }, [refill], { cooldownMs: n(1000) })]),
    ]);
    for (const timeMs of [0, 999, 1000, 1500, 2000]) {
      engine.fire({ on: "shot", timeMs, ownerId: "w" });
    }
    expect(calls.map((c) => c.timeMs)).toEqual([0, 1000, 2000]);
  });

  it("a missing value is an error, never a guess", () => {
    const { engine } = setup([
      owner([
        rule("r", { on: "shot" }, [
          { type: "spawn", part: "p", delayMs: { value: null, source: { ...source, status: "missing" } } },
        ]),
      ]),
    ]);
    expect(() => engine.fire({ on: "shot", timeMs: 0, ownerId: "w" })).toThrow(/missing/);
  });
});
