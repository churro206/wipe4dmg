// Compendium, Aegis and the Bungie manifest spell ability names differently, e.g. "Silence & Squall",
// "Silence and Squall", "Golden Gun: Deadshot" and "Golden Gun - Deadshot", "Slicewire Grenade".

/** Comparable key of an ability name: lower case, "&" as "and", without "grenade" and remarks. */
export function abilityNameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/&/g, "and")
    .replace(/\bgrenade\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Manifest items of an ability: the same kind and the same name key. */
export function itemsOfAbility<T extends { name: string; kind: string }>(
  items: T[],
  ability: { name: string; kind: string },
): T[] {
  const key = abilityNameKey(ability.name);
  return items.filter(
    (item) => item.kind === ability.kind && abilityNameKey(item.name) === key,
  );
}

/** The item of the ability's own element, e.g. the Arc and not the Prismatic one; else the first. */
export function elementItem<T extends { subclass: string }>(
  items: T[],
  element: string,
): T | undefined {
  return items.find((item) => item.subclass === element) ?? items[0];
}
