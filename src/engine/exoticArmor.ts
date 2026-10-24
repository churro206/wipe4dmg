// Exotic armor of a build (ADR 0014): which pieces a class can wear and which effects they bring.
// The kinds come from the armor import (exotic-armor.json); only kinds that change damage in the
// model are selectable, and pieces with an energy modifier (ability-energy.json, block 3).

import type {
  Build,
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

/** Selectable exotic armor of a class, in data order; the Spirit perks are not pieces. */
export function exoticArmorFor(
  entries: ExoticArmorEntry[],
  guardianClass: GuardianClass,
  energy?: Energy,
): ExoticArmorEntry[] {
  return entries.filter(
    (entry) =>
      entry.slot !== "classPerk" &&
      selectable(entry, energy) &&
      fitsClass(entry, guardianClass),
  );
}

/** Spirit perks of the Prismatic Exotic Class Item (ADR 0015, U6-3) a class can pick, in data order. */
export function classPerksFor(
  entries: ExoticArmorEntry[],
  guardianClass: GuardianClass,
): ExoticArmorEntry[] {
  return entries.filter(
    (entry) =>
      entry.slot === "classPerk" &&
      SELECTABLE.includes(entry.kind) &&
      fitsClass(entry, guardianClass),
  );
}

/**
 * The Spirit perks of a build. They only work with Prismatic and replace the exotic piece (the class
 * item is the build's exotic); throws if a perk is unknown, not selectable or of another class.
 */
export function classPerksOf(
  build: Pick<Build, "classPerkIds" | "exoticArmorId" | "subclass" | "guardianClass">,
  entries: ExoticArmorEntry[],
): ExoticArmorEntry[] {
  const ids = build.classPerkIds ?? [];
  if (ids.length === 0) return [];
  if (build.subclass !== "prismatic")
    throw new Error("Exotic Class Item perks only work with Prismatic");
  if (build.exoticArmorId !== undefined)
    throw new Error("A build has one exotic: the class item or another piece");
  if (new Set(ids).size !== ids.length)
    throw new Error("The two perks of the class item differ");
  const allowed = classPerksFor(entries, build.guardianClass);
  const perks = ids.map((id) => {
    const perk = allowed.find((e) => e.id === id);
    if (!perk)
      throw new Error(
        `Unknown class perk "${id}" or not selectable for ${build.guardianClass}`,
      );
    return perk;
  });
  if (perks.length === 2 && perks[0].column === perks[1].column)
    throw new Error(
      `"${perks[0].name}" and "${perks[1].name}" roll in the same column of the class item`,
    );
  return perks;
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
  if (entry.slot === "classPerk")
    throw new Error(`"${entry.name}" is a class perk, not a piece`);
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
