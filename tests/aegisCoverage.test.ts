// Coverage of the Aegis rows (block C): every row of the tabs Weapons, Sustained and Swap has one
// verdict. Rule: tests/lib/aegisCoverage.ts. Table: npm run coverage (writes docs/aegis-coverage.md).

import { describe, expect, it } from "vitest";
import type { Ability, AegisTotalRow, AegisWeaponRow, Effect } from "../src/data/schema";
import type { ReportWeapon } from "../scripts/lib/weaponPackages";
import {
  aegisCoverage,
  countVerdicts,
  missingKeys,
  type CoverageInput,
  type CoverageRow,
} from "./lib/aegisCoverage";
import { realCoverage, realMeasured } from "./lib/aegisCoverageData";
import { missingImpact } from "./lib/missingImpact";
import { aegisCoverageMarkdown } from "./support/aegisCoverageMarkdown";

const weaponRow = (id: string, name: string, assumptions: string[] = []) =>
  ({ id, name, assumptions }) as AegisWeaponRow;
const totalRow = (
  id: string,
  tab: AegisTotalRow["tab"],
  type: string,
  name: string,
  assumptions: string[] = [],
) => ({ id, tab, type, name, assumptions }) as AegisTotalRow;
const report = (extra: Partial<ReportWeapon>) =>
  ({
    name: "Truth",
    status: "package",
    gapReason: null,
    baseRow: null,
    options: [],
    unusedRows: [],
    ...extra,
  }) as ReportWeapon;
const ability = (name: string, kind: string) => ({ name, kind }) as Ability;
const ownDamageEffect = (name: string) =>
  ({ name, parts: [{ type: "periodicDamage" }] }) as unknown as Effect;

const input = (extra: Partial<CoverageInput>): CoverageInput => ({
  weaponRows: [],
  weaponReport: [],
  totals: [],
  weapons: [],
  exoticWeaponNames: [],
  abilities: [],
  effects: [],
  probe: { manual: new Set(), entries: [], skipped: [] },
  ...extra,
});
const verdictOf = (rows: CoverageRow[], id: string) =>
  rows.find((r) => r.id === id)!;

describe("aegisCoverage, tab Weapons", () => {
  const rows = aegisCoverage(
    input({
      weaponRows: [
        weaponRow("base", "Truth"),
        weaponRow("opt", "Truth", ["catalyst"]),
        weaponRow("mode", "Truth", ["hitscan"]),
        weaponRow("foreign", "Truth", ["Pack Hunter"]),
        weaponRow("armor", "Truth", ["Peacekeepers"]),
        weaponRow("dup", "Truth", ["catalyst", "again"]),
        weaponRow("frame", "Adaptive frame"),
      ],
      weaponReport: [
        report({
          baseRow: { id: "base" } as AegisWeaponRow,
          options: [{ rowId: "opt", name: "Catalyst" }] as ReportWeapon["options"],
          unusedRows: [
            { rowId: "mode", assumptions: [], reason: "ohne light der Basiszeile" },
            { rowId: "foreign", assumptions: [], reason: "fremder Perk: Pack Hunter" },
            { rowId: "armor", assumptions: [], reason: "Exotic-Rüstung: Peacekeepers" },
          ],
        }),
      ],
    }),
  );

  it("uses the base row and the options of the package", () => {
    expect(verdictOf(rows, "base")).toMatchObject({ verdict: "model" });
    expect(verdictOf(rows, "opt")).toMatchObject({ verdict: "model" });
  });

  it("skips other modes and things that are modelled on their own", () => {
    expect(verdictOf(rows, "mode").verdict).toBe("skipped");
    expect(verdictOf(rows, "armor").verdict).toBe("skipped");
    expect(verdictOf(rows, "dup").detail).toMatch(/same option/);
  });

  it("calls a foreign perk missing and names it", () => {
    expect(verdictOf(rows, "foreign")).toMatchObject({
      verdict: "missing",
      keys: ["Pack Hunter"],
    });
  });

  it("skips a legendary frame without a verdict per row (owner 2026-10-25)", () => {
    expect(verdictOf(rows, "frame").verdict).toBe("skipped");
  });
});

