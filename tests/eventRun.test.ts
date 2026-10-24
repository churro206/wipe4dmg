// Event run (ADR 0015, point 2): all damage sources pass one target state in time order.

import { describe, expect, it } from "vitest";
import { runEvents, type RunEvent } from "../src/engine/eventRun";
import type { TimedDamageInstance } from "../src/engine/simulate";

const hit = (id: string, timeMs: number): TimedDamageInstance => ({
  id,
  timeMs,
  damage: 1,
  damageSource: "weapon",
  element: "solar",
  factors: {},
});

/** An event that deals one hit at its own time. */
const hitEvent = (id: string, timeMs: number, group = 0): RunEvent => ({
  timeMs,
  group,
  handle: (_, emit) => emit(hit(id, timeMs)),
});

describe("runEvents", () => {
  it("handles events in time order, whatever order they come in", () => {
    const seen: string[] = [];
    const event = (id: string, timeMs: number): RunEvent => ({
      timeMs,
      group: 0,
      handle: () => void seen.push(id),
    });
    runEvents([event("late", 20), event("early", 10)]);
    expect(seen).toEqual(["early", "late"]);
  });

  it("orders equal times by group, then by the order of the events", () => {
    const ids = runEvents([
      hitEvent("ability", 10, 3),
      hitEvent("shot-a", 10, 0),
      hitEvent("shot-b", 10, 0),
      hitEvent("ignition", 10, 1),
    ]).map((d) => d.id);
    expect(ids).toEqual(["shot-a", "shot-b", "ignition", "ability"]);
  });

  it("returns hits sorted by time, also hits an event schedules for later", () => {
    const ticks: RunEvent = {
      timeMs: 0,
      group: 2,
      handle: (_, emit) => {
        emit(hit("tick-2", 200));
        emit(hit("tick-1", 100));
      },
    };
    const ids = runEvents([ticks, hitEvent("shot", 150)]).map((d) => d.id);
    expect(ids).toEqual(["tick-1", "shot", "tick-2"]);
  });

  it("shares one target state between all events", () => {
    const addStack: RunEvent = {
      timeMs: 0,
      group: 0,
      handle: (target) => {
        target.counters.set("scorch", { stacks: 5, blockedUntilMs: 0 });
      },
    };
    let seenStacks = 0;
    const read: RunEvent = {
      timeMs: 10,
      group: 3,
      handle: (target) => {
        seenStacks = target.counters.get("scorch")?.stacks ?? 0;
      },
    };
    runEvents([read, addStack]);
    expect(seenStacks).toBe(5);
  });
});
