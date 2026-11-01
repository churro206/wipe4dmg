import { useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AbilityKind,
  Build,
  Effect,
  GuardianClass,
  ProviderKind,
  Slot,
  Subclass,
} from "../data/schema";
import { compareResults, dpsByDamagePhase } from "../engine/analysis";
import { nextCastFor } from "../engine/buildSimulation";
import { buildSimulation } from "../engine/buildSimulation";
import { refillsOnCast } from "../engine/effectRules";
import { rotationWindows } from "../engine/effectWindows";
import { optimize, type OptimizerEntry } from "../engine/optimizer";
import { fitArtifact } from "../engine/artifacts";
import { abilitiesFor, effectsFor } from "../engine/providers";
import { classPerksFor } from "../engine/exoticArmor";
import { simulate } from "../engine/simulate";
import {
  ABILITY_KIND_LABELS,
  ABILITY_KINDS,
  STAT_ABILITY_KINDS,
  abilitiesOfChoice,
  buildOfState,
  choiceFor,
  CLASS_LABELS,
  defaultWindow,
  GRANTED_EFFECT_IDS,
  MAX_ABILITY_STATS,
  MAX_WEAPONS_STAT,
  replacesSuper,
  withoutBoundAbilities,
  withoutOwnSuperEffects,
  withoutSlot,
  type AbilityChoice,
  effectsOf,
  linkFor,
  selectionsFor,
  stateFromLink,
  SUBCLASS_LABELS,
  toggleSelection,
  windowsFor,
  type WindowInput,
} from "./buildState";
import { AbilityPicker } from "./components/AbilityPicker";
import { ArmorSection } from "./components/ArmorSection";
import { ArtifactPicker } from "./components/ArtifactPicker";
import { BreakdownPanel } from "./components/BreakdownPanel";
import { EffectPicker } from "./components/EffectPicker";
import { EncounterSection } from "./components/EncounterSection";
import { InfoTip } from "./components/InfoTip";
import { OptimizerTab } from "./components/OptimizerTab";
import { OverviewTab } from "./components/OverviewTab";
import { RotationTab } from "./components/RotationTab";
import { SegmentedControl } from "./components/SegmentedControl";
import { StatSliders } from "./components/StatSliders";
import { StickyResult } from "./components/StickyResult";
import { SummaryBar } from "./components/SummaryBar";
import { Tabs } from "./components/Tabs";
import { WeaponSection } from "./components/WeaponSection";
import { WikiView } from "./components/WikiView";
import {
  abilities,
  artifactData,
  baseEffects,
  gameData,
  keywords,
  bosses,
  buckets,
  effects,
  exoticArmor,
  generatedExoticEffects,
  weaponById,
} from "./data";
import { PROVIDER_LABELS } from "./describe";
import { effectSections } from "./effectSections";
import {
  effectRelevantTo,
  hasCatalyst,
  neededStatuses,
} from "../engine/weaponInfo";
import { roundToTenth } from "./format";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "rotation", label: "Rotation" },
  { id: "breakdown", label: "Breakdown" },
  { id: "optimizer", label: "Optimizer" },
] as const;
type TabId = (typeof TABS)[number]["id"];
// Calculator or wiki (US-15), switched in the header.
const VIEWS = [
  { value: "calculator", label: "Calculator" },
  { value: "wiki", label: "Wiki" },
] as const;
type View = (typeof VIEWS)[number]["value"];

// Number of builds the optimizer shows (US-08).
const OPTIMIZER_LIMIT = 15;
// Range of the DPS chart; it grows if the chosen damage phase is longer.
const DPS_CHART_MIN_SECONDS = 120;

const isFireteam = (s: { provider: ProviderKind }) =>
  s.provider === "fireteamSupport";

// The one way from a build to the simulator inputs, shared with the tests (plan 2026-10-22).
const simulationOf = (build: Build) => buildSimulation(build, gameData);

