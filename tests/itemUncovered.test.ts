// The report "sentences with a number and no rule" (ADR 0019, point 5): a sentence of an item's
// texts with a number is covered by a `$clarity`/`$compendium` quote or a notModelled quote.

import { describe, expect, it } from "vitest";
import { itemQuotes, uncoveredSentences } from "../scripts/lib/items/uncovered";

describe("uncoveredSentences", () => {
  const text = [
    "Fires at 300 RPM. Kills refill the magazine.",
    "• Minors: 1 ammo",
    "Grants 40 Reload Speed and Increases Magazine Size by 1 (4🠚5)",
  ].join("\n");

  it("lists the sentences with a number that no quote covers", () => {
    expect(uncoveredSentences([text], [])).toEqual([
      "Fires at 300 RPM.",
      "• Minors: 1 ammo",
      "Grants 40 Reload Speed and Increases Magazine Size by 1 (4🠚5)",
    ]);
  });

  it("a quote inside a sentence covers it", () => {
    expect(uncoveredSentences([text], ["Fires at 300 RPM", "1 ammo"])).toEqual([
      "Grants 40 Reload Speed and Increases Magazine Size by 1 (4🠚5)",
    ]);
  });
});

describe("itemQuotes", () => {
  it("collects quotes of references, expressions, sources and notModelled", () => {
    const item = {
      a: "$clarity[Frame](\"Fires at 300 RPM\")",
      b: { expr: "$compendium[X](\"20 Scorch\") * 6", note: "n" },
      c: { value: 1, source: { quote: "Increases reserves by 6" } },
      notModelled: [{ quote: "Kills refill", reason: "no adds (ADR 0015)" }],
    };
    expect(itemQuotes(item).sort()).toEqual(
      ["20 Scorch", "Fires at 300 RPM", "Increases reserves by 6", "Kills refill"].sort(),
    );
  });
});
