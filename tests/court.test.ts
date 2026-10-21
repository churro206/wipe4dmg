import { describe, expect, it } from "vitest";
import { parseCourtCategories, parseCourtSheet } from "../scripts/lib/court";
import rawSnapshot from "../src/data/court-buffs.json";
import { CourtSnapshot } from "../src/data/schema";

// Shortened rows in the layout of Court's Stacking Guide (htmlview, retrieved 2026-10-21).
const td = (text: string) => `<td class="s1">${text}</td>`;
const row = (...cells: string[]) =>
  `<tr style="height: 20px"><th><div>1</div></th>${cells.map(td).join("")}</tr>`;
const header = [
  "ICON",
  "FOUND/REQUIREMENT",
  "NAME",
  "TRIGGER",
  "PVE %",
  "PVE #s",
  "PVP %",
  "PVP #s",
  "% / # NOTES",
  "MISC NOTES",
  "OTHER NOTES",
  "INTRODUCED",
];
const html = [
  '<table class="waffle"><tbody>',
  row("", "Modifier Category", "", "Description", "Sources", "Stacking Rules"),
  row(
    "",
    "EXOTICS<br>INTRINSICS",
    "",
    "",
    "An effect from Exotics applied directly onto your Weapon or Ability<br>Unrelated to Debuffing, Empowering, or Surging",
    "Most Exotic Weapons<br>Most Exotic Armor",
    "Stacks with all other buffs<br>and itself",
  ),
  row("", "Category: Global Debuffs<br><br>Overview of all Global Debuffs"),
  row("", "", ...header),
  row(
    "MISC DEBUFFS",
    "",
    "",
    "*while carrying Scanner Augment",
    "Scanner Augment^<br>Deep Stone Crypt Mod",
    "Precision hits on Miniboss or Boss Weakens them",
    "20%*<br>at max",
    "tbc",
    "n/a",
    "n/a",
    "*Debuff stacks",
    "-",
    "^Only active in the Deep Stone Crypt Raid",
    "S12",
  ),
  row(
    "",
    "",
    "",
    "",
    "",
    "Gwisin Vest<br>Hunter Chest",
    "Exiting Invisibility near an enemy causes a Weaking Smoke Cloud around you",
    "15%",
    "10s",
    "7.5%",
    "5s",
    "-",
    "Smoke Cloud can be spawned in<br>neutral or Super",
    "",
    "Ep3<br>Act I",
  ),
  row(
    "",
    "Category: Exotic Intrinsics<br><br>Overview of all Exotic Intrinsics",
  ),
  row("", "", "HUNTER", "", "TITAN", "", "WARLOCK"),
  row("", "", "ICON", "NAME", "ICON", "NAME", "ICON", "NAME"),
  row(
    "",
    "",
    "",
    "Celestial Nighthawk<br>Hunter Helmet",
    "",
    "Cuirass of the Falling Star<br>Titan Chest",
    "n/a in PvP",
    "",
    "Dawn Chorus<br>Warlock Helmet",
  ),
  row("", "", "", "Liar&#39;s Handshake<br>Hunter Arms"),
  row("", "", "", "Liar&#39;s Handshake<br>Hunter Arms"),
  row("", "Category: Weapon Perks<br><br>Overview of all Weapon Perks"),
  row("", "", "ICON", "NAME", "ICON", "NAME"),
  row("", "", "", "Adagio", "", "Desperate Measures"),
  "</tbody></table>",
].join("");

describe("parseCourtSheet", () => {
  const entries = parseCourtSheet(html);

  it("reads table rows with category, group, item type and PvE values", () => {
    expect(entries[0]).toEqual({
      category: "Global Debuffs",
      group: "MISC DEBUFFS",
      name: "Scanner Augment^",
      itemType: "Deep Stone Crypt Mod",
      requirement: "*while carrying Scanner Augment",
      trigger: "Precision hits on Miniboss or Boss Weakens them",
      pve: "20%*\nat max",
      pveDuration: "tbc",
      notes: "*Debuff stacks\n-\n^Only active in the Deep Stone Crypt Raid",
    });
  });

  it("keeps the group of the rows above when the group cell is empty", () => {
    expect(entries[1]).toMatchObject({
      group: "MISC DEBUFFS",
      name: "Gwisin Vest",
      itemType: "Hunter Chest",
      pve: "15%",
      pveDuration: "10s",
    });
  });

  it("reads exotic armor in name lists once, without values", () => {
    const intrinsics = entries.filter(
      (e) => e.category === "Exotic Intrinsics",
    );
    expect(intrinsics.map((e) => e.name)).toEqual([
      "Celestial Nighthawk",
      "Cuirass of the Falling Star",
      "Dawn Chorus",
      "Liar's Handshake",
    ]);
    expect(intrinsics[1]).toMatchObject({
      itemType: "Titan Chest",
      pve: null,
      pveDuration: null,
    });
  });

  it("skips name lists without armor, e.g. weapon perks", () => {
    expect(entries.some((e) => e.category === "Weapon Perks")).toBe(false);
  });
});

describe("parseCourtCategories", () => {
  it("reads the overview of damage buff categories", () => {
    expect(parseCourtCategories(html)).toEqual([
      {
        name: "EXOTICS INTRINSICS",
        description:
          "An effect from Exotics applied directly onto your Weapon or Ability\nUnrelated to Debuffing, Empowering, or Surging",
        sources: "Most Exotic Weapons\nMost Exotic Armor",
        stacking: "Stacks with all other buffs\nand itself",
      },
    ]);
  });
});

describe("Court snapshot", () => {
  const snapshot = CourtSnapshot.parse(rawSnapshot);

  it("has table rows of every category with values", () => {
    const categories = new Set(
      snapshot.entries.filter((e) => e.pve !== null).map((e) => e.category),
    );
    expect([...categories]).toEqual([
      "Global Debuffs",
      "Empowering Buffs",
      "Weapon Surges",
      "Amplification Modifiers",
    ]);
  });

  it("lists the exotic armor with intrinsic damage bonuses", () => {
    const names = snapshot.entries
      .filter((e) => e.category === "Exotic Intrinsics")
      .map((e) => e.name);
    expect(names).toContain("Cuirass of the Falling Star");
    expect(names).toContain("Dawn Chorus");
    expect(names).toContain("Celestial Nighthawk");
  });

  it("has the seven damage buff categories", () => {
    expect(snapshot.categories.map((c) => c.name)).toEqual([
      "GLOBAL DEBUFFS",
      "EMPOWERING BUFFS",
      "WEAPON SURGES",
      "AMPLIFICATION MODIFIERS",
      "EXOTICS INTRINSICS",
      "WEAPON PERKS",
      "WORLD & ACTIVITY",
    ]);
  });
});
