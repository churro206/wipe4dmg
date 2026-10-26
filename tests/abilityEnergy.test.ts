import { describe, expect, it } from "vitest";
import rawEnergy from "../src/data/ability-energy.json";
import { EnergyData, type Ability } from "../src/data/schema";
import { curveAt, energyCasts, nextCastMs, type EnergyContext } from "../src/engine/abilityEnergy";
import { abilities } from "../src/ui/data";

const data = EnergyData.parse(rawEnergy);
const ability = (id: string): Ability => abilities.find((a) => a.id === id)!;
const cooldownMs = (id: string) =>
  data.abilities.find((a) => a.abilityId === id)!.cooldownSeconds.value! * 1000;
const regenAt100 = (kind: "grenade" | "melee" | "super") =>
  curveAt(data.stats.find((s) => s.kind === kind)!.regenUnits.points, 100);
// Test input, not a game value.
const PHASE_MS = 60_000;
const context = (patch: Partial<EnergyContext> = {}): EnergyContext => ({
  data,
  effectIds: new Set(),
  damagePhaseMs: PHASE_MS,
  ...patch,
});
const casts = (requests: { ability: Ability; castsMs: number[] }[], ctx = context()) =>
  energyCasts(requests, ctx).map((r) => r.castsMs.map(Math.round));

describe("energyCasts", () => {
  const fusion = ability("fusion-grenade");
  const fusionAt100 = Math.round(cooldownMs("fusion-grenade") / regenAt100("grenade"));

  it("starts charged and moves a cast to the time the energy is back (stat 100 by default)", () => {
    expect(casts([{ ability: fusion, castsMs: [0, 15_000] }])).toEqual([[0, fusionAt100]]);
  });

  it("keeps casts that the energy allows", () => {
    expect(casts([{ ability: fusion, castsMs: [2_000, 50_000] }])).toEqual([[2_000, 50_000]]);
  });

  it("regenerates slower at a lower stat and drops casts after the damage phase", () => {
    const ctx = context({ stats: { super: 100, grenade: 0, melee: 100 } });
    expect(cooldownMs("fusion-grenade")).toBeGreaterThan(PHASE_MS);
    expect(casts([{ ability: fusion, castsMs: [0, 15_000] }], ctx)).toEqual([[0]]);
  });

  it("allows one super per phase without refunds", () => {
    expect(casts([{ ability: ability("thundercrash"), castsMs: [0, 30_000] }])).toEqual([[0]]);
  });

  it("gives Starfire Protocol an extra charge and faster regeneration while Radiant", () => {
    const requests = [{ ability: fusion, castsMs: [0, 0, 0] }];
    const starfire = context({ exoticArmorId: "starfire-protocol" });
    const [without] = casts(requests, starfire);
    expect(without.slice(0, 2)).toEqual([0, 0]);
    const [radiant] = casts(requests, { ...starfire, effectIds: new Set(["radiant"]) });
    expect(radiant.slice(0, 2)).toEqual([0, 0]);
    expect(radiant[2]).toBeLessThan(without[2]);
    expect(without[2]).toBeLessThan(fusionAt100);
  });

  it("refills grenade energy on the super cast with Apotheosis Veil", () => {
    const requests = [
      { ability: ability("well-of-radiance"), castsMs: [5_000] },
      { ability: ability("solar-grenade"), castsMs: [0, 5_000] },
    ];
    expect(cooldownMs("solar-grenade") / regenAt100("grenade")).toBeGreaterThan(PHASE_MS);
    expect(casts(requests)[1]).toEqual([0]);
    expect(casts(requests, context({ exoticArmorId: "apotheosis-veil" }))[1]).toEqual([0, 5_000]);
  });

  it("speeds up the melee for a few seconds after a grenade with Heart of Inmost Light", () => {
    const requests = [
      { ability: ability("pulse-grenade"), castsMs: [0] },
      { ability: ability("thunderclap"), castsMs: [0, 0] },
    ];
    const [, without] = casts(requests);
    const [, heart] = casts(requests, context({ exoticArmorId: "heart-of-inmost-light" }));
    expect(heart[1]).toBeLessThan(without[1]);
  });

  it("regenerates grenades faster on a Warlock (class factor, K5), not on a Titan", () => {
    const warlock = data.modifiers.find(
      (m) => "guardianClass" in m.from && m.from.guardianClass === "warlock",
    )!;
    const requests = [{ ability: fusion, castsMs: [0, 0] }];
    const [[, titan]] = casts(requests, context({ guardianClass: "titan" }));
    const [[, onWarlock]] = casts(requests, context({ guardianClass: "warlock" }));
    expect(titan).toBe(fusionAt100);
    expect(onWarlock).toBeCloseTo(fusionAt100 / warlock.value.value!, -1);
  });

  it("starts with the innate charges and regenerates faster with fewer held (Frenzied Blade)", () => {
    const blade = ability("frenzied-blade");
    const speeds = data.abilities.find((a) => a.abilityId === "frenzied-blade")!.regenByCharges!;
    const fourthMs = cooldownMs("frenzied-blade") / (regenAt100("melee") * speeds[0].value!);
    const [[a, b, c, d]] = casts([{ ability: blade, castsMs: [0, 0, 0, 0] }]);
    expect([a, b, c]).toEqual([0, 0, 0]);
    expect(d).toBeCloseTo(fourthMs, -2);
  });

  it("slows the regeneration on Prismatic (Frenzied Blade, additional 0.7x)", () => {
    const blade = ability("frenzied-blade");
    const penalty = data.abilities.find((a) => a.abilityId === "frenzied-blade")!.prismaticRegen!;
    const requests = [{ ability: blade, castsMs: [0, 0, 0, 0] }];
    const [[, , , strand]] = casts(requests, context({ subclass: "strand", damagePhaseMs: 200_000 }));
    const [[, , , prismatic]] = casts(requests, context({ subclass: "prismatic", damagePhaseMs: 200_000 }));
    expect(prismatic / strand).toBeCloseTo(1 / penalty.value!, 1);
  });

  it("refunds super energy only with a matching ability (Ballistic Slam)", () => {
    const requests = [
      { ability: ability("thundercrash"), castsMs: [0] },
      { ability: ability("ballistic-slam"), castsMs: [0] },
    ];
    expect(casts(requests)).toEqual([[0], [0]]);
  });
});

describe("nextCastMs", () => {
  it("is the earliest time of one more cast, undefined if the phase is over", () => {
    const fusion = ability("fusion-grenade");
    const ctx = context();
    const next = nextCastMs([{ ability: fusion, castsMs: [0] }], fusion, ctx)!;
    expect(Math.round(next)).toBe(
      Math.round(cooldownMs("fusion-grenade") / regenAt100("grenade")),
    );
    expect(nextCastMs([{ ability: fusion, castsMs: [0, next] }], fusion, ctx)).toBeUndefined();
  });
});
