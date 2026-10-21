import { describe, expect, it } from "vitest";
import { parseCompendiumArmorTab } from "../scripts/lib/compendiumArmor";
import rawSnapshot from "../src/data/compendium-armor.json";
import { CompendiumSnapshot } from "../src/data/schema";

// Shortened rows in the layout of the Compendium tab "Exotic Armors" (htmlview, retrieved 2026-10-21):
// three class columns of Armor, Icon, Notes; the row below a name row holds the intrinsic names.
const td = (text: string) => `<td class="s1">${text}</td>`;
const row = (...cells: string[]) =>
  `<tr style="height: 20px"><th><div>1</div></th>${cells.map(td).join("")}</tr>`;
const html = [
  '<table class="waffle"><tbody>',
  row("Exotic Armor"),
  row("Hunters", "Titans", "Warlocks"),
  row(
    "Armor",
    "Icon",
    "Notes",
    "Armor",
    "Icon",
    "Notes",
    "Armor",
    "Icon",
    "Notes",
  ),
  row(
    "Celestial Nighthawk",
    "",
    "Replaces Golden Gun with a modified single shot.",
    "Cuirass of the Falling Star",
    "",
    "Thundercrash deals 55% increased damage.",
    "Dawn Chorus",
    "",
    "Daybreak Projectiles trigger an Ignition.",
  ),
  row("Hawkeye Hack", "Glorious Charge", "Rites of Ember"),
  row("Aeon Sects"),
  row(
    "Sect of Force<br><br>Foebreaker Chance",
    "",
    "Upon scoring 4 Precision Hits",
    "",
    "",
    "",
    "",
    "",
    "",
  ),
  "</tbody></table>",
].join("");

describe("parseCompendiumArmorTab", () => {
  const entries = parseCompendiumArmorTab(html);

  it("reads each exotic with its class, notes and intrinsic", () => {
    expect(entries).toEqual([
      {
        tab: "Exotic Armors",
        section: "hunter",
        name: "Celestial Nighthawk",
        text: "Replaces Golden Gun with a modified single shot.",
        extra: "Hawkeye Hack",
      },
      {
        tab: "Exotic Armors",
        section: "titan",
        name: "Cuirass of the Falling Star",
        text: "Thundercrash deals 55% increased damage.",
        extra: "Glorious Charge",
      },
      {
        tab: "Exotic Armors",
        section: "warlock",
        name: "Dawn Chorus",
        text: "Daybreak Projectiles trigger an Ignition.",
        extra: "Rites of Ember",
      },
    ]);
  });
});

describe("compendium-armor.json", () => {
  const snapshot = CompendiumSnapshot.parse(rawSnapshot);

  it("covers the exotic armor of all three classes", () => {
    const classes = new Set(snapshot.entries.map((e) => e.section));
    expect([...classes].sort()).toEqual(["hunter", "titan", "warlock"]);
    expect(snapshot.entries.length).toBeGreaterThan(120);
  });
});
