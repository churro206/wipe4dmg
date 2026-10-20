import type { Effect, Element } from "../../data/schema";
import type { WindowInput } from "../buildState";
import { percent } from "../format";
import { effectIconKey } from "../describe";
import { Icon } from "./Icon";
import { InfoTip } from "./InfoTip";

/** Start, duration and uptime per selected effect (US-07). */
export function RotationEditor({
  effects,
  windowInputOf,
  uptimeOf,
  onChange,
  weaponElement,
}: {
  weaponElement: Element; // surge icons follow the element of the weapon
  effects: Effect[];
  windowInputOf: (effect: Effect) => WindowInput;
  uptimeOf: (effect: Effect) => number | undefined;
  onChange: (effect: Effect, patch: Partial<WindowInput>) => void;
}) {
  if (effects.length === 0) {
    return (
      <p className="note">Wähle Effects, um ihre Zeitfenster festzulegen.</p>
    );
  }
  return (
    <table className="rotation">
      <thead>
        <tr>
          <th>Effect</th>
          <th>Start (s)</th>
          <th>
            Dauer (s){" "}
            <InfoTip>
              Leer heißt: bis zum Ende der Damage Phase. Vorbelegt ist die Dauer
              aus den Daten. Frischt ein Mitspieler einen Effect auf, trag eine
              längere Dauer ein.
            </InfoTip>
          </th>
          <th>Uptime</th>
        </tr>
      </thead>
      <tbody>
        {effects.map((effect) => {
          const input = windowInputOf(effect);
          const uptime = uptimeOf(effect);
          return (
            <tr key={effect.id}>
              <td>
                <span className="cell-with-icon">
                  <Icon
                    iconKey={effectIconKey(effect, weaponElement)}
                    label={effect.shortName}
                    size={24}
                  />
                  {effect.shortName}
                </span>
              </td>
              <td>
                <input
                  inputMode="decimal"
                  aria-label={`Start von ${effect.name} in Sekunden`}
                  value={input.start}
                  onChange={(event) =>
                    onChange(effect, { start: event.target.value })
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
                    onChange(effect, { duration: event.target.value })
                  }
                />
              </td>
              <td>{uptime === undefined ? "–" : percent.format(uptime)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
