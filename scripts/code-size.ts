// Size overview of the code for a health check: lines per file and the longest functions by a
// rough count. Run: node scripts/code-size.ts

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const files: string[] = [];
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(ts|tsx)$/.test(name)) files.push(path);
  }
};
for (const dir of ["src", "scripts", "tests"]) walk(join(ROOT, dir));

const rows = files.map((f) => {
  const text = readFileSync(f, "utf8");
  const lines = text.split("\n").length;
  const regexes = (text.match(/\/[^/\n]{8,}\/[gimsuy]*[;,)\]]/g) ?? []).length;
  return { file: f.slice(ROOT.length).replace(/\\/g, "/"), lines, regexes };
});
const sum = (dir: string) =>
  rows.filter((r) => r.file.startsWith(dir)).reduce((s, r) => s + r.lines, 0);
console.log(`src/engine ${sum("src/engine")}, src/ui ${sum("src/ui")}, src/data ${sum("src/data")}, scripts ${sum("scripts")}, tests ${sum("tests")}`);
console.log("largest files:");
for (const r of rows.sort((a, b) => b.lines - a.lines).slice(0, 15))
  console.log(`  ${r.lines}\t${r.regexes} regex\t${r.file}`);
