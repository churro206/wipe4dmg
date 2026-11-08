// Scenario bench (ADR 0017, ADR 0018, B2): the hand-made scenarios in tests/scenarios/ and the ones the
// generator makes from the other rows of the Aegis tab Weapons, against their rows. The table with
// the key figures is frozen in a file snapshot; a stage may change it only where it intends to
// (update with `npx vitest -u`, explain the change in the commit).

import { describe, expect, it } from "vitest";
import rawAbilityRows from "../src/data/aegis-abilities.json";
import rawAegis from "../src/data/aegis-weapons.json";
import rawTotals from "../src/data/aegis-totals.json";
import rawPackages from "../src/data/weapon-packages.json";
import { COMPONENT_TOLERANCE } from "../scripts/lib/abilityComponents";
import { AegisAbilityRow, AegisTotalsSnapshot, AegisWeaponSnapshot } from "../src/data/schema";
import { abilities, artifactData, effects, exoticArmor, weapons } from "../src/ui/data";
import switches from "./fixtures/scenario-switches.json";
import { fittedRows } from "./lib/fittedRows";
import { handMadeScenarios } from "./lib/scenarioFiles";
import deviations from "./fixtures/ranking-gate.json";
import {
  benchMarkdown,
  checkPairs,
  checkSet,
  DELTA_LIMIT,
  GATED,
  groupFigures,
  groupMarkdown,
  groupOf,
  GROUPS,
  judge,
  keyFigures,
  pairKey,
  runBench,
  scenarioProblems,
  SPEARMAN_MIN,
  tabOf,
  TOP,
  WITHIN,
  type Group,
} from "./lib/scenarioBench";
import {
  generateAbilityScenarios,
  generateScenarios,
  generateTotalScenarios,
  lotOf,
  shotsNamedByRow,
  STAT_200,
} from "./lib/scenarioGen";

const SNAPSHOT = "./__snapshots__/scenario-bench.md";

const handMade = handMadeScenarios();
const aegis = AegisWeaponSnapshot.parse(rawAegis).rows;
const totals = AegisTotalsSnapshot.parse(rawTotals).rows;
const abilityRows = AegisAbilityRow.array().parse(rawAbilityRows);
const generated = generateScenarios(
  aegis,
  { weapons, effects, exoticArmor, ignored: switches.ignored },
  new Set(handMade.map((s) => s.aegisRow)),
);
const generatedTotals = generateTotalScenarios(
  totals,
  {
    weapons,
    abilities,
    effects,
    exoticArmor,
    artifactPerks: artifactData.artifacts.flatMap((a) => a.perks),
    ignored: switches.ignoredTotals,
  },
  new Set(handMade.map((s) => s.aegisRow)),
);
const generatedAbilities = generateAbilityScenarios(
  abilityRows,
  {
    abilities,
    effects,
    exoticArmor,
    artifactPerks: artifactData.artifacts.flatMap((a) => a.perks),
    ignored: switches.ignoredTotals,
  },
  new Set(handMade.map((s) => s.aegisRow)),
);
// The Weapons figures stay as they were (block P, step 1): the other tabs have their own tests below.
const all = [
  ...handMade,
  ...generated.scenarios,
  ...generatedTotals.scenarios,
  ...generatedAbilities.scenarios,
];
const scenarios = all.filter((s) => tabOf(s) === "weapons");
const otherTabs = all.filter((s) => tabOf(s) !== "weapons");
const { weaponRows, abilityRows: fittedAbilityRows } = fittedRows(rawPackages, abilities);
// Rows the model took a value from: Weapons and Sustained rows of the item files, rows of ability packages.
const fitted = new Set([...weaponRows, ...fittedAbilityRows]);
const judgedAll = judge(runBench(all), fitted);
const judged = judgedAll.filter((r) => tabOf(r.scenario) === "weapons");
const rowTypes = new Map(totals.map((r) => [r.id, r.type]));
const rowType = (aegisRow: string) => rowTypes.get(aegisRow);

describe("scenarios", () => {
  it("have unique ids and rows, and compare only to scenarios of the same weapon", () => {
    const ids = scenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const rows = scenarios.map((s) => s.aegisRow);
    expect(new Set(rows).size).toBe(rows.length);
    for (const s of scenarios.filter((s) => s.comparesTo !== undefined)) {
      const other = scenarios.find((o) => o.id === s.comparesTo);
      expect(other?.build.weaponId, s.id).toBe(s.build.weaponId);
    }
  });

  it.each(scenarios.map((s) => [s.id, s] as const))(
    "%s quotes its Aegis row",
    (_, s) => {
      const row = aegis.find((r) => r.id === s.aegisRow);
      expect(row, s.aegisRow).toBeDefined();
      expect([s.wipe, s.fullModifiers]).toEqual([row!.wipe, row!.fullModifiers]);
      // The playstyle is the row's own list of assumptions.
      expect(s.playstyle).toEqual(row!.assumptions);
      // The shots of its column, or those its assumptions name where the column says 1 ("full mag").
      const magazine = weapons.find((w) => w.id === s.build.weaponId)?.magazine.value ?? null;
      expect([row!.shots, shotsNamedByRow(row!.assumptions, magazine)]).toContain(s.shots);
    },
  );

  it("generates a scenario for a good part of the rows of exotic weapons", () => {
    expect(generated.scenarios.length).toBeGreaterThan(50);
  });

  it("keep the rules of their tab", () => {
    for (const s of all) expect(scenarioProblems(s), s.id).toEqual([]);
  });
});

