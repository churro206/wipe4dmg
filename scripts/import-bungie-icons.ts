// Imports the icons for effects, weapons, abilities, subclasses and kinds of damage from the Bungie
// manifest into public/icons and writes src/data/icons.json (ADR 0008). Before that it reads the
// ability items of the manifest item table into src/data/manifest-abilities.json: slot, class and
// subclass of every super, grenade and melee, including Prismatic (ADR 0009).
// Needs BUNGIE_API_KEY, e.g. in .env.local (ignored by git). Run: npm run import:icons

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { format } from "prettier";
import {
  AbilityData,
  Effect,
  IconIndex,
  IconRef,
  ManifestAbilities,
  Weapon,
  type ManifestRef,
} from "../src/data/schema.ts";
import {
  abilityIconRefs,
  collectIconRefs,
  iconFileName,
} from "./lib/bungieIcons.ts";
import {
  extractManifestAbilities,
  type ManifestItem,
} from "./lib/manifestAbilities.ts";

const BUNGIE = "https://www.bungie.net";
const ROOT = new URL("../", import.meta.url);
const readJson = (path: string) =>
  JSON.parse(readFileSync(new URL(path, ROOT), "utf8"));

const apiKey = process.env.BUNGIE_API_KEY?.trim();
if (!apiKey) {
  throw new Error("BUNGIE_API_KEY is missing; put it into .env.local");
}
// Only the fields of the Bungie API responses this script reads.
type Envelope<T> = { ErrorStatus: string; Message: string; Response: T };
type Manifest = {
  version: string;
  jsonWorldComponentContentPaths: {
    en: { DestinyInventoryItemDefinition: string };
  };
};
type Definition = {
  displayProperties?: { name?: string; icon?: string; hasIcon?: boolean };
};

const api = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${BUNGIE}/Platform${path}`, {
    headers: { "X-API-Key": apiKey },
  });
  const body = (await response.json()) as Envelope<T>;
  if (body.ErrorStatus !== "Success") {
    throw new Error(`Bungie API ${path}: ${body.ErrorStatus} ${body.Message}`);
  }
  return body.Response;
};

const manifest = await api<Manifest>("/Destiny2/Manifest/");
const retrieved = new Date().toISOString().slice(0, 10);

// The item table is large (about 200 MB); it is read once and not stored.
const itemTable = await fetch(
  `${BUNGIE}${manifest.jsonWorldComponentContentPaths.en.DestinyInventoryItemDefinition}`,
);
if (!itemTable.ok)
  throw new Error(`Item table download failed: ${itemTable.status}`);
const manifestAbilities = ManifestAbilities.parse({
  manifestVersion: manifest.version,
  retrieved,
  abilities: extractManifestAbilities(
    (await itemTable.json()) as Record<string, ManifestItem>,
  ),
});
writeFileSync(
  new URL("src/data/manifest-abilities.json", ROOT),
  await format(JSON.stringify(manifestAbilities), { parser: "json" }),
);
console.log(`Wrote ${manifestAbilities.abilities.length} ability items`);

const refs = collectIconRefs(
  Effect.array().parse(readJson("src/data/effects.json")),
  // Every weapon Data File (ADR 0012).
  readdirSync(new URL("src/data/weapons/", ROOT))
    .filter((file) => file.endsWith(".json"))
    .map((file) => Weapon.parse(readJson(`src/data/weapons/${file}`))),
  [
    ...IconRef.array().parse(readJson("src/data/icon-refs.json")),
    ...abilityIconRefs(
      AbilityData.array().parse(readJson("src/data/abilities.json")),
      manifestAbilities.abilities,
    ),
  ],
);
mkdirSync(new URL("public/icons/", ROOT), { recursive: true });

// The same manifest entry can serve several keys, e.g. the three surge levels.
const files = new Map<string, string>();
const fileOf = async (ref: ManifestRef) => {
  const id = `${ref.table}/${ref.hash}`;
  const known = files.get(id);
  if (known) return known;
  const definition = await api<Definition>(
    `/Destiny2/Manifest/${ref.table}/${ref.hash}/`,
  );
  const iconPath: string | undefined = definition.displayProperties?.icon;
  if (!definition.displayProperties?.hasIcon || !iconPath) {
    throw new Error(
      `${id} (${definition.displayProperties?.name}) has no icon`,
    );
  }
  const image = await fetch(`${BUNGIE}${iconPath}`);
  if (!image.ok) throw new Error(`Download failed for ${id}: ${image.status}`);
  const file = iconFileName(ref, iconPath);
  writeFileSync(
    new URL(`public/${file}`, ROOT),
    Buffer.from(await image.arrayBuffer()),
  );
  files.set(id, file);
  return file;
};

const icons: Record<string, string> = {};
for (const ref of refs) {
  icons[ref.key] = await fileOf(ref.manifestRef);
}
const index = IconIndex.parse({
  manifestVersion: manifest.version,
  retrieved,
  icons: Object.fromEntries(
    Object.entries(icons).sort(([a], [b]) => a.localeCompare(b)),
  ),
});
writeFileSync(
  new URL("src/data/icons.json", ROOT),
  JSON.stringify(index, null, 2) + "\n",
);
console.log(
  `Wrote ${Object.keys(icons).length} icons (${files.size} files) from manifest ${manifest.version}`,
);
