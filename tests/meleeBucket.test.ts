// Melee bonuses of aspects and fragments (ADR 0015, U6-4): "Melee-increasing damage modifiers are
// additive" (Court). Other quoted bonuses without a Court category share one multiplicative bucket.

import { describe, expect, it } from "vitest";
import type { MultiplierPart } from "../src/data/schema";
import { bucketMultipliers } from "../src/engine/effectParts";
import { buckets } from "../src/ui/data";

const part = (
  bucketId: string,
  multiplier: number,
  damageSources: MultiplierPart["damageSources"],
): MultiplierPart => ({
  type: "multiplier",
  bucketId,
  multiplier: {
    value: multiplier,
    source: { name: "test", url: "", retrieved: "2026-10-23", status: "derived" },
  },
  damageSources,
});

const melee = { damageSource: "melee" as const, element: "arc" as const };

describe("melee bucket", () => {
  it("adds up: Knockout +160 % and Offensive Bulwark +160 % make ×4.2, not ×6.76", () => {
    const [entry] = bucketMultipliers(
      [part("melee", 2.6, ["melee"]), part("melee", 2.6, ["melee"])],
      buckets,
      melee,
    );
    expect(entry.bucket.stacking).toBe("additive");
    expect(entry.multiplier).toBeCloseTo(4.2, 10);
  });

  it("does not touch grenades", () => {
    expect(
      bucketMultipliers([part("melee", 2.6, ["melee"])], buckets, {
        damageSource: "grenade",
        element: "arc",
      }),
    ).toEqual([]);
  });

  it("bonuses without a Court category multiply with each other", () => {
    const [entry] = bucketMultipliers(
      [part("aspectBonus", 1.1, ["grenade"]), part("aspectBonus", 1.73, ["grenade"])],
      buckets,
      { damageSource: "grenade", element: "solar" },
    );
    expect(entry.bucket.stacking).toBe("multiplicative");
    expect(entry.multiplier).toBeCloseTo(1.1 * 1.73, 10);
  });
});
