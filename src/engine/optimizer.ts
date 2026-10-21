// Optimizer (US-08, glossary): tries every allowed combination of own effects for a class over
// all subclasses and ranks the builds by total damage. Fireteam support and its effect windows stay
// fixed; own effects use their default windows from the Data Files (no rotation in the optimizer).

import type {
  Bucket,
  Build,
  Effect,
  GuardianClass,
  Keyword,
  ProviderKind,
  Subclass,
  Weapon,
} from "../data/schema";
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
};

export type OptimizerEntry = {
  subclass: Subclass;
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
    const evaluated = combos.map((own) => {
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
      return { own, selections, result };
    });

    for (const { own, selections, result } of evaluated) {
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
): Selection[][] {
  const slots: Selection[][] = [];
  const groups = new Map<string, Selection[]>();
  for (const provider of OWN_PROVIDERS) {
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
  return combos;
}
