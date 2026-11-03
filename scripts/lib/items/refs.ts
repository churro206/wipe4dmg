// References and expressions of an item file (docs/architecture.md section 5.3, B4a step 3). A
// reference names one number of a snapshot; its status follows from the source, never from the file:
//
//   $quantum[<row>].<field>                 Quantum row, a number field             verified
//   $quantum[<row>].timing.<field>          timingFromQuantum: fireRateRpm,        verified
//                                           magazine, totalShots, reloadTimeMs
//   $aegis[<row>].critShot                  precision hit ÷ Full Modifiers          fitted (row)
//   $aegis[<row>].tick("<name>")            named tick ÷ Full Modifiers             fitted (row)
//   $aegis[<row>].perShot                   the row's value per shot (a playstyle)  fitted (row)
//   $aegisSustained[<row>].<field>          Sustained row, a number field           fitted (row)
//   $aegisSustained[<row>].timing.<field>   timingFromAegis, fields as for Quantum  fitted (row)
//   $manifest[<weapon>].stat("<stat>")      displayed stat of the manifest          verified
//   $clarity[<entry>]("<quote>")            the one number of a quote in the text   derived
//   $compendium[<entry>]("<quote>")         the same; entry by name or its start    derived
//
// An expression { expr, note } computes + - * / with brackets over references and numbers: derived,
// or fitted with its row if an Aegis row is in it (at most one). Its sources are named in the order
// of the references; as a damage value it takes the scale of the first (damageScaleOf), so the damage
// stands first. A reference that does not resolve is an error, never a gap.

import type {
  AegisSustainedSnapshot,
  AegisWeaponSnapshot,
  ClarityEntry,
  ClaritySnapshot,
  CompendiumEntry,
  CompendiumSnapshot,
  ItemExpression,
  ManifestWeapons,
  QuantumWeaponSnapshot,
  Source,
  SourcedNumber,
} from "../../../src/data/schema.ts";
import { type Timing, timingFromAegis, timingFromQuantum } from "../timing.ts";

/** The snapshots an item reads, and the link codes of the weapons. */
export type ItemSources = {
  aegis: AegisWeaponSnapshot;
  sustained: AegisSustainedSnapshot;
  quantum: QuantumWeaponSnapshot;
  manifest: ManifestWeapons;
  clarity: ClaritySnapshot;
  compendium: CompendiumSnapshot;
  codes: Record<string, number>;
};

/**
 * What resolving needs: the snapshots, the item's name (it tells Clarity entries of one name apart)
 * and the Aegis rows (Weapons and Sustained) the item has used so far.
 */
export type RefContext = { sources: ItemSources; itemName: string; fittedRows: string[] };

type ParsedRef = {
  text: string;
  source: string;
  key: string;
  path: string[];
  arg?: string;
};

const IDENT = /[A-Za-z]\w*/y;
const NUMBER = /\d+(?:\.\d+)?/y;
const NUMBERS = /\d+(?:\.\d+)?/g;

/** Reads one reference at `start` (a "$"); returns it and the position after it. */
function scanRef(input: string, start: number): { ref: ParsedRef; end: number } {
  let i = start + 1;
  const broken = (what: string): never => {
    throw new Error(`${what} at position ${i} of "${input}"`);
  };
  const ident = (): string => {
    IDENT.lastIndex = i;
    const m = IDENT.exec(input);
    if (!m) return broken("expected a name");
    i = IDENT.lastIndex;
    return m[0];
  };
  const source = ident();
  if (input[i] !== "[") broken(`expected "[" after $${source}`);
  const close = input.indexOf("]", i);
  if (close < 0) broken(`expected "]"`);
  const key = input.slice(i + 1, close);
  i = close + 1;
  const path: string[] = [];
  while (input[i] === ".") {
    i++;
    path.push(ident());
  }
  let arg: string | undefined;
  if (input[i] === "(") {
    if (input[i + 1] !== '"') broken(`expected '"' after "("`);
    const endQuote = input.indexOf('"', i + 2);
    if (endQuote < 0 || input[endQuote + 1] !== ")") broken(`expected '")'`);
    arg = input.slice(i + 2, endQuote);
    i = endQuote + 2;
  }
  return { ref: { text: input.slice(start, i), source, key, path, arg }, end: i };
}

const round = (value: number) => Number(value.toFixed(3));
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const fail = (ref: ParsedRef, message: string): never => {
  throw new Error(`${ref.text}: ${message}`);
};

