// Snapshot of the Aegis tabs "Sustained" and "Swap": total damage of one item under the standard
// factors of Aegis, the reference of the meta probe (block 5).

import { describe, expect, it } from "vitest";
import { parseAegisTotals } from "../scripts/lib/aegisTotals";
import rawTotals from "../src/data/aegis-totals.json";
import { AegisTotalsSnapshot } from "../src/data/schema";

// Rows copied from the Aegis tab "Swap" (retrieved 2026-10-23).
const swapCsv = [
  'Name,Type,Icon,Base,#,Perk,Surge,Buff,Debuff,200,Total,Ready,Fire,Stow,"swap\nTime","total\nTime","swap\nDPS","true\nDPS"',
  '"Blade Barrage\nKnock \'Em Down, Limit Break",super,,"13,076",1,,,1.150,1.300,1.450,"28,346",/,/,/,2.200,2.200,"12,885","12,885"',
  '"Parasite\nWorm\'s Hunger x20",burst,,"2,133",1,3.000,1.220,1.350,1.300,1.100,"15,074",0.350,0.000,0.316,0.666,0.666,"22,634","22,634"',
].join("\n");

// Rows copied from the Aegis tab "Sustained" (retrieved 2026-10-23).
const sustainedCsv = [
  'Name,Type,Family,Icon,#,Notes,Distribution,"peak\nRate",TtE,Base,Perk,Surge,Buff,Debuff,200,Single,"TFS\nTotal","TFS\nDPS",Total,DPS,"diff\nTotal","diff\nDPS"',
  '"Gjallarhorn\nArgent Ordnance",power,rocket,,11,,,1.000,10.000,"1,892",1.150,1.220,1.350,1.300,1.100,"5,125",,,"56,374","5,000",,',
  '"High-impact bow\nHeavy Bolts, e. Aggregate Charge x3 (Submersion), Argent Quiver",power,bow,,INF,,,0.950,N/A,"1,917",1.663,1.220,1.350,1.300,1.100,"6,000",,,INF,"6,300",,',
].join("\n");

describe("parseAegisTotals", () => {
  it("reads name, assumptions and all factors of a Swap row; empty factors are null", () => {
    expect(parseAegisTotals(swapCsv, "swap")[0]).toEqual({
      id: "swap-blade-barrage-knock-em-down-limit-break",
      tab: "swap",
      name: "Blade Barrage",
      assumptions: ["Knock 'Em Down", "Limit Break"],
      type: "super",
      shots: 1,
      base: 13076,
      perk: null,
      surge: null,
      buff: 1.15,
      debuff: 1.3,
      stat: 1.45,
      total: 28346,
    });
  });

  it("reads a Sustained row; INF shots and total are null", () => {
    const [gjallarhorn, bow] = parseAegisTotals(sustainedCsv, "sustained");
    expect(gjallarhorn).toMatchObject({
      id: "sustained-gjallarhorn-argent-ordnance",
      type: "power",
      shots: 11,
      perk: 1.15,
      total: 56374,
    });
    expect(bow).toMatchObject({ shots: null, total: null, perk: 1.663 });
  });

  it("total is base × factors × shots, within rounding", () => {
    const [, parasite] = parseAegisTotals(swapCsv, "swap");
    const product = [
      parasite.base,
      parasite.perk,
      parasite.surge,
      parasite.buff,
      parasite.debuff,
      parasite.stat,
      parasite.shots,
    ].reduce((p: number, x) => p * (x ?? 1), 1);
    expect(product / parasite.total!).toBeCloseTo(1, 2);
  });
});

describe("aegis-totals.json", () => {
  const { rows } = AegisTotalsSnapshot.parse(rawTotals);

  it("has unique ids and rows of both tabs", () => {
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
    expect(rows.some((r) => r.tab === "sustained")).toBe(true);
    expect(rows.some((r) => r.tab === "swap")).toBe(true);
  });
});
