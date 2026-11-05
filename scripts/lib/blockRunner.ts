// Logic of scripts/run-blocks.ts (plan S0): pick the next open block from the
// checklist, evaluate gates, decide when Opus reviews. No process handling here.

export interface PlanBlock {
  id: string;
  line: string;
  gate: string;
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
    const gate = /Gate:\s*(.*)$/.exec(line)?.[1] ?? "";
    blocks.push({ id: match[1], line, gate, opus: line.includes("(Opus)") });
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

/** Opus reviews engine changes always, everything else after every third block. */
export function needsReview(changedFiles: string[], blocksDone: number): boolean {
  return changedFiles.some((file) => file.startsWith("src/engine/")) || blocksDone % 3 === 0;
}

export function buildBlockPrompt(block: PlanBlock): string {
  return [
    `Setze genau diesen Block aus docs/plans/current.md um, folge dem Subagent-Vorbild .claude/agents/worker.md:`,
    block.line,
    `Hake den Block nicht ab. Committe und pushe bei Grün (Branch ground-up-model, kein Merge). Rufe notify nicht auf.`,
    `Dein Bericht beginnt mit „Was sich im Spiel ändert“, je Waffe ein Satz in Spielersprache. Danach Commit-Hashes, Beleg, „Rest: …“, Geeicht / Gelockert / Gestrichen / Unsicher.`,
  ].join("\n");
}
