// UI state of a build: selections per provider, abilities, rotation inputs and the build link (US-05).

import type {
  AbilityKind,
  Build,
  Effect,
  GuardianClass,
  ProviderKind,
  StatAbilityKind,
  Subclass,
} from "../data/schema";
import { fitArtifact } from "../engine/artifacts";
import { decodeLink, encodeLink } from "../engine/buildLink";
import type { EffectWindowInput } from "../engine/effectWindows";
import { classPerksFor } from "../engine/exoticArmor";
import { abilitiesFor, canProvide } from "../engine/providers";
import {
  abilities,
  artifactData,
  exoticArmor,
  abilityStats,
  bosses,
  DEFAULT_WEAPON_ID,
  effects,
  linkRegistry,
  weaponById,
  weaponStats,
} from "./data";
import { secondsInput } from "./format";
import { replacedMessage } from "./describe";

export type Selection = Build["selections"][number];
export type WindowInput = { start: string; duration: string };
export type AbilityPick = NonNullable<Build["abilities"]>[number];
/** Chosen ability per slot (super, grenade, melee). */
export type AbilityChoice = Partial<Record<AbilityKind, AbilityPick>>;
export type AbilityStatInputs = Record<StatAbilityKind, number>;

export const ABILITY_KINDS: AbilityKind[] = ["super", "grenade", "melee", "classAbility"];
export const STAT_ABILITY_KINDS: StatAbilityKind[] = ["super", "grenade", "melee"];
export const ABILITY_KIND_LABELS: Record<AbilityKind, string> = {
  super: "Super",
  grenade: "Grenade",
  melee: "Melee",
  classAbility: "Class Ability",
};
/** Stats where the damage bonus starts (100), i.e. no bonus; from ability-stats.json. */
export const DEFAULT_ABILITY_STATS = Object.fromEntries(
  abilityStats.map((s) => [s.kind, s.bonusFromStat]),
) as AbilityStatInputs;
/** Highest stat per kind (200), for the stat inputs. */
export const MAX_ABILITY_STATS = Object.fromEntries(
  abilityStats.map((s) => [s.kind, s.maxStat]),
) as AbilityStatInputs;
/** Weapons stat where the damage bonus starts (100) and its highest value (200); from weapon-stats.json. */
export const DEFAULT_WEAPONS_STAT = weaponStats[0].bonusFromStat;
export const MAX_WEAPONS_STAT = weaponStats[0].maxStat;
/** Effects that some ability grants, e.g. Well of Radiance; chosen through the super slot. */
export const GRANTED_EFFECT_IDS = new Set(
  abilities.flatMap((a) => a.grantsEffectIds ?? []),
);
const SUPER_GROUP = "super";

export const LINK_PARAM = "b";
/** The boss is no part of the build; it travels next to it so old links stay valid. */
export const BOSS_PARAM = "boss";
/** Damage Phase of the start state, so the first visit already shows a result. */
export const DEFAULT_DAMAGE_PHASE_SECONDS = 30;
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

