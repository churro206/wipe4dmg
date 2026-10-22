import { describe, expect, it } from "vitest";
import rawEffects from "../src/data/effects.json";
import rawSubclassEffects from "../src/data/subclass-effects.json";
import { loadEffects, loadSubclassEffects } from "../src/engine/loadData";
import { effectSections, tilesOf } from "../src/ui/effectSections";

// U3: own effects grouped by slot in the order of the game screens.
const effects = loadEffects(rawEffects);
const allEffects = [
  ...effects,
  ...loadSubclassEffects(rawSubclassEffects, { preBuilt: true }),
];
const CLASSES = ["titan", "hunter", "warlock"] as const;
const SUBCLASSES = [
  "arc",
  "solar",
  "void",
  "stasis",
  "strand",
  "prismatic",
] as const;
const granted = new Set([
  "well-of-radiance",
  "moebius-tether",
  "deadfall-tether",
]);
const idsOf = (sections: ReturnType<typeof effectSections>) =>
  sections.map((s) => [s.slot, s.effects.map((e) => e.id)]);

describe("effectSections", () => {
  it("orders the slots like the game and keeps only filled ones", () => {
    expect(idsOf(effectSections(effects, "warlock", "solar", granted))).toEqual(
      [
        ["classAbility", ["empowering-rift"]],
        ["fragment", ["radiant", "ember-of-ashes"]],
        ["mod", ["surge-1x", "surge-2x", "surge-3x"]],
        ["stat", ["weapons-stat-200"]],
        ["artifact", ["elemental-overdrive-solar", "particle-reconstruction"]],
      ],
    );
  });

  it("leaves out effects that a super grants", () => {
    const hunterVoid = effectSections(effects, "hunter", "void", granted);
    const ids = hunterVoid.flatMap((s) => s.effects.map((e) => e.id));
    expect(ids).not.toContain("moebius-tether");
    expect(ids).toContain("weaken");
  });

  it("shows own super effects without an ability in the super slot", () => {
    expect(idsOf(effectSections(effects, "titan", "void", granted))[0]).toEqual(
      ["super", ["banner-shield"]],
    );
  });

  it("gives the effects of one item one tile, e.g. both triggers of Facet of Dominance", () => {
    const sections = effectSections(allEffects, "titan", "prismatic", granted);
    const fragments = sections.find((s) => s.slot === "fragment")!;
    expect(
      tilesOf(fragments.effects)
        .find((t) => t[0].id === "facet-of-dominance")!
        .map((e) => e.id),
    ).toEqual(["facet-of-dominance", "facet-of-dominance-2"]);
  });

  it("rule: no item shows twice in any class and subclass", () => {
    const twice = CLASSES.flatMap((guardianClass) =>
      SUBCLASSES.flatMap((subclass) =>
        effectSections(allEffects, guardianClass, subclass, granted).flatMap(
          (s) => {
            const names = tilesOf(s.effects).map((t) => t[0].name);
            return names
              .filter((n, i) => names.indexOf(n) !== i)
              .map((n) => `${guardianClass} ${subclass} ${n}`);
          },
        ),
      ),
    );
    expect(twice).toEqual([]);
  });

  it("names the provider of each section for selections", () => {
    const sections = effectSections(effects, "warlock", "solar", granted);
    expect(sections.map((s) => s.provider)).toEqual([
      "subclass",
      "subclass",
      "armor",
      "armor",
      "artifact",
    ]);
  });
});
