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
const EMPTY_ANSWER = /^\W*(keine?|none|entfällt|-|—|–)?\W*$/i;

/** Problems a worker report names itself: Rest, Widerspruch, Frage, or no report at all. */
export function reportProblems(report: string): string[] {
  if (!report.includes(PLAYER_SECTION)) return ["Kein Bericht mit „Was sich im Spiel ändert“ (Limit erreicht?)."];
  const problems: string[] = [];
  for (const line of report.split("\n")) {
    const match = /^\W*(Rest|Widerspruch|Frage|Fragen|Offene Fragen|Offene Punkte|STOPP)\b[^:\n]*:\s*(.*)$/i.exec(line);
    if (match && !EMPTY_ANSWER.test(match[2])) problems.push(line.trim());
  }
  return problems;
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
    `Hake den Block nicht ab. Committe bei Grün (Branch ground-up-model, kein Merge). Pushe nicht. Rufe notify nicht auf.`,
    ...(defects ? [`Bessere nach. Mängelliste:`, defects] : []),
    `Dein Bericht beginnt mit „${PLAYER_SECTION}“, je Waffe ein Satz in Spielersprache. Danach Commit-Hashes, Beleg, „Rest: …“, Geeicht / Gelockert / Gestrichen / Unsicher.`,
  ].join("\n");
}

export function buildReviewPrompt(base: string): string {
  return `Prüfe die Commits ${base}..HEAD nach .claude/agents/reviewer.md. Ändere nichts.`;
}
