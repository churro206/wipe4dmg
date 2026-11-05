import { describe, expect, it } from "vitest";
import {
  buildBlockPrompt,
  firstRedGate,
  needsReview,
  nextOpenBlock,
  parseOpenBlocks,
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
    expect(blocks[0].gate).toBe("Probelauf.");
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

  it("asks for a player-readable report in the prompt", () => {
    const [block] = parseOpenBlocks(PLAN);
    const prompt = buildBlockPrompt(block);
    expect(prompt).toContain("S0 Setup");
    expect(prompt).toContain("Was sich im Spiel ändert");
  });
});
