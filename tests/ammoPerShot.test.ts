// A shot that consumes several rounds (Izanagi's Burden, Honed Edge) and a reload of its own length
// (the held reload): both are stat modifiers, so any weapon or effect can use them.

import { describe, expect, it } from "vitest";
import type { Effect, SourcedNumber, Weapon } from "../src/data/schema";
import { simulate } from "../src/engine/simulate";
import { buckets } from "../src/ui/data";
import { testWeapon } from "./support/testWeapon";

const sourced = (value: number): SourcedNumber => ({
  value,
  source: { name: "test", url: "", retrieved: "2026-11-06", status: "derived" },
});

const effect = (modifiers: Effect["modifiers"]): Effect => ({
  id: "honer",
  name: "Honer",
  code: 9997,
  shortName: "Hon",
  providers: [{ kind: "armor", slot: "exotic" }],
  modifiers,
});

const ammoPerShot = (n: number) =>
  effect([{ type: "stat", stat: "ammoPerShot", value: sourced(n) }]);
const heldReload = effect([
  { type: "stat", stat: "ammoPerShot", value: sourced(4) },
  { type: "stat", stat: "reloadMs", value: sourced(3200) },
]);

// 4 rounds in the magazine, 20 in all, one shot a second, reload 2 s
const sniper = (totalShots: number): Weapon => ({
  ...testWeapon,
  magazine: sourced(4),
  totalShots: sourced(totalShots),
  reloadTimeMs: sourced(2000),
});

const run = (weapon: Weapon, effects: Effect[]) => simulate(weapon, 60, effects, buckets);

describe("ammoPerShot and reloadMs", () => {
  it("without them the magazine holds 4 shots", () => {
    const { shots } = run(sniper(20), []);
    expect(shots.length).toBe(20);
    expect(shots[4].timeMs - shots[3].timeMs).toBe(3000); // 1 s interval + 2 s reload
  });

  it("a shot that consumes 4 rounds empties the magazine: 20 rounds give 5 shots, each after a reload", () => {
    const { shots } = run(sniper(20), [ammoPerShot(4)]);
    expect(shots.length).toBe(5);
    expect(shots[1].timeMs - shots[0].timeMs).toBe(3000);
  });

  it("the reload of its own length replaces the weapon's (also a longer one)", () => {
    const { shots } = run(sniper(20), [heldReload]);
    expect(shots.length).toBe(5);
    expect(shots[1].timeMs - shots[0].timeMs).toBe(4200); // 1 s interval + 3.2 s
  });

  it("the last shot takes only the rounds left (6 rounds: shots of 4 and 2)", () => {
    const { shots } = run(sniper(6), [ammoPerShot(4)]);
    expect(shots.length).toBe(2);
  });

  it("a shot takes no more than the magazine holds (3 per shot from 4: 3, then 1)", () => {
    const { shots } = run(sniper(20), [ammoPerShot(3)]);
    // rounds 3+1 | 3+1 | ...: 2 shots per magazine
    expect(shots[2].timeMs - shots[1].timeMs).toBe(3000);
    expect(shots[1].timeMs - shots[0].timeMs).toBe(1000);
  });
});
