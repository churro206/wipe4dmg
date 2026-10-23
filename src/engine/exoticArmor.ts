// Exotic armor of a build (ADR 0014): which pieces a class can wear and which effects they bring.
// The kinds come from the armor import (exotic-armor.json); only kinds that change damage in the
// model are selectable, and pieces with an energy modifier (ability-energy.json, block 3).

import type {
  Effect,
  EnergyData,
  ExoticArmorEffect,
  ExoticArmorEntry,
  ExoticArmorKind,
  GuardianClass,
} from "../data/schema";

const SELECTABLE: readonly ExoticArmorKind[] = [
  "abilityVariant",
  "damageBuff",
  "grantsEffect",
  "weaponTiming",
];

type Energy = Pick<EnergyData, "modifiers">;

const selectable = (entry: ExoticArmorEntry, energy: Energy | undefined) =>
  SELECTABLE.includes(entry.kind) ||
  (energy?.modifiers ?? []).some(
    (m) => "exoticArmorId" in m.from && m.from.exoticArmorId === entry.id,
  );

const fitsClass = (entry: ExoticArmorEntry, guardianClass: GuardianClass) =>
  entry.guardianClass === null || entry.guardianClass === guardianClass;

/** Selectable exotic armor of a class, in data order. */
export function exoticArmorFor(
  entries: ExoticArmorEntry[],
  guardianClass: GuardianClass,
  energy?: Energy,
): ExoticArmorEntry[] {
  return entries.filter(
    (entry) => selectable(entry, energy) && fitsClass(entry, guardianClass),
  );
}

/** The exotic armor of a build; throws if it is unknown, not selectable or of another class. */
export function exoticArmorOf(
  exoticArmorId: string | undefined,
  entries: ExoticArmorEntry[],
  guardianClass: GuardianClass,
  energy?: Energy,
): ExoticArmorEntry | undefined {
  if (exoticArmorId === undefined) return undefined;
  const entry = entries.find((e) => e.id === exoticArmorId);
  if (!entry) throw new Error(`Unknown exotic armor "${exoticArmorId}"`);
  if (!selectable(entry, energy))
    throw new Error(
      `Exotic armor "${entry.name}" is not selectable (${entry.kind})`,
    );
  if (!fitsClass(entry, guardianClass))
    throw new Error(
      `Exotic armor "${entry.name}" is not for the class ${guardianClass}`,
    );
  return entry;
}

/**
 * Effects an exotic armor piece adds: the modelled effects its texts grant (rule 4c), the effects
 * generated from its damage buffs (exotic-armor-effects.json, ADR 0015 U6-1; prebuilt ones only
 * with the option) and its quoted change of the shot plan (rule 5).
 */
export function exoticArmorEffects(
  entry: ExoticArmorEntry,
  effects: Effect[],
  generated: ExoticArmorEffect[] = [],
  { preBuilt = false }: { preBuilt?: boolean } = {},
): Effect[] {
  const granted = [
    ...entry.grantsEffectIds.map((id) => {
      const effect = effects.find((e) => e.id === id);
      if (!effect) throw new Error(`Unknown effect "${id}" of "${entry.name}"`);
      return effect;
    }),
    ...generated
      .filter(
        (g) =>
          g.exoticArmorId === entry.id &&
          (g.activation === "always" || preBuilt),
      )
      .map((g) => g.effect),
  ];
  if (!entry.timing) return granted;
  const timing: Effect = {
    id: `exotic-armor:${entry.id}`,
    name: entry.name,
    code: entry.hash, // not part of build links; the exotic itself is
    shortName: entry.name,
    providers: [{ kind: "armor", slot: "exotic" }],
    parts: [
      {
        type: "timing",
        change: entry.timing.change,
        factor: entry.timing.factor,
        source: {
          name:
            entry.timing.source === "compendium"
              ? "Destiny Data Compendium (tab Exotic Armors)"
              : "Clarity (Live-Clarity-Database)",
          retrieved: "2026-10-21",
          status: "verified",
          note: `„${entry.timing.quote}“; several reload factors: only the strongest counts (no source for stacking)`,
        },
      },
    ],
  };
  return [...granted, timing];
}