function App() {
  const [initial] = useState(() => stateFromLink(window.location.search));
  const [input, setInput] = useState(initial.input);
  const [bossId, setBossId] = useState(initial.bossId);
  const [guardianClass, setGuardianClass] = useState(initial.guardianClass);
  const [subclass, setSubclass] = useState(initial.subclass);
  const [selections, setSelections] = useState(initial.selections);
  const [weaponId, setWeaponId] = useState(initial.weaponId);
  const weapon = weaponById(weaponId);
  const [catalyst, setCatalyst] = useState(initial.catalyst);
  const [weaponPreBuilt, setWeaponPreBuilt] = useState(initial.weaponPreBuilt);
  const [playstyle, setPlaystyle] = useState(initial.playstyle);
  const [windowInputs, setWindowInputs] = useState(initial.windowInputs);
  const [abilityChoice, setAbilityChoice] = useState<AbilityChoice>(
    initial.abilityChoice,
  );
  const [abilityStatInputs, setAbilityStatInputs] = useState(
    initial.abilityStats,
  );
  const [weaponsStat, setWeaponsStat] = useState(initial.weaponsStat);
  const [openSlot, setOpenSlot] = useState<AbilityKind | null>(null);
  const [exoticArmorId, setExoticArmorId] = useState(initial.exoticArmorId);
  const [exoticPreBuilt, setExoticPreBuilt] = useState(initial.exoticPreBuilt);
  const [classPerkIds, setClassPerkIds] = useState(initial.classPerkIds);
  const [artifactId, setArtifactId] = useState(initial.artifactId);
  // The class item as the build's exotic; its perks are offered only then (a link carries the perks).
  const [classItemChosen, setClassItemChosen] = useState(
    initial.classPerkIds.length > 0,
  );
  const exotic = exoticArmor.find((e) => e.id === exoticArmorId);
  const exoticHasPreBuilt = generatedExoticEffects.some(
    (g) =>
      (g.exoticArmorId === exoticArmorId || classPerkIds.includes(g.exoticArmorId)) &&
      g.activation === "preBuilt",
  );
  const [comparison, setComparison] = useState(initial.comparison);
  const [copiedLink, setCopiedLink] = useState("");
  const [tab, setTab] = useState<TabId>("overview");
  const [view, setView] = useState<View>("calculator");
  const [fireteamOpen, setFireteamOpen] = useState(() =>
    initial.selections.some(isFireteam),
  );
  const [optimizer, setOptimizer] = useState<{
    forKey: string;
    entries: OptimizerEntry[];
  } | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const damagePhaseSeconds = Number(input);
  const isValid =
    input.trim() !== "" &&
    Number.isFinite(damagePhaseSeconds) &&
    damagePhaseSeconds >= 0;
  const ownSelected = effectsOf(selections);
  const currentBuild = buildOfState({
    weaponId,
    guardianClass,
    subclass,
    catalyst,
    weaponPreBuilt,
    playstyle,
    selections,
    windowInputs,
    abilityChoice,
    abilityStats: abilityStatInputs,
    weaponsStat,
    damagePhaseSeconds: isValid ? damagePhaseSeconds : 0,
    exoticArmorId,
    classPerkIds,
    exoticPreBuilt,
    artifactId,
  });
  const { selected, options } = simulationOf(currentBuild);
  const result = isValid
    ? simulate(weapon, damagePhaseSeconds, selected, buckets, options)
    : null;
  // For the catalyst slice of the donut: the same build without the catalyst
  const withoutCatalyst = (() => {
    if (!isValid || !currentBuild.catalyst) return undefined;
    const plain = simulationOf({ ...currentBuild, catalyst: false });
    return simulate(
      weapon,
      damagePhaseSeconds,
      plain.selected,
      buckets,
      plain.options,
    );
  })();
  const link = linkFor(isValid ? currentBuild : null, comparison, bossId);
  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      link ? `?${link}` : window.location.pathname,
    );
  }, [link]);
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopiedLink(link);
  };

  // The comparison runs with the same damage phase as the current build.
  const comparisonInputs = comparison ? simulationOf(comparison) : null;
  const comparisonResult =
    isValid && comparisonInputs
      ? simulate(
          weaponById(comparison!.weaponId),
          damagePhaseSeconds,
          comparisonInputs.selected,
          buckets,
          comparisonInputs.options,
        )
      : null;
  const summaryRows = result
    ? compareResults(result, comparisonResult ?? result)
    : [];

  const dpsChartSeconds = Math.max(
    DPS_CHART_MIN_SECONDS,
    isValid ? Math.ceil(damagePhaseSeconds) : 0,
  );
  const dpsPoints = useMemo(() => {
    const inputs = simulationOf(
      buildOfState({
        weaponId,
        guardianClass,
        subclass,
        catalyst,
        weaponPreBuilt,
        playstyle,
        selections,
        windowInputs,
        abilityChoice,
        abilityStats: abilityStatInputs,
        weaponsStat,
        // energy over the whole chart; a shorter phase keeps the casts up to its end
        damagePhaseSeconds: dpsChartSeconds,
        exoticArmorId,
        classPerkIds,
        exoticPreBuilt,
        artifactId,
      }),
    );
    return dpsByDamagePhase(
      weaponById(weaponId),
      inputs.selected,
      buckets,
      inputs.options,
      Array.from({ length: dpsChartSeconds }, (_, i) => i + 1),
    );
  }, [
    weaponId,
    guardianClass,
    subclass,
    catalyst,
    weaponPreBuilt,
    playstyle,
    selections,
    windowInputs,
    abilityChoice,
    abilityStatInputs,
    weaponsStat,
    dpsChartSeconds,
    exoticArmorId,
    classPerkIds,
    exoticPreBuilt,
    artifactId,
  ]);

  const changeWeapon = (id: string) => {
    setWeaponId(id);
    if (!hasCatalyst(weaponById(id))) setCatalyst(false);
    if (id !== weaponId) setWeaponPreBuilt(false);
    if (id !== weaponId) setPlaystyle(undefined);
  };
  const changeInput = (value: string) => {
    setInput(value);
    setBossId("");
  };
  const selectBoss = (id: string) => {
    setBossId(id);
    const chosen = bosses.find((b) => b.id === id);
    if (chosen) setInput(roundToTenth(chosen.damagePhaseSeconds.value));
  };
  const changeClass = (next: GuardianClass) => {
    setGuardianClass(next);
    if (exotic?.guardianClass && exotic.guardianClass !== next)
      setExoticArmorId(undefined);
    setClassPerkIds((current) =>
      current.filter((id) =>
        classPerksFor(exoticArmor, next).some((e) => e.id === id),
      ),
    );
    setSelections((current) => selectionsFor(current, next, subclass));
    setAbilityChoice((current) => choiceFor(current, next, subclass));
  };
  const changeSubclass = (next: Subclass) => {
    setSubclass(next);
    if (next !== "prismatic") {
      setClassPerkIds([]);
      setClassItemChosen(false);
    }
    setSelections((current) => selectionsFor(current, guardianClass, next));
    setAbilityChoice((current) => choiceFor(current, guardianClass, next));
  };
  const selectExotic = (id: string | undefined) => {
    setExoticArmorId(id);
    setClassPerkIds([]); // a piece or none replaces the class item
    setClassItemChosen(false);
    setExoticPreBuilt(false);
  };
  const chooseClassItem = () => {
    if (subclass !== "prismatic") changeSubclass("prismatic"); // the Spirit perks need Prismatic
    setExoticArmorId(undefined); // the class item is the exotic
    setClassItemChosen(true);
    setExoticPreBuilt(false);
  };
  const changeClassPerks = (ids: string[]) => {
    setClassPerkIds(ids);
    setExoticPreBuilt(false);
  };
  // A build has one super: the super slot and own effects of the super group exclude each other.
  // An ability that refills the magazine starts at the first reload instead of 0 s (U7).
  const firstCastMs = (kind: AbilityKind, abilityId: string) => {
    const ability = abilities.find((a) => a.id === abilityId);
    if (!ability || !refillsOnCast(ability)) return 0;
    const picks = abilitiesOfChoice({ ...abilityChoice, [kind]: { abilityId, castsMs: [] } });
    const build = { ...currentBuild, abilities: picks, abilityStats: abilityStatInputs };
    return nextCastFor(build, kind, gameData, weapon, buckets) ?? 0;
  };
  const selectAbility = (kind: AbilityKind, abilityId: string | null) => {
    const firstMs = abilityId === null ? 0 : firstCastMs(kind, abilityId);
    setAbilityChoice((current) => {
      const next = { ...current };
      if (abilityId === null) delete next[kind];
      else next[kind] = { abilityId, castsMs: [firstMs] };
      return next;
    });
    if (kind === "super" && abilityId !== null) {
      setSelections(withoutOwnSuperEffects);
    }
    setOpenSlot(null);
  };
  // Cast times of the chosen abilities; "+" adds a cast this long after the last one (UI default).
  const updateCasts = (
    kind: AbilityKind,
    change: (castsMs: number[]) => number[],
  ) =>
    setAbilityChoice((current) => {
      const pick = current[kind];
      return pick
        ? { ...current, [kind]: { ...pick, castsMs: change(pick.castsMs) } }
        : current;
    });
  const setWindow = (effect: Effect, patch: Partial<WindowInput>) =>
    setWindowInputs((inputs) => ({
      ...inputs,
      [effect.id]: {
        ...(inputs[effect.id] ?? defaultWindow(effect)),
        ...patch,
      },
    }));
  const isSelected = (effect: Effect, provider: ProviderKind) =>
    selections.some((s) => s.effectId === effect.id && s.provider === provider);
  const toggle = (effect: Effect, provider: ProviderKind) => {
    if (replacesSuper(effect, provider) && !isSelected(effect, provider)) {
      setAbilityChoice((current) => withoutSlot(current, "super"));
    }
    if (isSelected(effect, provider)) {
      setAbilityChoice((current) => withoutBoundAbilities(current, effect.id));
    }
    setSelections((current) => toggleSelection(current, effect, provider));
  };
  // Another artifact keeps the perks it also has, as far as its slots allow; none removes them all.
  const chooseArtifact = (id: string | undefined) => {
    setArtifactId(id);
    setSelections((current) =>
      id === undefined
        ? current.filter((s) => s.provider !== "artifact")
        : fitArtifact(artifactData, id, current).selections,
    );
  };
  const castRows = ABILITY_KINDS.flatMap((kind) => {
    const pick = abilityChoice[kind];
    const ability = pick && abilities.find((a) => a.id === pick.abilityId);
    if (!ability) return [];
    // the casts the energy allows and the earliest time of one more (block 3)
    const actual = options.abilities?.find((c) => c.ability.kind === kind);
    const actualMs = actual?.castsMs ?? pick.castsMs;
    const nextMs = nextCastFor(currentBuild, kind, gameData, weapon, buckets);
    return [{ ability, castsMs: pick.castsMs, actualMs, castMs: actual?.castMs, nextMs }];
  });
  // triggered effects, e.g. Radiant from Lightweight Knife, open their windows at the casts
  const windows = result
    ? rotationWindows(
        selected,
        damagePhaseSeconds,
        options,
        result.superWindows,
        weapon.element,
      )
    : [];

  // Optimizer: own effects vary, fireteam support and its windows stay as set.
  const fireteamSelections = selections.filter(isFireteam);
  const fixedWindows = windowsFor(effectsOf(fireteamSelections), windowInputs);
  // The ranking depends only on these inputs, not on the own effects.
  const optimizerKey = JSON.stringify({
    weaponId,
    guardianClass,
    fireteamSelections,
    fixedWindows,
    catalyst,
    damagePhaseSeconds,
  });
  const runOptimizer = () => {
    setOptimizing(true);
    // Let the browser show the busy state before the calculation blocks it.
    setTimeout(() => {
      const entries = optimize({
        weapon,
        buckets,
        // only effects.json: the generated aspects and fragments would multiply the combinations
        effects: baseEffects,
        guardianClass,
        fixedSelections: fireteamSelections,
        fixedWindows,
        catalyst,
        damagePhaseSeconds,
        limit: OPTIMIZER_LIMIT,
        keywords,
        artifacts: artifactData,
      });
      setOptimizer({ forKey: optimizerKey, entries });
      setOptimizing(false);
    });
  };
  const choiceOf = (entry: OptimizerEntry): AbilityChoice => {
    const choice = choiceFor(abilityChoice, guardianClass, entry.subclass);
    const ownSuper = entry.selections.some((s) =>
      effectsOf([s]).some((e) => replacesSuper(e, s.provider)),
    );
    return ownSuper ? withoutSlot(choice, "super") : choice;
  };
  const buildOf = (entry: OptimizerEntry): Build => {
    const picks = abilitiesOfChoice(choiceOf(entry));
    return {
      ...currentBuild,
      subclass: entry.subclass,
      artifactId: entry.artifactId ?? currentBuild.artifactId,
      selections: entry.selections,
      effectWindows: windowsFor(effectsOf(entry.selections), windowInputs),
      abilities: picks.length > 0 ? picks : undefined,
      abilityStats: picks.length > 0 ? abilityStatInputs : undefined,
    };
  };
  const applyOptimizerEntry = (entry: OptimizerEntry) => {
    setSubclass(entry.subclass);
    if (entry.artifactId) setArtifactId(entry.artifactId);
    setSelections(entry.selections);
    setAbilityChoice(choiceOf(entry));
  };

  // Own effects by slot, in the order of the game screens (U3). State-only items only show if
  // the exotic needs their state, e.g. Ascension (Amplified) for No Backup Plans.
  const needed = neededStatuses(selected);
  const shownEffects = effects.filter((effect) =>
    effectRelevantTo(effect, weapon, needed),
  );
  const sections = effectSections(
    shownEffects,
    guardianClass,
    subclass,
    GRANTED_EFFECT_IDS,
  );
  const pickerFor = (slot: Slot, heading: ReactNode) => {
    const section = sections.find((s) => s.slot === slot);
    if (!section) return null;
    return (
      <>
        {heading}
        <EffectPicker
          weaponElement={weapon.element}
          effects={section.effects}
          provider={section.provider}
          isSelected={(effect) => isSelected(effect, section.provider)}
          onToggle={(effect) => toggle(effect, section.provider)}
        />
      </>
    );
  };

  return (
    <>
      <main>
        <header>
          <a className="home" href="/" title="Back to the start page">
            <img className="logo" src="/logo.png" alt="" width={48} height={48} />
            <h1>wipe4dmg</h1>
          </a>
          <SegmentedControl
            label="View"
            options={[...VIEWS]}
            value={view}
            onChange={setView}
          />
        </header>

        {view === "wiki" && <WikiView />}
        {view === "calculator" && (
          <>
            <section className="settings" aria-label="Build">
              <EncounterSection
                input={input}
                bossId={bossId}
                onInput={changeInput}
                onCommitInput={(value) => setInput(roundToTenth(Number(value)))}
                onSelectBoss={selectBoss}
              />
              <WeaponSection
                weapon={weapon}
                catalyst={catalyst}
                preBuilt={weaponPreBuilt}
                onSelectWeapon={changeWeapon}
                onToggleCatalyst={() => setCatalyst((on) => !on)}
                onTogglePreBuilt={() => setWeaponPreBuilt((on) => !on)}
                playstyle={playstyle}
                onSelectPlaystyle={setPlaystyle}
              />

              <h2>Class</h2>
              <SegmentedControl
                label="Class"
                options={(Object.keys(CLASS_LABELS) as GuardianClass[]).map(
                  (id) => ({ value: id, label: CLASS_LABELS[id] }),
                )}
                value={guardianClass}
                onChange={changeClass}
              />
              <h2>Subclass</h2>
              <SegmentedControl
                label="Subclass"
                options={(Object.keys(SUBCLASS_LABELS) as Subclass[]).map(
                  (id) => ({
                    value: id,
                    label: SUBCLASS_LABELS[id],
                    iconKey: `subclass:${guardianClass}:${id}`,
                  }),
                )}
                value={subclass}
                onChange={changeSubclass}
              />

              <h2>
                Abilities
                <InfoTip>
                  Super, Grenade, Melee and Class Ability. Damage per cast is
                  mostly a measured value from Aegis; their stats are under
                  “Stats”. Each ability is cast at the start of the Damage
                  Phase, or when set in the Rotation; the weapon does not fire
                  during a Super. A class ability that reloads the weapon is
                  cast at the next reload.
                </InfoTip>
              </h2>
              <AbilityPicker
                slots={ABILITY_KINDS.map((kind) => ({
                  kind,
                  label: ABILITY_KIND_LABELS[kind],
                  // bound abilities (Transcendence grenades) only while their effect is selected
                  options: abilitiesFor(
                    abilities,
                    kind,
                    guardianClass,
                    subclass,
                  ).filter(
                    (a) =>
                      a.duringEffectId === undefined ||
                      selections.some((s) => s.effectId === a.duringEffectId),
                  ),
                  selected: abilities.find(
                    (a) => a.id === abilityChoice[kind]?.abilityId,
                  ),
                }))}
                openKind={openSlot}
                effects={effects}
                classAbilityElement={
                  subclass === "prismatic"
                    ? (abilities.find(
                        (a) => a.id === abilityChoice.super?.abilityId,
                      )?.element ?? "arc")
                    : subclass
                }
                onOpen={setOpenSlot}
                onSelect={selectAbility}
              />
              {pickerFor("super", <h3 className="sub">Super</h3>)}
              {pickerFor("aspect", <h2>Aspects</h2>)}
              {pickerFor("fragment", <h2>Fragments</h2>)}
              {pickerFor("buffs", <h2>Buffs &amp; Debuffs</h2>)}

              <ArmorSection
                guardianClass={guardianClass}
                subclass={subclass}
                exotic={exotic}
                classItemChosen={classItemChosen}
                exoticHasPreBuilt={exoticHasPreBuilt}
                exoticPreBuilt={exoticPreBuilt}
                classPerkIds={classPerkIds}
                onSelectExotic={selectExotic}
                onChooseClassItem={chooseClassItem}
                onTogglePreBuilt={() => setExoticPreBuilt((on) => !on)}
                onClassPerksChange={changeClassPerks}
              />
              {pickerFor("mod", <h3 className="sub">Mods</h3>)}

              <h2>Stats</h2>
              {pickerFor("stat", null)}
              <StatSliders
                rows={[
                  {
                    kind: "weapons",
                    label: "Weapons",
                    value: weaponsStat,
                    max: MAX_WEAPONS_STAT,
                  },
                  ...STAT_ABILITY_KINDS.map((kind) => ({
                    kind,
                    label: ABILITY_KIND_LABELS[kind],
                    value: abilityStatInputs[kind],
                    max: MAX_ABILITY_STATS[kind],
                  })),
                ]}
                onStat={(kind, value) =>
                  kind === "weapons"
                    ? setWeaponsStat(value)
                    : setAbilityStatInputs((current) => ({
                        ...current,
                        [kind]: value,
                      }))
                }
              />

              <h2>
                Artifact
                <InfoTip>
                  One seasonal artifact. As in the game, its perks fill seven
                  slots: two for one diamond, three for two, two for three.
                  Only perks that change damage are listed; the other slots
                  hold the rest.
                </InfoTip>
              </h2>
              <ArtifactPicker
                data={artifactData}
                artifactId={artifactId}
                effects={
                  sections.find((s) => s.slot === "artifact")?.effects ?? []
                }
                selectedEffectIds={selections
                  .filter((s) => s.provider === "artifact")
                  .map((s) => s.effectId)}
                weaponElement={weapon.element}
                onChoose={chooseArtifact}
                onToggle={(effect) => toggle(effect, "artifact")}
              />

              <details
                className="fireteam"
                open={fireteamOpen}
                onToggle={(event) => setFireteamOpen(event.currentTarget.open)}
              >
                <summary>
                  {PROVIDER_LABELS.fireteamSupport}
                  {fireteamSelections.length > 0 &&
                    ` (${fireteamSelections.length} selected)`}
                </summary>
                <EffectPicker
                  weaponElement={weapon.element}
                  effects={effectsFor(
                    shownEffects,
                    "fireteamSupport",
                    guardianClass,
                  )}
                  provider="fireteamSupport"
                  isSelected={(effect) => isSelected(effect, "fireteamSupport")}
                  onToggle={(effect) => toggle(effect, "fireteamSupport")}
                />
              </details>
            </section>

            <section className="results" aria-label="Result">
              <div className="results-head" id="results-head">
                {result ? (
                  <SummaryBar
                    rows={summaryRows}
                    withComparison={comparisonResult !== null}
                  />
                ) : (
                  <p className="result">
                    Enter a Damage Phase or pick a boss.
                  </p>
                )}
                <div className="toolbar">
                  <button type="button" onClick={copyLink} disabled={!link}>
                    {copiedLink !== "" && copiedLink === link
                      ? "Link copied"
                      : "Copy link"}
                  </button>
                  {comparison ? (
                    <button type="button" onClick={() => setComparison(null)}>
                      Remove comparison
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setComparison(currentBuild)}
                      disabled={!isValid}
                    >
                      Keep as comparison
                    </button>
                  )}
                  <InfoTip>
                    Effects apply in their window from the Rotation.{" "}
                    {weapon.rules?.some((rule) =>
                      rule.do.some((action) => action.type === "applyStatus"),
                    )
                      ? "Ignitions and Taken Seeker are included, burn damage not yet."
                      : "Damage per shot is a measured average (Aegis) including the intrinsic; shots and timing from Aegis or Quantum."}
                  </InfoTip>
                </div>
                {initial.message && <p className="note">{initial.message}</p>}
              </div>

              {result && (
                <Tabs tabs={[...TABS]} active={tab} onChange={setTab}>
                  {tab === "overview" && (
                    <OverviewTab
                      weapon={weapon}
                      result={result}
                      comparison={comparison}
                      comparisonResult={comparisonResult}
                      withoutCatalyst={withoutCatalyst}
                      selected={selected}
                      dpsPoints={dpsPoints}
                      damagePhaseSeconds={damagePhaseSeconds}
                    />
                  )}

                  {tab === "rotation" && (
                    <RotationTab
                      weapon={weapon}
                      result={result}
                      selected={selected}
                      ownSelected={ownSelected}
                      windows={windows}
                      castRows={castRows}
                      windowInputs={windowInputs}
                      damagePhaseSeconds={damagePhaseSeconds}
                      onWindowChange={setWindow}
                      onUpdateCasts={updateCasts}
                    />
                  )}

                  {tab === "breakdown" && (
                    <BreakdownPanel
                      weapon={weapon}
                      result={result}
                      damagePhaseSeconds={damagePhaseSeconds}
                      selected={selected}
                      options={options}
                    />
                  )}

                  {tab === "optimizer" && (
                    <OptimizerTab
                      optimizer={optimizer}
                      optimizerKey={optimizerKey}
                      optimizing={optimizing}
                      weaponElement={weapon.element}
                      guardianClass={guardianClass}
                      subclass={subclass}
                      selections={selections}
                      currentTotal={result.totalDamage}
                      onRun={runOptimizer}
                      onApply={applyOptimizerEntry}
                      onCompare={(entry) => setComparison(buildOf(entry))}
                    />
                  )}
                </Tabs>
              )}
            </section>
          </>
        )}
      </main>
      {result && (
        <StickyResult
          rows={summaryRows}
          withComparison={comparisonResult !== null}
          targetId="results-head"
        />
      )}
      <footer>
        wipe4dmg v{__APP_VERSION__} · Destiny content and icons © Bungie. Values
        from community sources (Quantum Damage-ics, Aegis, Destiny Data
        Compendium, Court). Perk data:{" "}
        <a href="https://www.d2clarity.com">Clarity</a> (feedback on perk texts
        in the <a href="https://url.d2clarity.com/discord">Clarity Discord</a>;
        our changes are marked).
      </footer>
    </>
  );
}

export default App;
