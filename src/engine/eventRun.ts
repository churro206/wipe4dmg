// Event run (ADR 0015, point 2): every damage source becomes events on one timeline. The events
// pass one target state in time order, so a hit of any source sees what earlier hits left on the
// target (counters, cooldowns, active damage over time sources).
//
// At equal times the group decides (lower first), then the order in which the events came in.
// The hits come back sorted the same way, by their own time; an event may deal hits later than
// its own time, e.g. the ticks of a damage over time source.

import type { CounterId } from "../data/schema";
import type { TimedDamageInstance } from "./simulate";

export type TargetState = {
  counters: Map<CounterId, { stacks: number; blockedUntilMs: number }>;
  // End time of the last tick of each active damage over time source, per part id.
  activeSourcesUntilMs: Map<string, number[]>;
};

export type RunEvent = {
  timeMs: number;
  group: number;
  handle: (
    target: TargetState,
    emit: (instance: TimedDamageInstance) => void,
  ) => void;
};

/** Handles the events in time order on one target and returns their hits sorted by time. */
export function runEvents(events: RunEvent[]): TimedDamageInstance[] {
  const target: TargetState = {
    counters: new Map(),
    activeSourcesUntilMs: new Map(),
  };
  const hits: { instance: TimedDamageInstance; group: number; seq: number }[] =
    [];
  const ordered = events
    .map((event, seq) => ({ event, seq }))
    .sort(
      (a, b) =>
        a.event.timeMs - b.event.timeMs ||
        a.event.group - b.event.group ||
        a.seq - b.seq,
    );
  for (const { event } of ordered) {
    event.handle(target, (instance) =>
      hits.push({ instance, group: event.group, seq: hits.length }),
    );
  }
  return hits
    .sort(
      (a, b) =>
        a.instance.timeMs - b.instance.timeMs ||
        a.group - b.group ||
        a.seq - b.seq,
    )
    .map((hit) => hit.instance);
}