describe("scenarios of the other tabs (block P)", () => {
  const others = judgedAll.filter((r) => tabOf(r.scenario) !== "weapons");
  const byId = (id: string) => others.find((r) => r.scenario.id === id)!;

  it.each(otherTabs.map((s) => [s.id, s] as const))("%s quotes its Aegis row", (_, s) => {
    const tab = tabOf(s);
    if (tab === "abilities") {
      const row = abilityRows.find((r) => r.id === s.aegisRow);
      expect(row, s.aegisRow).toBeDefined();
      const perUse = s.build.abilityStat === 200 ? row!.perUseStat200 : row!.perUseStat100;
      expect(s.wipe).toBe(perUse.value);
      expect(s.playstyle).toEqual(
        s.build.abilityStat === 200 ? [...row!.assumptions, STAT_200] : row!.assumptions,
      );
    } else {
      const row = totals.find((r) => r.id === s.aegisRow);
      expect(row, s.aegisRow).toBeDefined();
      expect(row!.tab).toBe(tab);
      expect(s.wipe).toBe(row!.total);
      expect(s.playstyle).toEqual(row!.assumptions);
    }
  });

  // The 14 hand-made entries of the former meta probe (docs/meta-probe.md, column "Modell") are
  // fixtures now: the same build through the one scenario path gives the same value.
  // Q1 (ADR 0019): six entries are out until their mechanics are back (Leviathan's Breath, Gjallarhorn,
  // Thunderlord, Whisper of the Worm, One Thousand Voices, Xenophage; see docs/plans/current.md).
  const PROBE_SUSTAINED: Record<string, number> = {
    // W4: 16 rockets (Quantum) and clusters of 177 (Compendium) instead of 14 and 155 (Aegis): 81 580 before; Aegis says 85 454 (+13,6 %)
    "sustained-truth-prototype-truthseeker-argent-ordnance": 97051,
    "sustained-sleeper-simulant": 87747,
    "sustained-grand-overture-volleys-when-available": 144662,
    "sustained-the-queenbreaker-rewind-rounds-combat-sights": 97261,
  };
  it.each(Object.entries(PROBE_SUSTAINED))("Sustained %s gives the value of the meta probe", (id, expected) => {
    expect(byId(id).model! / expected).toBeCloseTo(1, 2);
  });

  // The probe took Limit Break (and only that) out of the Aegis total. Limit Break raises damage of the
  // source "super" only (effects.json), so the keyword damage of a super stays out: at most 1.15.
  const PROBE_SWAP: Record<string, number> = {
    "swap-blade-barrage-knock-em-down-limit-break": 24118,
    "swap-nova-bomb-vortex-limit-break": 17330,
    "swap-gathering-storm-limit-break": 12866,
    "swap-golden-gun-marksman-celestial-nighthawk-radiant-facet-of-courage-limit-break": 33042,
  };
  it.each(Object.entries(PROBE_SWAP))("Swap %s gives the probe value times at most 1.15", (id, expected) => {
    const ratio = byId(id).model! / expected;
    expect(ratio).toBeGreaterThan(1.13);
    expect(ratio).toBeLessThanOrEqual(1.15 * (1 + 1e-4)); // the probe values are rounded to whole numbers
  });

  it("runs every generated scenario of Sustained and Swap", () => {
    expect(generatedTotals.scenarios.length).toBeGreaterThan(20);
    for (const r of others) expect(r.model, r.scenario.id).not.toBeNull();
  });

  it("Abilities: Gathering Storm lies within the tolerance of the ability gate, at stat 100 and 200", () => {
    for (const id of ["gen-super-gathering-storm", "gen-super-gathering-storm-stat-200"]) {
      expect(Math.abs(byId(id).deviation!), id).toBeLessThanOrEqual(COMPONENT_TOLERANCE);
    }
  });

  it("Abilities: the scenario at stat 200 is a delta pair with the one at stat 100", () => {
    const judgedAbilities = judge(
      others.filter((r) => tabOf(r.scenario) === "abilities"),
      new Set(),
    );
    const pairs = checkPairs(judgedAbilities);
    // other pairs exist too: rows of Aegis that differ by one assumption
    expect(pairs.some((p) => p.added === STAT_200)).toBe(true);
  });

  it("runs every generated scenario of Abilities", () => {
    expect(generatedAbilities.scenarios.length).toBeGreaterThan(100);
  });

  it("Sustained and Swap rows have no lot, Abilities rows keep theirs", () => {
    const judgedOthers = judge(others, new Set());
    for (const r of judgedOthers) {
      if (tabOf(r.scenario) === "abilities") expect(r.lot).toBe(lotOf(r.scenario.aegisRow));
      else expect(r.lot).toBe("check");
    }
  });
});

