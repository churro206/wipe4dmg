// Keyword sources from the Compendium texts (ADR 0015, U4b): who applies which keyword, with which
// filter or trigger. One boss without adds: kills never happen in the damage phase, kill buffs with a
// duration can be built up before it.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  findKeywordSources,
  renderKeywordSources,
} from "../scripts/lib/keywordSources";
import rawCompendium from "../src/data/compendium-abilities.json";
import { CompendiumSnapshot, type CompendiumEntry } from "../src/data/schema";

const entry = (
  section: string,
  name: string,
  text: string,
): CompendiumEntry => ({ tab: "Test", section, name, text });
const one = (e: CompendiumEntry) => findKeywordSources([e]);

describe("findKeywordSources", () => {
  it("an ability applies the keyword with its own hits, with its scorch stacks", () => {
    expect(
      one(
        entry(
          "Grenade Abilities",
          "Fusion Grenade",
          "Explosion deals up to 814 [130] damage and inflicts x60+30 Scorch over 8 meters on detonation.",
        ),
      ),
    ).toMatchObject([
      {
        name: "Fusion Grenade",
        keywordId: "ignition",
        stacks: 60,
        kind: "abilityHit",
        quote: "inflicts x60+30 Scorch",
      },
    ]);
  });

  it("an aspect or fragment applies it to hits named in the sentence", () => {
    const [shock] = one(
      entry("Fragments", "Shock", "Arc Grenades inflict Jolt on hit."),
    );
    expect(shock).toMatchObject({
      keywordId: "jolt",
      kind: "hitFilter",
      filter: { elements: ["arc"], damageSources: ["grenade"] },
    });
    const [instability] = one(
      entry("Fragments", "Instability", "Void Ability Damage inflicts Volatile."),
    );
    expect(instability).toMatchObject({
      keywordId: "volatile",
      kind: "hitFilter",
      filter: {
        elements: ["void"],
        damageSources: ["grenade", "melee", "super", "classAbility"],
      },
    });
  });

  it("a kill buff with a duration can be built up before the damage phase", () => {
    expect(
      one(
        entry(
          "Fragments",
          "Instinct",
          "Grenade Kills grant Volatile Rounds to Void Weapons for 11.25 [7.5] seconds.",
        ),
      ),
    ).toMatchObject([
      {
        keywordId: "volatile",
        kind: "preBuilt",
        durationSeconds: 11.25,
        filter: { elements: ["void"], damageSources: ["weapon"] },
      },
    ]);
  });

  it("a kill without a duration never fires (one boss, no adds)", () => {
    expect(
      one(
        entry(
          "Aspect",
          "Lightning Surge",
          "Scoring a Jolted Enemy Kill grants x1 Bolt Charge.",
        ),
      ),
    ).toMatchObject([{ keywordId: "boltCharge", stacks: 1, kind: "kill" }]);
  });

  it("class ability usage waits for its trigger (U7)", () => {
    expect(
      one(
        entry(
          "Aspect",
          "Storm's Keep",
          "On Class Ability Usage:\nGrants x4 Bolt Charge.",
        ),
      ),
    ).toMatchObject([{ keywordId: "boltCharge", stacks: 4, kind: "classAbility" }]);
  });

  it("an aspect's own damage without a named hit comes later", () => {
    expect(
      one(
        entry(
          "Aspects",
          "Hellion",
          "Hellion fires Solar Bolts, each dealing 40 damage and inflicting x10+5 Scorch.",
        ),
      ),
    ).toMatchObject([{ keywordId: "ignition", kind: "ownDamage" }]);
  });

  it("glossary entries only define the keyword", () => {
    expect(
      one(
        entry(
          "Glossary",
          "Jolted",
          "The damage from the hit that applies Jolt counts towards the damage threshold.",
        ),
      ),
    ).toMatchObject([{ keywordId: "jolt", kind: "definition" }]);
  });

  it("skips a cooldown before applying again and a condition 'upon inflicting'", () => {
    expect(
      one(
        entry(
          "Fragments",
          "Shock",
          "Arc Soul and Ionic Sentries have a 4 second cooldown before being able to inflict Jolt again.",
        ),
      ),
    ).toEqual([]);
    expect(
      one(
        entry(
          "Fragments",
          "Singeing",
          "Grants 10% Class Ability Regeneration Rate for 3 seconds upon inflicting Scorch to enemies.",
        ),
      ),
    ).toEqual([]);
  });

  it("finds nothing in a text without keywords", () => {
    expect(one(entry("Fragments", "Other", "Grants 10 Mobility."))).toEqual([]);
  });
});

describe("the Compendium snapshot", () => {
  const sources = findKeywordSources(
    CompendiumSnapshot.parse(rawCompendium).entries,
  );

  it("finds keyword sources of every kind", () => {
    const kinds = new Set(sources.map((s) => s.kind));
    for (const kind of ["abilityHit", "hitFilter", "kill", "definition"]) {
      expect(kinds, kind).toContain(kind);
    }
  });

  it("docs/keyword-sources.md is current (run npm run build:keywords)", () => {
    expect(
      readFileSync("docs/keyword-sources.md", "utf8").replace(/\r\n/g, "\n"),
    ).toBe(renderKeywordSources(sources));
  });
});
