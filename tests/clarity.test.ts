// Snapshot of the Clarity database (ADR 0013): perk, catalyst and armor trait texts by hash.

import { describe, expect, it } from "vitest";
import { parseClarity } from "../scripts/lib/clarity";
import rawClarity from "../src/data/clarity.json";
import { ClaritySnapshot } from "../src/data/schema";

// Shaped like descriptions/clarity.json of the Live-Clarity-Database (version 2.0625).
const raw = {
  "726894353": {
    hash: 726894353,
    name: "Truth Catalyst",
    itemHash: 1201830623,
    itemName: "Truth",
    type: "Weapon Catalyst Exotic",
    descriptions: {
      en: [
        {
          linesContent: [
            { text: "'Reaper's Tithe' grants " },
            { text: "20%|30%|40%", classNames: ["pve"] },
            { text: " increased damage for 15 seconds." },
          ],
        },
        { classNames: ["spacer"] },
        { linesContent: [{ text: "Timer only starts after firing." }] },
      ],
    },
  },
  "644105": {
    hash: 644105,
    name: "Heavy Ammo Finder",
    type: "Armor Mod General",
    descriptions: { en: [{ linesContent: [{ text: "Mod text." }] }] },
  },
};

describe("parseClarity", () => {
  it("flattens the description into plain text lines", () => {
    expect(parseClarity(raw)).toEqual([
      {
        hash: 644105,
        name: "Heavy Ammo Finder",
        type: "Armor Mod General",
        itemName: null,
        text: "Mod text.",
      },
      {
        hash: 726894353,
        name: "Truth Catalyst",
        type: "Weapon Catalyst Exotic",
        itemName: "Truth",
        text: "'Reaper's Tithe' grants 20%|30%|40% increased damage for 15 seconds.\nTimer only starts after firing.",
      },
    ]);
  });
});

describe("clarity.json", () => {
  const { entries } = ClaritySnapshot.parse(rawClarity);

  it("knows the catalysts of the test cases", () => {
    const catalyst = (item: string) =>
      entries.find(
        (e) => e.itemName === item && e.type === "Weapon Catalyst Exotic",
      );
    expect(catalyst("Truth")?.text).toContain("Reaper's Tithe");
    expect(catalyst("Thunderlord")?.text).toContain("refills 5 ammo");
  });
});
