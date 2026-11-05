// Rule engine of the core (docs/architecture.md section 6, ADR 0018, stage B3a): Event - Condition -
// Action. An event is matched against the rules of every owner; the conditions of a rule are checked
// before the actions of any rule of the event (all against the state before the event); the actions
// then run in file order (owner order, then rule order). The
// engine keeps the state of the owners (counters, modes, buffs, modifiers) and changes the world only
// through the host (spawns hits, applies statuses, refills, ...). New engine code only for a new type
// of trigger, condition or action (I3, tests/ruleTypes.test.ts).

import type {
  AbilityKind,
  Action,
  ActionModifier,
  ActorState,
  BuffDefinition,
  CompareOp,
  Condition,
  DamageSource,
  Delivery,
  Element,
  HitFilter,
  MultiplierModifier,
  MultiplierPart,
  Rule,
  RuleValue,
  StatModifier,
  TargetStatusId,
  Trigger,
  WeaponType,
} from "../../data/schema";
import { requireValue } from "../requireValue";
import type { BuffWindow } from "./types";

// Guards rounding up against floating point noise, e.g. 40 x 1.5 = 60.00000000000001.
const ROUNDING_TOLERANCE = 1e-9;

/** What the owner of a rule is: a weapon, an effect or an ability, with its rules and buffs. */
export type RuleOwner = {
  id: string;
  rules: Rule[];
  buffs?: BuffDefinition[];
  /** The windows of an effect: its rules fire and its buffs count only while it is active. Omitted: always. */
  activeAt?: (timeMs: number) => boolean;
};

/** What a shot or hit is, for the filter of a trigger. */
export type HitAttributes = {
  damageSource?: DamageSource;
  element?: Element;
  weaponType?: WeaponType;
  abilityId?: string;
  status?: TargetStatusId; // the status whose damage it is, e.g. scorch for an ignition
};

export type RuleEvent =
  | { on: "shot"; timeMs: number; ownerId: string; attributes?: HitAttributes }
  | {
      on: "hit";
      timeMs: number;
      ownerId: string;
      part?: string; // the owner's part that hit
      precision?: boolean;
      attributes?: HitAttributes;
    }
  | {
      on: "cast";
      timeMs: number;
      ownerId: string;
      kind: AbilityKind;
      abilityId: string;
    }
  | { on: "reload"; timeMs: number; ownerId: string; edge: "start" | "end" }
  | {
      on: "status";
      timeMs: number;
      status: TargetStatusId;
      event: "applied" | "threshold";
    }
  // ruleId: one tick of a rule with `everyMs`; expires: the end of a buff, mode or window of this id
  | {
      on: "timer";
      timeMs: number;
      ownerId: string;
      ruleId?: string;
      expires?: string;
    }
  | { on: "phaseStart"; timeMs: number };

/** What the conditions look at outside the owners' state. */
export type RuleContext = {
  statusStacks: (status: TargetStatusId, timeMs: number) => number;
  actorState: (ownerId: string, timeMs: number) => ActorState;
  hasItem: (id: string, ownerId: string) => boolean;
  playstyle: (id: string) => boolean;
};

/** What the actions change in the world; times are absolute (event time plus delay). */
export type RuleHost = {
  // Hits of one of the owner's parts. What the rule omits (delay, count, interval) is 0 ms, one
  // hit and no interval (section 6); timeMs is the time of the event.
  spawn: (spawn: {
    ownerId: string;
    part: string;
    timeMs: number;
    delayMs?: number;
    count?: number;
    intervalMs?: number;
    factor: number;
  }) => void;
  applyStatus: (apply: {
    ownerId: string;
    status: TargetStatusId;
    stacks: number;
    durationMs?: number;
    timeMs: number;
  }) => void;
  refill: (refill: { ownerId: string; rounds?: number; timeMs: number }) => void;
  damage: (damage: {
    ownerId: string;
    id: string;
    damage: number;
    element: Element;
    damageSource: DamageSource;
    delivery?: Delivery;
    timeMs: number;
  }) => void;
  addResource: (add: {
    ownerId: string;
    resource: AbilityKind;
    amount: number;
    timeMs: number;
  }) => void;
  /** Queues an event of the engine itself (the expiry of a buff or mode); feed it back to `fire`. */
  schedule: (event: RuleEvent) => void;
};

export type RuleEngineOptions = {
  /** Modifiers of items that are active in their own window (e.g. Ember of Ashes' counter factor). */
  passiveActionModifiers?: {
    modifier: ActionModifier;
    activeAt: (timeMs: number) => boolean;
  }[];
};

