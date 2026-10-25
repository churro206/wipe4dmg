// Which game texts of the coverage page start collapsed (the list of a category stays short).

/** Lines the collapsed view shows; src/index.css (.coverage-text.clamped) clamps to the same number. */
export const COLLAPSED_LINES = 4;
// A line wraps in the column; about this many characters fit into one line of it.
const CHARACTERS_PER_LINE = 55;

/** True if the text takes more than the collapsed lines in the column (lines plus wrapping). */
export function isLongText(text: string): boolean {
  const lines = text
    .split("\n")
    .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / CHARACTERS_PER_LINE)), 0);
  return lines > COLLAPSED_LINES;
}
