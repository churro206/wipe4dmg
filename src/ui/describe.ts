// Short German texts for effects, sources and provider groups in the UI.

import type {
  Ability,
  AegisAbilityRow,
  Effect,
  EffectPart,
  ProviderKind,
  Source,
} from "../data/schema";
import { superWindowMs } from "../engine/superWindow";
import { factor, integer, seconds, secondsInput } from "./format";

export const PROVIDER_LABELS: Record<ProviderKind, string> = {
  subclass: "Subklasse",
  armor: "Rüstung",
  artifact: "Artefakt",
  fireteamSupport: "Fireteam Support",
};

export const GROUP_LABELS: Record<string, string> = {
  super: "ein Super",
  "solar-surge": "eine Surge-Stufe",
};

const STATUS_LABELS: Record<Source["status"], string> = {
  verified: "geprüft",
  unverified: "ungeprüft",
  measured: "gemessen",
  missing: "fehlt",
};

export function describePart(part: EffectPart): string {
  switch (part.type) {
    case "multiplier":
      return `×${factor.format(part.multiplier.value ?? NaN)}`;
    case "timing":
      return "keine Reloads";
    case "counterModifier":
      return `Scorch ×${factor.format(part.factor.value ?? NaN)}`;
  }
}

export function describeEffect(effect: Effect): string {
  return effect.parts.map(describePart).join(", ");
}

export function describeDuration(effect: Effect): string {
  const durationMs = effect.durationMs?.value;
  return durationMs == null
    ? "ganze Damage Phase"
    : `${secondsInput.format(durationMs / 1000)} s`;
}

/** Sources of all parts with their status, e.g. "Court Stacking Guide (geprüft)". */
export function describeSources(effect: Effect): string[] {
  const sources = effect.parts.map((part) =>
    part.type === "multiplier"
      ? part.multiplier.source
      : part.type === "counterModifier"
        ? part.factor.source
        : part.source,
  );
  return [
    ...new Set(sources.map((s) => `${s.name} (${STATUS_LABELS[s.status]})`)),
  ];
}

/** Two letters as a placeholder until the effect has an icon, e.g. "Surge 4x" -> "S4". */
export function monogram(shortName: string): string {
  const words = shortName.split(/\s+/).filter(Boolean);
  const letters =
    words.length > 1 ? words[0][0] + words[1][0] : shortName.slice(0, 2);
  return letters.toUpperCase();
}

/** Level at the end of a short name, e.g. "Surge 4x" -> "4x"; for effects that share an icon. */
export function levelBadge(shortName: string): string | undefined {
  return /(\d+x)$/.exec(shortName)?.[1];
}

/** Lines for the hover card of an ability: model, assumptions, included effects, super window. */
export function describeAbility(
  ability: Ability,
  aegisRow: AegisAbilityRow | undefined,
  effects: Effect[],
): string[] {
  const nameOf = (id: string) => effects.find((e) => e.id === id)?.name ?? id;
  const total = ability.components.reduce(
    (sum, c) => sum + (c.damagePerTick.value ?? 0) * (c.ticks.value ?? 0),
    0,
  );
  const scaling = ability.components
    .filter((c) => c.scalesWithAbilityStat)
    .reduce(
      (sum, c) => sum + (c.damagePerTick.value ?? 0) * (c.ticks.value ?? 0),
      0,
    );
  const included = [
    ...new Set(ability.components.flatMap((c) => c.includedEffectIds ?? [])),
  ];
  const lines = [
    ability.components.length === 0
      ? "Kein eigener Schaden, nur Buff"
      : ability.package
        ? `Gemessener Wert von Aegis: ${integer.format(total)} pro Einsatz bei Stat 100`
        : `Eigene Teile: ${ability.components.map((c) => c.name).join(", ")}`,
  ];
  if (aegisRow && aegisRow.assumptions.length > 0) {
    lines.push(`Annahmen: ${aegisRow.assumptions.join(", ")}`);
  }
  if (total > 0) {
    lines.push(
      `Skaliert mit dem Stat: ${integer.format((scaling / total) * 100)} %`,
    );
  }
  if (included.length > 0) {
    lines.push(`Schon enthalten: ${included.map(nameOf).join(", ")}`);
  }
  if (ability.grantsEffectIds?.length) {
    lines.push(`Bringt mit: ${ability.grantsEffectIds.map(nameOf).join(", ")}`);
  }
  if (ability.kind === "super") lines.push(describeSuperWindow(ability));
  return lines;
}

/** How long the super keeps the weapon from firing, and whether that is exact. */
export function describeSuperWindow(ability: Ability): string {
  if (!ability.usage) return "Super Window: blockiert die Waffe nicht";
  const { durationMs, exact } = superWindowMs(ability.usage);
  const length = `${seconds.format(durationMs / 1000)} s`;
  switch (ability.usage.type) {
    case "cast":
      return exact
        ? `Super Window: Cast ${length}`
        : "Super Window: nur Cast, Dauer unbekannt (zählt als 0 s)";
    case "shots":
      return exact
        ? `Super Window: ${length} bis zum letzten Schuss`
        : `Super Window: höchstens ${length} (Schussabstand unbekannt)`;
    case "drain":
      return exact
        ? `Super Window: ${length}, bis die Energie leer ist`
        : `Super Window: höchstens ${length} (Verbrauch pro Angriff unbekannt)`;
  }
}

/** Source of an ability's value with its status, e.g. "Aegis Boss Damage sheet (geprüft)". */
export function describeAbilitySource(ability: Ability): string {
  const source = ability.components[0]?.damagePerTick.source;
  return source
    ? `${source.name} (${STATUS_LABELS[source.status]})`
    : "Destiny Data Compendium";
}
