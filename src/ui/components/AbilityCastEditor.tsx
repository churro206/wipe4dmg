import type { Ability } from "../../data/schema";
import { ABILITY_KIND_LABELS } from "../buildState";
import { secondsInput } from "../format";
import { Icon } from "./Icon";
import { InfoTip } from "./InfoTip";

/** Cast times per chosen ability (ADR 0009): one field per cast, "+" adds one, "×" removes one. */
export function AbilityCastEditor({
  rows,
  onChange,
  onAdd,
  onRemove,
}: {
  rows: { ability: Ability; castsMs: number[] }[];
  onChange: (ability: Ability, index: number, seconds: number) => void;
  onAdd: (ability: Ability) => void;
  onRemove: (ability: Ability, index: number) => void;
}) {
  if (rows.length === 0) return null;
  return (
    <table className="rotation casts">
      <thead>
        <tr>
          <th>Ability</th>
          <th>
            Casts (s){" "}
            <InfoTip>
              Time of each cast from the start of the Damage Phase. The calculator
              does not check energy or cooldowns: only enter casts that are
              possible in game. The weapon does not fire during a Super.
            </InfoTip>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ ability, castsMs }) => (
          <tr key={ability.id}>
            <td>
              <span className="cell-with-icon">
                <Icon
                  iconKey={`ability:${ability.id}`}
                  label={ability.name}
                  size={24}
                />
                {ability.name}
                <span className="kind">{ABILITY_KIND_LABELS[ability.kind]}</span>
              </span>
            </td>
            <td>
              <span className="casts-list">
                {castsMs.map((ms, index) => (
                  <span key={`${index}-${ms}`} className="cast">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      defaultValue={secondsInput.format(ms / 1000).replace(",", ".")}
                      aria-label={`Cast ${index + 1} of ${ability.name} in seconds`}
                      onBlur={(event) => {
                        const value = Number(event.target.value);
                        if (Number.isFinite(value)) onChange(ability, index, value);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                      }}
                    />
                    {castsMs.length > 1 && (
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Remove cast ${index + 1} of ${ability.name}`}
                        onClick={() => onRemove(ability, index)}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Add a cast of ${ability.name}`}
                  onClick={() => onAdd(ability)}
                >
                  +
                </button>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
