import { describe, expect, it } from "vitest";
import rawBosses from "../src/data/bosses.json";
import { Boss } from "../src/data/schema";

describe("bosses data file", () => {
  const bosses = Boss.array().parse(rawBosses);

  it("has unique ids", () => {
    const ids = bosses.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a damage phase for most bosses", () => {
    const withPhase = bosses.filter((b) => b.damagePhaseSeconds.value !== null);
    expect(withPhase.length).toBeGreaterThan(bosses.length / 2);
  });
});
