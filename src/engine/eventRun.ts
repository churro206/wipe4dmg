// Event run (ADR 0015, point 2): every damage source becomes events on one timeline. The events
// pass one target state in time order, so a hit of any source sees what earlier hits left on the
// target (counters, cooldowns, keywords, active damage over time sources).
//
// At equal times the group decides (lower first), then the order in which the events came in.
// An event deals hits at its own time or later, e.g. the ticks of a damage over time source; each
// hit is queued and handled at its own time. The optional onHit handler sees every hit in time
// order and may queue further events, e.g. the explosion of Volatile.

import type { CounterId, KeywordId } from "../data/schema";
import type { TimedDamageInstance } from "./simulate";

export type KeywordState = {
  activeUntilMs: number; // -Infinity if not applied
  damageTakenSinceTrigger: number;
  cooldownUntilMs: number;
};

export type TargetState = {
  counters: Map<CounterId, { stacks: number; blockedUntilMs: number }>;
  // End time of the last tick of each active damage over time source, per part id.
  activeSourcesUntilMs: Map<string, number[]>;
  keywords: Map<KeywordId, KeywordState>;
  // Stacks on the player, e.g. bolt charge; kept here so every hit sees one state.
  playerStacks: Map<KeywordId, number>;
};

export type Emit = (instance: TimedDamageInstance) => void;

export type RunEvent = {
  timeMs: number;
  group: number;
  handle: (target: TargetState, emit: Emit) => void;
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
  const target: TargetState = {
    counters: new Map(),
    activeSourcesUntilMs: new Map(),
    keywords: new Map(),
    playerStacks: new Map(),
  };
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
    event.handle(target, (instance) =>
      enqueue({
        timeMs: instance.timeMs,
        group: event.group,
        handle: () => {
          hits.push(instance);
          onHit?.(instance, target, enqueue);
        },
      }),
    );
  }
  return hits;
}
