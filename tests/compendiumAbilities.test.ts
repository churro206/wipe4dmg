import { describe, expect, it } from "vitest";
import {
  hasQuote,
  parseCompendiumTab,
} from "../scripts/lib/compendiumAbilities";
import rawSnapshot from "../src/data/compendium-abilities.json";
import { CompendiumSnapshot } from "../src/data/schema";

// Shortened rows in the layout of the Compendium tab "Arc" (htmlview, retrieved 2026-10-19).
const row = (cells: string) =>
  `<tr style="height: 20px"><th id="1R1"><div>1</div></th>${cells}</tr>`;
const html = [
  '<table class="waffle"><tbody>',
  row(
    '<td class="s14"></td><td class="s9" colspan="2">Go back to the top!</td><td class="s10">Arc Subclasses</td>',
  ),
  row('<td class="s16"></td><td class="s15" colspan="2">Super Abilities</td>'),
  row(
    '<td class="s14"></td><td class="s17">Thundercrash</td><td class="s28"><div><img src="x"/></div></td>' +
      '<td class="s19" colspan="10"><span style="color:#ffd966;">General Super Information<br></span>' +
      "Base Duration: Up to 4.5 seconds<br><br>Detonates on impact with a surface or enemy, dealing " +
      '<span style="color:#a4c2f4;">180 </span><span style="color:#ea9999;">[?] </span>impact damage, as well as up to ' +
      '<span style="color:#a4c2f4;">8,260 </span><span style="color:#ea9999;">[?]</span> explosive damage over 10 meters.</td>' +
      '<td class="s40">Tier 2 Super<br><br>556 seconds.</td>',
  ),
  row(
    '<td class="s14"></td><td class="s15" colspan="2">Aspect</td><td class="s15" colspan="10">Information</td><td class="s15">Fragment Slots</td>',
  ),
  row(
    '<td class="s14"></td><td class="s17">Knock &#39;Em Down</td><td class="s19" colspan="10">While &amp; Radiant: grants more knives.</td><td>2</td>',
  ),
  "</tbody></table>",
].join("");

describe("parseCompendiumTab", () => {
  const entries = parseCompendiumTab(html, "Arc");

  it("reads entries with name, text and the section above them", () => {
    expect(entries.map((e) => e.name)).toEqual([
      "Thundercrash",
      "Knock 'Em Down",
    ]);
    expect(entries[0]).toMatchObject({
      tab: "Arc",
      section: "Super Abilities",
      extra: "Tier 2 Super\n\n556 seconds.",
    });
    expect(entries[1].section).toBe("Aspect");
  });

  it("turns the cell HTML into plain text with line breaks and decoded characters", () => {
    expect(entries[0].text).toContain(
      "General Super Information\nBase Duration: Up to 4.5 seconds",
    );
    expect(entries[0].text).toContain(
      "dealing 180 [?] impact damage, as well as up to 8,260 [?] explosive damage",
    );
    expect(entries[1].text).toBe("While & Radiant: grants more knives.");
  });

  it("skips navigation rows and section titles", () => {
    expect(entries.some((e) => e.name.startsWith("Go back"))).toBe(false);
  });

  it("fails if the page has no entries, e.g. after a layout change", () => {
    expect(() => parseCompendiumTab("<html></html>", "Arc")).toThrow(
      /no entries/i,
    );
  });
});

describe("hasQuote", () => {
  const entries = parseCompendiumTab(html, "Arc");

  it("finds a quote in the text of the named entry", () => {
    expect(
      hasQuote(entries, {
        tab: "Arc",
        entry: "Thundercrash",
        quote: "up to 8,260 [?] explosive damage",
      }),
    ).toBe(true);
  });

  it("does not find a changed value or a quote from another entry", () => {
    expect(
      hasQuote(entries, {
        tab: "Arc",
        entry: "Thundercrash",
        quote: "up to 9,000 [?] explosive damage",
      }),
    ).toBe(false);
    expect(
      hasQuote(entries, {
        tab: "Arc",
        entry: "Knock 'Em Down",
        quote: "8,260",
      }),
    ).toBe(false);
  });
});

describe("compendium-abilities.json", () => {
  const snapshot = CompendiumSnapshot.parse(rawSnapshot);

  it("contains the supers of every element tab", () => {
    for (const tab of ["Arc", "Solar", "Void", "Stasis", "Strand"]) {
      expect(
        snapshot.entries.some(
          (e) => e.tab === tab && e.section === "Super Abilities",
        ),
        tab,
      ).toBe(true);
    }
  });

  it("still contains the Thundercrash values from ADR 0009", () => {
    expect(
      hasQuote(snapshot.entries, {
        tab: "Arc",
        entry: "Thundercrash",
        quote: "up to 8,260 [?] explosive damage",
      }),
    ).toBe(true);
  });
});
