// Loads abilities.json (ADR 0009). An ability with a package gets its components from one Aegis row,
// so a new Aegis import updates it without copying values.
//
// Stat split: Aegis measured the package at the stat where the bonus starts (100) and at the maximum
// (200). The package is split into a part that scales with the ability stat and a fixed part, so that
// both measurements are met exactly; in between the stat scales linearly per point.

import {
  Ability,
  AbilityData,
  type AbilityComponent,
  type AbilityStatScaling,
  type AegisAbilityRow,
  type Source,
} from "../data/schema";
import { requireValue } from "./requireValue";

// Shares closer to 0 or 1 than this are treated as 0 or 1: Aegis rounds measured damage to whole
// numbers, e.g. Thundercrash 14694 / 10136 = x1.4497 instead of x1.45.
const SHARE_TOLERANCE = 0.01;

/** Validates the raw abilities Data File and resolves packages from the Aegis rows. */
export function loadAbilities(
  raw: unknown,
  aegisRows: AegisAbilityRow[],
  abilityStats: AbilityStatScaling[],
): Ability[] {
  return AbilityData.array()
    .parse(raw)
    .map(({ components, ...ability }) =>
      Ability.parse({
        ...ability,
        components: ability.package
          ? packageComponents(
              ability.id,
              ability.aegisRowId!,
              ability.kind,
              aegisRows,
              abilityStats,
            )
          : (components ?? []),
      }),
    );
}

function packageComponents(
  abilityId: string,
  aegisRowId: string,
  kind: AbilityStatScaling["kind"],
  aegisRows: AegisAbilityRow[],
  abilityStats: AbilityStatScaling[],
): AbilityComponent[] {
  const row = aegisRows.find((r) => r.id === aegisRowId);
  if (!row) throw new Error(`${abilityId}: unknown Aegis row "${aegisRowId}"`);
  const atStat100 = requireValue(
    row.perUseStat100,
    `${aegisRowId} perUseStat100`,
  );
  const scaling = abilityStats.find((s) => s.kind === kind);
  if (!scaling) throw new Error(`${abilityId}: no stat scaling for "${kind}"`);
  const statFactor =
    1 +
    requireValue(scaling.damagePerPoint, "damagePerPoint") *
      (scaling.maxStat - scaling.bonusFromStat);

  const atStat200 = row.perUseStat200.value;
  const share =
    atStat200 === null
      ? 1
      : clampShare((atStat200 / atStat100 - 1) / (statFactor - 1));
  const valueSource = (note: string): Source => ({
    ...row.perUseStat100.source,
    status: atStat200 === null ? "unverified" : row.perUseStat100.source.status,
    note: `${row.perUseStat100.source.note ?? ""}; package ${aegisRowId}: ${note}`,
  });
  const modelSource: Source = {
    name: "Package model (ADR 0009)",
    retrieved: row.perUseStat100.source.retrieved,
    status: "unverified",
    note: "All damage at the cast; the time profile of the package is not modelled.",
  };
  const component = (
    id: string,
    name: string,
    damage: number,
    scales: boolean,
    note: string,
  ) => ({
    id,
    name,
    delayMs: { value: 0, source: modelSource },
    damagePerTick: { value: damage, source: valueSource(note) },
    ticks: { value: 1, source: modelSource },
    tickIntervalMs: { value: 0, source: modelSource },
    scalesWithAbilityStat: scales,
    includedEffectIds: row.includedEffectIds,
  });

  if (atStat200 === null) {
    return [
      component(
        "package",
        "Package",
        atStat100,
        true,
        "no value at stat 200, assumed to scale fully",
      ),
    ];
  }
  if (share === 1) {
    return [
      component(
        "package",
        "Package",
        atStat100,
        true,
        "scales fully with the ability stat",
      ),
    ];
  }
  if (share === 0) {
    return [
      component(
        "package",
        "Package",
        atStat100,
        false,
        "does not scale with the ability stat",
      ),
    ];
  }
  const percent = Math.round(share * 100);
  return [
    component(
      "package",
      "Package",
      atStat100 * share,
      true,
      `${percent}% scale with the ability stat`,
    ),
    component(
      "packageFixed",
      "Package (fixed part)",
      atStat100 * (1 - share),
      false,
      `${100 - percent}% fixed`,
    ),
  ];
}

function clampShare(share: number): number {
  if (share >= 1 - SHARE_TOLERANCE) return 1;
  if (share <= SHARE_TOLERANCE) return 0;
  return share;
}
