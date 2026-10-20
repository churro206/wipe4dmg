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
          <th>Fähigkeit</th>
          <th>
            Einsätze (s){" "}
            <InfoTip>
              Zeitpunkt jedes Einsatzes ab Beginn der Damage Phase. Energie und
              Cooldowns prüft der Rechner nicht: Trag nur Einsätze ein, die im
              Spiel möglich sind. Während eines Supers feuert die Waffe nicht.
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
                      aria-label={`Einsatz ${index + 1} von ${ability.name} in Sekunden`}
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
                        aria-label={`Einsatz ${index + 1} von ${ability.name} entfernen`}
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
                  aria-label={`Einsatz von ${ability.name} hinzufügen`}
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
