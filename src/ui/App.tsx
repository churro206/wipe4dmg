import { useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AbilityKind,
  Build,
  Effect,
  GuardianClass,
  ProviderKind,
  Slot,
  Subclass,
  Weapon,
} from "../data/schema";
import {
  compareResults,
  damageShares,
  damageCurve,
  dpsByDamagePhase,
} from "../engine/analysis";
import { breakdown } from "../engine/breakdown";
import {
  addCast,
  nextCastOf,
  removeCast,
  setCast,
} from "../engine/buildAbilities";
import { buildSimulation } from "../engine/buildSimulation";
import { effectWindows } from "../engine/effectWindows";
import { optimize, type OptimizerEntry } from "../engine/optimizer";
import { abilitiesFor, effectsFor } from "../engine/providers";
import { exoticArmorFor } from "../engine/exoticArmor";
import { simulate, type SimulationResult } from "../engine/simulate";
import type { SimulationOptions } from "../engine/simulate";
import {
  ABILITY_KIND_LABELS,
  ABILITY_KINDS,
  abilitiesOfChoice,
  buildOfState,
  choiceFor,
  CLASS_LABELS,
  defaultWindow,
  GRANTED_EFFECT_IDS,
  MAX_ABILITY_STATS,
  replacesSuper,
  withoutOwnSuperEffects,
  withoutSlot,
  type AbilityChoice,
  describeBuild,
  effectsOf,
  linkFor,
  selectionsFor,
  stateFromLink,
  SUBCLASS_LABELS,
  toggleSelection,
  windowsFor,
  type WindowInput,
} from "./buildState";
import {
  BreakdownChart,
  CompareCurveChart,
  DamageCurveChart,
  DamageShareChart,
  DpsByLengthChart,
  RotationTimeline,
} from "./Charts";
import { AbilityPicker } from "./components/AbilityPicker";
import { EffectPicker } from "./components/EffectPicker";
import { Icon } from "./components/Icon";
import { InfoTip } from "./components/InfoTip";
import { OptimizerCards } from "./components/OptimizerCards";
import { WikiView } from "./components/WikiView";
import { AbilityCastEditor } from "./components/AbilityCastEditor";
import { RotationEditor } from "./components/RotationEditor";
import { SegmentedControl } from "./components/SegmentedControl";
import { StatSliders } from "./components/StatSliders";
import { SummaryBar } from "./components/SummaryBar";
import { WeaponPicker } from "./components/WeaponPicker";
import { ExoticPicker } from "./components/ExoticPicker";
import { Tabs } from "./components/Tabs";
import {
  abilities,
  activities,
  baseEffects,
  gameData,
  keywords,
  bosses,
  buckets,
  effects,
  exoticArmor,
  generatedExoticEffects,
  iconUrl,
  weaponById,
  weapons,
} from "./data";
import {
  describeCatalyst,
  describeExotic,
  effectIconKey,
  PROVIDER_LABELS,
} from "./describe";
import { effectSections } from "./effectSections";
import {
  effectRelevantTo,
  hasCatalyst,
  hasIgnition,
  neededStatuses,
} from "../engine/weaponInfo";
import { factor, integer, seconds } from "./format";

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
  const [bossId, setBossId] = useState("");
  const [guardianClass, setGuardianClass] = useState(initial.guardianClass);
  const [subclass, setSubclass] = useState(initial.subclass);
  const [selections, setSelections] = useState(initial.selections);
  const [weaponId, setWeaponId] = useState(initial.weaponId);
  const weapon = weaponById(weaponId);
  const [catalyst, setCatalyst] = useState(initial.catalyst);
  const [windowInputs, setWindowInputs] = useState(initial.windowInputs);
  const [abilityChoice, setAbilityChoice] = useState<AbilityChoice>(
    initial.abilityChoice,
  );
  const [abilityStatInputs, setAbilityStatInputs] = useState(
    initial.abilityStats,
  );
  const [openSlot, setOpenSlot] = useState<AbilityKind | null>(null);
  const [exoticArmorId, setExoticArmorId] = useState(initial.exoticArmorId);
  const [exoticPreBuilt, setExoticPreBuilt] = useState(initial.exoticPreBuilt);
  const exotic = exoticArmor.find((e) => e.id === exoticArmorId);
  const exoticHasPreBuilt = generatedExoticEffects.some(
    (g) => g.exoticArmorId === exoticArmorId && g.activation === "preBuilt",
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
    selections,
    windowInputs,
    abilityChoice,
    abilityStats: abilityStatInputs,
    damagePhaseSeconds: isValid ? damagePhaseSeconds : 0,
    exoticArmorId,
    exoticPreBuilt,
  });
  const { selected, options } = simulationOf(currentBuild);
  const result = isValid
    ? simulate(weapon, damagePhaseSeconds, selected, buckets, options)
    : null;
  const boss = bosses.find((b) => b.id === bossId);
  const link = linkFor(isValid ? currentBuild : null, comparison);
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
        selections,
        windowInputs,
        abilityChoice,
        abilityStats: abilityStatInputs,
        // energy over the whole chart; a shorter phase keeps the casts up to its end
        damagePhaseSeconds: dpsChartSeconds,
        exoticArmorId,
        exoticPreBuilt,
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
    selections,
    windowInputs,
    abilityChoice,
    abilityStatInputs,
    dpsChartSeconds,
    exoticArmorId,
    exoticPreBuilt,
  ]);

  const changeWeapon = (id: string) => {
    setWeaponId(id);
    if (!hasCatalyst(weaponById(id))) setCatalyst(false);
  };
  const selectBoss = (id: string) => {
    setBossId(id);
    const chosen = bosses.find((b) => b.id === id);
    if (chosen) setInput(String(chosen.damagePhaseSeconds.value));
  };
  const changeClass = (next: GuardianClass) => {
    setGuardianClass(next);
    if (exotic?.guardianClass && exotic.guardianClass !== next)
      setExoticArmorId(undefined);
    setSelections((current) => selectionsFor(current, next, subclass));
    setAbilityChoice((current) => choiceFor(current, next, subclass));
  };
  const changeSubclass = (next: Subclass) => {
    setSubclass(next);
    setSelections((current) => selectionsFor(current, guardianClass, next));
    setAbilityChoice((current) => choiceFor(current, guardianClass, next));
  };
  // A build has one super: the super slot and own effects of the super group exclude each other.
  const selectAbility = (kind: AbilityKind, abilityId: string | null) => {
    setAbilityChoice((current) => {
      const next = { ...current };
      if (abilityId === null) delete next[kind];
      else next[kind] = { abilityId, castsMs: [0] };
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
    setSelections((current) => toggleSelection(current, effect, provider));
  };
  const castRows = ABILITY_KINDS.flatMap((kind) => {
    const pick = abilityChoice[kind];
    const ability = pick && abilities.find((a) => a.id === pick.abilityId);
    if (!ability) return [];
    // the casts the energy allows and the earliest time of one more (block 3)
    const actualMs =
      options.abilities?.find((c) => c.ability.kind === kind)?.castsMs ?? pick.castsMs;
    const nextMs = nextCastOf(currentBuild, kind, abilities, gameData.energy);
    return [{ ability, castsMs: pick.castsMs, actualMs, nextMs }];
  });
  const windows = isValid
    ? effectWindows(selected, damagePhaseSeconds, options)
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
      selections: entry.selections,
      effectWindows: windowsFor(effectsOf(entry.selections), windowInputs),
      abilities: picks.length > 0 ? picks : undefined,
      abilityStats: picks.length > 0 ? abilityStatInputs : undefined,
    };
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
          <img className="logo" src="/logo.png" alt="" width={48} height={48} />
          <h1>wipe4dmg</h1>
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
              <h2>Encounter</h2>
              <div className="phase-row">
                <label>
                  Damage Phase (s)
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={input}
                    onChange={(event) => {
                      setInput(event.target.value);
                      setBossId("");
                    }}
                  />
                </label>
                <label>
                  Boss
                  <select
                    value={bossId}
                    onChange={(event) => selectBoss(event.target.value)}
                  >
                    <option value="">– custom –</option>
                    {activities.map((activity) => (
                      <optgroup key={activity} label={activity}>
                        {bosses
                          .filter((b) => b.activity === activity)
                          .map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} (
                              {seconds.format(
                                b.damagePhaseSeconds.value ?? NaN,
                              )}{" "}
                              s)
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
              </div>
              {boss?.description && <p className="note">{boss.description}</p>}

              <h2>Weapon</h2>
              <div className="tile-grid">
                <WeaponPicker
                  weapons={weapons}
                  selected={weapon}
                  onSelect={changeWeapon}
                />
                {hasCatalyst(weapon) && (
                  <span className="tile-wrap">
                    <button
                      type="button"
                      className="tile"
                      aria-pressed={catalyst}
                      aria-describedby="catalyst-card"
                      onClick={() => setCatalyst((on) => !on)}
                    >
                      <Icon
                        iconKey={`catalyst:${weapon.id}`}
                        label="Catalyst"
                      />
                      <span className="tile-label">Catalyst</span>
                    </button>
                    <span role="tooltip" id="catalyst-card" className="hover-card">
                      <strong>{weapon.catalyst?.name ?? "Catalyst"}</strong>
                      {describeCatalyst(weapon).map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </span>
                  </span>
                )}
              </div>
              {catalyst &&
                weapon.options?.some(
                  (o) =>
                    o.kind === "catalyst" &&
                    (o.durationSeconds !== null || o.condition !== null),
                ) && (
                  <p className="note">
                    The catalyst applies for the whole Damage Phase here; in
                    game it is limited.
                  </p>
                )}

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
                  Super, Grenade and Melee. Damage per cast is mostly a
                  measured value from Aegis; their stats are under “Stats”.
                  Each ability is cast at the start of the Damage Phase, or
                  when set in the Rotation; the weapon does not fire during a
                  Super.
                </InfoTip>
              </h2>
              <AbilityPicker
                slots={ABILITY_KINDS.map((kind) => ({
                  kind,
                  label: ABILITY_KIND_LABELS[kind],
                  options: abilitiesFor(
                    abilities,
                    kind,
                    guardianClass,
                    subclass,
                  ),
                  selected: abilities.find(
                    (a) => a.id === abilityChoice[kind]?.abilityId,
                  ),
                }))}
                openKind={openSlot}
                effects={effects}
                onOpen={setOpenSlot}
                onSelect={selectAbility}
              />
              {pickerFor("super", <h3 className="sub">Super</h3>)}
              {pickerFor(
                "classAbility",
                <h3 className="sub">Class Ability</h3>,
              )}
              {pickerFor("aspect", <h2>Aspects</h2>)}
              {pickerFor("fragment", <h2>Fragments</h2>)}
              {pickerFor("buffs", <h2>Buffs &amp; Debuffs</h2>)}

              <h2>Armor</h2>
              <h3 className="sub">Exotic</h3>
              <div className="tile-grid">
                <ExoticPicker
                  entries={exoticArmorFor(exoticArmor, guardianClass, gameData.energy)}
                  selected={exotic}
                  onSelect={(id) => {
                    setExoticArmorId(id);
                    setExoticPreBuilt(false);
                  }}
                />
                {exoticHasPreBuilt && (
                  <span className="tile-wrap">
                    <button
                      type="button"
                      className="tile"
                      aria-pressed={exoticPreBuilt}
                      title="Kill buffs of the exotic stacked before the Damage Phase: active from 0 s for their duration, without refresh (one boss, no adds)."
                      onClick={() => setExoticPreBuilt((on) => !on)}
                    >
                      <span
                        className="icon ability-none"
                        style={{ width: 40, height: 40 }}
                      >
                        ↺
                      </span>
                      <span className="tile-label">Pre-stacked</span>
                    </button>
                  </span>
                )}
              </div>
              {exotic && (
                <ul className="note">
                  {describeExotic(exotic, effects, generatedExoticEffects).map(
                    (line) => (
                      <li key={line}>{line}</li>
                    ),
                  )}
                </ul>
              )}
              {pickerFor("mod", <h3 className="sub">Mods</h3>)}

              <h2>Stats</h2>
              {pickerFor("stat", null)}
              <StatSliders
                rows={ABILITY_KINDS.map((kind) => ({
                  kind,
                  label: ABILITY_KIND_LABELS[kind],
                  value: abilityStatInputs[kind],
                  max: MAX_ABILITY_STATS[kind],
                }))}
                onStat={(kind, value) =>
                  setAbilityStatInputs((current) => ({
                    ...current,
                    [kind]: value,
                  }))
                }
              />

              {pickerFor("artifact", <h2>Artifact</h2>)}

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
              <div className="results-head">
                {result ? (
                  <SummaryBar
                    rows={compareResults(
                      result,
                      comparisonResult ?? result,
                    ).filter(
                      (row) =>
                        row.key !== "ignitions" ||
                        hasIgnition(weapon) ||
                        (comparison !== null &&
                          hasIgnition(weaponById(comparison.weaponId))),
                    )}
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
                    {weapon.intrinsicParts.length > 0
                      ? "Ignitions and Taken Seeker are included, burn damage not yet."
                      : "Damage per shot is a measured average (Aegis) including the intrinsic; shots and timing from Aegis or Quantum."}
                  </InfoTip>
                </div>
                {initial.message && <p className="note">{initial.message}</p>}
              </div>

              {result && (
                <Tabs tabs={[...TABS]} active={tab} onChange={setTab}>
                  {tab === "overview" && (
                    <>
                      {comparison && comparisonResult && (
                        <div className="comparison">
                          <p className="note">
                            Comparison: {describeBuild(comparison)}. Same
                            Damage Phase ({seconds.format(damagePhaseSeconds)}{" "}
                            s).
                          </p>
                          <CompareCurveChart
                            current={damageCurve(result, damagePhaseSeconds)}
                            comparison={damageCurve(
                              comparisonResult,
                              damagePhaseSeconds,
                            )}
                          />
                        </div>
                      )}
                      {result.totalDamage > 0 && (
                        <DamageShareChart
                          entries={damageShares(result)}
                          abilityName={(id) =>
                            abilities.find((a) => a.id === id)?.name ?? id
                          }
                        />
                      )}
                      <DamageCurveChart
                        points={damageCurve(result, damagePhaseSeconds)}
                      />
                      <DpsByLengthChart
                        points={dpsPoints}
                        currentSeconds={damagePhaseSeconds}
                      />
                    </>
                  )}

                  {tab === "rotation" && (
                    <>
                      <RotationTimeline
                        rows={windows.map((w) => {
                          const effect = selected.find(
                            (e) => e.id === w.effectId,
                          )!;
                          return {
                            ...w,
                            label: effect.shortName,
                            iconUrl: iconUrl(
                              effectIconKey(effect, weapon.element),
                            ),
                          };
                        })}
                        abilityRows={castRows.map(({ ability, actualMs }) => ({
                          label: ability.name,
                          iconUrl: iconUrl(`ability:${ability.id}`),
                          kind: ability.kind,
                          castsMs: actualMs,
                          windows: result.superWindows.filter(
                            (w) => w.abilityId === ability.id,
                          ),
                        }))}
                        shotsMs={result.shots.map((s) => s.timeMs)}
                        ignitionsMs={result.damageInstances
                          .filter((d) => d.id === "ignition")
                          .map((d) => d.timeMs)}
                        damagePhaseSeconds={damagePhaseSeconds}
                      />
                      <RotationEditor
                        weaponElement={weapon.element}
                        effects={ownSelected}
                        windowInputOf={(effect) =>
                          windowInputs[effect.id] ?? defaultWindow(effect)
                        }
                        uptimeOf={(effect) =>
                          windows.find((w) => w.effectId === effect.id)?.uptime
                        }
                        onChange={setWindow}
                      />
                      <AbilityCastEditor
                        rows={castRows}
                        onChange={(ability, index, value) =>
                          updateCasts(ability.kind, (casts) =>
                            setCast(
                              casts,
                              index,
                              value * 1000,
                              damagePhaseSeconds * 1000,
                            ),
                          )
                        }
                        onAdd={(ability, atMs) =>
                          updateCasts(ability.kind, (casts) =>
                            addCast(casts, atMs),
                          )
                        }
                        onRemove={(ability, index) =>
                          updateCasts(ability.kind, (casts) =>
                            removeCast(casts, index),
                          )
                        }
                      />
                    </>
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
                    <>
                      <div className="toolbar">
                        <button
                          type="button"
                          onClick={runOptimizer}
                          disabled={optimizing}
                        >
                          {optimizing ? "Calculating …" : "Run optimizer"}
                        </button>
                        <InfoTip>
                          Tries every allowed combination of your own
                          effects for {CLASS_LABELS[guardianClass]} in all
                          subclasses. Fireteam Support and its windows
                          stay as set, your own effects run with
                          their default duration. Effects without benefit are left out.
                        </InfoTip>
                      </div>
                      {optimizer && optimizer.forKey !== optimizerKey && (
                        <p className="note">
                          This list is for an earlier build. Run the
                          optimizer again.
                        </p>
                      )}
                      {optimizer && (
                        <OptimizerCards
                          weaponElement={weapon.element}
                          entries={optimizer.entries}
                          guardianClass={guardianClass}
                          currentTotal={result.totalDamage}
                          onApply={(entry) => {
                            setSubclass(entry.subclass);
                            setSelections(entry.selections);
                            setAbilityChoice(choiceOf(entry));
                          }}
                          onCompare={(entry) => setComparison(buildOf(entry))}
                        />
                      )}
                    </>
                  )}
                </Tabs>
              )}
            </section>
          </>
        )}
      </main>
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

/** Breakdown tab: contribution per bucket as bars and as a table. */
const KIND_ORDER: AbilityKind[] = ["super", "grenade", "melee"];

function BreakdownPanel({
  weapon,
  result,
  damagePhaseSeconds,
  selected,
  options,
}: {
  weapon: Weapon;
  result: SimulationResult;
  damagePhaseSeconds: number;
  selected: Effect[];
  options: SimulationOptions;
}) {
  const entries = breakdown(
    weapon,
    damagePhaseSeconds,
    selected,
    buckets,
    options,
  );
  if (entries.length === 0) {
    return <p className="note">No multipliers selected.</p>;
  }
  // One column per damage source of the build: the weapon, then each ability (super, grenade, melee).
  const shares = damageShares(result);
  const castAbilities = [
    ...new Map(
      (options.abilities ?? []).map(({ ability }) => [ability.id, ability]),
    ).values(),
  ].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
  const columns = [
    {
      key: "weapon",
      abilityId: undefined as string | undefined,
      label: "Weapon",
      damage: shares
        .filter((s) => s.damageSource === "weapon")
        .reduce((sum, s) => sum + s.damage, 0),
    },
    ...castAbilities.map((ability) => ({
      key: ability.id,
      abilityId: ability.id as string | undefined,
      label: ability.name,
      damage: shares.find((s) => s.abilityId === ability.id)?.damage ?? 0,
    })),
  ];
  return (
    <>
      <BreakdownChart entries={entries} totalDamage={result.totalDamage} />
      <div className="table-scroll">
        <table className="breakdown">
          <thead>
            <tr>
              <th>Bucket</th>
              {columns.map((column) => (
                <th key={column.key} title={column.label}>
                  {column.abilityId ? (
                    <span className="column-head">
                      <Icon
                        iconKey={`ability:${column.abilityId}`}
                        label={column.label}
                        size={20}
                      />
                      {column.label}
                    </span>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              <th>Contribution</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.bucketId}>
                <td>{entry.name}</td>
                {columns.map((column) => {
                  const match = entry.multipliersBySource.find((m) =>
                    column.abilityId
                      ? m.abilityId === column.abilityId
                      : m.damageSource === "weapon",
                  );
                  return (
                    <td key={column.key} className={match ? "" : "muted"}>
                      {match ? `×${factor.format(match.multiplier)}` : "–"}
                    </td>
                  );
                })}
                <td>
                  +
                  {integer.format(
                    result.totalDamage - entry.totalDamageWithout,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>Damage</th>
              {columns.map((column) => (
                <th key={column.key}>{integer.format(column.damage)}</th>
              ))}
              <th>{integer.format(result.totalDamage)}</th>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="note">
        Multiplier while the effect is active. “–”: the bucket does not apply to
        this source. Contribution: Total Damage minus Total Damage without the bucket.
      </p>
    </>
  );
}

export default App;
