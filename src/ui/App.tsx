import { useMemo, useState } from "react";
import rawBosses from "../data/bosses.json";
import rawBuckets from "../data/buckets.json";
import rawEffects from "../data/effects.json";
import type { Effect, EffectPart } from "../data/schema";
import raw from "../data/weapons/one-thousand-voices.json";
import {
  damageByInstance,
  damageCurve,
  dpsByDamagePhase,
} from "../engine/analysis";
import { breakdown } from "../engine/breakdown";
import { effectWindows, type EffectWindowInput } from "../engine/effectWindows";
import { loadBosses, loadBuckets, loadEffects } from "../engine/loadData";
import { loadWeapon } from "../engine/loadWeapon";
import { simulate } from "../engine/simulate";
import {
  BreakdownChart,
  DamageCurveChart,
  DamageShareChart,
  DpsByLengthChart,
  RotationTimeline,
} from "./Charts";

const weapon = loadWeapon(raw);
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const bosses = loadBosses(rawBosses).filter(
  (boss) => boss.damagePhaseSeconds.value !== null,
);
const activities = [...new Set(bosses.map((boss) => boss.activity))];

const CATEGORIES: { id: Effect["category"]; label: string }[] = [
  { id: "subclass", label: "Subklasse" },
  { id: "armor", label: "Rüstung" },
  { id: "artifact", label: "Artefakt" },
  { id: "fireteamSupport", label: "Fireteam Support" },
  { id: "weapon", label: "Waffe" },
];

// Range of the DPS chart; it grows if the chosen damage phase is longer.
const DPS_CHART_MIN_SECONDS = 120;

const integer = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const seconds = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat("de-DE", {
  style: "percent",
  maximumFractionDigits: 0,
});
const factor = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

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

type WindowInput = { start: string; duration: string };

/** Seconds from an input field; undefined if empty or invalid. Accepts a decimal comma. */
function secondsOf(text: string): number | undefined {
  const value = Number(text.replace(",", "."));
  return text.trim() !== "" && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

/** Default rotation input: start 0, duration from the data file or empty (until the end). */
function defaultWindow(effect: Effect): WindowInput {
  const durationMs = effect.durationMs?.value;
  return {
    start: "0",
    duration: durationMs == null ? "" : seconds.format(durationMs / 1000),
  };
}

function selectedEffects(ids: string[]): Effect[] {
  return effects.filter((effect) => ids.includes(effect.id));
}

/** Effect windows for the engine from the rotation inputs (seconds) of the selected effects. */
function windowsFor(
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

function App() {
  const [input, setInput] = useState("");
  const [bossId, setBossId] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [catalyst, setCatalyst] = useState(false);
  const [windowInputs, setWindowInputs] = useState<Record<string, WindowInput>>(
    {},
  );

  const damagePhaseSeconds = Number(input);
  const isValid =
    input.trim() !== "" &&
    Number.isFinite(damagePhaseSeconds) &&
    damagePhaseSeconds >= 0;
  const selected = selectedEffects(selectedIds);
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
  const dpsChartSeconds = Math.max(
    DPS_CHART_MIN_SECONDS,
    isValid ? Math.ceil(damagePhaseSeconds) : 0,
  );
  const dpsPoints = useMemo(() => {
    const chosen = selectedEffects(selectedIds);
    return dpsByDamagePhase(
      weapon,
      chosen,
      buckets,
      { catalyst, effectWindows: windowsFor(chosen, windowInputs) },
      Array.from({ length: dpsChartSeconds }, (_, i) => i + 1),
    );
  }, [selectedIds, windowInputs, catalyst, dpsChartSeconds]);

  const selectBoss = (id: string) => {
    setBossId(id);
    const chosen = bosses.find((b) => b.id === id);
    if (chosen) setInput(String(chosen.damagePhaseSeconds.value));
  };
  const setWindow = (effect: Effect, patch: Partial<WindowInput>) =>
    setWindowInputs((inputs) => ({
      ...inputs,
      [effect.id]: {
        ...(inputs[effect.id] ?? defaultWindow(effect)),
        ...patch,
      },
    }));
  const windows = isValid
    ? effectWindows(selected, damagePhaseSeconds, options)
    : [];
  const uptimeOf = (effect: Effect) =>
    windows.find((w) => w.effectId === effect.id)?.uptime;
  const toggle = (id: string) =>
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );

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
        {CATEGORIES.map((category) => {
          const inCategory = effects.filter((e) => e.category === category.id);
          if (inCategory.length === 0) return null;
          return (
            <fieldset key={category.id}>
              <legend>{category.label}</legend>
              {inCategory.map((effect) => (
                <label key={effect.id} className="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(effect.id)}
                    onChange={() => toggle(effect.id)}
                  />
                  {effect.name}
                  <span className="note">
                    {effect.parts.map(describePart).join(", ")}
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
                  const input = windowInputOf(effect);
                  const uptime = uptimeOf(effect);
                  return (
                    <tr key={effect.id}>
                      <td>{effect.name}</td>
                      <td>
                        <input
                          inputMode="decimal"
                          aria-label={`Start von ${effect.name} in Sekunden`}
                          value={input.start}
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
                          value={input.duration}
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

            {result.totalDamage > 0 && (
              <DamageShareChart entries={damageByInstance(result)} />
            )}
            <DamageCurveChart
              points={damageCurve(result, damagePhaseSeconds)}
            />
            <RotationTimeline
              rows={windows.map((w) => ({
                ...w,
                label: selected.find((e) => e.id === w.effectId)!.name,
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