type BuffState = {
  stacks: number;
  untilMs: number;
  durationMs?: number;
  window: BuffWindow; // its entry in the buff log
};
type TimedModifier<M> = { modifier: M; untilMs: number };

type OwnerState = {
  counters: Map<string, number>;
  modes: Map<string, { value: string; untilMs: number }>;
  buffs: Map<string, BuffState>;
  statModifiers: TimedModifier<StatModifier>[];
  actionModifiers: TimedModifier<ActionModifier>[];
  lastFiredMs: Map<string, number>;
};

const matchesFilter = (
  filter: HitFilter | undefined,
  attributes: HitAttributes | undefined,
) => {
  if (!filter) return true;
  const a = attributes ?? {};
  const has = <T>(list: readonly T[] | undefined, value: T | undefined) =>
    list === undefined || (value !== undefined && list.includes(value));
  return (
    has(filter.damageSources, a.damageSource) &&
    has(filter.elements, a.element) &&
    has(filter.weaponTypes, a.weaponType) &&
    has(filter.abilityIds, a.abilityId) &&
    has(filter.statuses, a.status)
  );
};

const compare = (left: number, op: CompareOp, right: number) => {
  switch (op) {
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    case "=":
      return left === right;
    case ">=":
      return left >= right;
    case ">":
      return left > right;
  }
};

