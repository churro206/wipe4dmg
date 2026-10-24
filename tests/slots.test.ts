import { describe, expect, it } from "vitest";
import rawEffects from "../src/data/effects.json";
import { EffectProvider as Provider } from "../src/data/schema";
import { loadEffects } from "../src/engine/loadData";

// Slots (U2): where the game shows an own effect, e.g. Ember of Ashes as a fragment of the
// subclass. Teammates provide effects without a slot.
const effects = loadEffects(rawEffects);

describe("slots of own effects", () => {
  it("match the places in the game", () => {
    const slots = Object.fromEntries(
      effects.flatMap((effect) =>
        effect.providers
          .filter((p) => p.kind !== "fireteamSupport")
          .map((p) => [effect.id, p.slot]),
      ),
    );
    expect(slots).toEqual({
      "well-of-radiance": "super",
      "empowering-rift": "classAbility",
      radiant: "buffs",
      "banner-shield": "super",
      weaken: "buffs",
      "moebius-tether": "super",
      "deadfall-tether": "super",
      "surge-1x": "mod",
      "surge-2x": "mod",
      "surge-3x": "mod",
      "elemental-overdrive-solar": "artifact",
      "particle-reconstruction": "artifact",
      "ember-of-ashes": "fragment",
      transcendence: "buffs",
      "rally-barricade": "classAbility",
    });
  });
});

describe("Provider", () => {
  it("needs a slot for own effects", () => {
    expect(() => Provider.parse({ kind: "subclass" })).toThrow("slot");
  });

  it("allows only the slots of its kind", () => {
    expect(() => Provider.parse({ kind: "subclass", slot: "mod" })).toThrow(
      "slot",
    );
    expect(() => Provider.parse({ kind: "armor", slot: "fragment" })).toThrow(
      "slot",
    );
    expect(Provider.parse({ kind: "armor", slot: "stat" }).slot).toBe("stat");
  });

  it("has no slot for teammates", () => {
    expect(() =>
      Provider.parse({ kind: "fireteamSupport", slot: "fragment" }),
    ).toThrow("slot");
  });
});
