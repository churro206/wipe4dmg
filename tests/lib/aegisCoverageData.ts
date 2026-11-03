// The input of the coverage rule (scripts/lib/aegisCoverage.ts) from the data files of the model; shared
// by the coverage table of the Aegis rows and docs/coverage.md.

import { loadWeaponImportInputs } from "../../scripts/lib/weaponImportInputs";
import { buildWeaponImport } from "../../scripts/lib/weaponPackages";
import rawTotals from "../../src/data/aegis-totals.json";
import { AegisTotalsSnapshot } from "../../src/data/schema";
import { abilities, artifactData, effects, exoticArmor, weapons } from "../../src/ui/data";
import switches from "../fixtures/scenario-switches.json";
import { aegisCoverage, type CoverageRow } from "../../scripts/lib/aegisCoverage";
import type { MeasuredRow } from "../../scripts/lib/missingImpact";
import { autoEntries } from "./probeAuto";
import { tabOf } from "./scenarioBench";
import { handMadeScenarios } from "./scenarioFiles";

/** The measured value of every Aegis row, for the impact of what is missing (scripts/lib/missingImpact.ts). */
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
  // the rows of Sustained and Swap that a scenario made by hand covers
  const manual = new Set(
    handMadeScenarios()
      .filter((s) => tabOf(s) === "sustained" || tabOf(s) === "swap")
      .map((s) => s.aegisRow),
  );
  const { entries, skipped } = autoEntries(totals, {
    weapons,
    abilities,
    effects,
    exoticArmor,
    artifactPerks: artifactData.artifacts.flatMap((a) => a.perks),
    ignored: switches.ignoredTotals,
    covered: manual,
  });
  const inputs = loadWeaponImportInputs();
  return aegisCoverage({
    weaponRows: inputs.aegis.rows,
    weaponReport: buildWeaponImport(inputs).report.weapons,
    totals,
    weapons,
    exoticWeaponNames: inputs.manifest.map((w) => w.name),
    abilities,
    effects,
    probe: { manual, entries, skipped },
  });
}
