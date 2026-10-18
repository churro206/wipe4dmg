import { useState } from "react";
import rawBosses from "../data/bosses.json";
import rawBuckets from "../data/buckets.json";
import rawEffects from "../data/effects.json";
import type { Effect, EffectPart } from "../data/schema";
import raw from "../data/weapons/one-thousand-voices.json";
import { breakdown } from "../engine/breakdown";
import { loadBosses, loadBuckets, loadEffects } from "../engine/loadData";
import { loadWeapon } from "../engine/loadWeapon";
import { simulate } from "../engine/simulate";

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

const integer = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const seconds = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
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

function App() {
  const [input, setInput] = useState("");
  const [bossId, setBossId] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [catalyst, setCatalyst] = useState(false);

  const damagePhaseSeconds = Number(input);
  const isValid =
    input.trim() !== "" &&
    Number.isFinite(damagePhaseSeconds) &&
    damagePhaseSeconds >= 0;
  const selected = effects.filter((effect) => selectedIds.includes(effect.id));
  const result = isValid
    ? simulate(weapon, damagePhaseSeconds, selected, buckets, { catalyst })
    : null;
  const entries = isValid
    ? breakdown(weapon, damagePhaseSeconds, selected, buckets, { catalyst })
    : [];
  const boss = bosses.find((b) => b.id === bossId);

  const selectBoss = (id: string) => {
    setBossId(id);
    const chosen = bosses.find((b) => b.id === id);
    if (chosen) setInput(String(chosen.damagePhaseSeconds.value));
  };
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

            <h2>Breakdown</h2>
            {entries.length === 0 ? (
              <p className="note">Keine Multiplier gewählt.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Bucket</th>
                    <th>Multiplier</th>
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
            )}
          </>
        ) : (
          <p className="result">
            Gib eine Damage Phase ein oder wähle einen Boss.
          </p>
        )}
        <p className="note">
          Alle gewählten Effects sind die ganze Damage Phase aktiv. Ignitions
          sind enthalten, Burn-Schaden noch nicht.
        </p>
      </section>
    </main>
  );
}

export default App;
