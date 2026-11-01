// Unit tests of the status container (src/engine/core/status.ts, B3a step 2): stacks with a
// threshold and a cooldown, the burn of the stacks, a status that goes off by damage taken, and
// stacks on the player. The simulator tests cover the same behavior through whole builds.

import { describe, expect, it } from "vitest";
import type {
  Keyword,
  StatusModifierData,
  TargetStatusId,
} from "../src/data/schema";
import { statusOfKeywordId } from "../src/engine/effectRules";
import {
  runEvents,
  statusState,
  type OnHit,
  type RunEvent,
} from "../src/engine/eventRun";
import { createStatusContainer } from "../src/engine/core/status";
import type { TimedDamageInstance } from "../src/engine/core/types";

const source = {
  name: "tests/status.test.ts",
  retrieved: "2026-10-31",
  status: "unverified" as const,
};
const n = (value: number) => ({ value, source });

const base = {
  compendium: { tab: "t", entry: "e" },
  aegisRowId: "row",
  damageCategory: "generic" as const,
  damage: n(100),
};
const ignition: Keyword = {
  ...base,
  id: "ignition",
  status: "scorch",
  name: "Ignition",
  element: "solar",
  trigger: { type: "counter", threshold: n(100) },
  cooldownMs: n(1300),
  removedOnTrigger: true,
  burn: {
    baseDamage: n(2.7),
    damagePerStack: n(0.175),
    firstTickDelayMs: n(500),
    secondTickDelayMs: n(930),
    tickIntervalMs: n(560),
    holdMs: n(2300),
    decayStackIntervalMs: n(40),
  },
};
const jolt: Keyword = {
  ...base,
  id: "jolt",
  status: "jolt",
  name: "Jolt",
  element: "arc",
  trigger: { type: "damageTaken", threshold: n(115), applyingHitCounts: true },
  cooldownMs: n(2000),
  delayMs: n(100),
  durationMs: n(5000),
  removedOnTrigger: false,
};
const boltCharge: Keyword = {
  ...base,
  id: "boltCharge",
  status: "boltCharge",
  name: "Bolt Charge",
  element: "arc",
  trigger: {
    type: "playerStacks",
    stacks: n(4),
    dischargedBy: { damageSources: ["melee"], keywordIds: [], source },
  },
  removedOnTrigger: true,
};

const hit = (
  timeMs: number,
  extra: Partial<TimedDamageInstance> = {},
): TimedDamageInstance => ({
  id: "h",
  timeMs,
  damage: 100,
  damageSource: "weapon",
  element: "solar",
  weaponType: "handCannon",
  factors: {},
  ...extra,
});
/** What a rule `on hit → applyStatus` does to a hit of these tests (the core runs the rules). */
type Applies = {
  keywordId: "ignition" | "jolt" | "volatile" | "unravel" | "boltCharge";
  damageSources: TimedDamageInstance["damageSource"][];
  stacks?: ReturnType<typeof n>;
};
const appliesKeyword = (
  keywordId: Applies["keywordId"],
  extra: Partial<Applies> = {},
): Applies => ({ keywordId, damageSources: ["weapon"], ...extra });

const container = (
  keywords: Keyword[],
  parts: Applies[] = [],
  stackFactor: (status: TargetStatusId, timeMs: number) => number = () => 1,
) => {
  const status = createStatusContainer({
    keywords,
    multiplierAt: () => ({}),
    stackFactorAt: stackFactor,
    isInPhase: (timeMs) => timeMs <= 30_000,
  });
  const onHit: OnHit = (hit, target, schedule) => {
    status.onHit(hit, target, schedule);
    for (const part of parts) {
      if (!part.damageSources.includes(hit.damageSource)) continue;
      status.applyStatus(
        target,
        statusOfKeywordId(part.keywordId),
        part.stacks ? { stacks: part.stacks.value } : {},
        hit,
        schedule,
      );
    }
  };
  return { ...status, onHit };
};

/** Runs `hits` as events that pass through the container's onHit. */
const run = (
  status: ReturnType<typeof container>,
  hits: TimedDamageInstance[],
) =>
  runEvents(
    hits.map(
      (h): RunEvent => ({
        timeMs: h.timeMs,
        group: 0,
        handle: (_, emit) => emit(h),
      }),
    ),
    status.onHit,
  );

