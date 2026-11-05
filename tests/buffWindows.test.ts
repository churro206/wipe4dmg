// V3: a buff that ramps up (stacks change while it stands) opens a new window at every change, and the
// timeline labels each window with its own factor. Display only: the damage stays as it was.

import { describe, expect, it } from "vitest";
import { weapons } from "../src/ui/data";
import { bareWeaponRun } from "../src/ui/weaponBuild";
import { buffRows } from "../src/ui/weaponTimeline";

const weaponOf = (id: string) => weapons.find((w) => w.id === id)!;

describe("ramp buff in the log (through buildSimulation)", () => {
  const run = bareWeaponRun(weaponOf("outbreak-perfected"), false, 30);
  const log = run.buffLog.filter((b) => b.buffId === "nanites");

  it("Outbreak Perfected: Nanites open one window per stack change, each with its own factor", () => {
    expect(log.length).toBeGreaterThan(2);
    const factors = log.map((b) => b.factor);
    expect(factors[0]).toBeLessThan(factors[factors.length - 1]);
    for (let i = 1; i < log.length; i++) {
      expect(log[i - 1].endMs).toBeLessThanOrEqual(log[i].startMs); // no overlap
      expect(log[i].stacks === log[i - 1].stacks && log[i].startMs === log[i - 1].endMs).toBe(false);
    }
  });

  it("the timeline shows the factor of each window, not the final one", () => {
    const rows = buffRows(run.buffLog, 30);
    const nanites = rows.filter((r) => r.label.startsWith("Nanites"));
    expect(nanites.length).toBeGreaterThan(1);
    const first = nanites.find((r) => r.windows.some((w) => w.startMs === log[0].startMs))!;
    const percent = Math.round((log[0].factor - 1) * 1000) / 10;
    expect(first.label).toBe(`Nanites +${percent} %`);
    expect(new Set(nanites.map((r) => r.label)).size).toBe(nanites.length);
  });
});
