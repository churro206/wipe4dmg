// The core of the simulator (ADR 0017, ADR 0018 B1): the shots are not planned in advance. The weapon
// actor makes the next shot when the loop handles the previous one, and a shot sets off its hits,
// counter stacks and damage over time sources as events. Casts, effect windows and periodic damage are
// still planned in advance (castEvents.ts, until the strategy stage).

import type {
  Bucket,
  Effect,
  KeywordId,
  Weapon,
} from "../../data/schema";
import { KEYWORD_COUNTERS, type Factors } from "../effectParts";
import {
  runEvents,
  type OnHit,
  type RunEvent,
  type TargetState,
} from "../eventRun";
import { requireValue } from "../requireValue";
import { bucketFactors } from "../effectParts";
import {
  abilityHitEvents,
  EVENT_GROUP,
  periodicEvents,
  superWindowsOf,
} from "./castEvents";
import type {
  Shot,
  SimulationOptions,
  SimulationResult,
  TimedDamageInstance,
} from "./types";
import { withPlaystyle } from "../playstyle";
import { createContext, type ShotHistory } from "./context";
import { damageOf } from "./formula";
import {
  createRuleEngine,
  type HitAttributes,
  type RuleEvent,
} from "./rules";
import { createStatusContainer, KEYWORD_EVENT_GROUP } from "./status";
import { createWeaponActor, type PlannedShot } from "./weaponActor";

// A shot comes before every other event of its time: the hits it sets off see the shot history.
const SHOT_GROUP = -1;
// The start of the damage phase comes before the first shot (rules on phaseStart).
const PHASE_START_GROUP = -2;

