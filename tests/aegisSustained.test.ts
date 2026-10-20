// Snapshot of the Aegis tab "Sustained": shots, magazines and time to empty per weapon, the second
// timing source of the weapon import (ADR 0013, point 7).

import { describe, expect, it } from "vitest";
import { parseAegisSustained } from "../scripts/lib/aegisSustained";
import rawSustained from "../src/data/aegis-sustained.json";
import { AegisSustainedSnapshot } from "../src/data/schema";

// Rows copied from the Aegis tab "Sustained" (retrieved 2026-10-20); the ability row is left out.
const csv = [
  'Name,Type,Family,Icon,#,Notes,Distribution,"peak\nRate",TtE,Base,Perk,Surge,Buff,Debuff,200,Single,"TFS\nTotal","TFS\nDPS",Total,DPS,"diff\nTotal","diff\nDPS"',
  '"Truth\nPrototype Truthseeker, Reaper\'s Tithe x4, Argent Ordnance",power,rocket,,14,2134ms reload,3-3-3-3-2,0.533,13.333,"2,254",1.610,1.220,1.350,1.300,1.100,"8,545","2,505,849","139,508","119,636","8,973",2.449,3.299',
  '"Parasite\nEnvious Arsenal, x20 first shot",power,HGL,,18,1450ms swap,1-1-1...,1.450,24.650,"2,032",,1.220,1.350,1.300,1.100,"4,785","4,339,647","111,256","95,708","3,883",1.131,1.790',
  '"Thunderlord\nassumes only one reload post-nerf",power,LMG,,379,2833ms reload,379,0.083,34.124,114,,1.220,1.350,1.300,1.100,268,"5,339,126","137,017","101,659","2,979",0.977,1.115',
  '"Merciless\nImpetus, two kills",special,fusion,,17,"1000ms charge\n1317ms reload",7-8-2,0.516,11.700,"1,681",,1.220,1.350,1.300,1.150,"4,139","2,735,580","167,662","70,355","6,013",1.319,1.840',
  '"Thundercrash",super,,,1,,N/A,,,"8,260",,,,,,,,,,,,',
].join("\n");

describe("parseAegisSustained", () => {
  const rows = parseAegisSustained(csv);

  it("reads name, assumptions, shots, magazines, reload, peak rate and time to empty", () => {
    expect(rows[0]).toEqual({
      id: "truth-prototype-truthseeker-reaper-s-tithe-x4-argent-ordnance",
      name: "Truth",
      assumptions: [
        "Prototype Truthseeker",
        "Reaper's Tithe x4",
        "Argent Ordnance",
      ],
      ammo: "heavy",
      family: "rocket",
      shots: 14,
      magazines: [3, 3, 3, 3, 2],
      repeating: false,
      reloadMs: 2134,
      chargeMs: null,
      swapMs: null,
      notes: "2134ms reload",
      peakRateSeconds: 0.533,
      timeToEmptySeconds: 13.333,
      base: 2254,
    });
  });

  it("reads a repeating distribution and a swap instead of a reload", () => {
    expect(rows[1]).toMatchObject({
      magazines: [1, 1, 1],
      repeating: true,
      swapMs: 1450,
      reloadMs: null,
    });
  });

  it("reads charge and reload from notes with several lines", () => {
    expect(rows[3]).toMatchObject({
      ammo: "special",
      magazines: [7, 8, 2],
      chargeMs: 1000,
      reloadMs: 1317,
    });
  });

  it("keeps only weapons", () => {
    expect(rows.map((r) => r.name)).toEqual([
      "Truth",
      "Parasite",
      "Thunderlord",
      "Merciless",
    ]);
  });
});

describe("aegis-sustained.json", () => {
  const { rows } = AegisSustainedSnapshot.parse(rawSustained);

  it("has unique ids and holds Truth and Thunderlord", () => {
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
    for (const name of ["Truth", "Thunderlord"])
      expect(rows.some((r) => r.name === name)).toBe(true);
  });
});
