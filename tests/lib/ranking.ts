// Pure functions of the ranking gate (docs/product.md, "Rangfolge-Gate"): rank correlation, top hits
// and delta pairs between our totals and the Aegis totals.

export type Item = {
  id: string;
  tab: string;
  name: string;
  assumptions: string[];
  aegis: number;
  ours: number;
};

export type DeltaPair = {
  /** Label of the row with the extra assumption. */
  item: string;
  added: string;
  /** Percentage points: (with ÷ without − 1) × 100. */
  aegisDelta: number;
  ourDelta: number;
  /** ourDelta − aegisDelta. */
  gap: number;
};

/** Ranks from 1, ties get the mean rank. */
function ranks(values: number[]): number[] {
  const order = values.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
  const out = new Array<number>(values.length);
  for (let start = 0; start < order.length; ) {
    let end = start;
    while (end + 1 < order.length && order[end + 1][0] === order[start][0]) end++;
    const mean = (start + end) / 2 + 1;
    for (let k = start; k <= end; k++) out[order[k][1]] = mean;
    start = end + 1;
  }
  return out;
}

/** Spearman rank correlation; null when one side has no variation. */
export function spearman(a: number[], b: number[]): number | null {
  const ra = ranks(a);
  const rb = ranks(b);
  const n = a.length;
  const ma = ra.reduce((s, x) => s + x, 0) / n;
  const mb = rb.reduce((s, x) => s + x, 0) / n;
  let cov = 0;
  let va = 0;
  let vb = 0;
  for (let i = 0; i < n; i++) {
    cov += (ra[i] - ma) * (rb[i] - mb);
    va += (ra[i] - ma) ** 2;
    vb += (rb[i] - mb) ** 2;
  }
  return va === 0 || vb === 0 ? null : cov / Math.sqrt(va * vb);
}

/** How many of the best `top` by Aegis are among our best `within`. */
export function topHits(aegis: number[], ours: number[], top: number, within: number): number {
  const best = (values: number[], k: number) =>
    values
      .map((v, i) => [v, i] as const)
      .sort((x, y) => y[0] - x[0])
      .slice(0, k)
      .map(([, i]) => i);
  const ourBest = new Set(best(ours, within));
  return best(aegis, top).filter((i) => ourBest.has(i)).length;
}

const label = (i: Item) => [i.name, ...i.assumptions].join(", ");

/** Pairs of rows (same tab and name) that differ by exactly one assumption. */
export function deltaPairs(items: Item[]): DeltaPair[] {
  const pairs: DeltaPair[] = [];
  for (const more of items) {
    for (const less of items) {
      if (more === less || more.tab !== less.tab || more.name !== less.name) continue;
      if (more.assumptions.length !== less.assumptions.length + 1) continue;
      const extra = more.assumptions.filter((a) => !less.assumptions.includes(a));
      if (extra.length !== 1 || !less.assumptions.every((a) => more.assumptions.includes(a))) {
        continue;
      }
      const aegisDelta = (more.aegis / less.aegis - 1) * 100;
      const ourDelta = (more.ours / less.ours - 1) * 100;
      pairs.push({ item: label(more), added: extra[0], aegisDelta, ourDelta, gap: ourDelta - aegisDelta });
    }
  }
  return pairs;
}
