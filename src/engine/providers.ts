// Providers (glossary): which effects a build can get itself or from a teammate, per class.

import type { Effect, GuardianClass, ProviderKind } from "../data/schema";

/** True if the effect can come from this provider for a build of this class. */
export function canProvide(
  effect: Effect,
  provider: ProviderKind,
  guardianClass: GuardianClass,
): boolean {
  return effect.providers.some(
    (p) =>
      p.kind === provider &&
      (p.classes === undefined || p.classes.includes(guardianClass)),
  );
}

/** Effects this provider can give a build of this class, in data order. */
export function effectsFor(
  effects: Effect[],
  provider: ProviderKind,
  guardianClass: GuardianClass,
): Effect[] {
  return effects.filter((effect) =>
    canProvide(effect, provider, guardianClass),
  );
}
