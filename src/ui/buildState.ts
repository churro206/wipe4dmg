// UI state of a build: selections per provider, abilities, rotation inputs and the build link (US-05).

import type {
  AbilityKind,
  Build,
  Effect,
  GuardianClass,
  ProviderKind,
  Subclass,
} from "../data/schema";
import { decodeLink, encodeLink } from "../engine/buildLink";
import type { EffectWindowInput } from "../engine/effectWindows";
import { abilitiesFor, canProvide } from "../engine/providers";
import {
  abilities,
  exoticArmor,
  abilityStats,
  DEFAULT_WEAPON_ID,
  effects,
  linkRegistry,
  weaponById,
} from "./data";
import { secondsInput } from "./format";
import { replacedMessage } from "./describe";

export type Selection = Build["selections"][number];
export type WindowInput = { start: string; duration: string };
export type AbilityPick = NonNullable<Build["abilities"]>[number];
/** Chosen ability per slot (super, grenade, melee). */
export type AbilityChoice = Partial<Record<AbilityKind, AbilityPick>>;
export type AbilityStatInputs = Record<AbilityKind, number>;

export const ABILITY_KINDS: AbilityKind[] = ["super", "grenade", "melee"];
export const ABILITY_KIND_LABELS: Record<AbilityKind, string> = {
  super: "Super",
  grenade: "Grenade",
  melee: "Melee",
};
/** Stats where the damage bonus starts (100), i.e. no bonus; from ability-stats.json. */
export const DEFAULT_ABILITY_STATS = Object.fromEntries(
  abilityStats.map((s) => [s.kind, s.bonusFromStat]),
) as AbilityStatInputs;
/** Highest stat per kind (200), for the stat inputs. */
export const MAX_ABILITY_STATS = Object.fromEntries(
  abilityStats.map((s) => [s.kind, s.maxStat]),
) as AbilityStatInputs;
/** Effects that some ability grants, e.g. Well of Radiance; chosen through the super slot. */
export const GRANTED_EFFECT_IDS = new Set(
  abilities.flatMap((a) => a.grantsEffectIds ?? []),
);
const SUPER_GROUP = "super";