describe("aegisCoverage, tabs Sustained and Swap", () => {
  const rows = aegisCoverage(
    input({
      totals: [
        totalRow("w-ok", "sustained", "special", "Telesto"),
        totalRow("w-open", "sustained", "special", "Telesto", ["Lucent Blades x3"]),
        totalRow("w-inf", "sustained", "primary", "Telesto", ["inf"]),
        totalRow("w-frame", "sustained", "primary", "Adaptive frame"),
        totalRow("w-gap", "sustained", "special", "Wolfsbane"),
        totalRow("w-legendary", "sustained", "special", "Bequest"),
        totalRow("w-unknown", "sustained", "special", "Worldline Zero"),
        totalRow("t-base", "sustained", "tick", "Storm's Keep"),
        totalRow("t-variant", "sustained", "tick", "Storm's Keep", ["Flashover"]),
        totalRow("t-none", "sustained", "tick", "Mystery"),
        totalRow("s-ok", "swap", "super", "Chaos Reach"),
        totalRow("s-none", "swap", "super", "Song of Flame"),
        totalRow("burst", "swap", "burst", "Still Hunt"),
        totalRow("g-ok", "swap", "grenade", "Pulse Grenade"),
        totalRow("g-none", "swap", "grenade", "Mystery Grenade"),
      ],
      weapons: [{ name: "Telesto" }],
      exoticWeaponNames: ["Telesto", "Wolfsbane", "Worldline Zero"],
      weaponReport: [
        report({ name: "Wolfsbane", status: "gap", gapReason: "kein Timing" }),
      ],
      abilities: [ability("Chaos Reach", "super"), ability("Pulse Grenade", "grenade")],
      effects: [ownDamageEffect("Storm's Keep")],
      probe: {
        manual: new Set(["s-ok"]),
        entries: [
          { aegisId: "w-ok", unmapped: [] },
          { aegisId: "w-open", unmapped: ["Lucent Blades x3"] },
        ],
        skipped: [{ row: { id: "w-inf" }, reason: "no total (INF)" }],
      },
    }),
  );

  it("takes probe entries as model when every assumption has a switch, else as missing", () => {
    expect(verdictOf(rows, "w-ok").verdict).toBe("model");
    expect(verdictOf(rows, "s-ok").verdict).toBe("model");
    expect(verdictOf(rows, "w-open")).toMatchObject({
      verdict: "missing",
      keys: ["Lucent Blades x3"],
    });
  });

  it("keeps the reason of a skipped probe row", () => {
    expect(verdictOf(rows, "w-inf")).toMatchObject({
      verdict: "skipped",
      detail: "no total (INF)",
    });
  });

  it("skips a legendary frame in Sustained too, but an exotic without package is missing", () => {
    expect(verdictOf(rows, "w-frame").verdict).toBe("skipped");
    expect(verdictOf(rows, "w-gap")).toMatchObject({
      verdict: "missing",
      keys: ["Wolfsbane (no package)"],
    });
    expect(verdictOf(rows, "w-unknown")).toMatchObject({
      verdict: "missing",
      keys: ["weapon: Worldline Zero"],
    });
  });

  it("skips a legendary weapon named like an exotic: not an exotic of the manifest (K7)", () => {
    expect(verdictOf(rows, "w-legendary")).toMatchObject({
      verdict: "skipped",
      detail: "legendary weapon (owner 2026-10-25)",
    });
  });

  it("models own damage by the row with the fewest assumptions (rule H), the variants are missing", () => {
    expect(verdictOf(rows, "t-base").verdict).toBe("model");
    expect(verdictOf(rows, "t-variant").verdict).toBe("missing");
    expect(verdictOf(rows, "t-none").verdict).toBe("missing");
  });

  it("calls a super or an ability that is not in the model missing", () => {
    expect(verdictOf(rows, "s-none")).toMatchObject({
      verdict: "missing",
      keys: ["super: Song of Flame"],
    });
    expect(verdictOf(rows, "g-ok").verdict).toBe("model");
    expect(verdictOf(rows, "g-none").verdict).toBe("missing");
  });

  it("skips the bursts of the tab Swap", () => {
    expect(verdictOf(rows, "burst").verdict).toBe("skipped");
  });

  it("counts verdicts and missing items", () => {
    const count = countVerdicts(rows);
    expect(count.find((c) => c.tab === "swap")).toMatchObject({
      total: 5,
      model: 2,
      skipped: 1,
      missing: 2,
    });
    expect(missingKeys(rows)[0]).toEqual(expect.arrayContaining([expect.any(String), 1]));
  });
});

describe("the Aegis rows of the model", () => {
  const rows = realCoverage();

  it("is written to docs/aegis-coverage.md; run npm run coverage after changing data files", async () => {
    await expect(
      aegisCoverageMarkdown(rows, missingImpact(rows, realMeasured())),
    ).toMatchFileSnapshot(
      "../docs/aegis-coverage.md",
    );
  });

  it("have exactly one verdict each", () => {
    expect(new Set(rows.map((r) => `${r.tab}/${r.id}`)).size).toBe(rows.length);
  });

  it("cover the three tabs completely", () => {
    const count = countVerdicts(rows);
    expect(count.map((c) => c.total)).toEqual([417, 261, 204]);
  });
});
