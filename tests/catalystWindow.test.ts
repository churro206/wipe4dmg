// Catalyst window as a buff (docs/architecture.md section 6, ADR 0018 B3a step 4): the first shot
// grants a buff of the window's length; the option's factor applies only while it lasts, and only
// with the catalyst. A buff is active while t < end (section 6), so a hit exactly at the end of the
// window is outside.

import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import { Weapon, type WeaponOption } from "../src/data/schema";
import { loadBuckets } from "../src/engine/loadData";
import { simulate } from "../src/engine/simulate";
import { catalystWindowRules } from "../scripts/lib/partRules";
import { testWeapon } from "./support/testWeapon";

const source = {
  name: "Test fixture, not a game value",
  retrieved: "2026-11-01",
  status: "unverified" as const,
};
const n = (value: number) => ({ value, source });

const buckets = loadBuckets(rawBuckets);
const bucketId = buckets.find((bucket) => bucket.id === "weaponPerk")!.id;

const option: WeaponOption = {
  id: "tithe",
  name: "Tithe",
  kind: "catalyst",
  factor: n(2),
  bucketId,
  durationSeconds: 15,
  condition: null,
};
// 150 rpm: a shot every 400 ms from 0 s, primary ammo, no reload
const build = (window: ReturnType<typeof catalystWindowRules> | null): Weapon =>
  Weapon.parse({
    ...testWeapon,
    ammo: "primary",
    fireRateRpm: n(150),
    magazine: n(1000),
    totalShots: n(1000),
    reloadTimeMs: n(0),
    options: [option],
    ...(window ? { buffs: [window.buff] } : {}),
    rules: [...testWeapon.rules!, ...(window?.rules ?? [])],
  });
const windowed = build(catalystWindowRules(option, n(800)));

const damages = (weapon: Weapon, catalyst: boolean) =>
  simulate(weapon, 2, [], buckets, { catalyst }).damageInstances.map(
    (hit) => hit.damage,
  );

describe("catalyst window", () => {
  it("gives the factor from the first shot on until the window ends, not at its end", () => {
    const [first, second, third, fourth] = damages(windowed, true);
    expect(second / first).toBeCloseTo(1, 6);
    expect(third / first).toBeCloseTo(0.5, 6); // t = 800 ms: the window is over
    expect(fourth / first).toBeCloseTo(0.5, 6);
  });

  it("does nothing without the catalyst", () => {
    const [first, ...rest] = damages(windowed, false);
    for (const damage of rest) expect(damage / first).toBeCloseTo(1, 6);
    expect(first).toBeCloseTo(damages(windowed, true)[2], 6);
  });

  it("is the buff alone: the option does not count again for the whole phase", () => {
    const plain = damages(build(null), true);
    const late = damages(windowed, true).at(-1)!;
    expect(late).toBeCloseTo(plain[0] / 2, 6);
  });

  it("starts at the first shot, not at the start of the phase", () => {
    const late = Weapon.parse({
      ...windowed,
      chargeTimeMs: n(1000),
    });
    const [first, second, third] = damages(late, true);
    expect(second / first).toBeCloseTo(1, 6);
    expect(third / first).toBeCloseTo(0.5, 6);
  });
});
