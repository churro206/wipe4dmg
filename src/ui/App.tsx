import { useState } from "react";
import raw from "../data/weapons/one-thousand-voices.json";
import { loadWeapon } from "../engine/loadWeapon";
import { simulate } from "../engine/simulate";

const weapon = loadWeapon(raw);

function App() {
  const [input, setInput] = useState("");
  const damagePhaseSeconds = Number(input);
  const isValid =
    input.trim() !== "" &&
    Number.isFinite(damagePhaseSeconds) &&
    damagePhaseSeconds >= 0;

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

      <p className="result">
        {isValid
          ? `Shots: ${simulate(weapon, damagePhaseSeconds).length}`
          : "Gib eine Damage Phase in Sekunden ein."}
      </p>
      <p className="note">Reserves nicht berücksichtigt</p>
    </main>
  );
}

export default App;
