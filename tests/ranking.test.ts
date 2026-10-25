import { describe, expect, it } from "vitest";
import { deltaPairs, spearman, topHits, type Item } from "./lib/ranking";

const item = (
  name: string,
  assumptions: string[],
  aegis: number,
  ours: number,
): Item => ({ id: `${name}-${assumptions.join("-")}`, tab: "sustained", name, assumptions, aegis, ours });

describe("spearman", () => {
  it("is 1 for the same order and -1 for the reverse", () => {
    expect(spearman([1, 2, 3, 4], [10, 20, 30, 40])).toBeCloseTo(1);
    expect(spearman([1, 2, 3, 4], [40, 30, 20, 10])).toBeCloseTo(-1);
  });

  it("depends on the order only, not on the size", () => {
    expect(spearman([1, 2, 3], [1, 5, 1000])).toBeCloseTo(1);
  });

  it("gives ties the mean rank", () => {
    // ranks of b: 1.5, 1.5, 3 -> Pearson with ranks 1, 2, 3
    expect(spearman([1, 2, 3], [5, 5, 9])).toBeCloseTo(0.866, 3);
  });

  it("is null without variation", () => {
    expect(spearman([1, 1, 1], [1, 2, 3])).toBeNull();
  });
});

describe("topHits", () => {
  it("counts the top 3 of Aegis that are in our top 5", () => {
    const aegis = [100, 90, 80, 70, 60, 50, 40];
    const ours = [100, 90, 10, 70, 60, 50, 40]; // third of Aegis falls to the last place
    expect(topHits(aegis, ours, 3, 5)).toBe(2);
    expect(topHits(aegis, aegis, 3, 5)).toBe(3);
  });
});

describe("deltaPairs", () => {
  it("pairs rows of one name that differ by exactly one assumption", () => {
    const pairs = deltaPairs([
      item("Truth", [], 100, 100),
      item("Truth", ["Argent Ordnance"], 130, 126),
      item("Truth", ["Argent Ordnance", "Prototype"], 150, 160),
      item("Xenophage", [], 100, 100),
    ]);
    expect(pairs.map((p) => [p.item, p.added])).toEqual([
      [["Truth", "Argent Ordnance"].join(", "), "Argent Ordnance"],
      [["Truth", "Argent Ordnance", "Prototype"].join(", "), "Prototype"],
    ]);
    expect(pairs[0].aegisDelta).toBeCloseTo(30);
    expect(pairs[0].ourDelta).toBeCloseTo(26);
    expect(pairs[0].gap).toBeCloseTo(-4);
  });

  it("ignores pairs with two or more differences and other tabs", () => {
    const pairs = deltaPairs([
      item("Truth", [], 100, 100),
      item("Truth", ["A", "B"], 150, 150),
      { ...item("Truth", ["A"], 120, 120), tab: "swap" },
    ]);
    expect(pairs).toEqual([]);
  });
});
