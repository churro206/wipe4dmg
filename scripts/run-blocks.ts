// Plan S0: one fresh Sonnet session per open block, stops at the first red gate.
// Usage: npm run blocks -- [--block ID] [--max-turns N] [--dry-run]
//        npm run blocks -- --mini "<prompt>" [--max-turns N]   (probe: read-only, no gates)
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
  buildBlockPrompt,
  firstRedGate,
  needsReview,
  nextOpenBlock,
  parseOpenBlocks,
  type GateResult,
} from "./lib/blockRunner.ts";

const args = process.argv.slice(2);
const option = (name: string): string | undefined => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
};
const maxTurns = option("--max-turns") ?? "60";
const reviewTurns = "15";

const run = (command: string, commandArgs: string[]) =>
  spawnSync(command, commandArgs, { stdio: "inherit", shell: process.platform === "win32" });
const capture = (command: string, commandArgs: string[]) =>
  spawnSync(command, commandArgs, { encoding: "utf8", shell: process.platform === "win32" }).stdout.trim();

const mini = option("--mini");
if (mini) {
  // Read-only probe: only the Read tool, so nothing on disk can change.
  const result = run("claude", ["-p", JSON.stringify(mini), "--model", "sonnet", "--max-turns", maxTurns, "--allowedTools", "Read"]);
  process.exit(result.status ?? 1);
}

const GATES: Array<[string, string, string[]]> = [
  ["test:quiet", "npm", ["run", "test:quiet"]],
  ["tsc -b", "npx", ["tsc", "-b"]],
  ["lint", "npm", ["run", "lint"]],
];

// One block per call: the checklist is ticked off by hand after the report.
const plan = readFileSync("docs/plans/current.md", "utf8");
const block = nextOpenBlock(parseOpenBlocks(plan), option("--block"));
if (!block) {
  console.log("No open block.");
  process.exit(0);
}
console.log(`Block ${block.id}: ${block.line}`);
if (args.includes("--dry-run")) {
  console.log(buildBlockPrompt(block));
  process.exit(0);
}
const before = capture("git", ["rev-parse", "HEAD"]);
const session = run("claude", ["-p", JSON.stringify(buildBlockPrompt(block)), "--model", block.opus ? "opus" : "sonnet", "--max-turns", maxTurns, "--permission-mode", "acceptEdits"]);
if (session.status !== 0) {
  console.error(`STOP: session for ${block.id} failed (exit ${session.status}).`);
  process.exit(1);
}
const results: GateResult[] = [];
for (const [name, command, commandArgs] of GATES) {
  const ok = run(command, commandArgs).status === 0;
  results.push({ name, ok });
  if (!ok) break;
}
const red = firstRedGate(results);
if (red) {
  console.error(`STOP: gate "${red.name}" is red after ${block.id}.`);
  process.exit(1);
}
const changed = capture("git", ["diff", "--name-only", `${before}..HEAD`]).split("\n").filter(Boolean);
const blocksDone = (plan.match(/^- \[x\]/gm) ?? []).length + 1;
if (needsReview(changed, blocksDone)) {
  const review = run("claude", ["-p", JSON.stringify(`Prüfe die Commits ${before}..HEAD nach .claude/agents/reviewer.md. Ändere nichts.`), "--model", "opus", "--max-turns", reviewTurns, "--allowedTools", "Read", "Grep", "Glob", "Bash(git show:*)"]);
  if (review.status !== 0) {
    console.error(`STOP: review for ${block.id} failed.`);
    process.exit(1);
  }
}
console.log(`Block ${block.id} done; tick it off after reading the report.`);