describe("check set", () => {
  it("holds no row that the model took a value from (I1)", () => {
    for (const r of checkSet(judged)) expect(fitted.has(r.scenario.aegisRow), r.scenario.id).toBe(false);
  });

  it("holds only rows of the fixed lot (I10)", () => {
    for (const r of checkSet(judged)) expect(lotOf(r.scenario.aegisRow), r.scenario.id).toBe("check");
  });

  it("builds a delta pair only on a row in the check set", () => {
    const ids = new Set(checkSet(judged).map((r) => r.scenario.aegisRow));
    for (const p of checkPairs(judged)) expect(ids.has(p.id), p.item).toBe(true);
  });

  it("has delta pairs, the main key figure (I11)", () => {
    expect(keyFigures(judged).pairs.of).toBeGreaterThan(0);
  });
});

// ---- Groups: the ranking gate of docs/product.md, on the scenarios of all tabs ----

const aegisRowCount: Record<Group, number> = {
  Weapons: aegis.filter((r) => r.wipe > 0 && r.perShot > 0).length,
  Supers: totals.filter((r) => r.tab === "swap" && r.type === "super" && r.total !== null).length,
  Heavy: totals.filter((r) => r.tab === "sustained" && r.type === "power" && r.total !== null).length,
  Special: totals.filter((r) => r.tab === "sustained" && r.type === "special" && r.total !== null).length,
  Abilities: abilityRows.filter((r) => r.perUseStat100.value !== null).length,
};
const figures = GROUPS.map((g) => groupFigures(judgedAll, g, rowType, aegisRowCount[g]));
const groupOfTotal = (type: string, tab: string): Group | null =>
  groupOf({ tab, aegisRow: "" } as Scenario, () => type);
const missingByGroup: Record<string, { unmapped: string[] }[]> = {
  Weapons: generated.missing,
  Abilities: generatedAbilities.missing,
  ...Object.fromEntries(
    (["Supers", "Heavy", "Special"] as const).map((g) => [
      g,
      generatedTotals.missing.filter((m) => groupOfTotal(m.row.type, m.row.tab) === g),
    ]),
  ),
};
const topHitDeviations: Record<string, string> = deviations.topHits;
const pairDeviations: Record<string, string> = deviations.pairs;

describe("scenario bench", () => {
  it("keeps the frozen table and key figures", async () => {
    await expect(
      benchMarkdown(judged, generated.missing, generated.skipped) +
        groupMarkdown(figures, pairDeviations, missingByGroup),
    ).toMatchFileSnapshot(SNAPSHOT);
  });
});

// ADR 0019, point 2: until the Gegenprobe the bench is a report (the table above), not a gate. The
// ranking gate comes back then, with the deviations listed in ranking-gate.json as they are.
const REPORT_ONLY = true;

describe.skipIf(REPORT_ONLY).each(
  figures.filter((f) => GATED.includes(f.group)).map((f) => [f.group, f] as const),
)(
  "ranking gate: %s",
  (group, f) => {
    it(`has a Spearman of at least ${SPEARMAN_MIN}`, () => {
      if (!f.rank) return;
      expect(f.rank.rho).toBeGreaterThanOrEqual(SPEARMAN_MIN);
    });

    it(`has the Aegis top ${TOP} in our top ${WITHIN} or a known deviation`, () => {
      if (!f.rank) return;
      if (f.rank.hits < TOP) {
        expect(topHitDeviations[group], `hits: ${f.rank.hits}/${TOP}`).toBeDefined();
      } else {
        expect(topHitDeviations[group], "listed as deviation but all hits").toBeUndefined();
      }
    });

    it.each(f.pairs.map((p) => [pairKey(group, p), p] as const))(
      "%s lies within the limit or is a known deviation",
      (key, p) => {
        if (Math.abs(p.gap) > DELTA_LIMIT) {
          expect(pairDeviations[key], `gap: ${p.gap.toFixed(1)}`).toBeDefined();
        } else {
          expect(pairDeviations[key], "listed as deviation but inside the limit").toBeUndefined();
        }
      },
    );
  },
);

describe("ranking gate", () => {
  it("lists no deviation that no longer exists", () => {
    const keys = new Set(figures.flatMap((f) => f.pairs.map((p) => pairKey(f.group, p))));
    for (const key of Object.keys(pairDeviations)) expect(keys.has(key), key).toBe(true);
    for (const group of Object.keys(topHitDeviations)) expect(GATED.includes(group as Group), group).toBe(true);
  });

  it("measures every group", () => {
    expect(figures.map((f) => f.group)).toEqual([...GROUPS]);
    for (const f of figures) expect(f.covered, f.group).toBeGreaterThan(0);
  });
});
