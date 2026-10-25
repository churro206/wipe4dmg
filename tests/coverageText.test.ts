import { describe, expect, it } from "vitest";
import { COLLAPSED_LINES, isLongText } from "../src/ui/coverageText";

describe("isLongText", () => {
  it("keeps a short text open", () => {
    expect(isLongText("Grants range.")).toBe(false);
    expect(isLongText("One\nTwo\nThree")).toBe(false);
  });

  it("collapses a text with more lines than the collapsed view shows", () => {
    const lines = Array.from({ length: COLLAPSED_LINES + 1 }, (_, i) => `Line ${i}`);
    expect(isLongText(lines.join("\n"))).toBe(true);
    expect(isLongText(lines.slice(0, COLLAPSED_LINES).join("\n"))).toBe(false);
  });

  it("collapses a long text in one line, which wraps over several lines", () => {
    expect(isLongText("word ".repeat(100))).toBe(true);
  });
});