/** The reference has exactly this shape: path and whether it takes a quoted argument. */
function expectShape(ref: ParsedRef, length: number, withArg: boolean, usage: string) {
  if (ref.path.length !== length || (ref.arg !== undefined) !== withArg)
    fail(ref, `expected ${usage}`);
}

function numberField(ref: ParsedRef, row: object, field: string): number {
  if (!(field in row)) return fail(ref, `unknown field ${field}`);
  const value = (row as Record<string, unknown>)[field];
  if (typeof value !== "number")
    return fail(ref, `field ${field} is ${value === null ? "empty" : "not a number"}`);
  return value;
}

/** The Clarity entry of a name; entries of one name are told apart by the item they belong to. */
export function clarityEntry(sources: ItemSources, name: string, itemName: string): ClarityEntry {
  let entries = sources.clarity.entries.filter((e) => e.name === name);
  if (entries.length > 1) entries = entries.filter((e) => e.itemName === itemName);
  if (entries.length !== 1)
    throw new Error(`${entries.length} Clarity entries named "${name}" (of ${itemName})`);
  return entries[0];
}

/** The Compendium entry of a name, or the one entry whose name starts with it. */
export function compendiumEntry(sources: ItemSources, name: string): CompendiumEntry {
  const exact = sources.compendium.entries.filter((e) => e.name === name);
  const entries =
    exact.length > 0
      ? exact
      : sources.compendium.entries.filter((e) => e.name.startsWith(`${name} `));
  if (entries.length !== 1)
    throw new Error(`${entries.length} Compendium entries named "${name}" or starting with it`);
  return entries[0];
}

/** The one number of a quote that stands in the text. */
function quoteNumber(ref: ParsedRef, text: string): number {
  const quote = ref.arg!;
  if (!text.includes(quote)) fail(ref, `quote "${quote}" is not in the text of ${ref.key}`);
  const numbers = quote.match(NUMBERS) ?? [];
  if (numbers.length !== 1)
    fail(ref, `quote "${quote}" needs exactly one number, has ${numbers.length}`);
  return Number(numbers[0]);
}

const QUANTUM_TIMING: Record<string, (t: Timing) => number | null> = {
  fireRateRpm: (t) => round(60 / t.intervalSeconds),
  magazine: (t) => t.magazine,
  totalShots: (t) => t.totalShots, // null: primary ammo is unlimited
  reloadTimeMs: (t) => Math.round(t.engineReloadSeconds * 1000),
};

/**
 * One field of a row's timing. Only the rate carries the derivation of the interval (`timing.note`);
 * the other fields are read off the row and name just themselves.
 */
function timingField(
  ref: ParsedRef,
  timingOf: () => Timing | { problem: string },
): { value: number | null; note: string } {
  expectShape(ref, 2, false, `.timing.<${Object.keys(QUANTUM_TIMING).join("|")}>`);
  const field = ref.path[1];
  const of = QUANTUM_TIMING[field] ?? fail(ref, `unknown timing field ${field}`);
  const timing = timingOf();
  if ("problem" in timing) return fail(ref, timing.problem);
  return {
    value: of(timing),
    note: field === "fireRateRpm" ? `timing.${field}: ${timing.note}` : `timing.${field}`,
  };
}

