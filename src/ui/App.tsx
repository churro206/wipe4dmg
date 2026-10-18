import { useEffect, useMemo, useState } from "react";
import type {
  Build,
  Effect,
  EffectPart,
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
import { simulate } from "../engine/simulate";
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
  RankingChart,
  RotationTimeline,
} from "./Charts";
import { activities, bosses, buckets, effects, weapon } from "./data";
import {
  factor,
  integer,
  percent,
  seconds,
  signedInteger,
  signedPercent,
} from "./format";

const PROVIDER_GROUPS: { provider: ProviderKind; label: string }[] = [
  { provider: "subclass", label: "Subklasse" },
  { provider: "armor", label: "Rüstung" },
  { provider: "artifact", label: "Artefakt" },
  { provider: "fireteamSupport", label: "Fireteam Support" },
];
const GROUP_LABELS: Record<string, string> = {
  super: "ein Super",
  "solar-surge": "eine Surge-Stufe",
};
const COMPARISON_LABELS = {
  totalDamage: "Total Damage",
  dps: "DPS",
  shots: "Shots",
  ignitions: "Ignitions",
} as const;

// Number of builds the optimizer shows (US-08).
const OPTIMIZER_LIMIT = 15;

// Range of the DPS chart; it grows if the chosen damage phase is longer.
const DPS_CHART_MIN_SECONDS = 120;

function describePart(part: EffectPart): string {
  switch (part.type) {
    case "multiplier":
      return `×${factor.format(part.multiplier.value ?? NaN)}`;
    case "timing":
      return "keine Reloads";
    case "counterModifier":
      return `Scorch ×${factor.format(part.factor.value ?? NaN)}`;
  }
}

function describeEffect(effect: Effect, provider: ProviderKind): string {
  const parts = effect.parts.map(describePart).join(", ");
  const group =
    provider !== "fireteamSupport" && effect.exclusiveGroup
      ? ` · nur ${GROUP_LABELS[effect.exclusiveGroup] ?? effect.exclusiveGroup}`
      : "";
  return parts + group;
}

