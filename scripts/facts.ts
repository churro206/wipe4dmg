// Usage: npm run facts -- "<name>"
// Searches all snapshots under src/data for the name and prints the matching entries compactly.
import { readdirSync, readFileSync } from "node:fs";
import { findFacts } from "./lib/facts.ts";

const name = process.argv.slice(2).join(" ");
if (!name) {
  console.error('Usage: npm run facts -- "<name>"');
  process.exit(1);
}
const dir = "src/data";
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((file) => ({
    file,
    data: JSON.parse(readFileSync(`${dir}/${file}`, "utf8")) as unknown,
  }));
const lines = findFacts(files, name);
console.log(
  lines.length > 0 ? lines.join("\n") : `No snapshot mentions "${name}".`,
);