export function createRuleEngine(
  owners: RuleOwner[],
  context: RuleContext,
  host: RuleHost,
  options: RuleEngineOptions = {},
) {
  const states = new Map<string, OwnerState>();
  const buffDefinitions = new Map<string, Map<string, BuffDefinition>>();
  const activeAtOf = new Map<string, (timeMs: number) => boolean>();
  for (const owner of owners) {
    if (owner.activeAt) activeAtOf.set(owner.id, owner.activeAt);
    states.set(owner.id, {
      counters: new Map(),
      modes: new Map(),
      buffs: new Map(),
      statModifiers: [],
      actionModifiers: [],
      lastFiredMs: new Map(),
    });
    buffDefinitions.set(
      owner.id,
      new Map((owner.buffs ?? []).map((buff) => [buff.id, buff])),
    );
  }
  /** Every window of a buff (display only, the damage does not read it). */
  const buffLog: BuffWindow[] = [];
  const stateOf = (ownerId: string): OwnerState => {
    const state = states.get(ownerId);
    if (!state) throw new Error(`Unknown rule owner "${ownerId}"`);
    return state;
  };
  const buffDefinition = (ownerId: string, buffId: string): BuffDefinition => {
    const definition = buffDefinitions.get(ownerId)?.get(buffId);
    if (!definition) {
      throw new Error(`Unknown buff "${buffId}" of "${ownerId}"`);
    }
    return definition;
  };
  const expiryRule = (ownerId: string, id: string) =>
    owners
      .find((owner) => owner.id === ownerId)
      ?.rules.some((r) => r.on.on === "timer" && r.on.expires === id) ?? false;

  // --- State queries (modes and buffs with a duration are active while t < end) -----------------

  const counter = (ownerId: string, id: string) =>
    stateOf(ownerId).counters.get(id) ?? 0;
  const modeOf = (ownerId: string, id: string, timeMs: number) => {
    const mode = stateOf(ownerId).modes.get(id);
    return mode && timeMs < mode.untilMs ? mode.value : undefined;
  };
  const buffStacks = (ownerId: string, id: string, timeMs: number) => {
    const buff = stateOf(ownerId).buffs.get(id);
    return buff && timeMs < buff.untilMs ? buff.stacks : 0;
  };
  const statModifiersAt = (ownerId: string, timeMs: number): StatModifier[] =>
    stateOf(ownerId)
      .statModifiers.filter((m) => timeMs < m.untilMs)
      .map((m) => m.modifier);

  const isActive = (ownerId: string, timeMs: number) =>
    activeAtOf.get(ownerId)?.(timeMs) ?? true;

  /** The multiplier parts of the active buffs of all active owners. */
  const allBuffPartsAt = (timeMs: number): MultiplierPart[] =>
    owners.flatMap((owner) => buffPartsAt(owner.id, timeMs));

  /** The multiplier parts of the active buffs of an owner; a `perStack` multiplier scales with stacks. */
  const buffPartsAt = (ownerId: string, timeMs: number): MultiplierPart[] => {
    const parts: MultiplierPart[] = [];
    if (!isActive(ownerId, timeMs)) return parts;
    for (const [id, definition] of buffDefinitions.get(ownerId) ?? []) {
      const stacks = buffStacks(ownerId, id, timeMs);
      if (stacks === 0) continue;
      for (const modifier of definition.modifiers) {
        const part: Partial<MultiplierModifier> = { ...(modifier as MultiplierModifier) };
        delete part.perStack;
        parts.push({
          ...(part as MultiplierModifier),
          multiplier: { ...modifier.multiplier, value: multiplierAt(modifier, stacks) },
        });
      }
    }
    return parts;
  };

  /** The value of one multiplier at the given stacks: a `perStack` one scales with them. */
  const multiplierAt = (modifier: BuffDefinition["modifiers"][number], stacks: number) => {
    const multiplier = requireValue(modifier.multiplier, "multiplier");
    return (modifier as MultiplierModifier).perStack ? 1 + (multiplier - 1) * stacks : multiplier;
  };

  /** The product of the multipliers of a buff at the given stacks. */
  const buffFactor = (definition: BuffDefinition, stacks: number) =>
    definition.modifiers.reduce((product, modifier) => product * multiplierAt(modifier, stacks), 1);

  /**
   * Puts a buff's stand into the log: a window that goes on while the stacks stay, a new one at every
   * change of stacks (a ramp), so each window carries the factor it had.
   */
  const logWindow = (
    ownerId: string,
    id: string,
    definition: BuffDefinition,
    previous: BuffState | undefined,
    timeMs: number,
    stacks: number,
    endMs: number,
  ): BuffWindow => {
    const active = previous !== undefined && timeMs < previous.untilMs;
    if (active && previous.window.stacks === stacks) {
      previous.window.endMs = endMs;
      return previous.window;
    }
    if (active) previous.window.endMs = timeMs;
    const window: BuffWindow = {
      ownerId,
      buffId: id,
      name: definition.name,
      startMs: timeMs,
      endMs,
      stacks,
      factor: buffFactor(definition, stacks),
    };
    buffLog.push(window);
    return window;
  };

  /** Stacks an applyStatus brings, scaled by the active action modifiers and rounded up. */
  const stacksOfApply = (
    ownerId: string,
    status: TargetStatusId,
    stacks: number,
    timeMs: number,
  ) => {
    const factors = [
      ...stateOf(ownerId).actionModifiers.filter((m) => timeMs < m.untilMs),
      ...(options.passiveActionModifiers ?? [])
        .filter((m) => m.activeAt(timeMs))
        .map((m) => ({ modifier: m.modifier, untilMs: Infinity })),
    ]
      .filter(
        ({ modifier }) =>
          modifier.action === "applyStatus" && modifier.status === status,
      )
      .map(({ modifier }) => requireValue(modifier.factor, "factor"));
    if (factors.length === 0) return stacks;
    return Math.ceil(
      stacks * factors.reduce((a, b) => a * b, 1) - ROUNDING_TOLERANCE,
    );
  };

  // --- Triggers and conditions -------------------------------------------------------------------

  const matches = (rule: Rule, ownerId: string, event: RuleEvent): boolean => {
    const trigger: Trigger = rule.on;
    if (trigger.on !== event.on) return false;
    switch (trigger.on) {
      case "shot": {
        const e = event as Extract<RuleEvent, { on: "shot" }>;
        return trigger.filter
          ? matchesFilter(trigger.filter, e.attributes)
          : e.ownerId === ownerId;
      }
      case "hit": {
        const e = event as Extract<RuleEvent, { on: "hit" }>;
        if (trigger.part !== undefined) {
          if (e.ownerId !== ownerId || e.part !== trigger.part) return false;
        } else if (!trigger.filter && e.ownerId !== ownerId) {
          return false;
        }
        if (trigger.precision !== undefined && e.precision !== trigger.precision)
          return false;
        return matchesFilter(trigger.filter, e.attributes);
      }
      case "cast": {
        const e = event as Extract<RuleEvent, { on: "cast" }>;
        // Without a filter a cast means the owner's own, like a shot or a hit
        if (trigger.kinds === undefined && trigger.abilityIds === undefined) {
          return e.ownerId === ownerId;
        }
        return (
          (trigger.kinds === undefined || trigger.kinds.includes(e.kind)) &&
          (trigger.abilityIds === undefined ||
            trigger.abilityIds.includes(e.abilityId))
        );
      }
      case "reload": {
        const e = event as Extract<RuleEvent, { on: "reload" }>;
        return e.ownerId === ownerId && e.edge === trigger.edge;
      }
      case "status": {
        const e = event as Extract<RuleEvent, { on: "status" }>;
        return e.status === trigger.status && e.event === trigger.event;
      }
      case "timer": {
        const e = event as Extract<RuleEvent, { on: "timer" }>;
        if (e.ownerId !== ownerId) return false;
        return trigger.expires !== undefined
          ? e.expires === trigger.expires
          : e.ruleId === rule.id;
      }
      case "phaseStart":
        return true;
    }
  };

  const holds = (
    condition: Condition,
    ownerId: string,
    timeMs: number,
  ): boolean => {
    let result: boolean;
    switch (condition.type) {
      case "counter":
        result = compare(
          counter(ownerId, condition.id),
          condition.op,
          requireValue(condition.value, "counter value"),
        );
        break;
      case "stacks": {
        const stacks =
          condition.status !== undefined
            ? context.statusStacks(condition.status, timeMs)
            : buffStacks(ownerId, condition.buff ?? "", timeMs);
        result = compare(
          stacks,
          condition.op,
          requireValue(condition.value, "stacks value"),
        );
        break;
      }
      case "buff":
        result = buffStacks(ownerId, condition.id, timeMs) > 0;
        break;
      case "actor":
        result = context.actorState(ownerId, timeMs) === condition.state;
        break;
      case "mode":
        result = modeOf(ownerId, condition.id, timeMs) === condition.is;
        break;
      case "playstyle":
        result = context.playstyle(condition.id);
        break;
      case "hasItem":
        result = context.hasItem(condition.id, ownerId);
        break;
    }
    return condition.not ? !result : result;
  };

  // --- Actions -----------------------------------------------------------------------------------

  const ms = (value: RuleValue | undefined, name = "duration") =>
    value === undefined ? undefined : requireValue(value, name);

  const endOf = (timeMs: number, durationMs: number | undefined) =>
    durationMs === undefined ? Infinity : timeMs + durationMs;

  const act = (action: Action, ownerId: string, timeMs: number) => {
    const state = stateOf(ownerId);
    switch (action.type) {
      case "spawn":
        host.spawn({
          ownerId,
          part: action.part,
          timeMs,
          ...(action.delayMs ? { delayMs: ms(action.delayMs, "delayMs") } : {}),
          ...(action.count ? { count: requireValue(action.count, "ticks") } : {}),
          ...(action.intervalMs
            ? { intervalMs: ms(action.intervalMs, "tickIntervalMs") }
            : {}),
          factor: action.factor ? requireValue(action.factor, "factor") : 1,
        });
        return;
      case "addStacks": {
        const by = action.by ? requireValue(action.by, "by") : 1;
        if (action.counter !== undefined) {
          state.counters.set(action.counter, counter(ownerId, action.counter) + by);
          return;
        }
        const id = action.buff as string;
        const buff = state.buffs.get(id);
        if (!buff || timeMs >= buff.untilMs) return; // only an active buff
        const max = buffDefinition(ownerId, id).maxStacks;
        const stacks = Math.min(max ? requireValue(max, "maxStacks") : 1, buff.stacks + by);
        const untilMs = endOf(timeMs, buff.durationMs);
        buff.window = logWindow(ownerId, id, buffDefinition(ownerId, id), buff, timeMs, stacks, untilMs);
        buff.stacks = stacks;
        buff.untilMs = untilMs;
        return;
      }
      case "resetCounter":
        state.counters.set(action.counter, 0);
        return;
      case "applyStatus": {
        const delayMs = ms(action.delayMs) ?? 0;
        const applyMs = timeMs + delayMs;
        const durationMs = ms(action.durationMs);
        host.applyStatus({
          ownerId,
          status: action.status,
          stacks: stacksOfApply(
            ownerId,
            action.status,
            action.stacks ? requireValue(action.stacks, "stacks") : 1,
            applyMs,
          ),
          ...(durationMs !== undefined ? { durationMs } : {}),
          timeMs: applyMs,
        });
        return;
      }
      case "grantBuff": {
        const definition = buffDefinition(ownerId, action.buff);
        const durationMs =
          ms(action.durationMs) ?? ms(definition.durationMs);
        const max = definition.maxStacks
          ? requireValue(definition.maxStacks, "maxStacks")
          : 1;
        const given = action.stacks ? requireValue(action.stacks, "stacks") : 1;
        const current = state.buffs.get(action.buff);
        const active = current !== undefined && timeMs < current.untilMs;
        const stacks = Math.min(max, active ? Math.max(current.stacks, given) : given);
        // A renewal while the buff stands goes on in the same window, as long as the stacks stay
        const window = logWindow(ownerId, action.buff, definition, current, timeMs, stacks, endOf(timeMs, durationMs));
        state.buffs.set(action.buff, {
          stacks,
          untilMs: endOf(timeMs, durationMs),
          durationMs,
          window,
        });
        if (durationMs !== undefined && expiryRule(ownerId, action.buff)) {
          host.schedule({
            on: "timer",
            timeMs: timeMs + durationMs,
            ownerId,
            expires: action.buff,
          });
        }
        return;
      }
      case "refill":
        host.refill({
          ownerId,
          ...(action.rounds ? { rounds: requireValue(action.rounds, "rounds") } : {}),
          ...(action.ofCounter
            ? {
                // toFixed: 0.8 x 15 must not become 12.000000000000002 and round up to 13
                rounds: Math.ceil(
                  Number(
                    (
                      requireValue(action.ofCounter.share, "share") *
                      counter(ownerId, action.ofCounter.counter)
                    ).toFixed(9),
                  ),
                ),
              }
            : {}),
          timeMs,
        });
        return;
      case "modifyStat":
        state.statModifiers.push({
          modifier: action.modifier,
          untilMs: endOf(timeMs, ms(action.durationMs)),
        });
        return;
      case "setMode": {
        const durationMs = ms(action.durationMs);
        state.modes.set(action.mode, {
          value: action.to,
          untilMs: endOf(timeMs, durationMs),
        });
        if (durationMs !== undefined && expiryRule(ownerId, action.mode)) {
          host.schedule({
            on: "timer",
            timeMs: timeMs + durationMs,
            ownerId,
            expires: action.mode,
          });
        }
        return;
      }
      case "addResource":
        host.addResource({
          ownerId,
          resource: action.resource,
          amount: requireValue(action.amount, "amount"),
          timeMs,
        });
        return;
      case "modifyAction":
        state.actionModifiers.push({
          modifier: action.modifier,
          untilMs: endOf(timeMs, ms(action.durationMs)),
        });
        return;
      case "damage":
        host.damage({
          ownerId,
          id: action.id,
          damage: requireValue(action.damage, "damage"),
          element: action.element,
          damageSource: action.damageSource,
          ...(action.delivery ? { delivery: action.delivery } : {}),
          timeMs,
        });
        return;
    }
  };

  /**
   * Runs the rules that the event matches. All conditions (and cooldowns) are checked against the
   * state before the event; then the actions run in file order (owner order, then rule order).
   */
  const fire = (event: RuleEvent) => {
    const firing: { rule: Rule; ownerId: string }[] = [];
    for (const owner of owners) {
      // The end of a buff or mode still reaches an owner whose window is over
      const ends = event.on === "timer" && event.expires !== undefined;
      if (!ends && !isActive(owner.id, event.timeMs)) continue;
      const state = stateOf(owner.id);
      for (const rule of owner.rules) {
        if (!matches(rule, owner.id, event)) continue;
        if (!(rule.if ?? []).every((c) => holds(c, owner.id, event.timeMs))) {
          continue;
        }
        const cooldownMs = rule.cooldownMs
          ? requireValue(rule.cooldownMs, "cooldownMs")
          : 0;
        const last = state.lastFiredMs.get(rule.id);
        if (last !== undefined && event.timeMs < last + cooldownMs) continue;
        firing.push({ rule, ownerId: owner.id });
      }
    }
    for (const { rule, ownerId } of firing) {
      stateOf(ownerId).lastFiredMs.set(rule.id, event.timeMs);
      for (const action of rule.do) act(action, ownerId, event.timeMs);
    }
  };

  /** The rules with `timer everyMs`: the host queues their ticks inside the owner's window. */
  const periodicRules = () =>
    owners.flatMap((owner) =>
      owner.rules.flatMap((rule) =>
        rule.on.on === "timer" && rule.on.everyMs
          ? [
              {
                ownerId: owner.id,
                ruleId: rule.id,
                everyMs: requireValue(rule.on.everyMs, "everyMs"),
              },
            ]
          : [],
      ),
    );

  return {
    fire,
    counter,
    modeOf,
    buffStacks,
    buffPartsAt,
    allBuffPartsAt,
    statModifiersAt,
    periodicRules,
    buffLog,
  };
}

export type RuleEngine = ReturnType<typeof createRuleEngine>;