/** The choice without the abilities bound to an effect, e.g. the Prismatic grenade of Transcendence. */
export function withoutBoundAbilities(
  choice: AbilityChoice,
  effectId: string,
): AbilityChoice {
  return Object.fromEntries(
    Object.entries(choice).filter(
      ([, pick]) =>
        abilities.find((a) => a.id === pick.abilityId)?.duringEffectId !== effectId,
    ),
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
  weaponPreBuilt?: boolean;
  selections: Selection[];
  windowInputs: Record<string, WindowInput>;
  abilityChoice: AbilityChoice;
  abilityStats: AbilityStatInputs;
  weaponsStat?: number;
  damagePhaseSeconds: number;
  exoticArmorId?: string;
  classPerkIds?: string[];
  exoticPreBuilt?: boolean;
  artifactId?: string;
}): Build {
  const picks = abilitiesOfChoice(state.abilityChoice);
  const classPerkIds = state.classPerkIds ?? [];
  return {
    weaponId: state.weaponId,
    guardianClass: state.guardianClass,
    subclass: state.subclass,
    catalyst: state.catalyst,
    ...(state.weaponPreBuilt && weaponById(state.weaponId).setup
      ? { weaponPreBuilt: true }
      : {}),
    ...(state.artifactId ? { artifactId: state.artifactId } : {}),
    ...(state.exoticArmorId ? { exoticArmorId: state.exoticArmorId } : {}),
    ...(classPerkIds.length > 0 ? { classPerkIds } : {}),
    ...(state.exoticPreBuilt && (state.exoticArmorId || classPerkIds.length > 0)
      ? { exoticPreBuilt: true }
      : {}),
    selections: state.selections,
    effectWindows: windowsFor(effectsOf(state.selections), state.windowInputs),
    damagePhaseSeconds: state.damagePhaseSeconds,
    ...(picks.length > 0
      ? { abilities: picks, abilityStats: state.abilityStats }
      : {}),
    ...(state.weaponsStat !== undefined &&
    state.weaponsStat !== DEFAULT_WEAPONS_STAT
      ? { weaponsStat: state.weaponsStat }
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
  const perks = (build.classPerkIds ?? []).flatMap((id) => {
    const perk = exoticArmor.find((e) => e.id === id);
    return perk ? [perk.name] : [];
  });
  const worn = exotic ? [exotic.name] : perks;
  if (worn.length > 0)
    names.unshift(
      `${worn.join(" + ")}${build.exoticPreBuilt ? " (pre-stacked)" : ""}`,
    );
  if (build.catalyst) names.unshift("Catalyst");
  names.unshift(
    `${weaponById(build.weaponId).name}${build.weaponPreBuilt ? " (pre-stacked)" : ""}`,
  );
  const what = names.length > 0 ? names.join(", ") : "no effects";
  return `${CLASS_LABELS[build.guardianClass]} ${SUBCLASS_LABELS[build.subclass]}: ${what}`;
}

/** The perks of a linked build that the engine accepts; a hand-edited link must not break the page. */
function validClassPerks(build: Build): string[] {
  if (build.subclass !== "prismatic" || build.exoticArmorId !== undefined)
    return [];
  const allowed = classPerksFor(exoticArmor, build.guardianClass);
  const perks = [...new Set(build.classPerkIds ?? [])].flatMap((id) =>
    allowed.filter((e) => e.id === id),
  );
  // one perk per column of the class item; the first one wins
  return perks
    .filter((perk, i) => perks.findIndex((p) => p.column === perk.column) === i)
    .map((perk) => perk.id);
}

/** A linked build with an artifact choice the engine accepts. */
function withFittedArtifact(build: Build): Build {
  const { artifactId, selections } = fitArtifact(
    artifactData,
    build.artifactId,
    build.selections,
  );
  return { ...build, artifactId, selections };
}

export type LinkState = {
  input: string;
  bossId: string;
  weaponId: string;
  guardianClass: GuardianClass;
  subclass: Subclass;
  selections: Selection[];
  catalyst: boolean;
  weaponPreBuilt: boolean;
  windowInputs: Record<string, WindowInput>;
  abilityChoice: AbilityChoice;
  abilityStats: AbilityStatInputs;
  weaponsStat: number;
  exoticArmorId: string | undefined;
  classPerkIds: string[];
  exoticPreBuilt: boolean;
  artifactId: string | undefined;
  comparison: Build | null;
  message: string | null;
};

/** Start state from the build link in the address; empty without a link. */
export function stateFromLink(search: string): LinkState {
  const empty: LinkState = {
    input: String(DEFAULT_DAMAGE_PHASE_SECONDS),
    bossId: "",
    weaponId: DEFAULT_WEAPON_ID,
    guardianClass: DEFAULT_CLASS,
    subclass: DEFAULT_SUBCLASS,
    selections: [],
    catalyst: false,
    weaponPreBuilt: false,
    windowInputs: {},
    abilityChoice: {},
    abilityStats: DEFAULT_ABILITY_STATS,
    weaponsStat: DEFAULT_WEAPONS_STAT,
    exoticArmorId: undefined,
    classPerkIds: [],
    exoticPreBuilt: false,
    artifactId: undefined,
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
    // Old links took any artifact perks at once; only what one artifact allows stays.
    const artifact = fitArtifact(artifactData, build.artifactId, migrated.selections);
    return {
      input: String(build.damagePhaseSeconds),
      bossId: bossOfLink(search, build.damagePhaseSeconds),
      weaponId: build.weaponId,
      guardianClass: build.guardianClass,
      subclass: build.subclass,
      selections: artifact.selections,
      artifactId: artifact.artifactId,
      abilityChoice: choiceFor(
        migrated.choice,
        build.guardianClass,
        build.subclass,
      ),
      abilityStats: build.abilityStats ?? DEFAULT_ABILITY_STATS,
      weaponsStat: Math.min(
        build.weaponsStat ?? DEFAULT_WEAPONS_STAT,
        MAX_WEAPONS_STAT,
      ),
      exoticArmorId: build.exoticArmorId,
      classPerkIds: validClassPerks(build),
      exoticPreBuilt: build.exoticPreBuilt ?? false,
      catalyst: build.catalyst,
      weaponPreBuilt: build.weaponPreBuilt ?? false,
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
      comparison: comparison && withFittedArtifact(comparison),
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
export function linkFor(
  build: Build | null,
  comparison: Build | null,
  bossId = "",
): string {
  if (!build) return "";
  const text = `${LINK_PARAM}=${encodeLink({ build, comparison }, linkRegistry)}`;
  return bossId ? `${text}&${BOSS_PARAM}=${encodeURIComponent(bossId)}` : text;
}

/** The boss of a link if it exists and still has the link's Damage Phase; else custom. */
function bossOfLink(search: string, damagePhaseSeconds: number): string {
  const id = new URLSearchParams(search).get(BOSS_PARAM) ?? "";
  const boss = bosses.find((b) => b.id === id);
  return boss?.damagePhaseSeconds.value === damagePhaseSeconds ? id : "";
}
