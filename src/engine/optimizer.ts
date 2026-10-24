// Optimizer (US-08, glossary): tries every allowed combination of own effects for a class over
// all subclasses and ranks the builds by total damage. Fireteam support and its effect windows stay
// fixed; own effects use their default windows from the Data Files (no rotation in the optimizer).

import type {
  ArtifactData,
  Bucket,
  Build,
  Effect,
  GuardianClass,
  Keyword,
  ProviderKind,
  Subclass,
  Weapon,
} from "../data/schema";
import { perkSetsOf } from "./artifacts";
import type { EffectWindowInput } from "./effectWindows";
import { effectsFor } from "./providers";
import { simulate } from "./simulate";

const OWN_PROVIDERS: ProviderKind[] = ["subclass", "armor", "artifact"];
const SUBCLASSES: Subclass[] = [
  "arc",
  "solar",
  "void",
  "stasis",
  "strand",
  "prismatic",
];
// Totals closer than this count as equal (floating point noise).
const EQUAL_DAMAGE = 1e-6;

type Selection = Build["selections"][number];

export type OptimizerInput = {
  weapon: Weapon;
  buckets: Bucket[];
  effects: Effect[];
  guardianClass: GuardianClass;
  fixedSelections: Selection[]; // fireteam support, kept in every build
  fixedWindows: Record<string, EffectWindowInput>;
  catalyst: boolean;
  damagePhaseSeconds: number;
  limit: number;
  keywords?: Keyword[]; // keywords.json, for weapons that apply keywords
  // Without it every artifact effect can be switched on at once; with it only the perks of one
  // artifact that fit its slots.
  artifacts?: ArtifactData;
};

export type OptimizerEntry = {
  subclass: Subclass;
  artifactId?: string; // the artifact of the artifact selections
  selections: Selection[]; // fixed selections first, then own ones
  totalDamage: number;
  dps: number;
};

export function optimize(input: OptimizerInput): OptimizerEntry[] {
  const byId = new Map(input.effects.map((effect) => [effect.id, effect]));
  const keyOf = (selections: Selection[]) =>
    selections
      .map((s) => `${s.effectId}@${s.provider}`)
      .sort()
      .join("|");

  const found = new Map<string, OptimizerEntry>();
  for (const subclass of SUBCLASSES) {
    const combos = ownCombinations(input, subclass, byId);
    const totals = new Map<string, number>();
    const evaluated = combos.map(({ own, artifactId }) => {
      const selections = [...input.fixedSelections, ...own];
      const chosen = input.effects.filter((effect) =>
        selections.some((s) => s.effectId === effect.id),
      );
      const result = simulate(
        input.weapon,
        input.damagePhaseSeconds,
        chosen,
        input.buckets,
        {
          catalyst: input.catalyst,
          effectWindows: input.fixedWindows,
          keywords: input.keywords,
        },
      );
      totals.set(keyOf(own), result.totalDamage);
      return { own, artifactId, selections, result };
    });

    for (const { own, artifactId, selections, result } of evaluated) {
      // Keep only builds in which every own effect adds damage.
      const minimal = own.every(
        (removed) =>
          totals.get(keyOf(own.filter((s) => s !== removed)))! <
          result.totalDamage - EQUAL_DAMAGE,
      );
      const key = keyOf(selections);
      if (minimal && !found.has(key)) {
        found.set(key, {
          subclass,
          ...(artifactId !== undefined &&
          own.some((s) => s.provider === "artifact")
            ? { artifactId }
            : {}),
          selections,
          totalDamage: result.totalDamage,
          dps: result.dps,
        });
      }
    }
  }

  return [...found.values()]
    .sort(
      (a, b) =>
        b.totalDamage - a.totalDamage ||
        a.selections.length - b.selections.length,
    )
    .slice(0, input.limit);
}

/**
 * All combinations of own effects for one subclass: each effect on or off, and at most one effect
 * per exclusive group.
 */
function ownCombinations(
  input: OptimizerInput,
  subclass: Subclass,
  byId: Map<string, Effect>,
): { own: Selection[]; artifactId?: string }[] {
  const slots: Selection[][] = [];
  const groups = new Map<string, Selection[]>();
  for (const provider of OWN_PROVIDERS) {
    if (provider === "artifact" && input.artifacts) continue; // below, per artifact
    for (const effect of effectsFor(
      input.effects,
      provider,
      input.guardianClass,
      subclass,
    )) {
      const selection = { effectId: effect.id, provider };
      const group = byId.get(effect.id)!.exclusiveGroup;
      if (group === undefined) {
        slots.push([selection]);
      } else {
        groups.set(group, [...(groups.get(group) ?? []), selection]);
      }
    }
  }
  slots.push(...groups.values());

  let combos: Selection[][] = [[]];
  for (const slot of slots) {
    combos = combos.flatMap((combo) => [
      combo,
      ...slot.map((option) => [...combo, option]),
    ]);
  }
  const artifactChoices = artifactSets(input, subclass);
  return combos.flatMap((own) =>
    artifactChoices.map((choice) => ({
      own: [...own, ...choice.selections],
      ...(choice.artifactId === undefined ? {} : { artifactId: choice.artifactId }),
    })),
  );
}

/**
 * The artifact perks a build can have: every set of perks that fits the slots of one artifact,
 * each set once (the first artifact that has it). Without artifact data only the empty set.
 */
function artifactSets(
  input: OptimizerInput,
  subclass: Subclass,
): { artifactId?: string; selections: Selection[] }[] {
  const data = input.artifacts;
  if (!data) return [{ selections: [] }];
  const offered = new Set(
    effectsFor(input.effects, "artifact", input.guardianClass, subclass).map(
      (effect) => effect.id,
    ),
  );
  const seen = new Set<string>([""]);
  const choices: { artifactId?: string; selections: Selection[] }[] = [
    { selections: [] },
  ];
  for (const artifact of data.artifacts) {
    const modelled = {
      ...artifact,
      perks: artifact.perks.filter((perk) => offered.has(perk.effectId)),
    };
    for (const ids of perkSetsOf(data, modelled)) {
      const key = [...ids].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      choices.push({
        artifactId: artifact.id,
        selections: ids.map((effectId) => ({ effectId, provider: "artifact" as const })),
      });
    }
  }
  return choices;
}
