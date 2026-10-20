// Own effects grouped by slot, in the order of the game screens (U3): subclass (super, class
// ability, aspects, fragments), armor (mods, stats), artifact. Teammates have their own section.

import type {
  Effect,
  GuardianClass,
  ProviderKind,
  Slot,
  Subclass,
} from "../data/schema";
import { effectsFor } from "../engine/providers";

export type EffectSection = {
  slot: Slot;
  provider: ProviderKind;
  effects: Effect[];
};

const SLOT_ORDER: { slot: Slot; provider: ProviderKind }[] = [
  { slot: "super", provider: "subclass" },
  { slot: "classAbility", provider: "subclass" },
  { slot: "aspect", provider: "subclass" },
  { slot: "fragment", provider: "subclass" },
  { slot: "mod", provider: "armor" },
  { slot: "stat", provider: "armor" },
  { slot: "artifact", provider: "artifact" },
];

/**
 * The filled sections for class and subclass. Effects that a super grants (e.g. Well of
 * Radiance) come from the super slot and are left out.
 */
export function effectSections(
  effects: Effect[],
  guardianClass: GuardianClass,
  subclass: Subclass,
  grantedEffectIds: Set<string>,
): EffectSection[] {
  return SLOT_ORDER.flatMap(({ slot, provider }) => {
    const inSlot = effectsFor(
      effects,
      provider,
      guardianClass,
      subclass,
    ).filter(
      (effect) =>
        !grantedEffectIds.has(effect.id) &&
        effect.providers.some((p) => p.kind === provider && p.slot === slot),
    );
    return inSlot.length > 0 ? [{ slot, provider, effects: inSlot }] : [];
  });
}
