// UI state of a build: selections per provider, rotation inputs and the build link (US-05).

import type {
  Build,
  Effect,
  GuardianClass,
  ProviderKind,
} from "../data/schema";
import { decodeLink, encodeLink } from "../engine/buildLink";
import type { EffectWindowInput } from "../engine/effectWindows";
import { canProvide } from "../engine/providers";
import { effects, linkRegistry, weapon } from "./data";
import { secondsInput } from "./format";

export type Selection = Build["selections"][number];
export type WindowInput = { start: string; duration: string };

export const LINK_PARAM = "b";
export const DEFAULT_CLASS: GuardianClass = "warlock";
export const CLASS_LABELS: Record<GuardianClass, string> = {
  titan: "Titan",
  hunter: "Jäger",
  warlock: "Warlock",
};

const effectById = (id: string) => effects.find((effect) => effect.id === id);

/** Seconds from an input field; undefined if empty or invalid. Accepts a decimal comma. */
export function secondsOf(text: string): number | undefined {
  const value = Number(text.replace(",", "."));
  return text.trim() !== "" && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

/** Default rotation input: start 0, duration from the data file or empty (until the end). */
export function defaultWindow(effect: Effect): WindowInput {
  const durationMs = effect.durationMs?.value;
  return {
    start: "0",
    duration: durationMs == null ? "" : secondsInput.format(durationMs / 1000),
  };
}

/** The selected effects, each once, in data order (an effect may come from two providers). */
export function effectsOf(selections: Selection[]): Effect[] {
  return effects.filter((effect) =>
    selections.some((s) => s.effectId === effect.id),
  );
}

/**
 * Switches one selection on or off. Switching on an own effect of an exclusive group removes
 * the other own effects of that group; effects from teammates are not limited.
 */
export function toggleSelection(
  selections: Selection[],
  effect: Effect,
  provider: ProviderKind,
): Selection[] {
  const isSame = (s: Selection) =>
    s.effectId === effect.id && s.provider === provider;
  if (selections.some(isSame)) return selections.filter((s) => !isSame(s));
  const group =
    provider === "fireteamSupport" ? undefined : effect.exclusiveGroup;
  const kept =
    group === undefined
      ? selections
      : selections.filter(
          (s) =>
            s.provider === "fireteamSupport" ||
            effectById(s.effectId)?.exclusiveGroup !== group,
        );
  return [...kept, { effectId: effect.id, provider }];
}

/** Keeps only selections the class can still provide, e.g. after switching the class. */
export function selectionsForClass(
  selections: Selection[],
  guardianClass: GuardianClass,
): Selection[] {
  return selections.filter((s) => {
    const effect = effectById(s.effectId);
    return (
      effect !== undefined && canProvide(effect, s.provider, guardianClass)
    );
  });
}

/** Effect windows for the engine from the rotation inputs (seconds) of the selected effects. */
export function windowsFor(
  selected: Effect[],
  inputs: Record<string, WindowInput>,
): Record<string, EffectWindowInput> {
  return Object.fromEntries(
    selected.map((effect) => {
      const input = inputs[effect.id] ?? defaultWindow(effect);
      const durationSeconds = secondsOf(input.duration);
      return [
        effect.id,
        {
          startMs: (secondsOf(input.start) ?? 0) * 1000,
          ...(durationSeconds === undefined
            ? {}
            : { durationMs: durationSeconds * 1000 }),
        },
      ];
    }),
  );
}

/** Short text for a build, e.g. for the comparison. */
export function describeBuild(build: Build): string {
  const names = effectsOf(build.selections).map((effect) => effect.name);
  if (build.catalyst) names.unshift("Katalysator");
  const what = names.length > 0 ? names.join(", ") : "ohne Effects";
  return `${CLASS_LABELS[build.guardianClass]}: ${what}`;
}

export type LinkState = {
  input: string;
  guardianClass: GuardianClass;
  selections: Selection[];
  catalyst: boolean;
  windowInputs: Record<string, WindowInput>;
  comparison: Build | null;
  message: string | null;
};

/** Start state from the build link in the address; empty without a link. */
export function stateFromLink(search: string): LinkState {
  const empty: LinkState = {
    input: "",
    guardianClass: DEFAULT_CLASS,
    selections: [],
    catalyst: false,
    windowInputs: {},
    comparison: null,
    message: null,
  };
  const text = new URLSearchParams(search).get(LINK_PARAM);
  if (!text) return empty;
  try {
    const { build, comparison, unknownEffectCodes } = decodeLink(
      text,
      linkRegistry,
    );
    if (build.weaponId !== weapon.id) throw new Error(build.weaponId);
    return {
      input: String(build.damagePhaseSeconds),
      guardianClass: build.guardianClass,
      selections: build.selections,
      catalyst: build.catalyst,
      windowInputs: Object.fromEntries(
        Object.entries(build.effectWindows).map(([id, window]) => [
          id,
          {
            start: secondsInput.format(window.startMs / 1000),
            duration:
              window.durationMs === undefined
                ? ""
                : secondsInput.format(window.durationMs / 1000),
          },
        ]),
      ),
      comparison,
      message:
        unknownEffectCodes.length > 0
          ? `${unknownEffectCodes.length} unbekannte Effects im Link ignoriert (neuere Version?).`
          : null,
    };
  } catch {
    return { ...empty, message: "Der Link enthält keinen gültigen Build." };
  }
}

/** Link text for the address; empty if there is no valid build yet. */
export function linkFor(build: Build | null, comparison: Build | null): string {
  if (!build) return "";
  return `${LINK_PARAM}=${encodeLink({ build, comparison }, linkRegistry)}`;
}
