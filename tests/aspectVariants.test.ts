// Aspects and fragments that change an ability (U6-2 rule G): the Aegis row of the base plus the item
// becomes a variant; it applies while the build selects the item.

import { describe, expect, it } from "vitest";
import rawRows from "../src/data/aegis-abilities.json";
import rawManifest from "../src/data/manifest-abilities.json";
import { AegisAbilityRow, ManifestAbilities } from "../src/data/schema";
import { abilitySimulation } from "../src/engine/buildAbilities";
import { nameKey, variantRows } from "../src/engine/abilityVariants";
import { abilities, abilityStats, effects } from "../src/ui/data";

const rows = AegisAbilityRow.array().parse(rawRows);
const row = (id: string, name: string, assumptions: string[]) =>
  ({ ...rows[0], id, name, assumptions }) as AegisAbilityRow;

describe("variantRows", () => {
  const base = row("base", "Vortex", []);
  const items = new Map([
    [nameKey("Echo of Remnants"), "echo-of-remnants"],
    [nameKey("Chaos Accelerant"), "chaos-accelerant"],
  ]);
  const resolve = (a: string) => items.get(nameKey(a));

  it("takes rows of the same ability whose extras are all known items", () => {
    const found = variantRows(
      base,
      [
        base,
        row("a", "Vortex", ["Echo of Remnants"]),
        row("b", "Vortex", ["Echo of Remnants", "Chaos Accelerant"]),
        row("c", "Vortex", ["Echo of Remnants", "average"]),
        row("d", "Scatter", ["Echo of Remnants"]),
      ],
      resolve,
    );
    expect(found.map((f) => [f.row.id, f.extras])).toEqual([
      ["a", ["echo-of-remnants"]],
      ["b", ["echo-of-remnants", "chaos-accelerant"]],
    ]);
  });

  it("ignores apostrophes and case in names", () => {
    expect(nameKey("Knock 'Em Down")).toBe(nameKey("Knock Em Down"));
  });
});

describe("aspect variants in a build", () => {
  const cast = (abilityId: string, effectIds: string[]) =>
    abilitySimulation(
      {
        abilities: [{ abilityId, castsMs: [0] }],
        selections: effectIds.map((effectId) => ({
          effectId,
          provider: "subclass" as const,
        })),
      },
      abilities,
      abilityStats,
      effects,
    ).casts[0].ability.id;

  it("Blade Barrage uses its Knock 'Em Down variant only with the aspect", () => {
    expect(cast("blade-barrage", [])).toBe("blade-barrage");
    expect(cast("blade-barrage", ["knock-em-down"])).toBe(
      "blade-barrage-with-knock-em-down",
    );
  });

  it("takes the variant with the most selected items (Vortex with Echo and Chaos Accelerant)", () => {
    expect(cast("vortex-grenade", ["echo-of-remnants"])).toBe(
      "vortex-grenade-with-echo-of-remnants",
    );
    expect(
      cast("vortex-grenade", ["echo-of-remnants", "chaos-accelerant"]),
    ).toBe("vortex-grenade-with-echo-of-remnants-chaos-accelerant");
  });

  // Rule over all rows: an aspect or fragment Aegis measured an ability with either works in the
  // calculator or is a known gap. A new gap like Knock 'Em Down fails here.
  it("every aspect or fragment in an Aegis row above a base row works or is a known gap", () => {
    const items = new Map(
      ManifestAbilities.parse(rawManifest).subclassItems!.map((i) => [
        nameKey(i.name),
        i.name,
      ]),
    );
    const working = new Set(effects.map((e) => nameKey(e.name)));
    const named = new Set<string>();
    for (const ability of abilities.filter((a) => a.package && !a.variantOf)) {
      const base = rows.find((r) => r.id === ability.aegisRowId)!;
      for (const { extras } of variantRows(base, rows, (a) => a))
        for (const extra of extras)
          if (items.has(nameKey(extra))) named.add(items.get(nameKey(extra))!);
    }
    const gaps = [...named].filter((name) => !working.has(nameKey(name))).sort();
    // Facet of Courage: only with Feast of Light and max distance; Touch of Thunder: only with
    // "average" and Spark of Magnitude (other assumptions than the base row)
    expect(gaps).toEqual(["Facet of Courage", "Touch of Thunder"]);
  });

  it("every item named by a variant row is a selectable effect that changes the ability", () => {
    const changing = effects.filter((e) => e.changesAbilityIds?.length);
    expect(changing.map((e) => e.id).sort()).toEqual([
      "chaos-accelerant",
      "echo-of-remnants",
      "knock-em-down",
      "spark-of-magnitude",
      "thread-of-evolution",
      "touch-of-winter",
    ]);
  });
});
