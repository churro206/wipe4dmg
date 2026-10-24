import { describe, expect, it } from "vitest";
import { parseCompendiumArtifactsTab } from "../scripts/lib/compendiumArtifacts";

// Shortened rows in the layout of the Compendium tab "Artifact Perks" (htmlview, retrieved
// 2026-10-24): a header row with the artifact, then per perk row a row of names (10 cells) and a row
// of texts (7 cells).
const td = (text: string) => `<td class="s1">${text}</td>`;
const row = (...cells: string[]) =>
  `<tr style="height: 20px"><th><div>1</div></th>${cells.map(td).join("")}</tr>`;
const names = (a: string, b: string, c: string) =>
  row("", "", a, "", "", b, "", "", c, "");
const texts = (a: string, b: string, c: string) =>
  row("", a, "", b, "", c, "");
const html = [
  '<table class="waffle"><tbody>',
  row("Artifact Perks"),
  row("Artifacts from past seasons are equippable."),
  row("", "Encrypted Data Disk (Renegades)", ""),
  names("Press The Advantage", "Dielectric", "Elemental Orbs: Arc"),
  texts("Shield break: +20 Stability.", "Bolt Charge on kill.", "Arc Orbs."),
  names("Reload at Range", "Counter Energy", "Sniper's Meditation"),
  texts("Precision hits.", "Champion stun.", "Sniper Rifle Direct Hit."),
  row("", "Hunter's Journal (Echoes)", ""),
  names("Elemental Siphon", "Counter Energy", "Prismatic Transfer"),
  texts("Creates a pickup.", "Champion stun.", "Super cast."),
  "</tbody></table>",
].join("");

describe("parseCompendiumArtifactsTab", () => {
  const entries = parseCompendiumArtifactsTab(html);

  it("reads each perk with its artifact, row and column (the tier)", () => {
    expect(entries.map((e) => [e.section, e.name, e.extra])).toEqual([
      ["Encrypted Data Disk (Renegades)", "Press The Advantage", "row 1 column 1"],
      ["Encrypted Data Disk (Renegades)", "Dielectric", "row 1 column 2"],
      ["Encrypted Data Disk (Renegades)", "Elemental Orbs: Arc", "row 1 column 3"],
      ["Encrypted Data Disk (Renegades)", "Reload at Range", "row 2 column 1"],
      ["Encrypted Data Disk (Renegades)", "Counter Energy", "row 2 column 2"],
      ["Encrypted Data Disk (Renegades)", "Sniper's Meditation", "row 2 column 3"],
      ["Hunter's Journal (Echoes)", "Elemental Siphon", "row 1 column 1"],
      ["Hunter's Journal (Echoes)", "Counter Energy", "row 1 column 2"],
      ["Hunter's Journal (Echoes)", "Prismatic Transfer", "row 1 column 3"],
    ]);
  });

  it("takes the text from the row below the names", () => {
    expect(entries[5].text).toBe("Sniper Rifle Direct Hit.");
  });

  it("fails on a page without perks", () => {
    expect(() => parseCompendiumArtifactsTab("<table></table>")).toThrow(
      /No entries/,
    );
  });
});
