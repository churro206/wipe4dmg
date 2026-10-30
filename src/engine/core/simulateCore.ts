// The core of the ground-up model (ADR 0017, stage S1). Same input and output as simulate(), but the
// shots are not planned in advance: the weapon actor makes the next shot when the loop handles the
// previous one, and a shot sets off its hits, counter stacks and damage over time sources as events.
// Casts, effect windows and periodic damage are still planned in advance (stage S5).

import type {
  Bucket,
  CounterId,
  Effect,
  KeywordId,
  Weapon,
} from "../../data/schema";
import { KEYWORD_COUNTERS, type Factors } from "../effectParts";
import { runEvents, type RunEvent } from "../eventRun";
import { keywordOnHit } from "../keywordRun";
import { requireValue } from "../requireValue";
import {
  abilityHitEvents,
  EVENT_GROUP,
  periodicEvents,
  superWindowsOf,
  type Shot,
  type SimulationOptions,
  type SimulationResult,
  type TimedDamageInstance,
} from "../simulate";
import { bucketFactors } from "../effectParts";
import { withPlaystyle } from "../playstyle";
import { createBurn } from "./burn";
import { createContext, type ShotHistory } from "./context";
import { damageOf } from "./formula";
import { createWeaponActor, type PlannedShot } from "./weaponActor";

// A shot comes before every other event of its time: the hits it sets off see the shot history.
const SHOT_GROUP = -1;
// Guards rounding up against floating point noise, e.g. 10 x 1.5 = 15.000000000000002.
const ROUNDING_TOLERANCE = 1e-9;

export function simulateCore(
  plainWeapon: Weapon,
  damagePhaseSeconds: number,
  effects: Effect[] = [],
  buckets: Bucket[] = [],
  options: SimulationOptions = {},
): SimulationResult {
  const weapon = withPlaystyle(plainWeapon, options.playstyle);
  const history: ShotHistory = { shots: [], holdFactors: [] };
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

  // Burn of the counter's stacks, from the keyword that is set off by it (ADR 0017, stage S2).
  const burns = new Map(
    (options.keywords ?? []).flatMap((keyword) => {
      const burn = createBurn(
        keyword,
        context.keywordMultiplierAt,
        isInPhase,
      );
      return keyword.trigger.type === "counter" && burn
        ? [[keyword.trigger.counterId, burn] as const]
        : [];
    }),
  );
  const burnOf = (counterId: CounterId) => burns.get(counterId);
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

  /** Direct hits of the weapon's damage instances after a shot. */
  const hitEvents = (shot: PlannedShot): RunEvent[] => {
    const result: RunEvent[] = [];
    for (const instance of instances) {
      if (instance.requiresSetup && !shot.withSetup) continue;
      if ((shot.index + 1) % instance.everyNthShot !== 0) continue;
      for (let tick = 0; tick < instance.ticks; tick++) {
        const timeMs =
          shot.timeMs + instance.delayMs + tick * instance.tickIntervalMs;
        if (!isInPhase(timeMs)) continue;
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
            const added = Math.ceil(
              stacks * counterFactorAt(part.counterId, timeMs) -
                ROUNDING_TOLERANCE,
            );
            const counter = target.counters.get(part.counterId as CounterId) ?? {
              stacks: 0,
              blockedUntilMs: -Infinity,
            };
            target.counters.set(part.counterId as CounterId, counter);
            if (timeMs < counter.blockedUntilMs) return;
            const burning = burnOf(part.counterId);
            burning?.decay(counter, timeMs);
            counter.stacks += added;
            const reached = thresholds.find(
              (t) =>
                t.part.counterId === part.counterId &&
                counter.stacks >= t.threshold,
            );
            if (!reached) {
              burning?.applied(counter, timeMs, scorchSource(timeMs), later);
              return;
            }
            burning?.reset(counter);
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
            counter.stacks = 0;
            counter.blockedUntilMs = timeMs + reached.cooldownMs;
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
      handle: (_, __, later) => {
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
  const damageInstances = runEvents(
    events,
    keywordOnHit({
      keywords: options.keywords ?? [],
      keywordPartsAt: (timeMs) => [
        ...context.weaponKeywordParts,
        ...partsAt(timeMs).keywordParts,
      ],
      multiplierAt: context.keywordMultiplierAt,
      stackFactorAt: counterFactorAt,
      isInPhase,
      burn: (keyword) =>
        keyword.trigger.type === "counter"
          ? burnOf(keyword.trigger.counterId)
          : undefined,
    }),
  );

  const totalDamage = damageInstances.reduce((sum, d) => sum + d.damage, 0);
  const dps = damagePhaseSeconds > 0 ? totalDamage / damagePhaseSeconds : 0;
  return { shots, reloadsMs, damageInstances, superWindows, totalDamage, dps };
}
