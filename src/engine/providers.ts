// Providers (glossary): which effects a build can get itself or from a teammate, per class.

import type {
  Effect,
  GuardianClass,
  ProviderKind,
  Subclass,
} from "../data/schema";

/**
 * True if the effect can come from this provider for a build of this class. With a subclass,
 * own subclass effects must also fit the subclass.
 */
export function canProvide(
  effect: Effect,
  provider: ProviderKind,
  guardianClass: GuardianClass,
  subclass?: Subclass,
): boolean {
  return effect.providers.some(
    (p) =>
      p.kind === provider &&
      (p.classes === undefined || p.classes.includes(guardianClass)) &&
      (subclass === undefined ||
        p.subclasses === undefined ||
        p.subclasses.includes(subclass)),
  );
}

/** Effects this provider can give a build of this class, in data order. */
export function effectsFor(
  effects: Effect[],
  provider: ProviderKind,
  guardianClass: GuardianClass,
  subclass?: Subclass,
): Effect[] {
  return effects.filter((effect) =>
    canProvide(effect, provider, guardianClass, subclass),
  );
}
