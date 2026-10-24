// Impact of what is missing (block D): every missing key of the coverage gets the effect Aegis measures
// for it, from two rows of the same item that differ only by that key. Rule: tests/lib/missingImpact.ts.

import { describe, expect, it } from "vitest";
import type { CoverageRow } from "./lib/aegisCoverage";
import { missingImpact, type MeasuredRow } from "./lib/missingImpact";

const missing = (id: string, keys: string[], tab: CoverageRow["tab"] = "sustained") =>
  ({ tab, id, label: id, verdict: "missing", detail: "", keys }) as CoverageRow;
const measured = (
  id: string,
  name: string,
  assumptions: string[],
  total: number | null,
  tab: MeasuredRow["tab"] = "sustained",
): MeasuredRow => ({ tab, id, name, assumptions, total });

describe("missingImpact", () => {
  const rows = [
    measured("with", "The Lament", ["2L1H combo", "Lucent Blades x3"], 130),
    measured("without", "The Lament", ["2L1H combo"], 100),
    measured("small", "Truth", ["Bait and Switch"], 101),
    measured("small-base", "Truth", [], 100),
    measured("other-tab", "Truth", ["Pack Hunter"], 200, "swap"),
    measured("lonely", "Telesto", ["body"], 50),
  ];
  const impact = missingImpact(
    [
      missing("with", ["Lucent Blades x3"]),
      missing("small", ["Bait and Switch"]),
      missing("other-tab", ["Pack Hunter"], "swap"),
      missing("lonely", ["body"]),
      missing("x", ["super: Song of Flame"]),
      missing("y", ["Wolfsbane (no package)"]),
    ],
    rows,
  );
  const of = (key: string) => impact.find((i) => i.key === key)!;

  it("measures a key by two rows of the same item that differ only by it", () => {
    expect(of("Lucent Blades x3").verdict).toBe("above");
    expect(of("Lucent Blades x3").impact).toBeCloseTo(0.3);
    expect(of("Lucent Blades x3").pairs).toEqual([
      { tab: "sustained", withId: "with", withoutId: "without", ratio: 1.3 },
    ]);
  });

  it("calls an effect under 2 % below the threshold (CLAUDE.md)", () => {
    expect(of("Bait and Switch").verdict).toBe("below");
  });

  it("takes a partner only from the same tab", () => {
    expect(of("Pack Hunter")).toMatchObject({ verdict: "noPair", impact: null });
  });

  it("separates missing items, playstyle and named perks without a pair", () => {
    expect(of("body").verdict).toBe("playstyle");
    expect(of("Pack Hunter").verdict).toBe("noPair");
    expect(of("super: Song of Flame").verdict).toBe("item");
    expect(of("Wolfsbane (no package)").verdict).toBe("item");
  });

  it("lists the measured keys first, the largest effect first", () => {
    expect(impact.map((i) => i.verdict)).toEqual([
      "above",
      "item",
      "item",
      "noPair",
      "playstyle",
      "below",
    ]);
  });
});
