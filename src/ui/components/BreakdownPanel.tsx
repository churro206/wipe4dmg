import type { AbilityKind, Effect, Weapon } from "../../data/schema";
import { damageShares } from "../../engine/analysis";
import { breakdown } from "../../engine/breakdown";
import type { SimulationOptions, SimulationResult } from "../../engine/simulate";
import { ABILITY_KINDS } from "../buildState";
import { BreakdownChart } from "../Charts";
import { buckets } from "../data";
import { factor, integer } from "../format";
import { Icon } from "./Icon";

const KIND_ORDER: AbilityKind[] = ABILITY_KINDS;

/** Breakdown tab: contribution per bucket as bars and as a table. */
export function BreakdownPanel({
  weapon,
  result,
  damagePhaseSeconds,
  selected,
  options,
}: {
  weapon: Weapon;
  result: SimulationResult;
  damagePhaseSeconds: number;
  selected: Effect[];
  options: SimulationOptions;
}) {
  const entries = breakdown(
    weapon,
    damagePhaseSeconds,
    selected,
    buckets,
    options,
  );
  if (entries.length === 0) {
    return <p className="note">No multipliers selected.</p>;
  }
  // One column per damage source of the build: the weapon, then each ability (super, grenade, melee).
  const shares = damageShares(result);
  const castAbilities = [
    ...new Map(
      (options.abilities ?? []).map(({ ability }) => [ability.id, ability]),
    ).values(),
  ].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
  const columns = [
    {
      key: "weapon",
      abilityId: undefined as string | undefined,
      label: "Weapon",
      damage: shares
        .filter((s) => s.damageSource === "weapon")
        .reduce((sum, s) => sum + s.damage, 0),
    },
    ...castAbilities.map((ability) => ({
      key: ability.id,
      abilityId: ability.id as string | undefined,
      label: ability.name,
      damage: shares.find((s) => s.abilityId === ability.id)?.damage ?? 0,
    })),
  ];
  return (
    <>
      <BreakdownChart entries={entries} totalDamage={result.totalDamage} />
      <div className="table-scroll">
        <table className="breakdown">
          <thead>
            <tr>
              <th>Bucket</th>
              {columns.map((column) => (
                <th key={column.key} title={column.label}>
                  {column.abilityId ? (
                    <span className="column-head">
                      <Icon
                        iconKey={`ability:${column.abilityId}`}
                        label={column.label}
                        size={20}
                      />
                      {column.label}
                    </span>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              <th>Contribution</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.bucketId}>
                <td>{entry.name}</td>
                {columns.map((column) => {
                  const match = entry.multipliersBySource.find((m) =>
                    column.abilityId
                      ? m.abilityId === column.abilityId
                      : m.damageSource === "weapon",
                  );
                  return (
                    <td key={column.key} className={match ? "" : "muted"}>
                      {match ? `×${factor.format(match.multiplier)}` : "–"}
                    </td>
                  );
                })}
                <td>
                  +
                  {integer.format(
                    result.totalDamage - entry.totalDamageWithout,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>Damage</th>
              {columns.map((column) => (
                <th key={column.key}>{integer.format(column.damage)}</th>
              ))}
              <th>{integer.format(result.totalDamage)}</th>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="note">
        Multiplier while the effect is active. “–”: the bucket does not apply to
        this source. Contribution: Total Damage minus Total Damage without the bucket.
      </p>
    </>
  );
}
