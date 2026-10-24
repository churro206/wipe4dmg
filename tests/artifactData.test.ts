import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadArtifactInputs } from "../scripts/lib/artifactInputs";
import { buildArtifacts, renderArtifacts } from "../scripts/lib/artifacts";
import rawArtifacts from "../src/data/artifacts.json";
import { ArtifactData } from "../src/data/schema";
import { gameData } from "../src/ui/data";

// The seasonal artifacts come from the Compendium tab "Artifact Perks" (npm run build:artifacts):
// every perk has a verdict, the generated files are current, and the slots are those of the game.
const inputs = loadArtifactInputs();
const { data, rows } = buildArtifacts(inputs);
const artifacts = ArtifactData.parse(rawArtifacts);

describe("artifacts.json", () => {
  it("is current; run npm run build:artifacts after changing the Compendium snapshot or the effects", () => {
    expect(artifacts).toEqual(JSON.parse(JSON.stringify(data)));
  });

  it("has a verdict for every perk of the Compendium, none left open", () => {
    expect(rows).toHaveLength(inputs.compendium.length);
    expect(rows.filter((r) => r.verdict === "unclassified")).toEqual([]);
  });

  it("is documented in docs/artifact-import.md", () => {
    const doc = readFileSync(new URL("../docs/artifact-import.md", import.meta.url), "utf8");
    expect(doc).toBe(renderArtifacts(rows, inputs.effects));
  });

  it("lists seven artifacts with three tiers of seven perks each in the Compendium", () => {
    expect(artifacts.artifacts).toHaveLength(7);
    const perPerk = new Map<string, number>();
    for (const entry of inputs.compendium)
      perPerk.set(entry.section, (perPerk.get(entry.section) ?? 0) + 1);
    expect([...perPerk.values()]).toEqual(Array(7).fill(21));
  });

  it("has the slots of the game screen: two, three and two", () => {
    expect(artifacts.slots.map((s) => s.value)).toEqual([2, 3, 2]);
  });

  it("gives artifacts unique ids and codes, and every perk a known artifact effect once", () => {
    expect(new Set(artifacts.artifacts.map((a) => a.id)).size).toBe(7);
    expect(new Set(artifacts.artifacts.map((a) => a.code)).size).toBe(7);
    for (const artifact of artifacts.artifacts) {
      const ids = artifact.perks.map((p) => p.effectId);
      expect(new Set(ids).size, artifact.name).toBe(ids.length);
      for (const perk of artifact.perks) {
        const effect = gameData.effects.find((e) => e.id === perk.effectId);
        expect(effect, `${artifact.name}: ${perk.name}`).toBeDefined();
        expect(effect!.providers.some((p) => p.kind === "artifact")).toBe(true);
      }
    }
  });

  it("offers every effect with the provider artifact through some artifact", () => {
    const offered = new Set(artifacts.artifacts.flatMap((a) => a.perks.map((p) => p.effectId)));
    const lost = gameData.effects
      .filter((e) => e.providers.some((p) => p.kind === "artifact"))
      .filter((e) => !offered.has(e.id))
      .map((e) => e.id);
    expect(lost).toEqual([]);
  });

  it("matches the perks whose names differ in the Compendium and in Court", () => {
    const named = (artifact: string, perk: string) =>
      artifacts.artifacts.find((a) => a.name === artifact)!.perks.find((p) => p.name === perk)?.effectId;
    expect(named("Implement of Curiosity", "That Fresh Bullets Smell")).toBe("that-fresh-bullet-smell");
    expect(named("Encrypted Data Disk", "Combination Argent Blade")).toBe("argent-blade");
    expect(named("NPA Repulsion Regulator", "Void Weapon Channeling")).toBe("void-weapon-channelling");
    expect(named("Encrypted Data Disk", "Sniper's Meditation")).toBe("sniper-meditation");
  });
});
