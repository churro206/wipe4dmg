// A source whose note says "Derived…" has the status "derived", never "unverified" (B4a, step 2).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Source } from "../src/data/schema";

const collect = (node: unknown, out: Source[]) => {
  if (Array.isArray(node)) node.forEach((n) => collect(n, out));
  else if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    if (typeof o.note === "string" && typeof o.status === "string" && typeof o.name === "string")
      out.push(o as Source);
    Object.values(o).forEach((v) => collect(v, out));
  }
};

describe("derived status", () => {
  it("is part of the Source schema", () => {
    expect(
      Source.safeParse({ name: "x", retrieved: "2026-11-01", status: "derived" }).success,
    ).toBe(true);
  });

  it("is written for every weapon package source with a Derived note", () => {
    const sources: Source[] = [];
    collect(JSON.parse(readFileSync("src/data/weapon-packages.json", "utf8")), sources);
    const derivedNotes = sources.filter((s) => s.note?.startsWith("Derived"));
    expect(derivedNotes.length).toBeGreaterThan(0);
    const wrong = derivedNotes.filter((s) => s.status === "unverified");
    expect(wrong.map((s) => `${s.name}: ${s.note?.slice(0, 60)}`)).toEqual([]);
  });
});