export function simulate(
  plainWeapon: Weapon,
  damagePhaseSeconds: number,
  effects: Effect[] = [],
  buckets: Bucket[] = [],
  options: SimulationOptions = {},
): SimulationResult {
  const weapon = withPlaystyle(plainWeapon, options.playstyle);
  const history: ShotHistory = { shots: [], holdFactors: [], partHitsMs: [] };
  const superWindows = superWindowsOf(options.abilities ?? []);
  const context = createContext(
    weapon,
    effects,
    buckets,
    options,
    superWindows,
    history,
  );
  const { catalyst, damageSource, multiplierAt, counterFactorAt, partsAt } =
    context;
  const actor = createWeaponActor({
    weapon,
    catalyst,
    totalShotsLimit: options.shotLimit,
    setupPreBuilt: options.setupPreBuilt,
    setupDeployed: options.setupDeployed,
    damagePhaseSeconds,
    abilities: options.abilities ?? [],
    superWindows,
    partsAt,
  });
  const { isInPhase } = actor;

  const instances = weapon.damageInstances
    .filter((instance) => catalyst || !instance.requiresCatalyst)
    .map((instance) => ({
      tickFactors: (instance.tickFactors ?? []).map((f) => requireValue(f, "tickFactors")),
      id: instance.id,
      delivery: instance.delivery,
      delayMs: requireValue(instance.delayMs, "delayMs"),
      damage: requireValue(instance.damagePerTick, "damagePerTick"),
      ticks: requireValue(instance.ticks, "ticks"),
      tickIntervalMs: requireValue(instance.tickIntervalMs, "tickIntervalMs"),
      requiresSetup: instance.requiresSetup ?? false,
      everyNthShot: instance.everyNthShot
        ? requireValue(instance.everyNthShot, "everyNthShot")
        : 1,
    }));
  const thresholds = weapon.intrinsicParts.flatMap((part) =>
    part.type === "threshold"
      ? [
          {
            part,
            threshold: requireValue(part.threshold, "threshold"),
            cooldownMs: requireValue(part.cooldownMs, "cooldownMs"),
            damage: requireValue(part.damage, "damage"),
          },
        ]
      : [],
  );
  const counterParts = weapon.intrinsicParts.flatMap((part) =>
    part.type === "counter"
      ? [
          {
            part,
            stacks: requireValue(part.stacks, "stacks"),
            count: requireValue(
              part.applicationsPerTrigger,
              "applicationsPerTrigger",
            ),
            firstDelayMs: requireValue(part.firstDelayMs, "firstDelayMs"),
            intervalMs: requireValue(part.intervalMs, "intervalMs"),
          },
        ]
      : [],
  );
  const dotParts = weapon.intrinsicParts.flatMap((part) =>
    part.type === "damageOverTime" && (catalyst || !part.requiresCatalyst)
      ? [
          {
            part,
            count: requireValue(
              part.applicationsPerTrigger,
              "applicationsPerTrigger",
            ),
            firstDelayMs: requireValue(part.firstDelayMs, "firstDelayMs"),
            intervalMs: requireValue(part.intervalMs, "intervalMs"),
            sourceScale: part.sourceScale
              ? requireValue(part.sourceScale, "sourceScale")
              : 1,
            impactDamage: requireValue(part.impactDamage, "impactDamage"),
            tickDamage: requireValue(part.tickDamage, "tickDamage"),
            ticks: requireValue(part.ticks, "ticks"),
            tickIntervalMs: requireValue(part.tickIntervalMs, "tickIntervalMs"),
            firstTickDelayMs: requireValue(
              part.firstTickDelayMs,
              "firstTickDelayMs",
            ),
            maxActive: requireValue(
              part.maxActivePerTarget,
              "maxActivePerTarget",
            ),
          },
        ]
      : [],
  );

  // Statuses on the target and the burn of their stacks (status container, ADR 0018 B3a).
  const statusContainer = createStatusContainer({
    keywords: options.keywords ?? [],
    keywordPartsAt: (timeMs) => [
      ...context.weaponKeywordParts,
      ...partsAt(timeMs).keywordParts,
    ],
    multiplierAt: context.keywordMultiplierAt,
    stackFactorAt: counterFactorAt,
    isInPhase,
  });
  /** The weapon as source of scorch that its own parts apply; burn inherits its bonuses. */
  const scorchSource = (timeMs: number): TimedDamageInstance => ({
    id: "scorch",
    timeMs,
    damage: 0,
    damageSource: damageSource,
    element: weapon.element,
    weaponType: weapon.weaponType,
    factors: {},
  });

  // --- Rules of the weapon (docs/architecture.md section 6, ADR 0018 B3a) --------------------------
  // The engine decides when; what the actions do in the world is done here. A part that a `spawn`
  // action names is set off by the rules only; the other parts still by the shot (hitEvents).
  const WEAPON = weapon.id;
  const rules = weapon.rules ?? [];
  const ruleParts = new Set(
    rules.flatMap((rule) =>
      rule.do.flatMap((action) => (action.type === "spawn" ? [action.part] : [])),
    ),
  );
  const partsById = new Map(weapon.damageInstances.map((i) => [i.id, i]));
  /** The hits the rules set off: their part and whether it counts as a precision hit. */
  const ruleHits = new WeakMap<
    TimedDamageInstance,
    { part: string; precision: boolean }
  >();
  const statusOfKeyword = new Map(
    (options.keywords ?? []).map((keyword) => [keyword.id, keyword.status]),
  );
  /** Where the rules fire right now: the event that is handled, with its target and queue. */
  type Firing = {
    timeMs: number;
    target: TargetState;
    schedule: (event: RunEvent) => void;
    hit?: TimedDamageInstance;
  };
  let firing: Firing | undefined;
  const current = (): Firing => {
    if (!firing) throw new Error("A rule acted outside of an event");
    return firing;
  };
  const notYet = (what: string) => () => {
    throw new Error(`${what} is not supported by the core yet (B3b)`);
  };
  const ruleEngine = createRuleEngine(
    [{ id: WEAPON, rules, buffs: weapon.buffs ?? [] }],
    {
      statusStacks: (status, timeMs) =>
        statusContainer.stacksOnTarget(current().target, status, timeMs),
      actorState: notYet("The condition on the state of the weapon"),
      hasItem: (id) =>
        id === "catalyst" ? catalyst : effects.some((effect) => effect.id === id),
      playstyle: (id) => options.playstyle === id,
    },
    {
      spawn: ({ part, timeMs, delayMs, count, intervalMs, factor }) => {
        const instance = partsById.get(part);
        if (!instance) throw new Error(`A rule spawns the unknown part "${part}"`);
        const damage = requireValue(instance.damagePerTick, "damagePerTick");
        const first = timeMs + (delayMs ?? requireValue(instance.delayMs, "delayMs"));
        const every = intervalMs ?? requireValue(instance.tickIntervalMs, "tickIntervalMs");
        const hits = count ?? requireValue(instance.ticks, "ticks");
        const { schedule } = current();
        for (let tick = 0; tick < hits; tick++) {
          const atMs = first + tick * every;
          if (!isInPhase(atMs)) continue;
          schedule({
            timeMs: atMs,
            group: EVENT_GROUP.weaponHit,
            handle: (_, emit) => {
              const factors = multiplierAt(atMs, weapon.element);
              const hit: TimedDamageInstance = {
                id: instance.id,
                timeMs: atMs,
                damage: damageOf(damage * factor, factors),
                damageSource,
                element: weapon.element,
                weaponType: weapon.weaponType,
                ...(instance.delivery ? { delivery: instance.delivery } : {}),
                factors,
              };
              ruleHits.set(hit, {
                part: instance.id,
                precision: instance.canPrecision,
              });
              emit(hit);
            },
          });
        }
      },
      applyStatus: ({ status, stacks, durationMs, timeMs }) => {
        const { target, schedule, hit, timeMs: eventMs } = current();
        const source = hit ?? scorchSource(timeMs);
        const application = {
          stacks,
          ...(durationMs === undefined ? {} : { durationMs }),
        };
        if (timeMs <= eventMs) {
          statusContainer.applyStatus(target, status, application, source, schedule);
          return;
        }
        schedule({
          timeMs,
          group: KEYWORD_EVENT_GROUP,
          handle: (laterTarget, _, laterSchedule) =>
            statusContainer.applyStatus(
              laterTarget,
              status,
              application,
              { ...source, timeMs },
              laterSchedule,
            ),
        });
      },
      refill: ({ rounds, timeMs }) => actor.refill(timeMs, rounds),
      damage: notYet("The action damage"),
      addResource: notYet("The action addResource"),
      // A timer of the engine itself, e.g. the end of a mode: it comes back as an event
      schedule: (event) =>
        current().schedule({
          timeMs: event.timeMs,
          group: KEYWORD_EVENT_GROUP,
          handle: (target, _, schedule) => fireRules(event, target, schedule),
        }),
    },
  );
  /** Fires a rule event; the rules run with the target and queue of the event that is handled. */
  function fireRules(
    event: RuleEvent,
    target: TargetState,
    schedule: (event: RunEvent) => void,
    hit?: TimedDamageInstance,
  ) {
    if (rules.length === 0) return;
    const previous = firing;
    firing = { timeMs: event.timeMs, target, schedule, ...(hit ? { hit } : {}) };
    try {
      ruleEngine.fire(event);
    } finally {
      firing = previous;
    }
  }
  /** A hit seen by the statuses first, then by the rules. */
  const onHit: OnHit = (hit, target, schedule) => {
    statusContainer.onHit(hit, target, schedule);
    if (rules.length === 0) return;
    const own = ruleHits.get(hit);
    const status = hit.keywordId ? statusOfKeyword.get(hit.keywordId) : undefined;
    const attributes: HitAttributes = {
      damageSource: hit.damageSource,
      element: hit.element,
      ...(hit.weaponType ? { weaponType: hit.weaponType } : {}),
      ...(hit.abilityId ? { abilityId: hit.abilityId } : {}),
      ...(status ? { status } : {}),
    };
    fireRules(
      {
        on: "hit",
        timeMs: hit.timeMs,
        ownerId: own ? WEAPON : (hit.abilityId ?? hit.damageSource),
        ...(own ? { part: own.part, precision: own.precision } : {}),
        attributes,
      },
      target,
      schedule,
      hit,
    );
  };

  /** Direct hits of the weapon's damage instances after a shot. */
  const hitEvents = (shot: PlannedShot): RunEvent[] => {
    const result: RunEvent[] = [];
    for (const instance of instances) {
      if (ruleParts.has(instance.id)) continue;
      if (instance.requiresSetup && !shot.withSetup) continue;
      if ((shot.index + 1) % instance.everyNthShot !== 0) continue;
      for (let tick = 0; tick < instance.ticks; tick++) {
        const timeMs =
          shot.timeMs + instance.delayMs + tick * instance.tickIntervalMs;
        if (!isInPhase(timeMs)) continue;
        if (instance.everyNthShot > 1) history.partHitsMs.push(timeMs);
        result.push({
          timeMs,
          group: EVENT_GROUP.weaponHit,
          handle: (_, emit) => {
            const factors = multiplierAt(timeMs, weapon.element);
            emit({
              id: instance.id,
              timeMs,
              damage: damageOf(
                instance.damage * (instance.tickFactors[tick] ?? 1),
                factors,
              ),
              damageSource,
              element: weapon.element,
              weaponType: weapon.weaponType,
              ...(instance.delivery ? { delivery: instance.delivery } : {}),
              factors,
            });
          },
        });
      }
    }
    return result;
  };

  /** Stacks a shot adds to the counters; at a threshold a damage instance follows. */
  const counterEvents = (shot: PlannedShot): RunEvent[] =>
    counterParts.flatMap(({ part, stacks, count, firstDelayMs, intervalMs }) =>
      Array.from({ length: count }, (_, i) => {
        const timeMs = shot.timeMs + firstDelayMs + i * intervalMs;
        return {
          timeMs,
          group: EVENT_GROUP.threshold,
          handle: (target, emit, later) => {
            const reached = thresholds.find(
              (t) => t.part.counterId === part.counterId,
            );
            const outcome = statusContainer.addStacks(target, part.counterId, {
              stacks,
              timeMs,
              threshold: reached?.threshold ?? Number.POSITIVE_INFINITY,
              cooldownMs: reached?.cooldownMs ?? 0,
              source: scorchSource(timeMs),
              schedule: later,
            });
            if (outcome !== "threshold" || !reached) return;
            const keywordId = (Object.keys(KEYWORD_COUNTERS) as KeywordId[]).find(
              (id) => KEYWORD_COUNTERS[id] === reached.part.counterId,
            );
            const factors = multiplierAt(
              timeMs,
              reached.part.element,
              keywordId,
            );
            emit({
              id: reached.part.damageInstanceId,
              timeMs,
              damage: damageOf(reached.damage, factors),
              damageSource: "weapon",
              element: reached.part.element,
              weaponType: weapon.weaponType,
              factors,
            });
          },
        } satisfies RunEvent;
      }).filter((event) => isInPhase(event.timeMs)),
    );

  /** Releases of the damage over time sources after a shot: an impact, then ticks. */
  const dotEvents = (shot: PlannedShot): RunEvent[] =>
    dotParts.flatMap((dot) => {
      const impactDamage = dot.impactDamage * dot.sourceScale;
      const tickDamage = dot.tickDamage * dot.sourceScale;
      const hit = (timeMs: number, damage: number): TimedDamageInstance => {
        const factors: Factors = multiplierAt(timeMs, weapon.element);
        return {
          id: dot.part.id,
          timeMs,
          damage: damageOf(damage, factors),
          damageSource: "weapon",
          element: weapon.element,
          weaponType: weapon.weaponType,
          factors,
        };
      };
      return Array.from({ length: dot.count }, (_, i) => ({
        releaseMs: shot.timeMs + dot.firstDelayMs + i * dot.intervalMs,
      }))
        .filter(({ releaseMs }) => isInPhase(releaseMs))
        .map(
          ({ releaseMs }): RunEvent => ({
            timeMs: releaseMs,
            group: EVENT_GROUP.damageOverTime,
            handle: (target, emit) => {
              const activeUntilMs = (
                target.activeSourcesUntilMs.get(dot.part.id) ?? []
              ).filter((untilMs) => untilMs >= releaseMs);
              target.activeSourcesUntilMs.set(dot.part.id, activeUntilMs);
              emit(hit(releaseMs, impactDamage));
              if (activeUntilMs.length >= dot.maxActive) return;
              activeUntilMs.push(
                releaseMs +
                  dot.firstTickDelayMs +
                  (dot.ticks - 1) * dot.tickIntervalMs,
              );
              for (let tick = 0; tick < dot.ticks; tick++) {
                const timeMs =
                  releaseMs + dot.firstTickDelayMs + tick * dot.tickIntervalMs;
                if (isInPhase(timeMs)) emit(hit(timeMs, tickDamage));
              }
            },
          }),
        );
    });

  const shots: Shot[] = history.shots;
  const reloadsMs: number[] = [];
  /** Asks the actor for the next shot and queues its event; the shot joins the history now. */
  const planNext = (schedule: (event: RunEvent) => void) => {
    const step = actor.next();
    if (step.reloadStartMs !== undefined) reloadsMs.push(step.reloadStartMs);
    const shot = step.shot;
    if (!shot) return;
    shots.push({ timeMs: shot.timeMs });
    history.holdFactors.push(shot.holdFactor);
    schedule({
      timeMs: shot.timeMs,
      group: SHOT_GROUP,
      handle: (target, __, later) => {
        // The rules see the shot first: the hits they set off come before the part hits below.
        fireRules(
          {
            on: "shot",
            timeMs: shot.timeMs,
            ownerId: WEAPON,
            attributes: {
              damageSource,
              element: weapon.element,
              weaponType: weapon.weaponType,
            },
          },
          target,
          later,
        );
        for (const event of [
          ...hitEvents(shot),
          ...counterEvents(shot),
          ...dotEvents(shot),
        ]) {
          later(event);
        }
        planNext(later);
      },
    });
  };

  const events: RunEvent[] = [];
  if (rules.length > 0) {
    events.push({
      timeMs: 0,
      group: PHASE_START_GROUP,
      handle: (target, _, schedule) =>
        fireRules({ on: "phaseStart", timeMs: 0 }, target, schedule),
    });
  }
  planNext((event) => events.push(event));
  for (const cast of options.abilities ?? []) {
    events.push(
      ...abilityHitEvents(cast, isInPhase, (timeMs, component) =>
        bucketFactors(
          [
            ...partsAt(timeMs, component.includedEffectIds).multiplierParts,
            ...(component.scalesWithAbilityStat ? context.statParts : []),
          ],
          buckets,
          {
            damageSource: cast.ability.kind,
            element: cast.ability.element,
            abilityId: cast.ability.id,
          },
        ),
      ),
    );
  }
  // Damage of its own at a fixed rate in each window of its effect, e.g. Storm's Keep.
  for (const effect of effects) {
    for (const part of effect.parts) {
      if (part.type !== "periodicDamage") continue;
      events.push(
        ...periodicEvents(
          part,
          context.windows.get(effect.id)!,
          isInPhase,
          (timeMs) =>
            bucketFactors(partsAt(timeMs).multiplierParts, buckets, {
              damageSource: "keyword",
              element: part.element,
            }),
        ),
      );
    }
  }
  const damageInstances = runEvents(events, onHit);

  const totalDamage = damageInstances.reduce((sum, d) => sum + d.damage, 0);
  const dps = damagePhaseSeconds > 0 ? totalDamage / damagePhaseSeconds : 0;
  return { shots, reloadsMs, damageInstances, superWindows, totalDamage, dps };
}
