// Finds a name in the snapshots under src/data and prints one compact line per hit,
// so questions about game values don't need to read whole snapshot files.

export interface SnapshotFile {
  file: string;
  data: unknown;
}

interface Hit {
  file: string;
  score: number;
  line: string;
}

const NAME_FIELDS = ["name", "itemName", "weapon", "entry", "title"];
const SKIPPED_FIELDS = new Set([
  "source",
  "sources",
  "icon",
  "manifestHash",
  "hash",
  "quotes",
]);
const MAX_NAME_LENGTH = 80;
const MAX_TEXT = 160;
const MAX_LINE = 320;
const PER_FILE = 4;

export const normalize = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]/g, "");

function scoreOf(candidate: string, query: string): number | null {
  if (candidate.length > MAX_NAME_LENGTH) return null;
  const c = normalize(candidate);
  if (!c) return null;
  if (c === query) return 0;
  if (c.startsWith(query)) return 1;
  if (c.includes(query)) return 2;
  return null;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const cut = (s: string, max: number): string =>
  s.length > max ? `${s.slice(0, max - 1)}…` : s;

function render(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string")
    return cut(value.replace(/\s+/g, " "), MAX_TEXT);
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (value.every((v) => typeof v !== "object" || v === null))
      return cut(`[${value.join(", ")}]`, MAX_TEXT);
    return `[${value.length}]`;
  }
  // Values in data files are {value, source}; show the value only.
  if ("value" in value) return render(value.value);
  return `{${Object.keys(value).join(",")}}`;
}

function describe(obj: unknown): string {
  if (!isRecord(obj)) return render(obj) ?? "";
  const parts: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (SKIPPED_FIELDS.has(key)) continue;
    const shown = render(value);
    if (shown !== null) parts.push(`${key}=${shown}`);
  }
  return parts.join("; ");
}

function walk(
  node: unknown,
  path: string,
  query: string,
  file: string,
  hits: Hit[],
): void {
  if (Array.isArray(node)) {
    node.forEach((child, i) => walk(child, `${path}[${i}]`, query, file, hits));
    return;
  }
  if (!isRecord(node)) return;
  const own = NAME_FIELDS.map((f) => node[f])
    .filter((v): v is string => typeof v === "string")
    .map((v) => scoreOf(v, query))
    .filter((s): s is number => s !== null);
  if (own.length > 0) {
    hits.push({ file, score: Math.min(...own), line: describe(node) });
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (SKIPPED_FIELDS.has(key)) continue;
    // Records keyed by name (e.g. "Osteo Striga") start uppercase, field names are camelCase.
    const keyScore = /^[A-Z]/.test(key) ? scoreOf(key, query) : null;
    if (keyScore !== null) {
      hits.push({
        file,
        score: keyScore,
        line: `${path ? `${path}.` : ""}${key}: ${describe(child)}`,
      });
    } else {
      walk(child, path ? `${path}.${key}` : key, query, file, hits);
    }
  }
}

/** Lines for every snapshot that mentions the name, best matches first, at most `limit` lines. */
export function findFacts(
  files: SnapshotFile[],
  name: string,
  limit = 40,
): string[] {
  const query = normalize(name);
  if (!query) return [];
  const lines: string[] = [];
  let skipped = 0;
  const perFile = files
    .map(({ file, data }) => {
      const hits: Hit[] = [];
      walk(data, "", query, file, hits);
      return hits.sort((a, b) => a.score - b.score);
    })
    .filter((hits) => hits.length > 0)
    .sort((a, b) => a[0].score - b[0].score);
  for (const hits of perFile) {
    const file = hits[0].file;
    const shown = hits.slice(0, PER_FILE);
    // One line stays free for the note on hits left out.
    if (lines.length + 1 + shown.length > limit - 1) {
      skipped += hits.length;
      continue;
    }
    lines.push(`== ${file} (${hits.length})`);
    for (const hit of shown) lines.push(`  ${cut(hit.line, MAX_LINE)}`);
    skipped += hits.length - shown.length;
  }
  if (skipped > 0)
    lines.push(`… ${skipped} more hits not shown; use a longer name`);
  return lines;
}
