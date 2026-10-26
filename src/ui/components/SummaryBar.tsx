import type { ComparisonRow } from "../../engine/analysis";
import { keywords } from "../data";
import { integer, signedPercent } from "../format";

const LABELS = {
  totalDamage: "Total Damage",
  dps: "DPS",
  shots: "Shots",
} as const;

// A keyword counter reads "Jolt procs": how often the keyword's damage fires in the phase.
const labelOf = (key: ComparisonRow["key"]) =>
  key in LABELS
    ? LABELS[key as keyof typeof LABELS]
    : `${keywords.find((k) => `keyword:${k.id}` === key)?.name ?? key} procs`;

/**
 * Key figures, always visible (like Path of Building), then a counter per keyword that fires.
 * With a comparison each figure shows the change as text, so the sign does not depend on color.
 */
export function SummaryBar({
  rows,
  withComparison,
}: {
  rows: ComparisonRow[];
  withComparison: boolean;
}) {
  return (
    <dl className="summary-bar">
      {rows.map((row) => (
        <div key={row.key} className="summary-item">
          <dt>{labelOf(row.key)}</dt>
          <dd>
            {integer.format(row.a)}
            {withComparison && row.relative !== null && (
              <span className="delta">
                {signedPercent.format(row.relative)} vs. comparison
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
