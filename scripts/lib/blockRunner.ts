// Logic of scripts/run-blocks.ts (plan S0): pick the next open block from the
// checklist, evaluate gates, decide when Opus reviews. No process handling here.

export interface PlanBlock {
  id: string;
  line: string;
  opus: boolean;
}

export interface GateResult {
  name: string;
  ok: boolean;
}

/** Open checklist lines (`- [ ] <Block>: … Gate: …`) in file order. */
export function parseOpenBlocks(plan: string): PlanBlock[] {
  const blocks: PlanBlock[] = [];
  for (const raw of plan.split("\n")) {
    const match = /^- \[ \] (\S+)/.exec(raw);
    if (!match) continue;
    const line = raw.slice(6).trim();
    blocks.push({ id: match[1], line, opus: line.includes("(Opus)") });
  }
  return blocks;
}

export function nextOpenBlock(blocks: PlanBlock[], onlyId?: string): PlanBlock | undefined {
  return onlyId ? blocks.find((block) => block.id === onlyId) : blocks[0];
}

/** The first failed gate, or undefined when all are green. */
export function firstRedGate(results: GateResult[]): GateResult | undefined {
  return results.find((result) => !result.ok);
}

/**
 * Opus reviews when engine files changed since the last review, or when three
 * blocks have gone by without one. `changedFiles` spans last review..HEAD,
 * `blocksSinceReview` includes the block just finished.
 */
export function needsReview(changedFiles: string[], blocksSinceReview: number): boolean {
  return changedFiles.some((file) => file.startsWith("src/engine/")) || blocksSinceReview >= 3;
}

export type Verdict = "OK" | "NACHBESSERN" | "STOPP";

export function parseVerdict(review: string): Verdict | undefined {
  const match = /Urteil:\W*(OK|NACHBESSERN|STOPP)/i.exec(review);
  return match ? (match[1].toUpperCase() as Verdict) : undefined;
}

const PLAYER_SECTION = "Was sich im Spiel ändert";
const NONE_WORD = /^\W*(kein|keine|keiner|keines|none|nichts|entfällt)\W*$/i;
const NONE_THEN_SENTENCE = /^\W*(?:kein|keine|keiner|keines|none|nichts|entfällt)[.;]\s+(.*)$/i;
const LIST_ITEM = /^\s*(?:[-*•]|\d+[.)])\s+\S/;
const REPORT_LABEL = /(?:^\W*|[.;]\s+)(Rest|Widerspruch|Fragen?|Offene[rs]?\s+(?:Fragen?|Punkte?)|STOPP|Gelockert|Gestrichen)\b[^:\n]*:\s*(.*)$/i;

/** "keine", also "keine. <explanation>"; a further label in that sentence counts on its own. */
function isNone(answer: string): boolean {
  if (NONE_WORD.test(answer)) return true;
  const rest = NONE_THEN_SENTENCE.exec(answer);
  if (!rest) return false;
  const next = REPORT_LABEL.exec(rest[1]);
  return next ? isNone(next[2]) : true;
}

/**
 * Problems a worker report names itself: Rest, Widerspruch, Frage, a loosened or
 * dropped plan part, or no report at all. A label counts as empty only with a word
 * like "keine"; a label with a list below it is not empty.
 */
export function reportProblems(report: string): string[] {
  if (!report.includes(PLAYER_SECTION)) return ["Kein Bericht mit „Was sich im Spiel ändert“ (Limit erreicht?)."];
  const problems: string[] = [];
  const lines = report.split(/\r?\n/);
  lines.forEach((line, at) => {
    const match = REPORT_LABEL.exec(line);
    if (!match) return;
    const answer = match[2];
    if (isNone(answer)) return;
    if (/^\W*$/.test(answer)) {
      const next = lines.slice(at + 1).find((l) => l.trim() !== "") ?? "";
      if (!LIST_ITEM.test(next)) return;
    }
    problems.push(line.trim());
  });
  return problems;
}

/** Read-only flags of a review session (and of a probe run): only reading git commands; plan mode plus deny rules, no hard write lock proven. */
export const REVIEW_WRITERS = ["Edit", "Write", "NotebookEdit", "Bash(npm *)", "Bash(npx *)", "Bash(node *)", "Bash(git add *)", "Bash(git commit *)", "Bash(git push*)", "Bash(*--output*)"];
export function readOnlyFlags(tools: string): string[] {
  return ["--tools", tools, "--disallowedTools", ...REVIEW_WRITERS];
}
export const REVIEW_FLAGS = [...readOnlyFlags("Read,Grep,Glob,Bash"), "--permission-mode", "plan", "--allowedTools", "Bash(git show:*)", "Bash(git diff:*)", "Bash(git log:*)"];

/** Block sessions may not start subagents (`claude -p` ignores worker.md's setting). */
export const BLOCK_FLAGS = ["--disallowedTools", "Agent"];

/** True when `git status --porcelain` lists anything (ignored files such as tmp/ are not listed). */
export function isDirty(porcelain: string): boolean {
  return porcelain.trim().length > 0;
}

export interface RunFacts {
  committed: boolean;
  report: string;
  reviewNeeded: boolean;
  verdict?: Verdict;
}

/** Why a finished session must not count as done; empty means done. */
export function runProblems(facts: RunFacts): string[] {
  const problems: string[] = [];
  if (!facts.committed) problems.push("Kein neuer Commit.");
  problems.push(...reportProblems(facts.report));
  if (facts.reviewNeeded && facts.verdict !== "OK") problems.push(`Review: Urteil ${facts.verdict ?? "fehlt"}, nicht OK.`);
  return problems;
}

/** One shell-safe argument (the scripts run `claude` through a shell on Windows). */
export function quoteArg(arg: string): string {
  return `"${arg.replace(/"/g, '\\"')}"`;
}

export function buildBlockPrompt(block: PlanBlock, defects?: string): string {
  return [
    `Setze genau diesen Block aus docs/plans/current.md um, folge dem Subagent-Vorbild .claude/agents/worker.md:`,
    block.line,
    `Lies zuerst docs/plans/current.md. Alles, was dort oder in den dort genannten Abschnitten (etwa docs/plans/history-2026-11.md, „Setup und Plan V“) zu diesem Block steht, gehört zum Block.`,
    `Hake den Block nicht ab. Committe bei Grün (Branch ground-up-model, kein Merge). Pushe nicht. Rufe notify nicht auf.`,
    `Einen Screenshot im Gate macht die Hauptsitzung nach deinem Lauf: Versuche ihn nicht, nenne ihn nicht als Rest, und nenne unter „Unsicher“, wie man die Ansicht öffnet.`,
    ...(defects ? [`Bessere nach. Mängelliste:`, defects] : []),
    `Dein Bericht beginnt mit „${PLAYER_SECTION}“, je Waffe ein Satz in Spielersprache. Danach Commit-Hashes, Beleg, „Rest: …“ nur für offene Arbeit am Block, sonst „Rest: keiner“ (Hinweise unter „Unsicher“), Geeicht / Gelockert / Gestrichen / Unsicher.`,
  ].join("\n");
}

export function buildReviewPrompt(base: string): string {
  return `Prüfe die Commits ${base}..HEAD nach .claude/agents/reviewer.md. Ändere nichts.`;
}
