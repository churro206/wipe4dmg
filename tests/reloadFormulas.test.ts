// d2foundry reload formulas (weapon_formulas.json) and the catalyst reload factor.

import { describe, expect, it } from "vitest";
import {
  catalystReloadFactor,
  parseReloadFormulas,
  reloadFormulaOf,
  reloadSeconds,
} from "../scripts/lib/reloadFormulas";

const raw = {
  "Hand Cannon": {
    "1": { name: "Adaptive Frame", cat: "default" },
    cat: {
      default: {
        reload: {
          evpp: 0.00006137590643,
          vpp: -0.02385522011,
          offset: 3.600042253,
          ammo_percent: 0.71,
        },
      },
    },
  },
  "Combat Bow": {
    "2": { name: "Trinity Ghoul", cat: "default" },
    "3": { name: "Le Monarque", cat: "lemon" },
    "4": { name: "Wish-Ender", cat: "zero" },
    cat: {
      default: { reload: { evpp: 0, vpp: -0.01, offset: 1.1 } },
      lemon: { reload: { evpp: 0, vpp: -0.02, offset: 1.5 } },
      zero: { reload: { evpp: 0, vpp: 0, offset: 0 } },
    },
  },
};

describe("reload formulas", () => {
  const types = parseReloadFormulas(raw);

  it("keys weapon types like the manifest and keeps the ammo share", () => {
    expect(Object.keys(types)).toEqual(["handCannon", "bow"]);
    expect(types.handCannon.default.ammoPercent).toBe(0.71);
    expect(types.bow.default.ammoPercent).toBe(1);
  });

  it("keeps only exotics with their own category, without empty formulas", () => {
    expect(Object.keys(types.bow.weapons)).toEqual(["Le Monarque"]);
    expect(reloadFormulaOf(types, "bow", "Le Monarque")?.offset).toBe(1.5);
    expect(reloadFormulaOf(types, "bow", "Wish-Ender")?.offset).toBe(1.1);
    expect(reloadFormulaOf(types, "sword", "Ergo Sum")).toBeUndefined();
  });

  it("computes seconds until the ammo is in, stat capped at 100", () => {
    const f = types.handCannon.default;
    expect(reloadSeconds(f, 50)).toBeCloseTo(
      (0.00006137590643 * 2500 - 0.02385522011 * 50 + 3.600042253) * 0.71,
      6,
    );
    expect(reloadSeconds(f, 140)).toBe(reloadSeconds(f, 100));
  });

  it("gives the catalyst factor, with a reload animation bonus from the text", () => {
    const f = types.handCannon.default;
    expect(catalystReloadFactor(f, 40, 20, "")).toBeCloseTo(
      reloadSeconds(f, 60) / reloadSeconds(f, 40),
      9,
    );
    expect(
      catalystReloadFactor(
        f,
        80,
        40,
        "Grants 60 Reload Speed, and 15% decreased Reload Animation Duration.",
      ),
    ).toBeCloseTo((reloadSeconds(f, 100) / reloadSeconds(f, 80)) * 0.85, 9);
  });
});