function resolveRef(ref: ParsedRef, ctx: RefContext): SourcedNumber {
  const { sources } = ctx;
  switch (ref.source) {
    case "quantum": {
      const snapshot = sources.quantum;
      const row = snapshot.rows.find((r) => r.id === ref.key) ?? fail(ref, `no Quantum row ${ref.key}`);
      const source = (note: string): Source => ({
        name: `${snapshot.source.name} (${row.tab}), row ${row.id}`,
        url: snapshot.source.url,
        retrieved: snapshot.source.retrieved,
        status: "verified",
        note,
      });
      if (ref.path[0] === "timing") {
        const { value, note } = timingField(ref, () => timingFromQuantum(row));
        return { value, source: source(note) };
      }
      expectShape(ref, 1, false, ".<field> or .timing.<field>");
      return { value: numberField(ref, row, ref.path[0]), source: source(ref.path[0]) };
    }
    case "aegis": {
      const snapshot = sources.aegis;
      const row = snapshot.rows.find((r) => r.id === ref.key) ?? fail(ref, `no Aegis Weapons row ${ref.key}`);
      let raw: number;
      let note: string;
      if (ref.path[0] === "critShot") {
        expectShape(ref, 1, false, ".critShot");
        raw = row.critShot ?? fail(ref, "the row has no precision hit");
        note = `critShot ${raw} ÷ Full Modifiers ${row.fullModifiers}`;
      } else if (ref.path[0] === "perShot") {
        expectShape(ref, 1, false, ".perShot");
        // Aegis' own value per shot of the row: already divided by Full Modifiers
        raw = row.perShot;
        note = `perShot ${raw} of the row (Full Modifiers ${row.fullModifiers} already out)`;
        ctx.fittedRows.push(row.id);
        return {
          value: round(raw),
          source: {
            name: `${snapshot.source.name}, row ${row.id}`,
            url: snapshot.source.url,
            retrieved: snapshot.source.retrieved,
            status: "fitted",
            row: row.id,
            note,
          },
        };
      } else if (ref.path[0] === "tick") {
        expectShape(ref, 1, true, '.tick("<name>")');
        const tick = new RegExp(`\\b(\\d+(?:\\.\\d+)?)(?:\\/\\d+(?:\\.\\d+)?)? ${escapeRegExp(ref.arg!)}\\b`, "i").exec(
          row.otherTicks,
        );
        if (!tick) return fail(ref, `no tick "${ref.arg}" in "${row.otherTicks}"`);
        raw = Number(tick[1]);
        note = `tick "${tick[0]}" ÷ Full Modifiers ${row.fullModifiers}`;
      } else {
        return fail(ref, `unknown field ${ref.path.join(".")}; use .critShot, .perShot or .tick("<name>")`);
      }
      ctx.fittedRows.push(row.id);
      return {
        value: round(raw / row.fullModifiers),
        source: {
          name: `${snapshot.source.name}, row ${row.id}`,
          url: snapshot.source.url,
          retrieved: snapshot.source.retrieved,
          status: "fitted", // the row is the item's Eichung and no longer a check (I1)
          row: row.id,
          note,
        },
      };
    }
    case "aegisSustained": {
      const snapshot = sources.sustained;
      const row = snapshot.rows.find((r) => r.id === ref.key) ?? fail(ref, `no Aegis Sustained row ${ref.key}`);
      let value: number | null;
      let note: string;
      if (ref.path[0] === "timing") {
        ({ value, note } = timingField(ref, () => timingFromAegis(row)));
      } else {
        expectShape(ref, 1, false, ".<field> or .timing.<field>");
        value = numberField(ref, row, ref.path[0]);
        note = ref.path[0];
      }
      ctx.fittedRows.push(row.id);
      return {
        value,
        source: {
          name: `${snapshot.source.name}, row ${row.id}`,
          url: snapshot.source.url,
          retrieved: snapshot.source.retrieved,
          status: "fitted",
          row: row.id,
          note,
        },
      };
    }
    case "manifest": {
      const { manifest } = sources;
      const weapon = manifest.weapons.find((w) => w.name === ref.key) ?? fail(ref, `no manifest weapon "${ref.key}"`);
      expectShape(ref, 1, true, '.stat("<stat>")');
      if (ref.path[0] !== "stat") fail(ref, `unknown field ${ref.path[0]}; use .stat("<stat>")`);
      const value = weapon.stats[ref.arg!] ?? fail(ref, `no stat "${ref.arg}" of ${weapon.name}`);
      return {
        value,
        source: {
          name: `Bungie manifest ${manifest.manifestVersion}, stat "${ref.arg}" of ${weapon.name}`,
          retrieved: manifest.retrieved,
          status: "verified",
        },
      };
    }
    case "clarity":
    case "compendium": {
      expectShape(ref, 0, true, '("<quote with one number>")');
      const snapshot = ref.source === "clarity" ? sources.clarity : sources.compendium;
      let entry: ClarityEntry | CompendiumEntry;
      try {
        entry =
          ref.source === "clarity"
            ? clarityEntry(sources, ref.key, ctx.itemName)
            : compendiumEntry(sources, ref.key);
      } catch (error) {
        return fail(ref, (error as Error).message);
      }
      return {
        value: quoteNumber(ref, entry.text),
        source: {
          name: `${snapshot.source.name}: ${entry.name}`,
          url: snapshot.source.url,
          retrieved: snapshot.source.retrieved,
          status: "derived", // a text without a measurement
          quote: ref.arg,
          note: "Derived: the number in the quote",
        },
      };
    }
    default:
      return fail(
        ref,
        `unknown source "${ref.source}" (quantum, aegis, aegisSustained, manifest, clarity, compendium)`,
      );
  }
}

