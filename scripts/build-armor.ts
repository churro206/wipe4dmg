// Classifies the exotic armor from the snapshots (ADR 0014) and writes src/data/exotic-armor.json and
// the review table docs/armor-import.md. Then generates the effects of the damage buffs (ADR 0015,
// U6-1): src/data/exotic-armor-effects.json and the review table docs/exotic-effects.md. No download:
// run npm run import:court, import:compendium and import:icons first to refresh the sources.
// Run: npm run build:armor

import { writeFileSync } from "node:fs";
import { format } from "prettier";
import { loadArmorImportInputs } from "./lib/armorImportInputs.ts";
import { classifyExoticArmor, renderArmorImport } from "./lib/exoticArmor.ts";
import { loadExoticEffectInputs } from "./lib/exoticEffectInputs.ts";
import { exoticEffects, renderExoticEffects } from "./lib/exoticEffects.ts";

const ROOT = new URL("../", import.meta.url);
const entries = classifyExoticArmor(loadArmorImportInputs());

writeFileSync(
  new URL("src/data/exotic-armor.json", ROOT),
  await format(JSON.stringify(entries), { parser: "json" }),
);
writeFileSync(
  new URL("docs/armor-import.md", ROOT),
  renderArmorImport(entries),
);
const count = (kind: string) => entries.filter((e) => e.kind === kind).length;
console.log(
  `Wrote ${entries.length} exotic armor pieces (${count("abilityVariant")} ability variants, ${count("damageBuff")} damage buffs, ${count("gap")} gaps, ${count("noDamage")} without damage); review docs/armor-import.md`,
);

const { rows, effects } = exoticEffects(loadExoticEffectInputs(entries));
writeFileSync(
  new URL("src/data/exotic-armor-effects.json", ROOT),
  await format(JSON.stringify(effects), { parser: "json" }),
);
writeFileSync(
  new URL("docs/exotic-effects.md", ROOT),
  renderExoticEffects(rows),
);
console.log(
  `Wrote ${effects.length} exotic effects from ${rows.length} rows; review docs/exotic-effects.md`,
);
