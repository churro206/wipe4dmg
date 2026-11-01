// Timing of a weapon package (ADR 0013): from Aegis "Sustained" or Quantum, with and without the
// catalyst, and the override that lengthens it. Own file so that items/ can use it without
// importing the package builder.

import type {
  AegisSustainedRow,
  QuantumWeaponRow,
  Source,
  WeaponOverride,
} from "../../src/data/schema.ts";

/** Timing of a package; the simulator reaches timeToEmptySeconds with these values. */
export type Timing = {
  rowId: string;
  magazine: number;
  totalShots: number | null; // null: unlimited (primary ammo)
  reloadSeconds: number; // as the source states it
  engineReloadSeconds: number; // what the simulator adds after the interval of the last shot
  intervalSeconds: number;
  timeToEmptySeconds: number | null; // null: unlimited ammo
  note: string;
  reloadSource?: Source; // when the reload comes from another source than the row
  chargeMs?: number; // charge before a shot (Aegis note, e.g. "1000ms charge"); inside the interval
};
export type TimingProblem = { problem: string };
/** The first charge, which Aegis' time to empty counts on top of the intervals. */
export const chargeSeconds = (timing: Timing) => (timing.chargeMs ?? 0) / 1000;

/**
 * Aegis "Sustained" reloads right after the last shot of a magazine: time to empty = charge +
 * (shots − magazines) × interval + reloads × reload, where the interval (peak rate) already contains
 * the charge and the time to empty adds the first charge on top (21 of 22 rows with a note
 * "…ms charge" fit this to 1 %; tmp/charge-interval.ts, 2026-10-26). The simulator counts one
 * interval before each reload, so it gets reload − interval. Without reloads (an intrinsic refills
 * the magazine) the whole ammo is one magazine.
 */
export function timingFromAegis(
  row: AegisSustainedRow,
  noReloads = false,
): Timing | TimingProblem {
  const timeToEmpty = row.timeToEmptySeconds;
  // A magazine of one without a reload in the notes (e.g. Ex Diris): the reload is inside the fire
  // rate, so all ammo is one magazine.
  if (
    row.magazines.length > 0 &&
    row.magazines.every((m) => m === 1) &&
    row.reloadMs === null &&
    row.swapMs === null
  )
    noReloads = true;
  const magazine = noReloads ? row.shots : row.magazines[0];
  if (!magazine || timeToEmpty === null || row.shots < 1)
    return {
      problem: `Zeile „${row.id}“ ohne Magazin-Folge oder Zeit bis leer`,
    };
  const regular =
    noReloads ||
    row.magazines.every(
      (m, i) =>
        m === magazine || (i === row.magazines.length - 1 && m < magazine),
    );
  if (!regular)
    return {
      problem: `unregelmäßige Magazin-Folge ${row.magazines.join("-")}`,
    };
  const magazines = Math.ceil(row.shots / magazine);
  const reloads = magazines - 1;
  const reloadMs = row.reloadMs ?? row.swapMs;
  if (reloads > 0 && reloadMs === null)
    return { problem: "kein Reload in den Notizen" };
  const reloadSeconds = (reloadMs ?? 0) / 1000;
  const rowChargeSeconds = (row.chargeMs ?? 0) / 1000;
  const intervalSeconds =
    row.shots > magazines
      ? (timeToEmpty - rowChargeSeconds - reloads * reloadSeconds) /
        (row.shots - magazines)
      : (row.peakRateSeconds ?? reloadSeconds);
  const engineReloadSeconds = reloadSeconds - intervalSeconds;
  if (intervalSeconds <= 0 || (reloads > 0 && engineReloadSeconds < 0))
    return {
      problem: `Zeit bis leer ${timeToEmpty} s passt nicht zu ${reloads} Reloads à ${reloadSeconds} s`,
    };
  return {
    rowId: row.id,
    magazine,
    totalShots: row.shots,
    reloadSeconds,
    engineReloadSeconds: Math.max(0, engineReloadSeconds),
    intervalSeconds,
    timeToEmptySeconds: timeToEmpty,
    note: `Derived: (TtE ${timeToEmpty} s${row.chargeMs === null ? "" : ` − ${rowChargeSeconds} s charge`} − ${reloads} reloads × ${reloadSeconds} s) ÷ ${row.shots - magazines} intervals within magazines (ADR 0013)`,
    ...(row.chargeMs === null ? {} : { chargeMs: row.chargeMs }),
  };
}

/**
 * Quantum counts one interval before each reload, like the simulator. Primary ammo is unlimited
 * ("inf"): the timing is magazine, fire rate and reload, without total shots and time to empty;
 * `primaryWithoutReload` (an override) drops that reload, e.g. precision hits refill the magazine.
 */