function App() {
  const [initial] = useState(() => stateFromLink(window.location.search));
  const [input, setInput] = useState(initial.input);
  const [bossId, setBossId] = useState("");
  const [guardianClass, setGuardianClass] = useState(initial.guardianClass);
  const [subclass, setSubclass] = useState(initial.subclass);
  const [optimizer, setOptimizer] = useState<{
    forKey: string;
    entries: OptimizerEntry[];
  } | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [selections, setSelections] = useState(initial.selections);
  const [catalyst, setCatalyst] = useState(initial.catalyst);
  const [windowInputs, setWindowInputs] = useState(initial.windowInputs);
  const [comparison, setComparison] = useState(initial.comparison);
  const [copiedLink, setCopiedLink] = useState("");

  const damagePhaseSeconds = Number(input);
  const isValid =
    input.trim() !== "" &&
    Number.isFinite(damagePhaseSeconds) &&
    damagePhaseSeconds >= 0;
  const selected = effectsOf(selections);
  const windowInputOf = (effect: Effect) =>
    windowInputs[effect.id] ?? defaultWindow(effect);
  const options = {
    catalyst,
    effectWindows: windowsFor(selected, windowInputs),
  };
  const result = isValid
    ? simulate(weapon, damagePhaseSeconds, selected, buckets, options)
    : null;
  const entries = isValid
    ? breakdown(weapon, damagePhaseSeconds, selected, buckets, options)
    : [];
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

  // Optimizer: own effects vary, fireteam support and its windows stay as set.
  const fireteamSelections = selections.filter(
    (s) => s.provider === "fireteamSupport",
  );
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
  const applyEntry = (entry: OptimizerEntry) => {
    setSubclass(entry.subclass);
    setSelections(entry.selections);
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
  const windows = isValid
    ? effectWindows(selected, damagePhaseSeconds, options)
    : [];
  const uptimeOf = (effect: Effect) =>
    windows.find((w) => w.effectId === effect.id)?.uptime;

  return (
    <main>
      <header>
        <h1>wipe4dmg</h1>
        <p>{weapon.name}</p>
      </header>

      <section className="settings">
        <h2>Damage Phase</h2>
        <label>
          Sekunden
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
        {boss?.description && <p className="note">{boss.description}</p>}

        <h2>Effects</h2>
        <label>
          Klasse
          <select
            value={guardianClass}
            onChange={(event) =>
              changeClass(event.target.value as GuardianClass)
            }
          >
            {(Object.keys(CLASS_LABELS) as GuardianClass[]).map((id) => (
              <option key={id} value={id}>
                {CLASS_LABELS[id]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Subklasse
          <select
            value={subclass}
            onChange={(event) => changeSubclass(event.target.value as Subclass)}
          >
            {(Object.keys(SUBCLASS_LABELS) as Subclass[]).map((id) => (
              <option key={id} value={id}>
                {SUBCLASS_LABELS[id]}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>Waffe</legend>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={catalyst}
              onChange={() => setCatalyst((on) => !on)}
            />
            Katalysator
            <span className="note">Taken Seeker</span>
          </label>
        </fieldset>
        {PROVIDER_GROUPS.map(({ provider, label }) => {
          const available = effectsFor(
            effects,
            provider,
            guardianClass,
            subclass,
          );
          if (available.length === 0) return null;
          return (
            <fieldset key={provider}>
              <legend>
                {provider === "subclass"
                  ? `${label} (${CLASS_LABELS[guardianClass]}, ${SUBCLASS_LABELS[subclass]})`
                  : label}
              </legend>
              {available.map((effect) => (
                <label key={effect.id} className="checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected(effect, provider)}
                    onChange={() =>
                      setSelections((current) =>
                        toggleSelection(current, effect, provider),
                      )
                    }
                  />
                  {effect.name}
                  <span className="note">
                    {describeEffect(effect, provider)}
                  </span>
                </label>
              ))}
            </fieldset>
          );
        })}

        {selected.length > 0 && (
          <>
            <h2>Rotation</h2>
            <table className="rotation">
              <thead>
                <tr>
                  <th>Effect</th>
                  <th>Start (s)</th>
                  <th>Dauer (s)</th>
                  <th>Uptime</th>
                </tr>
              </thead>
              <tbody>
                {selected.map((effect) => {
                  const windowInput = windowInputOf(effect);
                  const uptime = uptimeOf(effect);
                  return (
                    <tr key={effect.id}>
                      <td>{effect.name}</td>
                      <td>
                        <input
                          inputMode="decimal"
                          aria-label={`Start von ${effect.name} in Sekunden`}
                          value={windowInput.start}
                          onChange={(event) =>
                            setWindow(effect, { start: event.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          inputMode="decimal"
                          placeholder="bis Ende"
                          aria-label={`Dauer von ${effect.name} in Sekunden`}
                          value={windowInput.duration}
                          onChange={(event) =>
                            setWindow(effect, { duration: event.target.value })
                          }
                        />
                      </td>
                      <td>
                        {uptime === undefined ? "–" : percent.format(uptime)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="note">
              Dauer leer heißt: bis zum Ende der Damage Phase. Vorbelegt ist die
              Dauer aus den Daten. Frischt ein Mitspieler einen Effect auf, trag
              eine längere Dauer ein.
            </p>
          </>
        )}
      </section>

      <section className="results">
        <h2>Ergebnis</h2>
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
        </div>
        {initial.message && <p className="note">{initial.message}</p>}
        {result ? (
          <>
            <dl className="result">
              <dt>Total Damage</dt>
              <dd>{integer.format(result.totalDamage)}</dd>
              <dt>DPS</dt>
              <dd>{integer.format(result.dps)}</dd>
              <dt>Shots</dt>
              <dd>{result.shots.length}</dd>
              <dt>Ignitions</dt>
              <dd>
                {
                  result.damageInstances.filter((d) => d.id === "ignition")
                    .length
                }
              </dd>
            </dl>

            {comparison && comparisonResult && (
              <div className="comparison">
                <h2>Vergleich</h2>
                <p className="note">
                  Vergleich: {describeBuild(comparison)}. Gleiche Damage Phase (
                  {seconds.format(damagePhaseSeconds)} s).
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Kennzahl</th>
                      <th>Aktuell</th>
                      <th>Vergleich</th>
                      <th>Differenz</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareResults(result, comparisonResult).map((row) => (
                      <tr key={row.key}>
                        <td>{COMPARISON_LABELS[row.key]}</td>
                        <td>{integer.format(row.a)}</td>
                        <td>{integer.format(row.b)}</td>
                        <td>
                          {signedInteger.format(row.difference)}
                          {row.relative !== null &&
                            ` (${signedPercent.format(row.relative)})`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <CompareCurveChart
                  current={damageCurve(result, damagePhaseSeconds)}
                  comparison={damageCurve(comparisonResult, damagePhaseSeconds)}
                />
              </div>
            )}

            {result.totalDamage > 0 && (
              <DamageShareChart entries={damageByInstance(result)} />
            )}
            <DamageCurveChart
              points={damageCurve(result, damagePhaseSeconds)}
            />
            <RotationTimeline
              rows={windows.map((w) => ({
                ...w,
                label: selected.find((e) => e.id === w.effectId)!.shortName,
              }))}
              shotsMs={result.shots.map((s) => s.timeMs)}
              ignitionsMs={result.damageInstances
                .filter((d) => d.id === "ignition")
                .map((d) => d.timeMs)}
              damagePhaseSeconds={damagePhaseSeconds}
            />
            <DpsByLengthChart
              points={dpsPoints}
              currentSeconds={damagePhaseSeconds}
            />

            <h2>Optimizer</h2>
            <div className="toolbar">
              <button
                type="button"
                onClick={runOptimizer}
                disabled={optimizing}
              >
                {optimizing ? "Rechnet …" : "Optimizer starten"}
              </button>
            </div>
            <p className="note">
              Probiert alle erlaubten Kombinationen deiner eigenen Effects für{" "}
              {CLASS_LABELS[guardianClass]} in allen Subklassen. Fireteam
              Support und seine Zeitfenster bleiben wie eingestellt, eigene
              Effects laufen mit ihrer Standarddauer. Effects ohne Nutzen lässt
              er weg.
            </p>
            {optimizer && optimizer.forKey !== optimizerKey && (
              <p className="note">
                Die Liste gilt für einen früheren Stand. Starte den Optimizer
                neu.
              </p>
            )}
            {optimizer && optimizer.entries.length > 0 && (
              <>
                <RankingChart
                  entries={optimizer.entries.map((entry, i) => ({
                    label: `#${i + 1}`,
                    totalDamage: entry.totalDamage,
                  }))}
                  currentTotal={result.totalDamage}
                />
                <table className="ranking">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Subklasse und eigene Effects</th>
                      <th>Total Damage</th>
                      <th>zu aktuell</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {optimizer.entries.map((entry, i) => {
                      const own = effectsOf(
                        entry.selections.filter(
                          (s) => s.provider !== "fireteamSupport",
                        ),
                      );
                      const relative =
                        result.totalDamage > 0
                          ? entry.totalDamage / result.totalDamage - 1
                          : null;
                      return (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>
                            {SUBCLASS_LABELS[entry.subclass]}:{" "}
                            {own.length > 0
                              ? own.map((e) => e.shortName).join(" · ")
                              : "keine eigenen Effects"}
                          </td>
                          <td>{integer.format(entry.totalDamage)}</td>
                          <td>
                            {relative === null
                              ? "–"
                              : signedPercent.format(relative)}
                          </td>
                          <td>
                            <div className="row-actions">
                              <button
                                type="button"
                                onClick={() => applyEntry(entry)}
                              >
                                Übernehmen
                              </button>
                              <button
                                type="button"
                                onClick={() => setComparison(buildOf(entry))}
                              >
                                Als Vergleich
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}

            <h2>Breakdown</h2>
            {entries.length === 0 ? (
              <p className="note">Keine Multiplier gewählt.</p>
            ) : (
              <>
                <BreakdownChart
                  entries={entries}
                  totalDamage={result.totalDamage}
                />
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
                          +
                          {integer.format(
                            result.totalDamage - entry.totalDamageWithout,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        ) : (
          <p className="result">
            Gib eine Damage Phase ein oder wähle einen Boss.
          </p>
        )}
        <p className="note">
          Effects sind in ihrem Zeitfenster aus der Rotation aktiv. Ignitions
          sind enthalten, Burn-Schaden noch nicht.
        </p>
      </section>
    </main>
  );
}

export default App;
