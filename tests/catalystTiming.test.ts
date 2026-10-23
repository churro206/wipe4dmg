import { describe, expect, it } from "vitest";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import type { Weapon } from "../src/data/schema";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";
import { hasCatalyst } from "../src/engine/weaponInfo";

// A catalyst that changes magazine, ammo or reload replaces the weapon's timing while it is on,
// e.g. Telesto 4 → 7 rounds per magazine. Test inputs, not game data.
const base = { ...loadWeapon(raw), intrinsicParts: [] };
const source = base.magazine.source;
const weapon: Weapon = {
  ...base,
  damageInstances: base.damageInstances.filter((i) => !i.requiresCatalyst),
  catalyst: {
    name: "Deeper Pockets",
    description: "Increases Magazine Size by 3 (4🠚7)",
    effect: "timing",
    timing: {
      fireRateRpm: base.fireRateRpm,
      magazine: { value: 7, source },
      totalShots: { value: 14, source },
      reloadTimeMs: base.reloadTimeMs,
    },
  },
};

describe("catalyst timing", () => {
  it("uses the catalyst's magazine and ammo only with the catalyst on", () => {
    const off = simulate(weapon, 300).shots.length;
    const on = simulate(weapon, 300, [], [], { catalyst: true }).shots.length;
    expect(off).toBe(base.totalShots.value);
    expect(on).toBe(14);
  });

  it("reloads after 7 instead of 4 shots with the catalyst", () => {
    const shots = simulate(weapon, 300, [], [], { catalyst: true }).shots;
    const gaps = shots.slice(1).map((s, i) => s.timeMs - shots[i].timeMs);
    const longest = Math.max(...gaps);
    expect(gaps.indexOf(longest)).toBe(6);
  });

  it("offers the catalyst switch for every weapon with a catalyst, also without effect", () => {
    expect(
      hasCatalyst({
        ...weapon,
        catalyst: { ...weapon.catalyst!, effect: "none", timing: undefined },
      }),
    ).toBe(true);
  });
});
