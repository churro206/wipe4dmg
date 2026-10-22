// Aegis rows that measure an ability like its base row plus extra items (ADR 0014 rule 1, U6-2 rule G):
// same category and name, all base assumptions, and every extra assumption is a known item, e.g.
// "Blade Barrage" + "Knock Em Down". Shared by the ability loader and npm run build:keywords, so it
// imports nothing (the scripts load it directly).

/** The fields of an Aegis ability row (AegisAbilityRow) this needs. */
type Row = { id: string; category: string; name: string; assumptions: string[] };

/** Name key that ignores case, spaces and apostrophes, e.g. "Knock 'Em Down" = "Knock Em Down". */
export const nameKey = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Variant rows of a base row; `resolve` maps an extra assumption of a row to its item. */
export function variantRows<R extends Row, T>(
  base: R,
  rows: R[],
  resolve: (assumption: string, row: R) => T | undefined,
): { row: R; extras: T[] }[] {
  return rows.flatMap((row) => {
    if (
      row.id === base.id ||
      row.category !== base.category ||
      row.name !== base.name ||
      !base.assumptions.every((a) => row.assumptions.includes(a))
    )
      return [];
    const extraNames = row.assumptions.filter(
      (a) => !base.assumptions.includes(a),
    );
    const extras = extraNames.map((a) => resolve(a, row));
    if (extras.length === 0 || extras.some((e) => e === undefined)) return [];
    return [{ row, extras: extras as T[] }];
  });
}
