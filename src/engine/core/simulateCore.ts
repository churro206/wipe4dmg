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
import { KEYWORD_COUNTERS, productOf, type Factors } from "../effectParts";
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
  castEvents,
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
  weapon: Weapon,
  damagePhaseSeconds: number,
  effects: Effect[] = [],
  buckets: Bucket[] = [],
  options: SimulationOptions = {},
): SimulationResult {
  const history: ShotHistory = { shots: [], holdFactors: [] };
  const superWindows = superWindowsOf(options.abilities ?? []);
  const context = createContext(
    weapon,
    effects,
    buckets,
    options,
    superWindows,
    history,
    // The rules come after the context and need it; they are asked only once the loop runs
    (timeMs) => ruleEngine.allBuffPartsAt(timeMs),
  );
  const { catalyst, damageSource, multiplierAt, counterFactorAt, partsAt } =
    context;
  const actor = createWeaponActor({
    weapon,
    catalyst,
    totalShotsLimit: options.shotLimit,
    damagePhaseSeconds,
    abilities: options.abilities ?? [],
    superWindows,
    // The rules come after the actor and need it (refill); they are asked only once a shot is planned.
    // Stat modifiers of the active effects come first, so a rule's rate is the latest.
    statModifiersAt: (timeMs) => [
      ...partsAt(timeMs).statModifiers,
      ...ruleEngine.statModifiersAt(weapon.id, timeMs),
    ],
  });
  const { isInPhase } = actor;

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
    modifierStatuses: options.statusModifiers ?? [],
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
  // action names is set off by the rules only: a part without a `spawn` rule does no damage.
  const WEAPON = weapon.id;
  const rules = weapon.rules ?? [];
  // The abilities of the build own rules too (their keywords, a refill); their casts and the hits of
  // their components reach them. The id differs from an effect's of the same name.
  const abilityOwnerId = (abilityId: string) => `ability:${abilityId}`;
  const abilityOwners = [
    ...new Map(
      (options.abilities ?? []).map(({ ability }) => [ability.id, ability]),
    ).values(),
  ]
    .filter((ability) => (ability.rules?.length ?? 0) > 0)
    .map((ability) => ({ id: abilityOwnerId(ability.id), rules: ability.rules! }));
  // The effects own rules and buffs too; they act only inside the windows of the effect
  const owners = [
    { id: WEAPON, rules, buffs: weapon.buffs ?? [] },
    ...abilityOwners,
    ...effects
      .filter((effect) => (effect.rules?.length ?? 0) + (effect.buffs?.length ?? 0) > 0)
      .map((effect) => ({
        id: effect.id,
        rules: effect.rules ?? [],
        buffs: effect.buffs ?? [],
        activeAt: (timeMs: number) =>
          context.windows
            .get(effect.id)!
            .some((w) => w.startMs <= timeMs && timeMs < w.endMs),
      })),
  ];
  const hasRules = owners.some((owner) => owner.rules.length > 0);
  const partsById = new Map(weapon.damageInstances.map((i) => [i.id, i]));
  /** The hits the rules set off: their part and whether it counts as a precision hit. */
  const ruleHits = new WeakMap<
    TimedDamageInstance,
    { part: string; precision: boolean }
  >();
  /** The component of an ability that a hit is, for the rules of the ability. */
  const abilityParts = new WeakMap<TimedDamageInstance, string>();
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
    owners,
    {
      statusStacks: (status, timeMs) =>
        statusContainer.stacksOnTarget(current().target, status, timeMs),
      actorState: notYet("The condition on the state of the weapon"),
      hasItem: (id) =>
        id === "catalyst" ? catalyst : effects.some((effect) => effect.id === id),
      // Without a playstyle the plain shot is played: the first entry of the weapon's list; the
      // assumptions of the build or scenario read the same way
      playstyle: (id) =>
        (options.playstyle ?? weapon.playstyles?.[0]?.id) === id ||
        (options.assumptions ?? []).includes(id),
    },
    {
      spawn: ({ part, timeMs, delayMs, count, intervalMs, factor }) => {
        const instance = partsById.get(part);
        if (!instance) throw new Error(`A rule spawns the unknown part "${part}"`);
        const damage = requireValue(instance.damagePerTick, "damagePerTick");
        const { schedule } = current();
        // What the rule omits is 0 ms delay, one hit, no interval (section 6); never the part's own
        const first = timeMs + (delayMs ?? 0);
        const every = intervalMs ?? 0;
        const hits = count ?? 1;
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
      // Damage of its own, e.g. a Storm's Keep discharge: generic damage like Bolt Charge, so only
      // multipliers for keyword damage apply (Aegis applies only the debuff to these rows)
      damage: ({ id, damage, element, damageSource, delivery, timeMs }) => {
        if (!isInPhase(timeMs)) return;
        current().schedule({
          timeMs,
          group: EVENT_GROUP.periodic,
          handle: (_, emit) => {
            const factors = bucketFactors(partsAt(timeMs).multiplierParts, buckets, {
              damageSource,
              element,
            });
            emit({
              id,
              timeMs,
              damage: damage * productOf(factors),
              damageSource,
              element,
              ...(delivery ? { delivery } : {}),
              factors,
            });
          },
        });
      },
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
    if (!hasRules) return;
    const previous = firing;
    firing = {
      timeMs: event.timeMs,
      target,
      schedule,
      ...(hit ? { hit } : {}),
    };
    try {
      ruleEngine.fire(event);
    } finally {
      firing = previous;
    }
  }
  /** A hit seen by the statuses first, then by the rules. */
  const onHit: OnHit = (hit, target, schedule) => {
    statusContainer.onHit(hit, target, schedule);
    if (!hasRules) return;
    const own = ruleHits.get(hit);
    const abilityPart = abilityParts.get(hit);
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
        ownerId: own
          ? WEAPON
          : abilityPart
            ? abilityOwnerId(hit.abilityId as string)
            : (hit.abilityId ?? hit.damageSource),
        ...(own
          ? { part: own.part, precision: own.precision }
          : abilityPart
            ? { part: abilityPart }
            : {}),
        attributes,
      },
      target,
      schedule,
      hit,
    );
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
        // The rules see the shot first: the hits they set off come before the counter and dot events.
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
  if (hasRules) {
    events.push({
      timeMs: 0,
      group: PHASE_START_GROUP,
      handle: (target, _, schedule) =>
        fireRules({ on: "phaseStart", timeMs: 0 }, target, schedule),
    });
  }
  planNext((event) => events.push(event));
  for (const cast of options.abilities ?? []) {
    if (hasRules) {
      events.push(
        ...castEvents(cast, abilityOwnerId(cast.ability.id), isInPhase, fireRules),
      );
    }
    events.push(
      ...abilityHitEvents(
        cast,
        isInPhase,
        (timeMs, component) =>
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
        (hit, part) => abilityParts.set(hit, part),
      ),
    );
  }
  // The rules with `timer everyMs` tick in each window of their effect, first one interval after its
  // start, e.g. Storm's Keep.
  for (const { ownerId, ruleId, everyMs } of ruleEngine.periodicRules()) {
    for (const window of context.windows.get(ownerId) ?? []) {
      events.push(...periodicEvents(ownerId, ruleId, everyMs, window, isInPhase, fireRules));
    }
  }
  const damageInstances = runEvents(events, onHit);

  const totalDamage = damageInstances.reduce((sum, d) => sum + d.damage, 0);
  const dps = damagePhaseSeconds > 0 ? totalDamage / damagePhaseSeconds : 0;
  return { shots, reloadsMs, damageInstances, superWindows, totalDamage, dps };
}
