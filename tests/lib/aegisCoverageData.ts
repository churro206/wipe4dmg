// The input of the coverage rule (tests/lib/aegisCoverage.ts) from the data files of the model; shared
// by the coverage table of the Aegis rows and docs/coverage.md.

import { loadWeaponImportInputs } from "../../scripts/lib/weaponImportInputs";
import { buildWeaponImport } from "../../scripts/lib/weaponPackages";
import rawTotals from "../../src/data/aegis-totals.json";
import { AegisTotalsSnapshot } from "../../src/data/schema";
import { abilities, artifactData, effects, exoticArmor, weapons } from "../../src/ui/data";
import auto from "../fixtures/meta-probe-auto.json";
import probe from "../fixtures/meta-probe.json";
import { aegisCoverage, type CoverageRow } from "./aegisCoverage";
import type { MeasuredRow } from "./missingImpact";
import { autoEntries } from "./probeAuto";

/** The measured value of every Aegis row, for the impact of what is missing (tests/lib/missingImpact.ts). */
export function realMeasured(): MeasuredRow[] {
  const { rows: totals } = AegisTotalsSnapshot.parse(rawTotals);
  return [
    ...loadWeaponImportInputs().aegis.rows.map(
      (r): MeasuredRow => ({ ...r, tab: "weapons", total: r.wipe }),
    ),
    ...totals.map((r): MeasuredRow => ({ ...r, tab: r.tab })),
  ];
}

export function realCoverage(): CoverageRow[] {
  const { rows: totals } = AegisTotalsSnapshot.parse(rawTotals);
  const manual = new Set(probe.entries.map((e) => e.aegisId));
  const { entries, skipped } = autoEntries(totals, {
    weapons,
    abilities,
    effects,
    exoticArmor,
    artifactPerks: artifactData.artifacts.flatMap((a) => a.perks),
    ignored: auto.ignored,
    covered: manual,
  });
  const inputs = loadWeaponImportInputs();
  return aegisCoverage({
    weaponRows: inputs.aegis.rows,
    weaponReport: buildWeaponImport(inputs).report.weapons,
    totals,
    weapons,
    abilities,
    effects,
    probe: { manual, entries, skipped },
  });
}
