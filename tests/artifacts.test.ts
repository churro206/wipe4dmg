import { describe, expect, it } from "vitest";
import type { ArtifactData, Build } from "../src/data/schema";
import {
  artifactPerksOf,
  fitArtifact,
  freeSlots,
  perkSetsOf,
} from "../src/engine/artifacts";

// Slots as in the game screen of Hunter's Journal (owner screenshot 2026-10-24): 2, 3 and 2.
const source = {
  name: "test",
  retrieved: "2026-10-24",
  status: "verified" as const,
};
const slot = (value: number) => ({ value, source });
const data: ArtifactData = {
  slots: [slot(2), slot(3), slot(2)],
  artifacts: [
    {
      id: "journal",
      code: 1,
      name: "Journal",
      season: "Echoes",
      perks: [
        { name: "A", tier: 1, effectId: "a" },
        { name: "B", tier: 1, effectId: "b" },
        { name: "C", tier: 1, effectId: "c" },
        { name: "D", tier: 3, effectId: "d" },
      ],
    },
    {
      id: "disk",
      code: 2,
      name: "Disk",
      season: "Renegades",
      perks: [{ name: "E", tier: 2, effectId: "e" }],
    },
  ],
};
const pick = (artifactId: string | undefined, ...ids: string[]) =>
  ({
    artifactId,
    selections: ids.map((effectId) => ({ effectId, provider: "artifact" })),
  }) as Pick<Build, "artifactId" | "selections">;

describe("artifactPerksOf", () => {
  it("returns the perks of the chosen artifact", () => {
    expect(
      artifactPerksOf(pick("journal", "a", "d"), data).map((p) => p.name),
    ).toEqual(["A", "D"]);
  });

  it("needs no artifact without perks", () => {
    expect(artifactPerksOf(pick(undefined), data)).toEqual([]);
  });

  it("throws for perks without an artifact", () => {
    expect(() => artifactPerksOf(pick(undefined, "a"), data)).toThrow(
      /need an artifact/,
    );
  });

  it("throws for a perk of another artifact", () => {
    expect(() => artifactPerksOf(pick("journal", "e"), data)).toThrow(
      /not a perk of Journal/,
    );
  });

  it("throws for more perks in a tier than the tier has slots", () => {
    expect(() => artifactPerksOf(pick("journal", "a", "b", "c"), data)).toThrow(
      /2 slots in tier 1, not 3/,
    );
  });

  it("ignores selections of other providers", () => {
    const build = {
      artifactId: undefined,
      selections: [{ effectId: "z", provider: "fireteamSupport" }],
    } as Pick<Build, "artifactId" | "selections">;
    expect(artifactPerksOf(build, data)).toEqual([]);
  });
});

describe("fitArtifact", () => {
  const sel = (...ids: string[]) =>
    ids.map((effectId) => ({ effectId, provider: "artifact" as const }));

  it("takes the artifact that holds most of the perks of an old link", () => {
    const fitted = fitArtifact(data, undefined, sel("e", "a", "b"));
    expect(fitted.artifactId).toBe("journal");
    expect(fitted.selections.map((s) => s.effectId)).toEqual(["a", "b"]);
  });

  it("drops the perks that no longer fit a tier, the first ones win", () => {
    const fitted = fitArtifact(data, "journal", sel("a", "b", "c", "d"));
    expect(fitted.selections.map((s) => s.effectId)).toEqual(["a", "b", "d"]);
  });

  it("keeps selections of other providers and an artifact without perks", () => {
    const other = [{ effectId: "z", provider: "fireteamSupport" as const }];
    expect(fitArtifact(data, "disk", other)).toEqual({
      artifactId: "disk",
      selections: other,
    });
    expect(fitArtifact(data, undefined, other).artifactId).toBeUndefined();
  });

  it("drops perks of no known artifact", () => {
    expect(fitArtifact(data, "gone", sel("x")).selections).toEqual([]);
  });
});

describe("freeSlots and perkSetsOf", () => {
  const journal = data.artifacts[0];

  it("counts the slots left per tier", () => {
    expect(freeSlots(data, journal, ["a", "d"])).toEqual({ 1: 1, 2: 3, 3: 1 });
  });

  it("lists exactly the sets that fit the slots", () => {
    const sets = perkSetsOf(data, journal);
    // tier 1: 3 perks, at most 2 (1 + 3 + 3 = 7 sets); tier 3: 1 perk (2 sets)
    expect(sets).toHaveLength(14);
    expect(sets[0]).toEqual([]);
    expect(sets.some((set) => ["a", "b", "c"].every((id) => set.includes(id)))).toBe(
      false,
    );
  });
});
