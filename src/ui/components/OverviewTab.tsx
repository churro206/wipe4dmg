import type { Build, Effect } from "../../data/schema";
import {
  damageByMultiplier,
  damageCurve,
  damageShares,
  type dpsByDamagePhase,
} from "../../engine/analysis";
import type { SimulationResult } from "../../engine/simulate";
import { describeBuild } from "../buildState";
import {
  CompareCurveChart,
  DamageCurveChart,
  DamageShareChart,
  DpsByLengthChart,
} from "../Charts";
import { abilities } from "../data";
import { seconds } from "../format";

/** Overview tab: damage by source, damage over time and DPS by Damage Phase length. */
export function OverviewTab({
  result,
  comparison,
  comparisonResult,
  withoutCatalyst,
  selected,
  dpsPoints,
  damagePhaseSeconds,
}: {
  result: SimulationResult;
  comparison: Build | null;
  comparisonResult: SimulationResult | null;
  withoutCatalyst: SimulationResult | undefined;
  selected: Effect[];
  dpsPoints: ReturnType<typeof dpsByDamagePhase>;
  damagePhaseSeconds: number;
}) {
  return (
    <>
      {comparison && comparisonResult && (
        <div className="comparison">
          <p className="note">
            Comparison: {describeBuild(comparison)}. Same Damage Phase (
            {seconds.format(damagePhaseSeconds)} s).
          </p>
          <CompareCurveChart
            current={damageCurve(result, damagePhaseSeconds)}
            comparison={damageCurve(comparisonResult, damagePhaseSeconds)}
          />
        </div>
      )}
      {result.totalDamage > 0 && (
        <DamageShareChart
          entries={damageShares(result)}
          multipliers={damageByMultiplier(result, withoutCatalyst)}
          abilityName={(id) =>
            abilities.find((a) => a.id === id)?.name ??
            // damage of its own from an effect, e.g. Storm's Keep (rule H)
            selected.find((e) => e.id === id)?.name ??
            id
          }
        />
      )}
      <DamageCurveChart points={damageCurve(result, damagePhaseSeconds)} />
      <DpsByLengthChart points={dpsPoints} currentSeconds={damagePhaseSeconds} />
    </>
  );
}
