import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawIcons from "../src/data/icons.json";
import {
  loadBuckets,
  loadEffects,
  loadIconIndex,
} from "../src/engine/loadData";

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

  it("rejects an effect without modifiers", () => {
    expect(() => loadEffects([{ ...rawEffects[0], modifiers: [] }])).toThrow();
  });
});

describe("loadIconIndex", () => {
  it("accepts the icons data file", () => {
    expect(Object.keys(loadIconIndex(rawIcons).icons).length).toBeGreaterThan(
      0,
    );
  });

  it("rejects an index without icons", () => {
    expect(() =>
      loadIconIndex({ manifestVersion: "x", retrieved: "y" }),
    ).toThrow();
  });
});
