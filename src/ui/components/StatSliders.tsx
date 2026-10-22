import type { AbilityKind } from "../../data/schema";

export type StatRow = {
  kind: AbilityKind;
  label: string; // e.g. "Super"
  value: number;
  max: number;
};

/** Ability stats as one block like the character screen: name, slider and number per row. */
export function StatSliders({
  rows,
  onStat,
}: {
  rows: StatRow[];
  onStat: (kind: AbilityKind, value: number) => void;
}) {
  return (
    <div className="stat-rows">
      {rows.map((row) => (
        <label key={row.kind} className="ability-stat">
          <span>{row.label}</span>
          <input
            type="range"
            min={0}
            max={row.max}
            step={1}
            value={row.value}
            aria-label={`${row.label} stat`}
            onChange={(event) => onStat(row.kind, Number(event.target.value))}
          />
          <input
            type="number"
            min={0}
            max={row.max}
            step={1}
            value={row.value}
            aria-label={`${row.label} stat as a number`}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isFinite(value)) {
                onStat(row.kind, Math.min(row.max, Math.max(0, value)));
              }
            }}
          />
        </label>
      ))}
    </div>
  );
}
