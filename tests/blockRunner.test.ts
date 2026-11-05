import { describe, expect, it } from "vitest";
import {
  BLOCK_FLAGS,
  REVIEW_FLAGS,
  isDirty,
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

  it("makes the plan details part of the block and keeps Rest for open work", () => {
    const [block] = parseOpenBlocks(PLAN);
    const prompt = buildBlockPrompt(block);
    expect(prompt).toContain("docs/plans/history-2026-11.md");
    expect(prompt).toContain("gehört zum Block");
    expect(prompt).toContain("Rest: keiner");
    expect(prompt).toContain("Screenshot");
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

  it("accepts one-word 'none' answers, also keiner and keines", () => {
    expect(reportProblems("Was sich im Spiel ändert: X.\nRest: keiner\nWiderspruch: keiner.\nFrage: keines")).toEqual([]);
  });

  it("flags a label with a list below it, not an empty label", () => {
    const withList = "Was sich im Spiel ändert: X.\nOffene Punkte:\n- Waffe Y fehlt";
    expect(reportProblems(withList)).toHaveLength(1);
    expect(reportProblems("Was sich im Spiel ändert: X.\nRest:\nGeeicht: keine")).toEqual([]);
  });

  it("is red on a non-empty Gelockert or Gestrichen, green on keine", () => {
    expect(reportProblems("Was sich im Spiel ändert: X.\nGelockert: Gate Z\nGestrichen: keine")).toHaveLength(1);
    expect(reportProblems("Was sich im Spiel ändert: X.\nGelockert: keine\nGestrichen: Teil 2")).toHaveLength(1);
    expect(reportProblems("Was sich im Spiel ändert: X.\nGelockert: keine\nGestrichen: keine")).toEqual([]);
  });

  it("finds Gelockert and Gestrichen anywhere in the line", () => {
    expect(reportProblems("Was sich im Spiel ändert: X.\nGeeicht: keine. Gelockert: Gate Z")).toHaveLength(1);
    expect(reportProblems("Was sich im Spiel ändert: X.\nGeeicht: keine. Gelockert: keine")).toEqual([]);
  });

  it("takes 'keine.' with an explaining sentence as empty, unless a next label names something", () => {
    expect(reportProblems("Was sich im Spiel ändert: X.\nGelockert: keine. Die Grenze von 2 % bleibt.")).toEqual([]);
    expect(reportProblems("Was sich im Spiel ändert: X.\nGelockert: keine. Gestrichen: keine")).toEqual([]);
    expect(reportProblems("Was sich im Spiel ändert: X.\nGelockert: keine. Gestrichen: Teil 2")).toHaveLength(1);
    expect(reportProblems("Was sich im Spiel ändert: X.\nRest: keine offenen Punkte")).toHaveLength(1);
  });

  it("takes singular and plural labels and the next non-empty line", () => {
    expect(reportProblems("Was sich im Spiel ändert: X.\nOffene Frage: x")).toHaveLength(1);
    expect(reportProblems("Was sich im Spiel ändert: X.\nOffener Punkt: x")).toHaveLength(1);
    expect(reportProblems("Was sich im Spiel ändert: X.\nOffene Punkte:\n\n- x")).toHaveLength(1);
  });

  it("treats CRLF like LF", () => {
    expect(reportProblems("Was sich im Spiel ändert: X.\r\nRest: x\r\n")).toHaveLength(1);
    expect(reportProblems("Was sich im Spiel ändert: X.\r\nRest: keine\r\n")).toEqual([]);
  });

  it("keeps Agent out of block sessions and writers out of review sessions", () => {
    expect(BLOCK_FLAGS).toEqual(["--disallowedTools", "Agent"]);
    expect(REVIEW_FLAGS).toContain("Bash(git show:*)");
    expect(REVIEW_FLAGS).toContain("plan"); // plan mode, no hard write lock proven (a deny rule does not catch `> file`)
  });

  it("calls a work tree dirty when git status lists anything", () => {
    expect(isDirty("")).toBe(false);
    expect(isDirty(" M src/a.ts\n")).toBe(true);
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