describe("status without damage (weaken)", () => {
  const weaken: StatusModifierData = {
    id: "weaken",
    name: "Weaken",
    compendium: { tab: "Void", entry: "Weaken" },
    durationMs: n(6000),
    modifiers: [
      {
        type: "multiplier",
        bucketId: "debuff",
        multiplier: n(1.15),
        damageSources: ["weapon", "keyword"],
      },
    ],
  };
  const withWeaken = () =>
    createStatusContainer({
      keywords: [],
      modifierStatuses: [weaken],
      multiplierAt: () => ({}),
      stackFactorAt: () => 1,
      isInPhase: () => true,
    });
  const target = () => ({ statuses: new Map() });
  const apply = (
    status: ReturnType<typeof withWeaken>,
    t: ReturnType<typeof target>,
    timeMs: number,
    durationMs?: number,
  ) =>
    status.applyStatus(
      t,
      "weaken",
      durationMs === undefined ? {} : { durationMs },
      hit(timeMs),
      () => {},
    );
  const multipliers = (
    status: ReturnType<typeof withWeaken>,
    t: ReturnType<typeof target>,
    timeMs: number,
  ) => status.modifiersOnTarget(t, timeMs).map((m) => m.multiplier.value);

  it("modifies the damage for its duration and then ends", () => {
    const status = withWeaken();
    const t = target();
    expect(multipliers(status, t, 0)).toEqual([]);
    apply(status, t, 1000);
    expect(multipliers(status, t, 1000)).toEqual([1.15]);
    expect(multipliers(status, t, 6999)).toEqual([1.15]);
    expect(multipliers(status, t, 7000)).toEqual([]);
  });

  it("is refreshed by a new application, never shortened", () => {
    const status = withWeaken();
    const t = target();
    apply(status, t, 0);
    apply(status, t, 4000);
    expect(multipliers(status, t, 9999)).toEqual([1.15]);
    expect(multipliers(status, t, 10_000)).toEqual([]);
    apply(status, t, 5000, 1000); // a shorter application does not cut the running one
    expect(multipliers(status, t, 9999)).toEqual([1.15]);
  });

  it("takes the duration of the application if it names one", () => {
    const status = withWeaken();
    const t = target();
    apply(status, t, 0, 30_000);
    expect(multipliers(status, t, 29_999)).toEqual([1.15]);
    expect(multipliers(status, t, 30_000)).toEqual([]);
  });

  it("is a status of its own on each target", () => {
    const status = withWeaken();
    const [a, b] = [target(), target()];
    apply(status, a, 0);
    expect(multipliers(status, b, 100)).toEqual([]);
  });
});

