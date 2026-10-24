// Seasonal artifact of a build: it offers perks in three tiers and the screen of the game has a
// fixed number of slots per tier, so only some combinations of perks are possible. Only perks with
// an effect in the model are listed (artifacts.json); the other slots can hold the perks without one.

import type {
  Artifact,
  ArtifactData,
  ArtifactPerk,
  Build,
} from "../data/schema";

const TIERS = [1, 2, 3] as const;

/** Slots of a tier (1 to 3). */
export const slotsOfTier = (data: ArtifactData, tier: number): number =>
  data.slots[tier - 1]?.value ?? 0;

/** The artifact perks of a tier, in data order. */
export const perksOfTier = (artifact: Artifact, tier: number): ArtifactPerk[] =>
  artifact.perks.filter((perk) => perk.tier === tier);

/** Slots left in each tier after these perks of an artifact. */
export function freeSlots(
  data: ArtifactData,
  artifact: Artifact,
  effectIds: string[],
): Record<number, number> {
  return Object.fromEntries(
    TIERS.map((tier) => [
      tier,
      slotsOfTier(data, tier) -
        perksOfTier(artifact, tier).filter((p) => effectIds.includes(p.effectId))
          .length,
    ]),
  );
}

/**
 * The artifact perks of a build: its selections with the provider "artifact". Throws if there is no
 * artifact, a perk is not one of this artifact, or a tier holds more perks than it has slots.
 */
export function artifactPerksOf(
  build: Pick<Build, "artifactId" | "selections">,
  data: ArtifactData,
): ArtifactPerk[] {
  const chosen = build.selections.filter((s) => s.provider === "artifact");
  if (chosen.length === 0) return [];
  if (build.artifactId === undefined)
    throw new Error("Artifact perks need an artifact");
  const artifact = data.artifacts.find((a) => a.id === build.artifactId);
  if (!artifact) throw new Error(`Unknown artifact "${build.artifactId}"`);
  const perks = chosen.map((s) => {
    const perk = artifact.perks.find((p) => p.effectId === s.effectId);
    if (!perk)
      throw new Error(`"${s.effectId}" is not a perk of ${artifact.name}`);
    return perk;
  });
  for (const tier of TIERS) {
    const count = perks.filter((p) => p.tier === tier).length;
    if (count > slotsOfTier(data, tier))
      throw new Error(
        `${artifact.name} has ${slotsOfTier(data, tier)} slots in tier ${tier}, not ${count}`,
      );
  }
  return perks;
}

/**
 * Makes the artifact choice of a linked build valid, so a hand-edited or old link (before the
 * artifact existed, any perks at once) does not break the page: without a known artifact the one
 * that holds most of the perks is taken, perks it does not have are dropped, and so are the ones
 * that no longer fit a tier (the first ones win).
 */
export function fitArtifact<S extends Build["selections"][number]>(
  data: ArtifactData,
  artifactId: string | undefined,
  selections: S[],
): { artifactId: string | undefined; selections: S[] } {
  const chosen = selections.filter((s) => s.provider === "artifact");
  const holds = (a: Artifact) =>
    chosen.filter((s) => a.perks.some((p) => p.effectId === s.effectId)).length;
  const artifact =
    data.artifacts.find((a) => a.id === artifactId) ??
    (chosen.length === 0
      ? undefined
      : [...data.artifacts].sort((a, b) => holds(b) - holds(a))[0]);
  const used = { 1: 0, 2: 0, 3: 0 } as Record<number, number>;
  const kept = selections.filter((s) => {
    if (s.provider !== "artifact") return true;
    const perk = artifact?.perks.find((p) => p.effectId === s.effectId);
    if (!perk || used[perk.tier] >= slotsOfTier(data, perk.tier)) return false;
    used[perk.tier]++;
    return true;
  });
  return { artifactId: artifact?.id, selections: kept };
}

/**
 * Every set of effect ids of one artifact that fits its slots, the empty set first. For the
 * optimizer; small, because only perks with an effect are listed.
 */
export function perkSetsOf(data: ArtifactData, artifact: Artifact): string[][] {
  let sets: string[][] = [[]];
  for (const perk of artifact.perks) {
    sets = sets.flatMap((set) => {
      const next = [...set, perk.effectId];
      return freeSlots(data, artifact, next)[perk.tier] >= 0
        ? [set, next]
        : [set];
    });
  }
  return sets;
}
