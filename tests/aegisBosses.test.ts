import { describe, expect, it } from "vitest";
import { parseAegisBosses } from "../scripts/lib/aegisBosses";
import { parseCsv } from "../scripts/lib/csv";

const RETRIEVED = "2026-10-18";

describe("parseCsv", () => {
  it("splits rows and fields", () => {
    expect(parseCsv("a,b\nc,d")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("keeps commas, quotes and line breaks inside quoted fields", () => {
    expect(parseCsv('"a,b","say ""hi""","line\nbreak"')).toEqual([
      ["a,b", 'say "hi"', "line\nbreak"],
    ]);
  });

  it("handles Windows line endings and a trailing line break", () => {
    expect(parseCsv("a,b\r\nc,d\r\n")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });
});

// Same layout as the Aegis tab "Bosses": a title row, then the header row. Test input, not game data.
const header =
  '#,Activity,Boss,"ingame\nHealth",Notes,Phase,"1 phase\nDescription"';
const csv = [
  "NAME,,,INFO,,,",
  header,
  "1,Last Wish,Kalli,100,note,72,30s middle damage",
  "2,Deep Stone Crypt,Crypt Security,100,,Variable,",
  "3,Vault of Glass,,100,,15,",
  "4,Vault of Glass,Atheon,100,,30,",
].join("\n");

describe("parseAegisBosses", () => {
  const bosses = parseAegisBosses(csv, RETRIEVED);

  it("reads activity, name and damage phase", () => {
    expect(bosses[0]).toMatchObject({
      id: "last-wish-kalli",
      activity: "Last Wish",
      name: "Kalli",
      description: "30s middle damage",
    });
    expect(bosses[0].damagePhaseSeconds.value).toBe(72);
    expect(bosses[0].damagePhaseSeconds.source.status).toBe("verified");
    expect(bosses[0].damagePhaseSeconds.source.retrieved).toBe(RETRIEVED);
  });

  it("marks a damage phase that is not a number as missing", () => {
    const security = bosses.find((b) => b.name === "Crypt Security")!;
    expect(security.damagePhaseSeconds.value).toBeNull();
    expect(security.damagePhaseSeconds.source.status).toBe("missing");
    expect(security.damagePhaseSeconds.source.note).toContain("Variable");
  });

  it("skips rows without a boss name", () => {
    expect(bosses.map((b) => b.name)).toEqual([
      "Kalli",
      "Crypt Security",
      "Atheon",
    ]);
  });

  it("finds the columns by their header, not by position", () => {
    const reordered = [
      "NAME,,,",
      "Phase,Boss,Activity,#",
      "72,Kalli,Last Wish,1",
    ].join("\n");
    const [kalli] = parseAegisBosses(reordered, RETRIEVED);
    expect(kalli.damagePhaseSeconds.value).toBe(72);
    expect(kalli.description).toBe("");
  });

  it("fails if a required column is missing", () => {
    expect(() => parseAegisBosses("a,b\n1,2", RETRIEVED)).toThrow("header");
  });

  it("fails on duplicate ids", () => {
    const duplicate = [
      header,
      "1,Last Wish,Kalli,1,,72,",
      "2,Last Wish,Kalli,1,,70,",
    ].join("\n");
    expect(() => parseAegisBosses(duplicate, RETRIEVED)).toThrow(
      "last-wish-kalli",
    );
  });
});
