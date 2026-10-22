import type { ComparisonRow } from "../../engine/analysis";
import { integer, signedPercent } from "../format";

const LABELS = {
  totalDamage: "Total Damage",
  dps: "DPS",
  shots: "Shots",
  ignitions: "Ignitions",
} as const;

/**
 * Key figures, always visible (like Path of Building). With a comparison each figure shows the
 * change as text, so the sign does not depend on color.
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
          <dt>{LABELS[row.key]}</dt>
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
