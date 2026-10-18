import { useEffect, useMemo, useState } from "react";
import type {
  Build,
  Effect,
  GuardianClass,
  ProviderKind,
  Subclass,
} from "../data/schema";
import {
  compareResults,
  damageByInstance,
  damageCurve,
  dpsByDamagePhase,
} from "../engine/analysis";
import { breakdown } from "../engine/breakdown";
import { effectWindows } from "../engine/effectWindows";
import { optimize, type OptimizerEntry } from "../engine/optimizer";
import { effectsFor } from "../engine/providers";
import { simulate, type SimulationResult } from "../engine/simulate";
import type { SimulationOptions } from "../engine/simulate";
import {
  CLASS_LABELS,
  defaultWindow,
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
import { EffectPicker } from "./components/EffectPicker";
import { Icon } from "./components/Icon";
import { InfoTip } from "./components/InfoTip";
import { OptimizerCards } from "./components/OptimizerCards";
import { RotationEditor } from "./components/RotationEditor";
import { SegmentedControl } from "./components/SegmentedControl";
import { SummaryBar } from "./components/SummaryBar";
import { Tabs } from "./components/Tabs";
import { activities, bosses, buckets, effects, iconUrl, weapon } from "./data";
import { PROVIDER_LABELS } from "./describe";
import { factor, integer, seconds } from "./format";

const OWN_PROVIDERS: ProviderKind[] = ["subclass", "armor", "artifact"];
const TABS = [
  { id: "overview", label: "Übersicht" },
  { id: "rotation", label: "Rotation" },
  { id: "breakdown", label: "Breakdown" },
  { id: "optimizer", label: "Optimizer" },
] as const;
type TabId = (typeof TABS)[number]["id"];

// Number of builds the optimizer shows (US-08).
const OPTIMIZER_LIMIT = 15;
// Range of the DPS chart; it grows if the chosen damage phase is longer.
const DPS_CHART_MIN_SECONDS = 120;

const isFireteam = (s: { provider: ProviderKind }) =>
  s.provider === "fireteamSupport";

function App() {
  const [initial] = useState(() => stateFromLink(window.location.search));
  const [input, setInput] = useState(initial.input);
  const [bossId, setBossId] = useState("");
  const [guardianClass, setGuardianClass] = useState(initial.guardianClass);
  const [subclass, setSubclass] = useState(initial.subclass);
  const [selections, setSelections] = useState(initial.selections);
  const [catalyst, setCatalyst] = useState(initial.catalyst);
  const [windowInputs, setWindowInputs] = useState(initial.windowInputs);
  const [comparison, setComparison] = useState(initial.comparison);
  const [copiedLink, setCopiedLink] = useState("");
  const [tab, setTab] = useState<TabId>("overview");
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
  const selected = effectsOf(selections);
  const options = {
    catalyst,
    effectWindows: windowsFor(selected, windowInputs),
  };
  const result = isValid
    ? simulate(weapon, damagePhaseSeconds, selected, buckets, options)
    : null;
  const boss = bosses.find((b) => b.id === bossId);

  const currentBuild: Build = {
    weaponId: weapon.id,
    guardianClass,
    subclass,
    catalyst,
    selections,
    effectWindows: options.effectWindows,
    damagePhaseSeconds: isValid ? damagePhaseSeconds : 0,
  };
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
  const comparisonResult =
    isValid && comparison
      ? simulate(
          weapon,
          damagePhaseSeconds,
          effectsOf(comparison.selections),
          buckets,
          {
            catalyst: comparison.catalyst,
            effectWindows: comparison.effectWindows,
          },
        )
      : null;

  const dpsChartSeconds = Math.max(
    DPS_CHART_MIN_SECONDS,
    isValid ? Math.ceil(damagePhaseSeconds) : 0,
  );
  const dpsPoints = useMemo(() => {
    const chosen = effectsOf(selections);
    return dpsByDamagePhase(
      weapon,
      chosen,
      buckets,
      { catalyst, effectWindows: windowsFor(chosen, windowInputs) },
      Array.from({ length: dpsChartSeconds }, (_, i) => i + 1),
    );
  }, [selections, windowInputs, catalyst, dpsChartSeconds]);

  const selectBoss = (id: string) => {
    setBossId(id);
    const chosen = bosses.find((b) => b.id === id);
    if (chosen) setInput(String(chosen.damagePhaseSeconds.value));
  };
  const changeClass = (next: GuardianClass) => {
    setGuardianClass(next);
    setSelections((current) => selectionsFor(current, next, subclass));
  };
  const changeSubclass = (next: Subclass) => {
    setSubclass(next);
    setSelections((current) => selectionsFor(current, guardianClass, next));
  };
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
  const toggle = (effect: Effect, provider: ProviderKind) =>
    setSelections((current) => toggleSelection(current, effect, provider));
  const windows = isValid
    ? effectWindows(selected, damagePhaseSeconds, options)
    : [];

  // Optimizer: own effects vary, fireteam support and its windows stay as set.
  const fireteamSelections = selections.filter(isFireteam);
  const fixedWindows = windowsFor(effectsOf(fireteamSelections), windowInputs);
  // The ranking depends only on these inputs, not on the own effects.
  const optimizerKey = JSON.stringify({
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
        effects,
        guardianClass,
        fixedSelections: fireteamSelections,
        fixedWindows,
        catalyst,
        damagePhaseSeconds,
        limit: OPTIMIZER_LIMIT,
      });
      setOptimizer({ forKey: optimizerKey, entries });
      setOptimizing(false);
    });
  };
  const buildOf = (entry: OptimizerEntry): Build => ({
    ...currentBuild,
    subclass: entry.subclass,
    selections: entry.selections,
    effectWindows: windowsFor(effectsOf(entry.selections), windowInputs),
  });

  return (
    <>
      <main>
        <header>
          <Icon iconKey={`weapon:${weapon.id}`} label={weapon.name} size={48} />
          <div>
            <h1>wipe4dmg</h1>
            <p>{weapon.name}</p>
          </div>
        </header>

        <section className="settings" aria-label="Build">
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
                <option value="">– eigene Eingabe –</option>
                {activities.map((activity) => (
                  <optgroup key={activity} label={activity}>
                    {bosses
                      .filter((b) => b.activity === activity)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} (
                          {seconds.format(b.damagePhaseSeconds.value ?? NaN)} s)
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>
          </div>
          {boss?.description && <p className="note">{boss.description}</p>}

          <h2>Klasse</h2>
          <SegmentedControl
            label="Klasse"
            options={(Object.keys(CLASS_LABELS) as GuardianClass[]).map(
              (id) => ({ value: id, label: CLASS_LABELS[id] }),
            )}
            value={guardianClass}
            onChange={changeClass}
          />
          <h2>Subklasse</h2>
          <SegmentedControl
            label="Subklasse"
            options={(Object.keys(SUBCLASS_LABELS) as Subclass[]).map((id) => ({
              value: id,
              label: SUBCLASS_LABELS[id],
              iconKey: `subclass:${guardianClass}:${id}`,
            }))}
            value={subclass}
            onChange={changeSubclass}
          />

          <h2>Waffe</h2>
          <div className="tile-grid">
            <span className="tile-wrap">
              <button
                type="button"
                className="tile"
                aria-pressed={catalyst}
                onClick={() => setCatalyst((on) => !on)}
              >
                <Icon iconKey={`catalyst:${weapon.id}`} label="Katalysator" />
                <span className="tile-label">Katalysator</span>
              </button>
            </span>
          </div>

          {OWN_PROVIDERS.map((provider) => {
            const available = effectsFor(
              effects,
              provider,
              guardianClass,
              subclass,
            );
            if (available.length === 0) return null;
            return (
              <div key={provider}>
                <h2>{PROVIDER_LABELS[provider]}</h2>
                <EffectPicker
                  effects={available}
                  provider={provider}
                  isSelected={(effect) => isSelected(effect, provider)}
                  onToggle={(effect) => toggle(effect, provider)}
                />
              </div>
            );
          })}

          <details
            className="fireteam"
            open={fireteamOpen}
            onToggle={(event) => setFireteamOpen(event.currentTarget.open)}
          >
            <summary>
              {PROVIDER_LABELS.fireteamSupport}
              {fireteamSelections.length > 0 &&
                ` (${fireteamSelections.length} gewählt)`}
            </summary>
            <EffectPicker
              effects={effectsFor(effects, "fireteamSupport", guardianClass)}
              provider="fireteamSupport"
              isSelected={(effect) => isSelected(effect, "fireteamSupport")}
              onToggle={(effect) => toggle(effect, "fireteamSupport")}
            />
          </details>
        </section>

        <section className="results" aria-label="Ergebnis">
          <div className="results-head">
            {result ? (
              <SummaryBar
                rows={compareResults(result, comparisonResult ?? result)}
                withComparison={comparisonResult !== null}
              />
            ) : (
              <p className="result">
                Gib eine Damage Phase ein oder wähle einen Boss.
              </p>
            )}
            <div className="toolbar">
              <button type="button" onClick={copyLink} disabled={!link}>
                {copiedLink !== "" && copiedLink === link
                  ? "Link kopiert"
                  : "Link kopieren"}
              </button>
              {comparison ? (
                <button type="button" onClick={() => setComparison(null)}>
                  Vergleich entfernen
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setComparison(currentBuild)}
                  disabled={!isValid}
                >
                  Als Vergleich festhalten
                </button>
              )}
              <InfoTip>
                Effects wirken in ihrem Zeitfenster aus der Rotation. Ignitions
                und Taken Seeker sind enthalten, Burn-Schaden noch nicht.
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
                        Vergleich: {describeBuild(comparison)}. Gleiche Damage
                        Phase ({seconds.format(damagePhaseSeconds)} s).
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
                    <DamageShareChart entries={damageByInstance(result)} />
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
                      const effect = selected.find((e) => e.id === w.effectId)!;
                      return {
                        ...w,
                        label: effect.shortName,
                        iconUrl: iconUrl(`effect:${effect.id}`),
                      };
                    })}
                    shotsMs={result.shots.map((s) => s.timeMs)}
                    ignitionsMs={result.damageInstances
                      .filter((d) => d.id === "ignition")
                      .map((d) => d.timeMs)}
                    damagePhaseSeconds={damagePhaseSeconds}
                  />
                  <RotationEditor
                    effects={selected}
                    windowInputOf={(effect) =>
                      windowInputs[effect.id] ?? defaultWindow(effect)
                    }
                    uptimeOf={(effect) =>
                      windows.find((w) => w.effectId === effect.id)?.uptime
                    }
                    onChange={setWindow}
                  />
                </>
              )}

              {tab === "breakdown" && (
                <BreakdownPanel
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
                      {optimizing ? "Rechnet …" : "Optimizer starten"}
                    </button>
                    <InfoTip>
                      Probiert alle erlaubten Kombinationen deiner eigenen
                      Effects für {CLASS_LABELS[guardianClass]} in allen
                      Subklassen. Fireteam Support und seine Zeitfenster bleiben
                      wie eingestellt, eigene Effects laufen mit ihrer
                      Standarddauer. Effects ohne Nutzen lässt er weg.
                    </InfoTip>
                  </div>
                  {optimizer && optimizer.forKey !== optimizerKey && (
                    <p className="note">
                      Die Liste gilt für einen früheren Stand. Starte den
                      Optimizer neu.
                    </p>
                  )}
                  {optimizer && (
                    <OptimizerCards
                      entries={optimizer.entries}
                      guardianClass={guardianClass}
                      currentTotal={result.totalDamage}
                      onApply={(entry) => {
                        setSubclass(entry.subclass);
                        setSelections(entry.selections);
                      }}
                      onCompare={(entry) => setComparison(buildOf(entry))}
                    />
                  )}
                </>
              )}
            </Tabs>
          )}
        </section>
      </main>
      <footer>
        Destiny-Inhalte und Icons © Bungie. Werte aus Community-Quellen (Quantum
        Damage-ics, Aegis, Destiny Data Compendium, Court).
      </footer>
    </>
  );
}

/** Breakdown tab: contribution per bucket as bars and as a table. */
function BreakdownPanel({
  result,
  damagePhaseSeconds,
  selected,
  options,
}: {
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
    return <p className="note">Keine Multiplier gewählt.</p>;
  }
  return (
    <>
      <BreakdownChart entries={entries} totalDamage={result.totalDamage} />
      <table>
        <thead>
          <tr>
            <th>Bucket</th>
            <th>Multiplier (aktiv)</th>
            <th>Total ohne</th>
            <th>Beitrag</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.bucketId}>
              <td>{entry.name}</td>
              <td>×{factor.format(entry.multiplier)}</td>
              <td>{integer.format(entry.totalDamageWithout)}</td>
              <td>
                +{integer.format(result.totalDamage - entry.totalDamageWithout)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default App;
