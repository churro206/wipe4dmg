import { describe, expect, it } from "vitest";
import {
  buildBlockPrompt,
  firstRedGate,
  needsReview,
  nextOpenBlock,
  parseOpenBlocks,
  parseVerdict,
  quoteArg,
  reportProblems,
  runProblems,
} from "../scripts/lib/blockRunner.ts";

const PLAN = [
  "# Plan",
  "- [x] A1, Q0 erledigt (abc123).",
  "- [ ] S0 Setup (`chore`): frische Sitzung. Gate: Probelauf.",
  "- [ ] V1 Waffenstatus, Daten: Datei. Gate: Test rot bei veralteter Datei.",
  "- [ ] Q-Bilanz (Opus): Waffen mit Item. Gate: Stopp.",
  "Text - [ ] kein Block",
].join("\n");

describe("block runner", () => {
  it("parses only open checklist lines, in order", () => {
    const blocks = parseOpenBlocks(PLAN);
    expect(blocks.map((b) => b.id)).toEqual(["S0", "V1", "Q-Bilanz"]);
    expect(blocks[2].opus).toBe(true);
    expect(blocks[0].opus).toBe(false);
  });

  it("picks the first open block, or the one named", () => {
    const blocks = parseOpenBlocks(PLAN);
    expect(nextOpenBlock(blocks)?.id).toBe("S0");
    expect(nextOpenBlock(blocks, "V1")?.id).toBe("V1");
    expect(nextOpenBlock(blocks, "M9")).toBeUndefined();
    expect(nextOpenBlock([])).toBeUndefined();
  });

  it("stops at the first red gate and skips the ones behind it", () => {
    const result = firstRedGate([
      { name: "test", ok: true },
      { name: "tsc", ok: false },
      { name: "lint", ok: true },
    ]);
    expect(result?.name).toBe("tsc");
    expect(firstRedGate([{ name: "test", ok: true }])).toBeUndefined();
  });

  it("reviews on engine changes, otherwise every third block", () => {
    expect(needsReview(["src/engine/core/x.ts"], 1)).toBe(true);
    expect(needsReview(["src/data/a.json"], 1)).toBe(false);
    expect(needsReview(["src/data/a.json"], 2)).toBe(false);
    expect(needsReview(["src/data/a.json"], 3)).toBe(true);
    expect(needsReview(["src/data/a.json"], 6)).toBe(true);
  });

  it("asks for a player-readable report in the prompt, without push", () => {
    const [block] = parseOpenBlocks(PLAN);
    const prompt = buildBlockPrompt(block);
    expect(prompt).toContain("S0 Setup");
    expect(prompt).toContain("Was sich im Spiel ändert");
    expect(prompt).not.toMatch(/pushe(?! nicht)/);
    expect(prompt).not.toContain("Mängelliste");
  });

  it("adds a defect list for a fix run", () => {
    const [block] = parseOpenBlocks(PLAN);
    expect(buildBlockPrompt(block, "1. foo.ts:3 falsch")).toContain("1. foo.ts:3 falsch");
  });

  it("reads the verdict of a review", () => {
    expect(parseVerdict("- Urteil: OK\n- Mängel: keine")).toBe("OK");
    expect(parseVerdict("Urteil: NACHBESSERN")).toBe("NACHBESSERN");
    expect(parseVerdict("- Urteil: **STOPP**")).toBe("STOPP");
    expect(parseVerdict("kein Urteil hier")).toBeUndefined();
  });

  it("flags Rest, Widerspruch and Frage in a report, not 'keine'", () => {
    const clean = "Was sich im Spiel ändert: X.\nRest: keine\nGeeicht: keine";
    expect(reportProblems(clean)).toEqual([]);
    expect(reportProblems("Was sich im Spiel ändert: X.\nRest: Waffe Y fehlt")).toHaveLength(1);
    expect(reportProblems("Was sich im Spiel ändert: X.\n- Widerspruch: Plan sagt A")).toHaveLength(1);
    expect(reportProblems("Was sich im Spiel ändert: X.\nFrage an den Inhaber: B?")).toHaveLength(1);
    expect(reportProblems("Was sich im Spiel ändert: X.\nOffene Fragen: keine.")).toEqual([]);
  });

  it("treats a report without the player section as a missing report", () => {
    expect(reportProblems("Ich bin am Limit abgebrochen")[0]).toMatch(/Bericht/);
  });

  it("is red without a new commit, with problems in the report or without review OK", () => {
    const report = "Was sich im Spiel ändert: X.\nRest: keine";
    const base = { committed: true, report, reviewNeeded: false };
    expect(runProblems(base)).toEqual([]);
    expect(runProblems({ ...base, committed: false })).toHaveLength(1);
    expect(runProblems({ ...base, report: "Was sich im Spiel ändert: X.\nRest: Y" })).toHaveLength(1);
    expect(runProblems({ ...base, reviewNeeded: true })).toHaveLength(1);
    expect(runProblems({ ...base, reviewNeeded: true, verdict: "NACHBESSERN" })).toHaveLength(1);
    expect(runProblems({ ...base, reviewNeeded: true, verdict: "OK" })).toEqual([]);
  });

  it("quotes arguments for the shell", () => {
    expect(quoteArg("Bash(git show:*)")).toBe('"Bash(git show:*)"');
    expect(quoteArg('a "b"')).toBe('"a \\"b\\""');
  });
});