export function timingFromQuantum(
  row: QuantumWeaponRow,
  noReloads = false,
  primaryWithoutReload = false,
): Timing | TimingProblem {
  const { totalShots, timeToEmptySeconds, rpm } = row;
  const reloadSeconds = row.reloadSeconds ?? (noReloads ? 0 : null);
  if (row.textCells.totalShots === "inf") {
    if (row.magazine === null || reloadSeconds === null || rpm === null)
      return {
        problem: `unbegrenzte Munition, aber ohne Magazin, Reload oder rpm (${JSON.stringify(row.textCells)})`,
      };
    // A bow with a magazine of one nocks an arrow after every shot: Quantum's rpm is 60 ÷ (draw time
    // + that reload) for 6 of 8 primary bows within 5 % (tmp/bow-cycle test, 2026-10-26), so the
    // reload is inside the interval, like Aegis' bows ("repeating", peak rate = draw time).
    const nockInRate = row.weaponType === "bow" && row.magazine === 1;
    return {
      rowId: row.id,
      magazine: row.magazine,
      totalShots: null,
      reloadSeconds,
      engineReloadSeconds: nockInRate || primaryWithoutReload ? 0 : reloadSeconds,
      intervalSeconds: 60 / rpm,
      timeToEmptySeconds: null,
      note: nockInRate
        ? "Quantum fire rate of a bow: the draw and the nock after each arrow are inside it; primary ammo is unlimited (Quantum: inf)"
        : primaryWithoutReload
          ? "Quantum fire rate; primary ammo is unlimited (Quantum: inf), no reload (override)"
          : "Quantum fire rate; primary ammo is unlimited (Quantum: inf)",
    };
  }
  const magazine = noReloads ? totalShots : row.magazine;
  if (magazine === null || totalShots === null || reloadSeconds === null)
    return {
      problem: `ohne Magazin, Munition oder Reload (${JSON.stringify(row.textCells)})`,
    };
  const reloads = Math.ceil(totalShots / magazine) - 1;
  let intervalSeconds: number;
  let note: string;
  if (row.weaponType === "bow" && row.magazine === 1 && rpm !== null) {
    // Quantum's time to empty of a bow is shots × 60 ÷ rpm (Leviathan's Breath 17.4 s ÷ 9 = 1.93 s,
    // rpm 31): the nock after each arrow is inside the rate, as with the primary bows. That time
    // holds the first draw as a whole cycle; from the first arrow on it is one cycle less.
    return {
      rowId: row.id,
      magazine,
      totalShots,
      reloadSeconds,
      engineReloadSeconds: 0,
      intervalSeconds: 60 / rpm,
      timeToEmptySeconds: ((totalShots - 1) * 60) / rpm,
      note: `Quantum fire rate of a bow: the draw and the nock after each arrow are inside it; Time to Empty ${timeToEmptySeconds ?? "–"} s = ${totalShots} × 60 ÷ ${rpm} rpm counts the first draw as a cycle`,
    };
  }
  if (timeToEmptySeconds !== null && totalShots > 1) {
    intervalSeconds =
      (timeToEmptySeconds - reloads * reloadSeconds) / (totalShots - 1);
    note = `Derived: (Time to Empty ${timeToEmptySeconds} s − ${reloads} reloads × ${reloadSeconds} s) ÷ ${totalShots - 1} intervals (ADR 0013)`;
    // With one shot per magazine the reloads fill the time; the interval does not matter.
    if (intervalSeconds <= 0 && magazine === 1) intervalSeconds = 0.001;
  } else if (rpm !== null) {
    intervalSeconds = 60 / rpm;
    note = "Quantum fire rate; no Time to Empty";
  } else {
    return { problem: "ohne Zeit bis leer und ohne rpm" };
  }
  if (intervalSeconds <= 0) return { problem: "abgeleiteter Abstand ≤ 0" };
  return {
    rowId: row.id,
    magazine,
    totalShots,
    reloadSeconds,
    engineReloadSeconds: reloadSeconds,
    intervalSeconds,
    timeToEmptySeconds:
      timeToEmptySeconds ??
      (totalShots - 1) * intervalSeconds + reloads * reloadSeconds,
    note,
  };
}

// Clarity states what a catalyst adds with before and after, e.g. "Increases Magazine Size by 3
// (4🠚7)" or "Increases Reserves by 5 (9🠚14)".
export const CATALYST_MAGAZINE =
  /Magazine Size by (?:\d+|one|two|three) \((\d+)🠚(\d+)\)/i;
