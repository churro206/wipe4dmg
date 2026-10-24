// Effects granted by abilities at every cast or hit (block "Effekte durch Abilities"): Radiant from
// Acrobat's Dodge and Lightweight Knife, Weaken from Snare Bomb and Void supers (Compendium, Court).

import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import generated from "../src/data/ability-grants.json";
import { AbilityGrant, type Build } from "../src/data/schema";
import { abilityGrants } from "../scripts/lib/abilityGrants";
import { loadGrantInputs } from "../scripts/lib/grantInputs";
import { buildSimulation } from "../src/engine/buildSimulation";
import { loadBuckets } from "../src/engine/loadData";
import { simulate } from "../src/engine/simulate";
import { gameData, weaponById } from "../src/ui/data";

const result = abilityGrants(loadGrantInputs());
const grantOf = (abilityId: string) => result.grants.find((g) => g.abilityId === abilityId);
const buckets = loadBuckets(rawBuckets);

describe("rule: effects from the Compendium texts of the abilities", () => {
  it("reads Radiant from Acrobat's Dodge and Lightweight Knife", () => {
    expect(grantOf("acrobats-dodge")).toMatchObject({
      effectId: "radiant",
      on: "cast",
      durationMs: { value: 10_000 },
    });
    expect(grantOf("lightweight-knife")).toMatchObject({
      effectId: "radiant",
      on: "hit",
      durationMs: { value: 10_000 },
    });
  });

  it("takes the duration from Court when the line names none", () => {
    expect(grantOf("twilight-arsenal")?.durationMs.source.name).toContain("Court");
    expect(grantOf("twilight-arsenal")?.durationMs.value).toBe(6000);
  });

  it("leaves out tethers and wells that are effects of their own, heavy attacks and kills", () => {
    for (const id of ["shadowshot-deadfall", "shadowshot-moebius-quiver", "well-of-radiance", "spectral-blades"])
      expect(grantOf(id)).toBeUndefined();
  });

  it("the generated file is current", () => {
    expect(AbilityGrant.array().parse(generated)).toEqual(result.grants);
  });
});

const hunter = (fields: Partial<Build>): Build => ({
  weaponId: "gjallarhorn",
  guardianClass: "hunter",
  subclass: "solar",
  catalyst: false,
  selections: [],
  effectWindows: {},
  damagePhaseSeconds: 30,
  ...fields,
});
const weaponHits = (b: Build) => {
  const { selected, options } = buildSimulation(b, gameData);
  return simulate(weaponById(b.weaponId), b.damagePhaseSeconds, selected, buckets, options)
    .damageInstances.filter((d) => d.damageSource === "weapon");
};

describe("engine: a cast opens the window of the granted effect", () => {
  const castMs = 3000;
  const plain = weaponHits(hunter({}));
  const dodged = weaponHits(hunter({ abilities: [{ abilityId: "acrobats-dodge", castsMs: [castMs] }] }));

  it("Acrobat's Dodge: weapon hits in the 10 s after the cast are 1.2x, the others unchanged", () => {
    expect(dodged).toHaveLength(plain.length);
    dodged.forEach((hit, i) => {
      const inside = hit.timeMs >= castMs && hit.timeMs < castMs + 10_000;
      expect(hit.damage / plain[i].damage).toBeCloseTo(inside ? 1.2 : 1, 6);
    });
    expect(dodged.some((h) => h.timeMs >= castMs && h.timeMs < castMs + 10_000)).toBe(true);
  });

  it.each(["acrobats-dodge", "lightweight-knife"])(
    "%s does not stack with the Radiant switch (highest in the empowering bucket)",
    (abilityId) => {
      const radiant = { selections: [{ effectId: "radiant" }] };
      const both = weaponHits(hunter({ ...radiant, abilities: [{ abilityId, castsMs: [castMs] }] }));
      const only = weaponHits(hunter(radiant));
      expect(both).toHaveLength(only.length);
      both.forEach((hit, i) => {
        expect(hit.damage).toBeCloseTo(only[i].damage, 6);
        expect(hit.factors.empowering).toBeCloseTo(1.2, 6);
      });
    },
  );
});
