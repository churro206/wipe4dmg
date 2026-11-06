// The PreToolUse hook .claude/hooks/shell-rules.mjs enforces CLAUDE.md, "Befehle und Shell".

import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const HOOK = ".claude/hooks/shell-rules.mjs";

const run = (tool_name: string, command: string) =>
  spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ tool_name, tool_input: { command } }),
    encoding: "utf8",
  }).status;

describe("shell rules hook", () => {
  it.each([
    "npm run test:quiet",
    'npm run facts -- "Gjallarhorn"',
    "npx tsc -b",
    "git status",
    'git commit -m "fix: a; b | c && d" -m "Co-Authored-By: x"',
    "curl -o C:/scratch/page.html https://example.com",
    "node tmp/eval.ts",
    "npm run check:block -- M3",
  ])("lets Bash run %s", (command) => {
    expect(run("Bash", command)).toBe(0);
  });

  it.each([
    'node -e "console.log(1)"',
    "cat src/data/buckets.json",
    "cd tmp",
    "git add . && git commit -m x",
    "npm run probe | grep Truth",
    "npm run probe; git status",
    "node tmp/x.ts <<EOF",
    'git grep -n "chargeTimeMs" -- src/data',
  ])("blocks Bash %s", (command) => {
    expect(run("Bash", command)).toBe(2);
  });

  it("blocks every PowerShell call", () => {
    expect(run("PowerShell", "(Get-Item docs\\product.md).Length")).toBe(2);
  });

  it("ignores other tools", () => {
    expect(run("Read", "")).toBe(0);
  });
});