export const LINK_PARAM = "b";
export const DEFAULT_CLASS: GuardianClass = "warlock";
export const DEFAULT_SUBCLASS: Subclass = "solar";
export const SUBCLASS_LABELS: Record<Subclass, string> = {
  arc: "Arc",
  solar: "Solar",
  void: "Void",
  stasis: "Stasis",
  strand: "Strand",
  prismatic: "Prismatic",
};
export const CLASS_LABELS: Record<GuardianClass, string> = {
  titan: "Titan",
  hunter: "Hunter",
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

/** Keeps only selections class and subclass can still provide, e.g. after switching them. */
export function selectionsFor(
  selections: Selection[],
  guardianClass: GuardianClass,
  subclass: Subclass,
): Selection[] {
  return selections.filter((s) => {
    const effect = effectById(s.effectId);
    return (
      effect !== undefined &&
      canProvide(effect, s.provider, guardianClass, subclass)
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

/** Abilities of the choice in slot order, for the build. */
export function abilitiesOfChoice(choice: AbilityChoice): AbilityPick[] {
  return ABILITY_KINDS.flatMap((kind) => {
    const pick = choice[kind];
    return pick ? [pick] : [];
  });
}

/** The choice without the ability of one slot. */
export function withoutSlot(
  choice: AbilityChoice,
  kind: AbilityKind,
): AbilityChoice {
  return Object.fromEntries(
    Object.entries(choice).filter(([slot]) => slot !== kind),
  );
}

/** Keeps only abilities class and subclass can still use, e.g. after switching them. */
export function choiceFor(
  choice: AbilityChoice,
  guardianClass: GuardianClass,
  subclass: Subclass,
): AbilityChoice {
  return Object.fromEntries(
    ABILITY_KINDS.flatMap((kind) => {
      const pick = choice[kind];
      const usable = abilitiesFor(abilities, kind, guardianClass, subclass);
      return pick && usable.some((a) => a.id === pick.abilityId)
        ? [[kind, pick]]
        : [];
    }),
  );
}

/** A build has one super: choosing a super removes own effects of the super group, e.g. Banner Shield. */
export function withoutOwnSuperEffects(selections: Selection[]): Selection[] {
  return selections.filter(
    (s) =>
      s.provider === "fireteamSupport" ||
      effectById(s.effectId)?.exclusiveGroup !== SUPER_GROUP,
  );
}

/** True if switching on this own effect must clear the super slot. */
export function replacesSuper(effect: Effect, provider: ProviderKind): boolean {
  return (
    provider !== "fireteamSupport" && effect.exclusiveGroup === SUPER_GROUP
  );
}

/**
 * Links of format 2 chose a super as an own effect, e.g. Well of Radiance from the subclass. Such
 * a selection becomes the super that grants it, cast at the start of its window.
 */
function migrateGrantedSelections(
  build: Build,
  choice: AbilityChoice,
): { selections: Selection[]; choice: AbilityChoice } {
  let next = choice;
  const selections = build.selections.filter((selection) => {
    if (selection.provider === "fireteamSupport") return true;
    if (!GRANTED_EFFECT_IDS.has(selection.effectId) || next.super) return true;
    const ability = abilitiesFor(
      abilities,
      "super",
      build.guardianClass,
      build.subclass,
    ).find((a) => a.grantsEffectIds?.includes(selection.effectId));
    if (!ability) return true;
    const startMs = build.effectWindows[selection.effectId]?.startMs ?? 0;
    next = { ...next, super: { abilityId: ability.id, castsMs: [startMs] } };
    return false;
  });
  return { selections, choice: next };
}

/** The build of the UI state; abilities and stats only if an ability is chosen. */
export function buildOfState(state: {
  weaponId: string;
  guardianClass: GuardianClass;
  subclass: Subclass;
  catalyst: boolean;
  selections: Selection[];
  windowInputs: Record<string, WindowInput>;
  abilityChoice: AbilityChoice;
  abilityStats: AbilityStatInputs;
  damagePhaseSeconds: number;
  exoticArmorId?: string;
  exoticPreBuilt?: boolean;
}): Build {
  const picks = abilitiesOfChoice(state.abilityChoice);
  return {
    weaponId: state.weaponId,
    guardianClass: state.guardianClass,
    subclass: state.subclass,
    catalyst: state.catalyst,
    ...(state.exoticArmorId ? { exoticArmorId: state.exoticArmorId } : {}),
    ...(state.exoticArmorId && state.exoticPreBuilt
      ? { exoticPreBuilt: true }
      : {}),
    selections: state.selections,
    effectWindows: windowsFor(effectsOf(state.selections), state.windowInputs),
    damagePhaseSeconds: state.damagePhaseSeconds,
    ...(picks.length > 0
      ? { abilities: picks, abilityStats: state.abilityStats }
      : {}),
  };
}

/** Short text for a build, e.g. for the comparison. */
export function describeBuild(build: Build): string {
  const names = [
    ...(build.abilities ?? []).map(
      (pick) =>
        abilities.find((a) => a.id === pick.abilityId)?.name ?? pick.abilityId,
    ),
    ...effectsOf(build.selections).map((effect) => effect.name),
  ];
  const exotic = exoticArmor.find((e) => e.id === build.exoticArmorId);
  if (exotic)
    names.unshift(
      `${exotic.name}${build.exoticPreBuilt ? " (pre-stacked)" : ""}`,
    );
  if (build.catalyst) names.unshift("Catalyst");
  names.unshift(weaponById(build.weaponId).name);
  const what = names.length > 0 ? names.join(", ") : "no effects";
  return `${CLASS_LABELS[build.guardianClass]} ${SUBCLASS_LABELS[build.subclass]}: ${what}`;
}

export type LinkState = {
  input: string;
  weaponId: string;
  guardianClass: GuardianClass;
  subclass: Subclass;
  selections: Selection[];
  catalyst: boolean;
  windowInputs: Record<string, WindowInput>;
  abilityChoice: AbilityChoice;
  abilityStats: AbilityStatInputs;
  exoticArmorId: string | undefined;
  exoticPreBuilt: boolean;
  comparison: Build | null;
  message: string | null;
};

/** Start state from the build link in the address; empty without a link. */
export function stateFromLink(search: string): LinkState {
  const empty: LinkState = {
    input: "",
    weaponId: DEFAULT_WEAPON_ID,
    guardianClass: DEFAULT_CLASS,
    subclass: DEFAULT_SUBCLASS,
    selections: [],
    catalyst: false,
    windowInputs: {},
    abilityChoice: {},
    abilityStats: DEFAULT_ABILITY_STATS,
    exoticArmorId: undefined,
    exoticPreBuilt: false,
    comparison: null,
    message: null,
  };
  const text = new URLSearchParams(search).get(LINK_PARAM);
  if (!text) return empty;
  try {
    const {
      build,
      comparison,
      unknownEffectCodes,
      unknownAbilityCodes,
      replacedEffectCodes,
    } = decodeLink(text, linkRegistry);
    const linked: AbilityChoice = Object.fromEntries(
      (build.abilities ?? []).flatMap((pick) => {
        const kind = abilities.find((a) => a.id === pick.abilityId)?.kind;
        return kind ? [[kind, pick]] : [];
      }),
    );
    const migrated = migrateGrantedSelections(build, linked);
    return {
      input: String(build.damagePhaseSeconds),
      weaponId: build.weaponId,
      guardianClass: build.guardianClass,
      subclass: build.subclass,
      selections: migrated.selections,
      abilityChoice: choiceFor(
        migrated.choice,
        build.guardianClass,
        build.subclass,
      ),
      abilityStats: build.abilityStats ?? DEFAULT_ABILITY_STATS,
      exoticArmorId: build.exoticArmorId,
      exoticPreBuilt: build.exoticPreBuilt ?? false,
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
        [
          replacedMessage(replacedEffectCodes, effects),
          unknownMessage(unknownEffectCodes.length, unknownAbilityCodes.length),
        ]
          .filter(Boolean)
          .join(" ") || null,
    };
  } catch {
    return { ...empty, message: "The link does not contain a valid build." };
  }
}

/** Hint about parts of a link from a newer version; null if everything is known. */
function unknownMessage(effects: number, abilities: number): string | null {
  const parts = [
    effects > 0 ? `${effects} unknown effects` : "",
    abilities > 0 ? `${abilities} unknown abilities` : "",
  ].filter(Boolean);
  return parts.length > 0
    ? `${parts.join(" and ")} in the link were ignored (newer version?).`
    : null;
}

/** Link text for the address; empty if there is no valid build yet. */
export function linkFor(build: Build | null, comparison: Build | null): string {
  if (!build) return "";
  return `${LINK_PARAM}=${encodeLink({ build, comparison }, linkRegistry)}`;
}