type Token =
  | { kind: "number"; value: number }
  | { kind: "ref"; ref: ParsedRef }
  | { kind: "op"; op: string };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (/\s/.test(c)) {
      i++;
    } else if (c === "$") {
      const { ref, end } = scanRef(expr, i);
      tokens.push({ kind: "ref", ref });
      i = end;
    } else if ("+-*/()".includes(c)) {
      tokens.push({ kind: "op", op: c });
      i++;
    } else {
      NUMBER.lastIndex = i;
      const m = NUMBER.exec(expr);
      if (!m) throw new Error(`unexpected "${c}" at position ${i} of "${expr}"`);
      tokens.push({ kind: "number", value: Number(m[0]) });
      i = NUMBER.lastIndex;
    }
  }
  return tokens;
}

/** Evaluates the tokens: sum of products of factors (number, reference, -factor, bracket). */
function evaluate(tokens: Token[], valueOf: (ref: ParsedRef) => number, expr: string): number {
  let pos = 0;
  const opAt = (ops: string): string | undefined => {
    const t = tokens[pos];
    return t?.kind === "op" && ops.includes(t.op) ? t.op : undefined;
  };
  const factor = (): number => {
    const t = tokens[pos++];
    if (!t) throw new Error(`"${expr}" ends too early`);
    if (t.kind === "number") return t.value;
    if (t.kind === "ref") return valueOf(t.ref);
    if (t.op === "-") return -factor();
    if (t.op === "(") {
      const value = sum();
      if (opAt(")") === undefined) throw new Error(`missing ")" in "${expr}"`);
      pos++;
      return value;
    }
    throw new Error(`unexpected "${t.op}" in "${expr}"`);
  };
  const product = (): number => {
    let value = factor();
    for (let op = opAt("*/"); op !== undefined; op = opAt("*/")) {
      pos++;
      const right = factor();
      if (op === "/" && right === 0) throw new Error(`division by 0 in "${expr}"`);
      value = op === "*" ? value * right : value / right;
    }
    return value;
  };
  const sum = (): number => {
    let value = product();
    for (let op = opAt("+-"); op !== undefined; op = opAt("+-")) {
      pos++;
      const right = product();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  };
  const value = sum();
  if (pos !== tokens.length) throw new Error(`unexpected input after token ${pos} of "${expr}"`);
  return value;
}

function resolveExpression({ expr, note }: ItemExpression, ctx: RefContext): SourcedNumber {
  const tokens = tokenize(expr);
  const refs = tokens.flatMap((t) => (t.kind === "ref" ? [t.ref] : []));
  if (refs.length === 0)
    throw new Error(`"${expr}": an expression needs a reference; write a SourcedNumber instead`);
  const resolved = new Map(refs.map((ref) => [ref, resolveRef(ref, ctx)] as const));
  const rows = [
    ...new Set([...resolved.values()].flatMap((n) => (n.source.status === "fitted" ? [n.source.row!] : []))),
  ];
  if (rows.length > 1)
    throw new Error(`"${expr}": one Aegis row per expression, found ${rows.join(", ")}`);
  const value = evaluate(
    tokens,
    (ref) => resolved.get(ref)!.value ?? fail(ref, "is null (e.g. unlimited ammo), not a number"),
    expr,
  );
  const parts = [...resolved].map(([ref, n]) => `${ref.text} = ${n.value} (${n.source.name})`);
  return {
    value: round(value),
    source: {
      name: `Expression over ${[...new Set([...resolved.values()].map((n) => n.source.name))].join("; ")}`,
      retrieved: [...resolved.values()].map((n) => n.source.retrieved).sort().at(-1)!,
      status: rows.length > 0 ? "fitted" : "derived",
      ...(rows.length > 0 ? { row: rows[0] } : {}),
      note: `Derived: ${expr} (${note}); ${parts.join("; ")}`,
    },
  };
}

/** A reference or an expression as a SourcedNumber; throws if it does not resolve. */
export function resolveValue(value: string | ItemExpression, ctx: RefContext): SourcedNumber {
  if (typeof value !== "string") return resolveExpression(value, ctx);
  if (!value.startsWith("$")) throw new Error(`"${value}" is not a reference`);
  const { ref, end } = scanRef(value, 0);
  if (end !== value.length) throw new Error(`unexpected "${value.slice(end)}" after ${ref.text}`);
  return resolveRef(ref, ctx);
}
