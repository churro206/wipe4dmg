import { useState } from "react";
import raw from "../data/weapons/one-thousand-voices.json";
import { loadWeapon } from "../engine/loadWeapon";
import { simulate } from "../engine/simulate";

const weapon = loadWeapon(raw);
const numberFormat = new Intl.NumberFormat("de-DE");

function App() {
  const [input, setInput] = useState("");
  const damagePhaseSeconds = Number(input);
  const isValid =
    input.trim() !== "" &&
    Number.isFinite(damagePhaseSeconds) &&
    damagePhaseSeconds >= 0;
  const result = isValid ? simulate(weapon, damagePhaseSeconds) : null;

  return (
    <main>
      <h1>wipe4dmg</h1>
      <p>{weapon.name}</p>

      <label>
        Damage Phase (s)
        <input
          type="number"
          min="0"
          step="any"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </label>

      {result ? (
        <dl className="result">
          <dt>Total Damage</dt>
          <dd>{numberFormat.format(result.totalDamage)}</dd>
          <dt>Shots</dt>
          <dd>{result.shots.length}</dd>
        </dl>
      ) : (
        <p className="result">Gib eine Damage Phase in Sekunden ein.</p>
      )}
      <p className="note">
        Ohne Effekte. Ignitions sind enthalten, Burn-Schaden noch nicht.
      </p>
    </main>
  );
}

export default App;
