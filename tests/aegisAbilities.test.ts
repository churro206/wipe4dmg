import { describe, expect, it } from "vitest";
import { parseAegisAbilities } from "../scripts/lib/aegisAbilities";
import rawRows from "../src/data/aegis-abilities.json";
import rawEffects from "../src/data/effects.json";
import { AegisAbilityRow } from "../src/data/schema";

describe("aegis-abilities.json", () => {
  const rows = AegisAbilityRow.array().parse(rawRows);

  it("matches the schema and has unique ids", () => {
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
  });

  it("only names included effects that exist", () => {
    const effectIds = new Set(rawEffects.map((e) => e.id));
    for (const row of rows) {
      for (const id of row.includedEffectIds) expect(effectIds, row.id).toContain(id);
    }
  });

  it("covers supers, grenades and melees", () => {
    for (const category of ["super", "grenade", "melee"]) {
      expect(rows.some((r) => r.category === category), category).toBe(true);
    }
  });
});

const RETRIEVED = "2026-10-19";

// Rows copied from the Aegis tab "Abilties" (retrieved 2026-10-19); the last row is test input.
const csv = [
  ",,,,,,VISUAL - 100 stat,,,,,VISUAL - 200 stat,,,,,HEALTHBAR,,,,,,,VERIFICATION,,",
  '🖼️,Type,Subtype,"primary\nTick","secondary\nTicks",Modifiers,Boss,Wipe,#,Full Modifiers,"visual\nValue",Wipe,#,Full Modifiers,"visual\nValue",Multi,Boss,#,HP1,HP2,%,Full Modifiers,"healthbar\nValue",Patch,Ratio,Deviation',
  ',Grenade,Firebolt,916,"15 impact, 1592 ignition","average - Ember of Ashes, with ignition",C,5605,4,2.30,609.239,9265,4,2.30,1007.065,1.653,/,/,/,/,/,/,/,9.7.0.3,N/A,N/A',
  ",Miscellaneous,Bolt Charge,932,\"622 secondary, 1398/932 Flashover\",,C,1559,1,2.30,677.826,/,1,2.30,N/A,N/A,/,/,/,/,/,/,/,9.7.0.3,N/A,N/A",
  ",Miscellaneous,Bolt Charge,932,\"622 secondary, 1398/932 Flashover\",,C,1559,1,2.30,677.826,/,1,2.30,N/A,N/A,/,/,/,/,/,/,/,9.7.0.3,N/A,N/A",
  ',Super,Blade Barrage,,,"Knock Em Down, Feast of Light x6",C,51534,1,2.30,22406.087,73590,1,2.30,31995.652,1.428,/,/,/,/,/,/,/,9.7.0.3,N/A,N/A',
  ",Super,Blade Barrage,,,,C,21470,1,2.30,9334.783,31109,1,2.30,13525.652,1.449,/,/,/,/,/,/,/,9.7.0.3,N/A,N/A",
  ',Super,Golden Gun - Marksman,,,"Radiant, Feast of Light x6",C,36009,1,2.30,15656.087,52213,1,2.30,22701.304,1.450,/,/,/,/,/,/,/,9.7.0.3,N/A,N/A',
  ",Super,Song of Flame,,,snap spam,C,16658,1,1.00,16658.000,24157,1,1.00,24157.000,1.450,/,/,/,/,/,/,/,9.7.0.3,N/A,N/A",
  ',Super,Twilight Arsenal,3396,2107 secondary,"axe heavy, includes weaken",C,5503,1,2.65,2080.529,/,1,2.30,N/A,N/A,/,/,/,/,/,/,/,9.7.0.3,N/A,N/A',
  ",,,,,,,,,,,,,,,,,,,,,,,,,",
].join("\n");

const effects = [
  { id: "radiant", name: "Radiant" },
  { id: "weaken", name: "Weaken" },
  { id: "ember-of-ashes", name: "Ember of Ashes" },
  { id: "well-of-radiance", name: "Well of Radiance (standing inside)" },
];

