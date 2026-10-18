// Short German texts for effects, sources and provider groups in the UI.

import type { Effect, EffectPart, ProviderKind, Source } from "../data/schema";
import { factor, secondsInput } from "./format";

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
