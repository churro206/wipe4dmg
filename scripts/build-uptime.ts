// Writes the review table docs/uptime-import.md: every effect without a window gets a verdict on
// whether its text names a duration (block "Uptime", owner 2026-10-24). No download.
// Run: npm run build:uptime

import { writeFileSync } from "node:fs";
import { renderUptime, uptimeRows } from "./lib/uptime.ts";
import { loadUptimeInputs } from "./lib/uptimeInputs.ts";

const ROOT = new URL("../", import.meta.url);
const rows = uptimeRows(loadUptimeInputs());
writeFileSync(new URL("docs/uptime-import.md", ROOT), renderUptime(rows));
const open = rows.filter((r) => r.verdict === "open").length;
console.log(`Wrote ${rows.length} effects, ${open} open; review docs/uptime-import.md`);
