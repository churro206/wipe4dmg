// Snapshots of the weapon sources for the weapon import (ADR 0013): Aegis tab "Weapons" and the
// Quantum tabs Primaries, Specials and Heavies.

import { describe, expect, it } from "vitest";
import { parseAegisWeapons } from "../scripts/lib/aegisWeapons";
import { parseQuantumWeapons } from "../scripts/lib/quantumWeapons";
import rawAegis from "../src/data/aegis-weapons.json";
import rawCompendium from "../src/data/compendium-weapons.json";
import rawQuantum from "../src/data/quantum-weapons.json";
import {
  AegisWeaponSnapshot,
  CompendiumSnapshot,
  QuantumWeaponSnapshot,
} from "../src/data/schema";

// Rows copied from the Aegis tab "Weapons" (retrieved 2026-10-20); the last row repeats one.
const aegisCsv = [
  "INFORMATION,,,,,,,VISUAL,,,,,HEALTHBAR,,,,,,,,VERIFICATION,,,",
  '🖼️,Type,Subtype,"crit\nShot","body\nShot","other\nTicks",Modifiers,Boss,Wipe,#,Full Modifiers,"visual\nValue",Boss,#,Type,HP1,HP2,%,Full Modifiers,"healthbar\nValue",Patch,Crit,Ratio,Deviation',
  ",Rocket launcher,Truth,5682,5682,,,C,5682,1,3.16,1796.680,/,/,/,/,/,/,/,/,9.7.0.3,1.000,N/A,N/A",
  ",Rocket launcher,Truth,5682,5682,490/36 cluster,average - Prototype Truthseeker,C,62028,9,3.16,2179.289,/,/,/,/,/,/,/,/,9.7.0.3,1.000,N/A,N/A",
  ',Rocket launcher,Truth,7955,7955,686/50 cluster,"average - Prototype Truthseeker, Reaper\'s Tithe x4",C,119734,12,3.16,3155.046,/,/,/,/,/,/,/,/,9.7.0.3,1.000,N/A,N/A',
  ',Machine gun,Thunderlord,304,217,,"average - with lightning strikes, excludes Bolt Charge",C,43912,127,3.04,113.888,/,/,/,/,/,/,/,/,9.7.0.3,1.336,N/A,N/A',
  ",SMG,Adaptive frame,416,237,,,S,416,1,15.09,27.574,/,/,/,/,/,/,/,/,9.7.0,1.755,N/A,N/A",
  ",SMG,Adaptive frame,416,237,,,S,416,1,15.09,27.574,/,/,/,/,/,/,/,/,9.7.0,1.755,N/A,N/A",
].join("\n");

// Rows copied from the Quantum tab Heavies (retrieved 2026-10-20).
const quantumCsv = [
  '"Note: all weapons assume Backup Mag whenever applicable.",,,,,,,,,,,,,,',
  ',Frame/Weapon,"1-Mag Burst or ""True"" DPS",Sustained DPS,,Theoretical Total Damage,1-Mag Damage,Magazine Capacity,Reserves + Magazine,Fire rate (rpm),Reload Speed (s),Time to Empty (s),Body Damage,Precision Damage,',
  "Machine Guns,Rapid-Fire,870,638,,33350,6670,115,575,900,2.86,49.4,44,58,",
  ",Thunderlord,1248,678,,39373,6444,62,379,617,3.57,57.6,72,101,",
  "cata,Thunderlord,1248,1248,,39404,inf,inf,379,617,3.57,32.5,72,101,",
  "Rocket Launchers,Aggressive,1856,843,,17820,1980,1,9,56,2.35,18.8,1980,N/A,Adaptive and Aggressive rocket launchers share the same damage",
  ',Truth,1404,1884,,35940,5391,3,20,47,2.35,17.4,1797,N/A,"Assumes starting with Prototype Trueseeker, no bomblets hit the boss"',
  "Fusion Rifles,One Thousand Voices,1434,1274,,28430,10500,4,11,33,1.25,20.7,2180,N/A,Does not consider Scorch; with ignition",
  "Ember of Ashes,One Thousand Voices,1678,1490,,33770,12280,4,11,33,1.25,20.7,2180,N/A,Does not consider Scorch; with ignition; Ember of Ashes",
].join("\n");

