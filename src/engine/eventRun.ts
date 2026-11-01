// Event run (ADR 0015, point 2): every damage source becomes events on one timeline. The events
// pass one target state in time order, so a hit of any source sees what earlier hits left on the
// target (counters, cooldowns, keywords, active damage over time sources).
//
// At equal times the group decides (lower first), then the order in which the events came in.
// An event deals hits at its own time or later, e.g. the ticks of a damage over time source; each
// hit is queued and handled at its own time. The optional onHit handler sees every hit in time
// order and may queue further events, e.g. the explosion of Volatile.

import type { TargetStatusId } from "../data/schema";
import type { TimedDamageInstance } from "./simulate";

/**
 * The state of one status on the target (status container, core/status.ts). A status uses the fields
 * of its kind: stacks with a threshold (scorch), a debuff that goes off by damage taken (jolt,
 * volatile, unravel) or stacks on the player (bolt charge).
 */
export type StatusState = {
  // Stacks: the number, the end of the cooldown after the threshold, and the burn of the stacks
  // (time of the last application, the hit that applied it, the ticks running, and a number that
  // ends them at a reset)
  stacks: number;
  blockedUntilMs: number;
  appliedMs?: number;
  burnSource?: TimedDamageInstance;
  burning?: boolean;
  burnGeneration?: number;
  // Debuff: the end of the application (-Infinity if not applied), damage since the last trigger
  activeUntilMs: number;
  damageTakenSinceTrigger: number;
  cooldownUntilMs: number;
  // Stacks on the player, e.g. bolt charge; kept here so every hit sees one state
  playerStacks: number;
};

export type TargetState = {
  statuses: Map<TargetStatusId, StatusState>;
};

/** The state of a status on the target; a status nobody applied yet is empty. */
export function statusState(
  target: TargetState,
  id: TargetStatusId,
): StatusState {
  let state = target.statuses.get(id);
  if (!state) {
    state = {
      stacks: 0,
      blockedUntilMs: -Infinity,
      activeUntilMs: -Infinity,
      damageTakenSinceTrigger: 0,
      cooldownUntilMs: -Infinity,
      playerStacks: 0,
    };
    target.statuses.set(id, state);
  }
  return state;
}

export type Emit = (instance: TimedDamageInstance) => void;

export type RunEvent = {
  timeMs: number;
  group: number;
  // schedule queues a further event, e.g. the next shot of the core (core/simulateCore.ts)
  handle: (
    target: TargetState,
    emit: Emit,
    schedule: (event: RunEvent) => void,
  ) => void;
};

export type OnHit = (
  hit: TimedDamageInstance,
  target: TargetState,
  schedule: (event: RunEvent) => void,
) => void;

type Queued = { event: RunEvent; seq: number };

const before = (a: Queued, b: Queued) =>
  a.event.timeMs - b.event.timeMs ||
  a.event.group - b.event.group ||
  a.seq - b.seq;

/** Handles the events in time order on one target and returns their hits in that order. */
export function runEvents(
  events: RunEvent[],
  onHit?: OnHit,
): TimedDamageInstance[] {
  const target: TargetState = { statuses: new Map() };
  const hits: TimedDamageInstance[] = [];
  let seq = 0;
  const queue: Queued[] = events
    .map((event) => ({ event, seq: seq++ }))
    .sort(before);
  let head = 0; // events before head are handled
  // Keeps the queue sorted; new events come after all queued events of the same time and group.
  const enqueue = (event: RunEvent) => {
    const item = { event, seq: seq++ };
    let low = head;
    let high = queue.length;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (before(queue[mid], item) < 0) low = mid + 1;
      else high = mid;
    }
    queue.splice(low, 0, item);
  };

  while (head < queue.length) {
    const { event } = queue[head++];
    event.handle(
      target,
      (instance) =>
        enqueue({
          timeMs: instance.timeMs,
          group: event.group,
          handle: () => {
            hits.push(instance);
            onHit?.(instance, target, enqueue);
          },
        }),
      enqueue,
    );
  }
  return hits;
}
