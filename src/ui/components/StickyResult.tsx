import { useEffect, useState } from "react";
import type { ComparisonRow } from "../../engine/analysis";
import { integer, signedPercent } from "../format";

/**
 * Narrow result line for narrow screens (the form stands above the result): shown while the
 * element `targetId` is not visible. CSS hides it on wide screens, where the result stands beside
 * the form.
 */
export function StickyResult({
  rows,
  withComparison,
  targetId,
}: {
  rows: ComparisonRow[];
  withComparison: boolean;
  targetId: string;
}) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry?.isIntersecting ?? true),
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  const shown = rows.filter((row) => row.key === "totalDamage" || row.key === "dps");
  if (visible || shown.length === 0) return null;
  return (
    <a className="sticky-result" href={`#${targetId}`} aria-label="Show the result">
      {shown.map((row) => (
        <span key={row.key}>
          <span className="muted">{row.key === "dps" ? "DPS" : "Total"}</span>{" "}
          <strong>{integer.format(row.a)}</strong>
          {withComparison && row.relative !== null && (
            <span className="delta"> {signedPercent.format(row.relative)}</span>
          )}
        </span>
      ))}
    </a>
  );
}
