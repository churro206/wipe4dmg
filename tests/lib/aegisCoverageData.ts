// The input of the coverage rule (tests/lib/aegisCoverage.ts) from the data files of the model; shared
// by the coverage table of the Aegis rows and docs/coverage.md.

import { loadWeaponImportInputs } from "../../scripts/lib/weaponImportInputs";
import { buildWeaponImport } from "../../scripts/lib/weaponPackages";
import rawTotals from "../../src/data/aegis-totals.json";
import { AegisTotalsSnapshot } from "../../src/data/schema";
import { abilities, effects, exoticArmor, weapons } from "../../src/ui/data";
import auto from "../fixtures/meta-probe-auto.json";
import probe from "../fixtures/meta-probe.json";
import { aegisCoverage, type CoverageRow } from "./aegisCoverage";
import { autoEntries } from "./probeAuto";

export function realCoverage(): CoverageRow[] {
  const { rows: totals } = AegisTotalsSnapshot.parse(rawTotals);
  const manual = new Set(probe.entries.map((e) => e.aegisId));
  const { entries, skipped } = autoEntries(totals, {
    weapons,
    abilities,
    effects,
    exoticArmor,
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
