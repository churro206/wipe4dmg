// A weapon item file → a Weapon (docs/architecture.md section 5, B4a step 3). The import fills in
// what the manifest and the link codes know (identity, intrinsics), turns the parts into single
// hits, resolves every reference and expression (refs.ts) and lets the runtime schema Weapon check
// the result. A text whose hash changed is a review: the item still resolves, the report shows it.

import {
  type BuffDefinition,
  type DamageInstance,
  type ItemPart,
  type ItemText,
  ItemExpression,
  type SourcedNumber,
  Weapon,
  WeaponItem,
} from "../../../src/data/schema.ts";
import { damageScaleOf } from "../../../src/engine/damageScale.ts";
import { slug } from "../aegisBosses.ts";
import { textHash } from "../hash.ts";
import { itemQuotes, uncoveredSentences } from "./uncovered.ts";
import {
  clarityEntry,
  compendiumEntry,
  type ItemSources,
  type RefContext,
  resolveValue,
} from "./refs.ts";

/** `uncovered`: sentences of the texts with a number that no quote covers (ADR 0019, point 5). */
export type ResolvedItem = { weapon: Weapon; review: string[]; uncovered: string[] };

/**
 * The buffs a rule grants only with the catalyst (`hasItem catalyst`), e.g. Reaper's Tithe x4 of
 * Truth: an Aegis assumption of that name means the catalyst.
 */
export function catalystBuffs(weapon: Pick<Weapon, "buffs" | "rules">): BuffDefinition[] {
  const granted = new Set(
    (weapon.rules ?? [])
      .filter((rule) =>
        (rule.if ?? []).some((c) => c.type === "hasItem" && c.id === "catalyst" && !c.not),
      )
      .flatMap((rule) => rule.do.flatMap((a) => (a.type === "grantBuff" ? [a.buff] : []))),
  );
  return (weapon.buffs ?? []).filter((buff) => granted.has(buff.id));
}

/** Fields of the item itself; the others are Weapon fields. */
const ITEM_FIELDS = ["id", "kind", "name", "texts", "parts", "notModelled", "quantumCheck"];

type Issue = { path: PropertyKey[]; message: string };
const issuesText = (issues: Issue[]) =>
  issues.map((i) => `${i.path.map(String).join(".") || "(item)"}: ${i.message}`).join("; ");

/** Resolves every reference and expression in a JSON value; SourcedNumbers stay as they are. */
function resolveTree(value: unknown, path: string, ctx: RefContext, itemId: string): unknown {
  const at = (v: string | ItemExpression) => {
    try {
      return resolveValue(v, ctx);
    } catch (error) {
      throw new Error(`item ${itemId}: ${path}: ${(error as Error).message}`, { cause: error });
    }
  };
  if (typeof value === "string") return value.startsWith("$") ? at(value) : value;
  if (Array.isArray(value)) return value.map((v, i) => resolveTree(v, `${path}[${i}]`, ctx, itemId));
  if (value !== null && typeof value === "object") {
    const expression = ItemExpression.safeParse(value);
    if (expression.success) return at(expression.data);
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [
        key,
        resolveTree(v, path ? `${path}.${key}` : key, ctx, itemId),
      ]),
    );
  }
  return value;
}

/** A part as a single hit: the rule that spawns it sets its time and count (spawn). */
function partInstance(
  id: string,
  part: ItemPart,
  ctx: RefContext,
  itemId: string,
): DamageInstance {
  const damage = resolveTree(part.damage, `parts.${id}.damage`, ctx, itemId) as SourcedNumber;
  const structure = (value: number): SourcedNumber => ({
    value,
    source: {
      name: `Item file ${itemId}`,
      retrieved: damage.source.retrieved,
      status: "derived",
      note: "Derived: one hit; the rule that spawns the part sets its time and count",
    },
  });
  const scale = damageScaleOf(damage);
  return {
    id,
    name: part.name,
    delayMs: structure(0),
    damagePerTick: damage,
    ticks: structure(1),
    tickIntervalMs: structure(0),
    canPrecision: part.precision ?? false,
    delivery: part.delivery,
    ...(scale ? { scale } : {}),
  };
}

/** The current text of an entry; throws if the entry is gone. */
function currentText(text: ItemText, sources: ItemSources, itemName: string, itemId: string) {
  try {
    return text.source === "clarity"
      ? clarityEntry(sources, text.entry, itemName).text
      : compendiumEntry(sources, text.entry).text;
  } catch (error) {
    throw new Error(`item ${itemId}: texts: ${(error as Error).message}`, { cause: error });
  }
}

/** A review line if the text changed since the file was written. */
function checkText(text: ItemText, current: string, itemId: string) {
  const hash = textHash(current);
  return hash === text.hash
    ? null
    : `${itemId}: ${text.source} "${text.entry}" changed (hash ${text.hash} in the file, ${hash} now); check the item against the text`;
}

export function resolveWeaponItem(raw: unknown, sources: ItemSources): ResolvedItem {
  const parsed = WeaponItem.safeParse(raw);
  if (!parsed.success) {
    const id = (raw as { id?: unknown } | null)?.id;
    throw new Error(`item ${String(id)}: ${issuesText(parsed.error.issues)}`);
  }
  const { id, name, texts, parts } = parsed.data;
  // The rest of the file are Weapon fields
  const body = Object.fromEntries(
    Object.entries(parsed.data).filter(([key]) => !ITEM_FIELDS.includes(key)),
  );
  const manifest = sources.manifest.weapons.find((w) => w.name === name);
  if (!manifest) throw new Error(`item ${id}: name: no manifest weapon "${name}"`);
  const code = sources.codes[id];
  if (code === undefined) throw new Error(`item ${id}: code: no link code for ${id} (weapon-codes.json)`);

  const current = texts.map((t) => currentText(t, sources, name, id));
  const review = texts.flatMap((t, i) => checkText(t, current[i], id) ?? []);
  (parsed.data.notModelled ?? []).forEach(({ quote }, i) => {
    if (!current.some((text) => text.includes(quote)))
      throw new Error(`item ${id}: notModelled[${i}]: quote "${quote}" is in none of the item's texts`);
  });
  const ctx: RefContext = { sources, itemName: name, fittedRows: [] };
  const resolved = resolveTree(body, "", ctx, id) as Record<string, unknown>;
  const damageInstances = Object.entries(parts).map(([partId, part]) =>
    partInstance(partId, part, ctx, id),
  );
  // The game version of the Aegis measurement the item uses, else the manifest's
  const aegisRow = ctx.fittedRows
    .map((rowId) => sources.aegis.rows.find((r) => r.id === rowId))
    .find((r) => r !== undefined);

  const weapon = Weapon.strict().safeParse({
    id,
    code,
    name: manifest.name,
    manifestHash: manifest.hash,
    gameVersion: aegisRow?.gameVersion ?? sources.manifest.manifestVersion,
    weaponType: manifest.weaponType,
    element: manifest.element,
    ammo: manifest.ammo,
    ...resolved,
    damageInstances,
    intrinsics: manifest.intrinsics.map((intrinsic) => ({
      id: slug(intrinsic),
      name: intrinsic,
      description: manifest.description.split("\n")[0] ?? "",
      source: {
        name: "Bungie manifest",
        retrieved: sources.manifest.retrieved,
        status: "verified",
        note: sources.manifest.manifestVersion,
      },
    })),
  });
  if (!weapon.success) throw new Error(`item ${id}: ${issuesText(weapon.error.issues)}`);
  return { weapon: weapon.data, review, uncovered: uncoveredSentences(current, itemQuotes(raw)) };
}