const CATALYST_RESERVES = /Reserves by (\d+) \((\d+)🠚(\d+)\)/i;

/**
 * Timing with the catalyst from the base and the numbers Clarity names (magazine, reserves); null
 * if it names none or the base magazine does not match the text.
 */
export function timingWithCatalyst(
  base: Timing,
  texts: string[],
): Timing | null {
  const text = texts.join("\n");
  const magazine = CATALYST_MAGAZINE.exec(text);
  const reserves = CATALYST_RESERVES.exec(text);
  if (!magazine && !reserves) return null;
  if (magazine && Number(magazine[1]) !== base.magazine) return null;
  const newMagazine = magazine ? Number(magazine[2]) : base.magazine;
  const totalShots =
    base.totalShots === null
      ? null
      : base.totalShots +
        (magazine ? newMagazine - base.magazine : 0) +
        (reserves ? Number(reserves[1]) : 0);
  const reloads =
    totalShots === null ? 0 : Math.ceil(totalShots / newMagazine) - 1;
  return {
    ...base,
    magazine: newMagazine,
    totalShots,
    timeToEmptySeconds:
      totalShots === null
        ? null
        : (totalShots - 1) * base.intervalSeconds +
          reloads * base.engineReloadSeconds +
          chargeSeconds(base),
    note: `${base.note}; with catalyst from Clarity: ${[magazine?.[0], reserves?.[0]].filter(Boolean).join(", ")} (assumption: the magazine counts to the ammo)`,
  };
}

/**
 * Timing without the catalyst from a timing with it, where Clarity names the magazine and reserves
 * before and after. Null if the text changes something else that the sources do not quantify
 * (reload speed as a stat, refills), or if the magazine does not match the timing.
 */
export function timingWithoutCatalyst(
  withCatalyst: Timing,
  texts: string[],
): { timing: Timing; quote: string } | null {
  const text = texts.join("\n");
  const magazine = CATALYST_MAGAZINE.exec(text);
  const reserves = CATALYST_RESERVES.exec(text);
  if (!magazine && !reserves) return null;
  if (magazine && Number(magazine[2]) !== withCatalyst.magazine) return null;
  const baseMagazine = magazine ? Number(magazine[1]) : withCatalyst.magazine;
  const totalShots =
    withCatalyst.totalShots === null
      ? null
      : withCatalyst.totalShots -
        (magazine ? Number(magazine[2]) - Number(magazine[1]) : 0) -
        (reserves ? Number(reserves[1]) : 0);
  const reloads =
    totalShots === null ? 0 : Math.ceil(totalShots / baseMagazine) - 1;
  return {
    timing: {
      ...withCatalyst,
      magazine: baseMagazine,
      totalShots,
      timeToEmptySeconds:
        totalShots === null
          ? null
          : (totalShots - 1) * withCatalyst.intervalSeconds +
            reloads * withCatalyst.engineReloadSeconds +
            chargeSeconds(withCatalyst),
      note: `${withCatalyst.note}; without catalyst from Clarity: ${[magazine?.[0], reserves?.[0]].filter(Boolean).join(", ")}`,
    },
    quote: [magazine?.[0], reserves?.[0]].filter(Boolean).join("; "),
  };
}

/** Applies an override (fewer shots, longer interval) and recomputes the time to empty. */
export function adjustTiming(
  timing: Timing,
  { totalShots, addIntervalSeconds }: NonNullable<WeaponOverride["timing"]>,
): Timing {
  const shots = totalShots ?? timing.totalShots;
  const interval = timing.intervalSeconds + (addIntervalSeconds ?? 0);
  // Unlimited ammo (primaries, Quantum): every shot takes longer, the reload stays.
  if (shots === null)
    return {
      ...timing,
      intervalSeconds: interval,
      note: `${timing.note}; override: +${addIntervalSeconds ?? 0} s per shot`,
    };
  const reloads = Math.ceil(shots / timing.magazine) - 1;
  // The simulator adds interval + engine reload between magazines; keep the stated reload.
  const engineReload = Math.max(
    0,
    timing.engineReloadSeconds - (addIntervalSeconds ?? 0),
  );
  return {
    ...timing,
    totalShots: shots,
    intervalSeconds: interval,
    engineReloadSeconds: engineReload,
    timeToEmptySeconds:
      (shots - 1) * interval + reloads * engineReload + chargeSeconds(timing),
    note: `${timing.note}; override: ${totalShots ?? "same"} shots, +${addIntervalSeconds ?? 0} s per shot`,
  };
}
