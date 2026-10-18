import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import { loadBuckets, loadEffects } from "../src/engine/loadData";

describe("loadBuckets", () => {
  it("accepts the buckets data file", () => {
    expect(loadBuckets(rawBuckets).length).toBeGreaterThan(0);
  });

  it("rejects an unknown stacking rule", () => {
    expect(() =>
      loadBuckets([{ ...rawBuckets[0], stacking: "sometimes" }]),
    ).toThrow();
  });
});

describe("loadEffects", () => {
  it("accepts the effects data file", () => {
    expect(loadEffects(rawEffects).length).toBeGreaterThan(0);
  });

  it("rejects an effect without parts", () => {
    expect(() => loadEffects([{ ...rawEffects[0], parts: [] }])).toThrow();
  });
});
