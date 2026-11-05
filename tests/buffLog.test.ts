// V3: the buffs of a weapon (Vex Calculated Balance, Truth's Reaper's Tithe) show up in the result as a
// log, for the timeline of an expanded row. Display only: the damage stays as it was.

import { describe, expect, it } from "vitest";
import { weapons } from "../src/ui/data";
import { bareWeaponRun } from "../src/ui/weaponBuild";
import { buffRows, magazineNote } from "../src/ui/weaponTimeline";

const weaponOf = (id: string) => weapons.find((w) => w.id === id)!;

describe("buff log of the result", () => {
  it("Vex: Calculated Balance, 20 % for 5 s, from the 15th hit; every further 15 hits renew it (Clarity)", () => {
    const run = bareWeaponRun(weaponOf("vex-mythoclast"), true, 30);
    const log = run.buffLog.filter((b) => b.buffId === "calculated-balance");
    expect(log.length).toBeGreaterThan(0);
    const hits = run.damageInstances
      .filter((d) => d.id === "shot")
      .map((d) => d.timeMs)
      .sort((a, b) => a - b);
    expect(log[0].startMs).toBe(hits[14]);
    // one window: it ends 5 s after the last renewal, which is a 15th hit (hit 15, 30, 45, ...)
    const lastGrant = log[0].endMs - 5000;
    expect(lastGrant).toBeGreaterThanOrEqual(log[0].startMs);
    expect(hits.filter((_, i) => i % 15 === 14)).toContain(lastGrant);
    expect(log[0].factor).toBeCloseTo(1.2, 9);
    expect(log[0].name).toBe("Calculated Balance");
    expect(log[0].stacks).toBe(1);
  });

  it("Vex without the catalyst has no buff", () => {
    expect(bareWeaponRun(weaponOf("vex-mythoclast"), false, 30).buffLog).toEqual([]);
  });

  it("Truth: Reaper's Tithe is logged as well", () => {
    const run = bareWeaponRun(weaponOf("truth"), true, 30);
    const log = run.buffLog.filter((b) => b.buffId === "reapers-tithe");
    expect(log.length).toBeGreaterThan(0);
    expect(log[0].name).toBe("Reaper's Tithe x4");
    expect(log[0].factor).toBeGreaterThan(1);
  });

  it("a renewed buff ends where the next one starts (no overlap)", () => {
    const run = bareWeaponRun(weaponOf("vex-mythoclast"), true, 60);
    const log = run.buffLog.filter((b) => b.buffId === "calculated-balance");
    for (let i = 1; i < log.length; i++) expect(log[i - 1].endMs).toBeLessThanOrEqual(log[i].startMs);
  });

  it("rows for the timeline: one row per buff, windows cut at the phase", () => {
    const rows = buffRows(
      [
        { ownerId: "w", buffId: "a", name: "A", startMs: 1000, endMs: 6000, stacks: 1, factor: 1.2 },
        { ownerId: "w", buffId: "a", name: "A", startMs: 20000, endMs: 25000, stacks: 1, factor: 1.2 },
        { ownerId: "w", buffId: "b", name: "B", startMs: 28000, endMs: Infinity, stacks: 2, factor: 1.1 },
      ],
      30,
    );
    expect(rows.map((r) => r.label)).toEqual(["A +20 %", "B +10 %"]);
    expect(rows[0].windows).toEqual([
      { startMs: 1000, endMs: 6000, uptime: 1 },
      { startMs: 20000, endMs: 25000, uptime: 1 },
    ]);
    expect(rows[1].windows[0].endMs).toBe(30000);
  });
});

describe("the magazine note", () => {
  it("counts refills and reloads apart", () => {
    expect(magazineNote(11, 1)).toBe("11 refills, 1 reload");
    expect(magazineNote(1, 2)).toBe("1 refill, 2 reloads");
    expect(magazineNote(0, 3)).toBe("3 reloads");
    expect(magazineNote(0, 0)).toBe("");
  });

  it("Vex over 60 s: refills and a reload in between, the note says so", () => {
    const run = bareWeaponRun(weaponOf("vex-mythoclast"), false, 60);
    expect(run.reloadsMs.length).toBeGreaterThan(0);
    expect(magazineNote(run.refillsMs.length, run.reloadsMs.length)).toContain("reload");
  });
});
