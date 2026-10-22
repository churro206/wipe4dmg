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
      <p className="note">Pick effects to set their windows.</p>
    );
  }
  return (
    <table className="rotation">
      <thead>
        <tr>
          <th>Effect</th>
          <th>Start (s)</th>
          <th>
            Duration (s){" "}
            <InfoTip>
              Empty means until the end of the Damage Phase. The default is the
              duration from the data. If a teammate refreshes an effect, enter a
              longer duration.
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
                  aria-label={`Start of ${effect.name} in seconds`}
                  value={input.start}
                  onChange={(event) =>
                    onChange(effect, { start: event.target.value })
                  }
                />
              </td>
              <td>
                <input
                  inputMode="decimal"
                  placeholder="to end"
                  aria-label={`Duration of ${effect.name} in seconds`}
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