describe("parseAegisWeapons", () => {
  const rows = parseAegisWeapons(aegisCsv);

  it("reads weapon type, name, hits, assumptions and the visual value", () => {
    expect(rows[2]).toEqual({
      id: "rocket-launcher-truth-average-prototype-truthseeker-reaper-s-tithe-x4",
      weaponType: "rocketLauncher",
      name: "Truth",
      critShot: 7955,
      bodyShot: 7955,
      otherTicks: "686/50 cluster",
      assumptions: ["average", "Prototype Truthseeker", "Reaper's Tithe x4"],
      wipe: 119734,
      shots: 12,
      fullModifiers: 3.16,
      perShot: 3155.046,
      gameVersion: "9.7.0.3",
    });
  });

  it("keeps rows without assumptions", () => {
    expect(rows[0]).toMatchObject({
      id: "rocket-launcher-truth",
      assumptions: [],
      perShot: 1796.68,
    });
  });

  it("maps every Aegis weapon type", () => {
    expect(rows.map((r) => r.weaponType)).toEqual([
      "rocketLauncher",
      "rocketLauncher",
      "rocketLauncher",
      "machineGun",
      "submachineGun",
      "submachineGun",
    ]);
  });

  it("gives repeated rows unique ids", () => {
    expect(rows[5].id).toBe("smg-adaptive-frame-2");
  });

  it("rejects an unknown weapon type", () => {
    expect(() =>
      parseAegisWeapons(aegisCsv.replace("Machine gun", "Laser cannon")),
    ).toThrow(/Laser cannon/);
  });
});

describe("parseQuantumWeapons", () => {
  const rows = parseQuantumWeapons(quantumCsv, "heavies");

  it("takes the weapon type from the section heading in the first column", () => {
    expect(rows.map((r) => [r.name, r.variant, r.weaponType])).toEqual([
      ["Rapid-Fire", "", "machineGun"],
      ["Thunderlord", "", "machineGun"],
      ["Thunderlord", "cata", "machineGun"],
      ["Aggressive", "", "rocketLauncher"],
      ["Truth", "", "rocketLauncher"],
      ["One Thousand Voices", "", "fusionRifle"],
      ["One Thousand Voices", "Ember of Ashes", "fusionRifle"],
    ]);
  });

  it("reads numbers and the note", () => {
    expect(rows[4]).toEqual({
      id: "heavies-rocket-launcher-truth",
      tab: "heavies",
      weaponType: "rocketLauncher",
      name: "Truth",
      variant: "",
      totalDamage: 35940,
      magDamage: 5391,
      magazine: 3,
      totalShots: 20,
      rpm: 47,
      reloadSeconds: 2.35,
      timeToEmptySeconds: 17.4,
      bodyDamage: 1797,
      precisionDamage: null,
      textCells: { precisionDamage: "N/A" },
      note: "Assumes starting with Prototype Trueseeker, no bomblets hit the boss",
    });
  });

  it("keeps text cells such as unlimited ammo", () => {
    expect(rows[2]).toMatchObject({
      id: "heavies-machine-gun-thunderlord-cata",
      magazine: null,
      textCells: { magDamage: "inf", magazine: "inf" },
    });
  });
});

describe("weapon source snapshots", () => {
  const aegis = AegisWeaponSnapshot.parse(rawAegis);
  const quantum = QuantumWeaponSnapshot.parse(rawQuantum);

  it("have unique ids", () => {
    for (const rows of [aegis.rows, quantum.rows]) {
      expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
    }
  });

  it("contain the test cases Truth and Thunderlord in both sources", () => {
    for (const name of ["Truth", "Thunderlord"]) {
      expect(
        aegis.rows.some((r) => r.name === name),
        name,
      ).toBe(true);
      expect(
        quantum.rows.some((r) => r.name === name),
        name,
      ).toBe(true);
    }
  });

  it("cover all three Quantum tabs", () => {
    expect(new Set(quantum.rows.map((r) => r.tab))).toEqual(
      new Set(["primaries", "specials", "heavies"]),
    );
  });
});

describe("compendium-weapons.json", () => {
  const { entries } = CompendiumSnapshot.parse(rawCompendium);

  it("holds exotic weapons with their perks in the name", () => {
    const truth = entries.find(
      (e) => e.tab === "Exotic Weapons" && e.name.startsWith("Truth "),
    );
    expect(truth?.name).toContain("Prototype Trueseeker");
    expect(truth?.text).toContain("Rocket Launcher");
  });

  it("holds weapon perks with duration and condition", () => {
    const tithe = entries.find(
      (e) => e.tab === "Weapon Perks" && e.name === "Reaper's Tithe",
    );
    expect(tithe?.text).toContain("Increased Weapon Damage for 15");
    expect(tithe?.text).toContain("simultaneously killed enemies");
  });
});
