import { describe, expect, it } from "vitest";
import rawEffects from "../src/data/effects.json";
import raw from "../src/data/weapons/one-thousand-voices.json";
import { loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { canProvide, effectsFor } from "../src/engine/providers";

const effects = loadEffects(rawEffects);
const byId = (id: string) => effects.find((e) => e.id === id)!;

describe("effect data for providers and links", () => {
  it("gives every effect a unique positive code", () => {
    const codes = effects.map((e) => e.code);
    expect(new Set(codes).size).toBe(codes.length);
    codes.forEach((code) => expect(code).toBeGreaterThan(0));
  });

  it("gives the weapon a positive code", () => {
    expect(loadWeapon(raw).code).toBeGreaterThan(0);
  });
});

describe("canProvide", () => {
  it("lets only a Warlock provide Well of Radiance through the own subclass", () => {
    const well = byId("well-of-radiance");
    expect(canProvide(well, "subclass", "warlock")).toBe(true);
    expect(canProvide(well, "subclass", "hunter")).toBe(false);
  });

  it("lets a teammate provide Well of Radiance for every class", () => {
    const well = byId("well-of-radiance");
    for (const guardianClass of ["titan", "hunter", "warlock"] as const) {
      expect(canProvide(well, "fireteamSupport", guardianClass)).toBe(true);
    }
  });

  it("lets every class provide an effect without class restriction", () => {
    const surge = byId("surge-3x");
    for (const guardianClass of ["titan", "hunter", "warlock"] as const) {
      expect(canProvide(surge, "armor", guardianClass)).toBe(true);
    }
    expect(canProvide(surge, "fireteamSupport", "hunter")).toBe(false);
  });
});

describe("effectsFor", () => {
  it("lists the effects a provider can give a class, in data order", () => {
    const hunterSubclass = effectsFor(effects, "subclass", "hunter").map(
      (e) => e.id,
    );
    expect(hunterSubclass).toContain("moebius-tether");
    expect(hunterSubclass).not.toContain("well-of-radiance");
    expect(hunterSubclass).toEqual(
      effects.filter((e) => hunterSubclass.includes(e.id)).map((e) => e.id),
    );
  });
});