describe("stacks with a threshold (scorch)", () => {
  const add = (
    status: ReturnType<typeof container>,
    target: Parameters<ReturnType<typeof container>["addStacks"]>[0],
    stacks: number,
    timeMs: number,
  ) =>
    status.addStacks(target, "scorch", {
      stacks,
      timeMs,
      threshold: 100,
      cooldownMs: 1300,
      source: hit(timeMs),
      schedule: () => {},
    });
  const target = () => ({ statuses: new Map() });

  it("stacks below the threshold, resets at it, and blocks during the cooldown", () => {
    const status = container([ignition]);
    const t = target();
    expect(add(status, t, 60, 0)).toBe("stacked");
    expect(statusState(t, "scorch").stacks).toBe(60);
    expect(add(status, t, 60, 100)).toBe("threshold");
    expect(statusState(t, "scorch").stacks).toBe(0);
    expect(add(status, t, 40, 1399)).toBe("blocked");
    expect(add(status, t, 40, 1400)).toBe("stacked");
    expect(statusState(t, "scorch").stacks).toBe(40);
  });

  it("scales the stacks by the action modifiers and rounds up", () => {
    const status = container([ignition], [], () => 1.5);
    const t = target();
    add(status, t, 15, 0); // 22.5
    expect(statusState(t, "scorch").stacks).toBe(23);
    add(status, t, 40, 10); // 60 although 40 x 1.5 = 60.00000000000001 in floating point
    expect(statusState(t, "scorch").stacks).toBe(83);
  });

  it("ignition goes off at once with the bonuses of the applying hit", () => {
    const status = container([ignition], [appliesKeyword("ignition", { stacks: n(60) })]);
    const hits = run(status, [hit(0), hit(100)]);
    const ignitions = hits.filter((h) => h.keywordId === "ignition" && h.id === "ignition");
    expect(ignitions.map((h) => [h.timeMs, h.damage])).toEqual([[100, 100]]);
  });

  it("burns: first tick 500 ms after the first stacks, second 930 ms later, then every 560 ms", () => {
    const status = container([ignition], [appliesKeyword("ignition", { stacks: n(40) })]);
    const burns = run(status, [hit(0)]).filter((h) => h.id === "burn");
    expect(burns.map((h) => h.timeMs).slice(0, 4)).toEqual([500, 1430, 1990, 2550]);
    expect(burns[0].damage).toBeCloseTo(2.7 + 0.175 * 40, 10);
  });

  it("burn stacks hold 2.3 s and then fall one by one", () => {
    const status = container([ignition], [appliesKeyword("ignition", { stacks: n(40) })]);
    const burns = run(status, [hit(0)]).filter((h) => h.id === "burn");
    // at 2550 ms the hold (2300 ms) is over by 250 ms: floor(250 / 40) = 6 stacks fell
    expect(burns[3].timeMs).toBe(2550);
    expect(burns[3].damage).toBeCloseTo(2.7 + 0.175 * 34, 10);
  });

  it("an ignition ends the burn that was running", () => {
    const status = container([ignition], [appliesKeyword("ignition", { stacks: n(60) })]);
    const burns = run(status, [hit(0), hit(100)]).filter((h) => h.id === "burn");
    expect(burns).toEqual([]);
  });
});

describe("a status that goes off by damage taken (jolt)", () => {
  const parts = [appliesKeyword("jolt")];

  it("counts the applying hit and the following ones; goes off after its delay", () => {
    const status = container([jolt], parts);
    const hits = run(status, [hit(0, { damage: 60 }), hit(50, { damage: 60 })]);
    const goOff = hits.filter((h) => h.id === "jolt");
    expect(goOff.map((h) => h.timeMs)).toEqual([150]);
  });

  it("does not count its own hits and waits for the cooldown", () => {
    const status = container([jolt], parts);
    const hits = run(status, [
      hit(0, { damage: 200 }), // applying hit counts: goes off at 100
      hit(500, { damage: 200 }), // cooldown until 2000
      hit(2000, { damage: 200 }),
    ]);
    expect(hits.filter((h) => h.id === "jolt").map((h) => h.timeMs)).toEqual([
      100, 2100,
    ]);
  });

  it("is not active after its duration", () => {
    const status = container([jolt], []);
    const withPart = container([jolt], parts);
    expect(run(status, [hit(0, { damage: 500 })]).some((h) => h.id === "jolt")).toBe(false);
    expect(
      run(withPart, [hit(0, { damage: 100 }), hit(5001, { damage: 100 })]).some(
        (h) => h.id === "jolt" && h.timeMs < 5000,
      ),
    ).toBe(false);
  });
});

describe("stacks on the player (bolt charge)", () => {
  it("adds up to the stack count and is used up by a discharging hit", () => {
    const status = container(
      [boltCharge],
      [appliesKeyword("boltCharge", { stacks: n(2), damageSources: ["weapon"] })],
    );
    const hits = run(status, [
      hit(0),
      hit(10),
      hit(20),
      hit(30, { damageSource: "melee" }),
      hit(40, { damageSource: "melee" }), // used up: nothing
    ]);
    expect(hits.filter((h) => h.id === "boltCharge").map((h) => h.timeMs)).toEqual([30]);
  });

  it("does not discharge below the stack count", () => {
    const status = container(
      [boltCharge],
      [appliesKeyword("boltCharge", { stacks: n(1) })],
    );
    const hits = run(status, [hit(0), hit(10, { damageSource: "melee" })]);
    expect(hits.some((h) => h.id === "boltCharge")).toBe(false);
  });
});
