// Plan S0: one fresh Sonnet session per open block, stops at the first red gate.
// Usage: npm run blocks -- [--block ID] [--fix <defects file>] [--max-turns N] [--dry-run]
//        npm run blocks -- --mini "<prompt>" [--max-turns N]   (probe: read-only, no gates)
// Exit 0 only when the block is really done: new commit, clean report, gates green and,
// where a review runs, "Urteil: OK". Ticking the block off stays with the main session.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
  buildBlockPrompt,
  buildReviewPrompt,
  firstRedGate,
  needsReview,
  nextOpenBlock,
  parseOpenBlocks,
  parseVerdict,
  quoteArg,
  runProblems,
  type GateResult,
  type Verdict,
} from "./lib/blockRunner.ts";

const args = process.argv.slice(2);
const option = (name: string): string | undefined => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
};
const maxTurns = option("--max-turns") ?? "60";
const reviewTurns = "15";
const shell = process.platform === "win32";

const run = (command: string, commandArgs: string[]) => spawnSync(command, commandArgs, { stdio: "inherit", shell });
const capture = (command: string, commandArgs: string[]) =>
  spawnSync(command, commandArgs, { encoding: "utf8", shell }).stdout.trim();

/** `claude -p` with the prompt on stdin (no quoting or newline trouble); echoes and returns the answer. */
function claude(prompt: string, flags: string[]): { status: number; text: string } {
  const result = spawnSync("claude", ["-p", ...flags.map(quoteArg)], {
    input: prompt,
    encoding: "utf8",
    shell,
    stdio: ["pipe", "pipe", "inherit"],
    maxBuffer: 64 * 1024 * 1024,
  });
  const text = result.stdout ?? "";
  console.log(text);
  return { status: result.status ?? 1, text };
}

// Read-only sessions: only the listed tools exist, and writing commands are denied on top
// (deny beats the allow rules of .claude/settings.json such as `npm run` and `git commit`).
const WRITERS = ["Edit", "Write", "NotebookEdit", "Bash(npm *)", "Bash(npx *)", "Bash(node *)", "Bash(git add *)", "Bash(git commit *)", "Bash(git push*)", "Bash(*--output*)"];
const readOnly = (tools: string): string[] => ["--tools", tools, "--disallowedTools", ...WRITERS];

const mini = option("--mini");
if (mini) {
  const result = claude(mini, ["--model", "sonnet", "--max-turns", maxTurns, ...readOnly("Read")]);
  process.exit(result.status);
}

const GATES: Array<[string, string, string[]]> = [
  ["test:quiet", "npm", ["run", "test:quiet"]],
  ["tsc -b", "npx", ["tsc", "-b"]],
  ["lint", "npm", ["run", "lint"]],
];

// State between calls, kept inside .git (not versioned): last reviewed commit, blocks since then.
const STATE_FILE = ".git/blocks-state.json";
interface State {
  reviewed: string;
  blocks: number;
}
const head = () => capture("git", ["rev-parse", "HEAD"]);
const state: State = existsSync(STATE_FILE) ? (JSON.parse(readFileSync(STATE_FILE, "utf8")) as State) : { reviewed: head(), blocks: 0 };

const fail = (message: string): never => {
  console.error(`NOT DONE: ${message}`);
  process.exit(1);
};

// One block per call: the checklist is ticked off by hand after the report.
const plan = readFileSync("docs/plans/current.md", "utf8");
const block = nextOpenBlock(parseOpenBlocks(plan), option("--block"));
if (!block) {
  console.log("No open block.");
  process.exit(0);
}
const fixFile = option("--fix");
const defects = fixFile ? readFileSync(fixFile, "utf8") : undefined;
console.log(`Block ${block.id}: ${block.line}`);
const prompt = buildBlockPrompt(block, defects);
if (args.includes("--dry-run")) {
  console.log(prompt);
  process.exit(0);
}
const before = head();
const session = claude(prompt, ["--model", block.opus ? "opus" : "sonnet", "--max-turns", maxTurns, "--permission-mode", "acceptEdits"]);
if (session.status !== 0) fail(`session for ${block.id} ended with exit ${session.status} (turn limit?).`);

const committed = head() !== before;
const results: GateResult[] = [];
for (const [name, command, commandArgs] of GATES) {
  const ok = run(command, commandArgs).status === 0;
  results.push({ name, ok });
  if (!ok) break;
}
const red = firstRedGate(results);
if (red) fail(`gate "${red.name}" is red after ${block.id}.`);

const changed = capture("git", ["diff", "--name-only", `${state.reviewed}..HEAD`]).split("\n").filter(Boolean);
const reviewNeeded = needsReview(changed, state.blocks + 1);
let verdict: Verdict | undefined;
if (reviewNeeded) {
  const review = claude(buildReviewPrompt(state.reviewed), ["--model", "opus", "--max-turns", reviewTurns, ...readOnly("Read,Grep,Glob,Bash"), "--allowedTools", "Bash(git show:*)", "Bash(git diff:*)", "Bash(git log:*)"]);
  verdict = review.status === 0 ? parseVerdict(review.text) : undefined;
}

const problems = runProblems({ committed, report: session.text, reviewNeeded, verdict });
if (problems.length > 0) fail(`${block.id}:\n- ${problems.join("\n- ")}`);

// Only a finished block moves the review base.
const next: State = reviewNeeded ? { reviewed: head(), blocks: 0 } : { reviewed: state.reviewed, blocks: state.blocks + 1 };
writeFileSync(STATE_FILE, JSON.stringify(next));
console.log(`Block ${block.id}: no problems found${reviewNeeded ? ", review OK" : ""}.`);