describe("parseAegisAbilities", () => {
  const rows = parseAegisAbilities(csv, RETRIEVED, effects);
  const byId = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) throw new Error(`No row ${id}`);
    return row;
  };

  it("produces rows that match the schema", () => {
    expect(() => AegisAbilityRow.array().parse(rows)).not.toThrow();
  });

  it("reads category, name, assumptions and the value per use at stat 100 and 200", () => {
    const row = byId("super-blade-barrage-knock-em-down-feast-of-light-x6");
    expect(row).toMatchObject({
      category: "super",
      name: "Blade Barrage",
      assumptions: ["Knock Em Down", "Feast of Light x6"],
      gameVersion: "9.7.0.3",
    });
    expect(row.perUseStat100.value).toBe(22406.087);
    expect(row.perUseStat200.value).toBe(31995.652);
    expect(row.perUseStat100.source.status).toBe("verified");
    expect(row.perUseStat100.source.retrieved).toBe(RETRIEVED);
    expect(row.perUseStat100.source.note).toContain("51534");
  });

  it("gives a row without assumptions a plain id", () => {
    expect(byId("super-blade-barrage").assumptions).toEqual([]);
  });

  it("splits a leading 'average -' into its own assumption", () => {
    expect(byId("grenade-firebolt-average-ember-of-ashes-with-ignition").assumptions).toEqual([
      "average",
      "Ember of Ashes",
      "with ignition",
    ]);
  });

  it("keeps the tick columns as text for later cross-checks", () => {
    const row = byId("grenade-firebolt-average-ember-of-ashes-with-ignition");
    expect(row.primaryTick).toBe("916");
    expect(row.secondaryTicks).toBe("15 impact, 1592 ignition");
  });

  it("tags assumptions that are modelled effects as included effects", () => {
    expect(byId("super-golden-gun-marksman-radiant-feast-of-light-x6").includedEffectIds).toEqual(["radiant"]);
    expect(byId("grenade-firebolt-average-ember-of-ashes-with-ignition").includedEffectIds).toEqual([
      "ember-of-ashes",
    ]);
    expect(byId("super-blade-barrage").includedEffectIds).toEqual([]);
  });

  it("marks a missing value ('/' or 'N/A') as missing", () => {
    const bolt = byId("miscellaneous-bolt-charge");
    expect(bolt.perUseStat200.value).toBeNull();
    expect(bolt.perUseStat200.source.status).toBe("missing");
  });

  it("marks values without normalisation (Full Modifiers 1.00) as unverified", () => {
    const song = byId("super-song-of-flame-snap-spam");
    expect(song.perUseStat100.source.status).toBe("unverified");
    expect(song.perUseStat100.source.note).toContain("not normalised");
  });

  it("marks values with other Full Modifiers than the sheet's usual ones as unverified and tags no effects", () => {
    const arsenal = byId("super-twilight-arsenal-axe-heavy-includes-weaken");
    expect(arsenal.perUseStat100.source.status).toBe("unverified");
    expect(arsenal.perUseStat100.source.note).toContain("2.65");
    expect(arsenal.includedEffectIds).toEqual([]);
  });

  it("merges identical duplicate rows and skips empty rows", () => {
    expect(rows.filter((r) => r.name === "Bolt Charge")).toHaveLength(1);
    expect(rows).toHaveLength(7);
  });

  it("rejects duplicate rows with different values", () => {
    const conflicting = csv.replace("1559,1,2.30,677.826,/", "1600,1,2.30,695.652,/");
    expect(() => parseAegisAbilities(conflicting, RETRIEVED, effects)).toThrow(/miscellaneous-bolt-charge/);
  });

  it("fails without the header row", () => {
    expect(() => parseAegisAbilities("a,b\n1,2", RETRIEVED, effects)).toThrow(/header/);
  });
});
