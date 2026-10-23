import { describe, expect, it } from "vitest";
import { parseCompendiumClassTab } from "../scripts/lib/compendiumClass";

// Shortened rows in the layout of the Compendium tab "Exotic Class" (htmlview, retrieved 2026-10-23):
// section titles in one cell, two perks per row in three columns (name, icon, text).
const td = (text: string) => `<td class="s1">${text}</td>`;
const row = (...cells: string[]) =>
  `<tr style="height: 20px"><th><div>1</div></th>${cells.map(td).join("")}</tr>`;
const html = [
  '<table class="waffle"><tbody>',
  row("Exotic Class Perks"),
  row("Class-agnostic Perks"),
  row("Spirit of the Assassin", "", "Grants Void Invisibility.", "Spirit of Verity", "", "Death Throes."),
  row("Hunter-exclusive Perks"),
  row("Spirit of Caliban", "", "Melee Kills trigger an Ignition.", "", "", ""),
  row("Warlock-exclusive Perks"),
  row("Spirit of Vesper", "", "Arc Shockwave.", "", "", ""),
  row("Exotic Class Items will only apply their perks while the Prismatic subclass is equipped!"),
  "</tbody></table>",
].join("");

describe("parseCompendiumClassTab", () => {
  const entries = parseCompendiumClassTab(html);

  it("reads both perks of a row with the class of the section", () => {
    expect(entries.map((e) => [e.section, e.name, e.text])).toEqual([
      ["any", "Spirit of the Assassin", "Grants Void Invisibility."],
      ["any", "Spirit of Verity", "Death Throes."],
      ["hunter", "Spirit of Caliban", "Melee Kills trigger an Ignition."],
      ["warlock", "Spirit of Vesper", "Arc Shockwave."],
    ]);
  });

  it("fails on a page without perks", () => {
    expect(() => parseCompendiumClassTab("<table></table>")).toThrow(
      /No entries/,
    );
  });
});
