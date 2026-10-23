import { describe, expect, it } from "vitest";
import {
  abilities,
  effects,
  exoticArmor,
  iconUrl,
  weapons,
} from "../src/ui/data";
import { effectIconKey } from "../src/ui/describe";

// Every key the UI asks for has a Bungie icon, so no tile or legend falls back to initials.
describe("icons in the UI", () => {
  const missing = (keys: string[]) => keys.filter((key) => !iconUrl(key));

  it("has an icon for every ability, also variants with exotic armor or an effect", () => {
    expect(abilities.some((a) => a.variantOf)).toBe(true);
    expect(missing(abilities.map((a) => `ability:${a.id}`))).toEqual([]);
  });

  it("has an icon for every effect, for every weapon element", () => {
    const elements = [...new Set(weapons.map((w) => w.element))];
    expect(
      missing(effects.flatMap((e) => elements.map((el) => effectIconKey(e, el)))),
    ).toEqual([]);
  });

  it("has an icon for every exotic armor piece and weapon", () => {
    expect(
      missing([
        ...exoticArmor.map((x) => `armor:${x.id}`),
        ...weapons.map((w) => `weapon:${w.id}`),
      ]),
    ).toEqual([]);
  });
});
