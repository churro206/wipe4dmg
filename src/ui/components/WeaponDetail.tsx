import { useMemo } from "react";
import { damageCurve } from "../../engine/analysis";
import { DamageCurveChart, RotationTimeline } from "../Charts";
import { weaponById } from "../data";
import { bareWeaponRun } from "../weaponBuild";
import { magazineChain } from "../weaponTimeline";
import type { WeaponRow } from "../weaponRanking";

const STATE_LABEL = { rule: "In the model", notModelled: "Left out", open: "Not in yet" } as const;

/**
 * An expanded row of the weapon table: the Clarity sentences with their state, the assumptions of
 * the Aegis rows, and the timeline of the bare weapon (shots, reloads, refills, keyword damage and
 * the damage curve) from buildSimulation. It is only built once the row is open.
 */
export function WeaponDetail({ weapon: row, seconds }: { weapon: WeaponRow; seconds: number }) {
  const run = useMemo(() => {
    const weapon = weaponById(row.id);
    if (weapon.id !== row.id) return null; // an unknown id falls back to the default weapon
    return bareWeaponRun(weapon, false, seconds); // the build of the table, see weaponBuild.ts
  }, [row.id, seconds]);

  const chain = run ? magazineChain(run) : [];

  return (
    <div className="ranking-detail">
      <div className="ranking-detail-texts">
        <h4>Clarity sentences</h4>
        {row.sentences.length === 0 ? (
          <p className="ranking-none">No sentence with a number.</p>
        ) : (
          <ul>
            {row.sentences.map((s) => (
              <li key={s.text} data-state={s.state}>
                <strong>{STATE_LABEL[s.state]}:</strong> {s.text}
                {s.reason && <span className="ranking-comes"> ({s.reason})</span>}
              </li>
            ))}
          </ul>
        )}
        <h4>Aegis assumptions</h4>
        {row.aegis.rows.length === 0 ? (
          <p className="ranking-none">No Aegis row ({row.aegis.check}).</p>
        ) : (
          <ul>
            {row.aegis.rows.map((r) => (
              <li key={r.row}>
                {r.row}: {r.assumptions.length === 0 ? "no assumptions" : r.assumptions.join(", ")}
              </li>
            ))}
          </ul>
        )}
      </div>
      {run && (
        <div className="ranking-detail-charts">
          {chain.length > 1 && (
            <p className="ranking-chain">
              Magazines in {seconds} s: {chain.join(", ")} shots
              {run.refillsMs.length > 0 && ` (${run.refillsMs.length} refills without a reload)`}
            </p>
          )}
          <RotationTimeline
            rows={[]}
            abilityRows={[]}
            shotsMs={run.shots.map((s) => s.timeMs)}
            procRows={[
              ...(run.reloadsMs.length > 0
                ? [{ label: "Reloads", color: "var(--muted)", timesMs: run.reloadsMs }]
                : []),
              ...(run.refillsMs.length > 0
                ? [{ label: "Magazine refills", color: "var(--accent)", timesMs: run.refillsMs }]
                : []),
            ]}
            damagePhaseSeconds={seconds}
          />
          <DamageCurveChart points={damageCurve(run, seconds)} />
        </div>
      )}
    </div>
  );
}
