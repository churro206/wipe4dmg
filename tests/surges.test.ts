import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawIconRefs from "../src/data/icon-refs.json";
import rawIcons from "../src/data/icons.json";
import { Element, type MultiplierPart } from "../src/data/schema";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { decodeLink, encodeLink } from "../src/engine/buildLink";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";
import { effectIconKey, replacedMessage } from "../src/ui/describe";

// Surges (docs/mechanics/damage-stacking.md, rules 4 and 5): armor mods on the legs give 1x to 3x;
// 4x only comes from exotics. Assumption: the player wears the mods matching the weapon element.
const weapon = loadWeapon(raw);
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const byId = (id: string) => effects.find((e) => e.id === id)!;
const surges = effects.filter((e) => e.exclusiveGroup === "surge");
const DAMAGE_PHASE_SECONDS = 60;

describe("surge levels", () => {
  it("are 1x, 2x and 3x from armor mods; 4x is not a mod", () => {
    expect(surges.map((e) => e.id)).toEqual([
      "surge-1x",
      "surge-2x",
      "surge-3x",
    ]);
    expect(
      surges.map((e) => (e.parts[0] as MultiplierPart).multiplier.value),
    ).toEqual([1.1, 1.17, 1.22]);
    for (const surge of surges) {
      expect(surge.providers).toEqual([{ kind: "armor", slot: "mod" }]);
    }
    expect(effects.some((e) => /4x/.test(e.id))).toBe(false);
  });

  it("have no element filter and work for a weapon of any element", () => {
    for (const surge of surges) {
      for (const part of surge.parts) {
        expect("elements" in part).toBe(false);
      }
    }
    const arcWeapon = { ...weapon, element: "arc" as const };
    const base = simulate(arcWeapon, DAMAGE_PHASE_SECONDS).totalDamage;
    const withSurge = simulate(
      arcWeapon,
      DAMAGE_PHASE_SECONDS,
      [byId("surge-3x")],
      buckets,
      { effectWindows: { "surge-3x": { startMs: 0 } } },
    ).totalDamage;
    expect(withSurge / base).toBeCloseTo(1.22);
  });
});

describe("effect codes", () => {
  const active = effects.map((e) => e.code);
  const former = effects.flatMap((e) =>
    (e.formerCodes ?? []).map((f) => f.code),
  );

  it("are unique, and a former code is never reused", () => {
    expect(new Set(active).size).toBe(active.length);
    expect(new Set(former).size).toBe(former.length);
    expect(former.filter((code) => active.includes(code))).toEqual([]);
  });

  it("keep code 13 (old Surge 4x) readable as Surge 3x", () => {
    expect(byId("surge-3x").formerCodes).toEqual([
      expect.objectContaining({ code: 13, reason: "onlyFromExoticArmor" }),
    ]);
  });
});

describe("old links with Surge 4x", () => {
  const registry = { weapons: [weapon], effects, abilities: [] };
  // Encoded with the old code: a registry in which code 13 still is an effect.
  const oldRegistry = {
    ...registry,
    effects: [...effects, { id: "solar-surge-4x", code: 13 }],
  };
  const link = encodeLink(
    {
      build: {
        weaponId: weapon.id,
        guardianClass: "warlock",
        subclass: "solar",
        catalyst: false,
        damagePhaseSeconds: 30,
        selections: [{ effectId: "solar-surge-4x", provider: "armor" }],
        effectWindows: { "solar-surge-4x": { startMs: 0 } },
      },
    },
    oldRegistry,
  );

  it("open with Surge 3x and report the replacement", () => {
    const decoded = decodeLink(link, registry);
    expect(decoded.build.selections).toEqual([
      { effectId: "surge-3x", provider: "armor" },
    ]);
    expect(decoded.build.effectWindows).toEqual({ "surge-3x": { startMs: 0 } });
    expect(decoded.replacedEffectCodes).toEqual([
      { code: 13, effectId: "surge-3x", reason: "onlyFromExoticArmor" },
    ]);
  });

  it("write Surge 3x with its own code again", () => {
    const decoded = decodeLink(link, registry);
    const again = decodeLink(
      encodeLink({ build: decoded.build }, registry),
      registry,
    );
    expect(again.replacedEffectCodes).toEqual([]);
    expect(again.build.selections[0].effectId).toBe("surge-3x");
  });
});

describe("surge icons", () => {
  it("follow the element of the weapon", () => {
    expect(effectIconKey(byId("surge-1x"), "arc")).toBe("surge:arc");
    expect(effectIconKey(byId("surge-3x"), "solar")).toBe("surge:solar");
    expect(effectIconKey(byId("radiant"), "arc")).toBe("effect:radiant");
  });

  it("exist for every element", () => {
    const refKeys = rawIconRefs.map((r) => r.key);
    const iconKeys = Object.keys(rawIcons.icons);
    for (const element of Element.options) {
      expect(refKeys).toContain(`surge:${element}`);
      expect(iconKeys).toContain(`surge:${element}`);
    }
  });
});

describe("replacedMessage", () => {
  it("explains a replaced effect from an old link", () => {
    expect(
      replacedMessage(
        [{ code: 13, effectId: "surge-3x", reason: "onlyFromExoticArmor" }],
        effects,
      ),
    ).toBe(
      "Solar Surge 4x gibt es nur über Exotic-Rüstung; der Link nutzt jetzt Surge 3x.",
    );
  });

  it("is null without replacements", () => {
    expect(replacedMessage([], effects)).toBeNull();
  });
});
