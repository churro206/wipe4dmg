// Writes the review table docs/text-check.md: every multiplier part, catalyst and grant next to the
// texts of its item (block "Text-Abgleich", owner 2026-10-24). No download.
// Run: npm run check:text

import { readFileSync, writeFileSync } from "node:fs";
import { renderTextCheck, textCheckRows } from "./lib/textCheck.ts";
import { loadTextCheckInputs } from "./lib/textCheckInputs.ts";

const ROOT = new URL("../", import.meta.url);
const { reasons } = JSON.parse(readFileSync(new URL("tests/fixtures/text-check.json", ROOT), "utf8")) as {
  reasons: Record<string, string>;
};
const rows = textCheckRows(loadTextCheckInputs());
writeFileSync(new URL("docs/text-check.md", ROOT), renderTextCheck(rows, reasons));
const open = rows.filter((r) => r.verdict === "deviation" && !reasons[r.key]).length;
console.log(`Wrote ${rows.length} rows, ${open} deviations without reason; review docs/text-check.md`);
