import type { Ability } from "../../data/schema";
import { ABILITY_KIND_LABELS } from "../buildState";
import { seconds, secondsInput } from "../format";
import { Icon } from "./Icon";
import { InfoTip } from "./InfoTip";

// A cast counts as moved if the energy shifts it by more than this; below it is rounding.
const MOVED_MS = 50;

/**
 * Cast times per chosen ability (ADR 0009): one field per cast, "+" adds one at the earliest time
 * the energy allows, "×" removes one. A cast the energy moves or drops shows its actual time (block 3).
 */
export function AbilityCastEditor({
  rows,
  onChange,
  onAdd,
  onRemove,
}: {
  rows: {
    ability: Ability;
    castsMs: number[]; // as entered, sorted
    actualMs: number[]; // as the energy allows; shorter if casts are dropped
    nextMs: number | undefined; // earliest time of one more cast
  }[];
  onChange: (ability: Ability, index: number, seconds: number) => void;
  onAdd: (ability: Ability, atMs: number) => void;
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
              Time of each cast from the start of the Damage Phase. Every ability starts
              charged. A cast before its energy is back moves to the time it is back, from
              the cooldown, the stat and the energy your exotic, aspects and fragments give.
              "+" adds a cast at the earliest time. The weapon does not fire during a Super.
            </InfoTip>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ ability, castsMs, actualMs, nextMs }) => (
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
                    {index >= actualMs.length ? (
                      <span className="cast-note" title="No energy for this cast in the Damage Phase">
                        no energy
                      </span>
                    ) : (
                      Math.abs(actualMs[index] - ms) > MOVED_MS && (
                        <span className="cast-note" title="Moved to the time the energy is back">
                          → {seconds.format(actualMs[index] / 1000)}
                        </span>
                      )
                    )}
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
                  title={
                    nextMs === undefined
                      ? "No energy for another cast in this Damage Phase"
                      : `Next cast possible at ${seconds.format(nextMs / 1000)} s`
                  }
                  disabled={nextMs === undefined}
                  onClick={() => nextMs !== undefined && onAdd(ability, nextMs)}
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
