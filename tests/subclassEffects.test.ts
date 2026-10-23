// Effects of the aspects and fragments by rule (ADR 0015, U6-2), checked against the rules the owner
// approved on 2026-10-22, and Ember of Ashes as the cross-check against effects.json.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import rawCodes from "../src/data/effect-codes.json";
import rawEffects from "../src/data/effects.json";
import rawGenerated from "../src/data/subclass-effects.json";
import { SubclassEffect } from "../src/data/schema";
import { loadEffects, loadSubclassEffects } from "../src/engine/loadData";
import {
  renderSubclassEffects,
  subclassEffects,
} from "../scripts/lib/subclassEffects";
import { loadSubclassEffectInputs } from "../scripts/lib/subclassEffectInputs";

const inputs = loadSubclassEffectInputs();
const result = subclassEffects(inputs);
const effects = loadEffects(rawEffects);
const generatedOf = (id: string) =>
  result.effects.find((e) => e.effect.id === id)!;
const kindsOf = (name: string) =>
  result.rows.filter((r) => r.name === name).map((r) => r.kind);

describe("rules for aspects and fragments", () => {
  it("has one row or more for every aspect and fragment of the manifest", () => {
    const names = new Set(inputs.subclassItems.map((i) => i.name));
    expect(new Set(result.rows.map((r) => r.name))).toEqual(names);
  });

  it("generates Ember of Ashes exactly as effects.json has it (cross-check)", () => {
    const kept = effects.find((e) => e.id === "ember-of-ashes")!;
    const generated = generatedOf("ember-of-ashes").effect;
    expect(generated.code).toBe(kept.code);
    expect(generated.manifestRef).toEqual(kept.manifestRef);
    expect(generated.providers).toEqual(kept.providers);
    expect(generated.parts.map((p) => ({ ...p, factor: undefined }))).toEqual(
      kept.parts.map((p) => ({ ...p, factor: undefined })),
    );
    expect(generated.parts[0]).toMatchObject({ factor: { value: 1.5 } });
  });

  it.each([
    ["Ascension", "always"],
    ["Ember of Ashes", "always"],
    ["Spark of Shock", "always"],
    ["Controlled Demolition", "always"],
    ["Echo of Instability", "preBuilt"],
    ["Roaring Flames", "preBuilt"],
    ["On the Prowl", "preBuilt"],
    ["Echo of Undermining", "triggered"],
    ["Ember of Torches", "triggered"],
    ["Trapper's Ambush", "classAbility"],
    ["Knockout", "preBuilt"],
    ["Offensive Bulwark", "always"],
    ["Threaded Specter", "notAgainstBoss"],
    ["Facet of Courage", "always"],
    ["Crackshot", "bonusLater"],
    ["Ember of Char", "keywordLater"],
    ["Spark of Amplitude", "noDamage"],
  ])("%s → %s", (name, kind) => {
    expect(kindsOf(name)).toContain(kind);
  });

  it("a state from an aspect holds the whole damage phase", () => {
    expect(generatedOf("ascension").effect).toMatchObject({
      parts: [],
      grantsStatus: ["amplified"],
    });
    expect(generatedOf("ascension").effect.durationMs).toBeUndefined();
  });

  it("a state from kills is prebuilt with the duration of the text", () => {
    expect(generatedOf("roaring-flames")).toMatchObject({
      activation: "preBuilt",
      effect: { grantsStatus: ["roaringFlames"], durationMs: { value: 20000 } },
    });
  });

  it("windows from the rotation: Weaken from Void grenades, Radiant from melee hits", () => {
    expect(generatedOf("echo-of-undermining").effect).toMatchObject({
      trigger: { on: "hit", abilityKinds: ["grenade"], elements: ["void"] },
      durationMs: { value: 5000 },
      parts: [{ bucketId: "debuff", multiplier: { value: 1.15 } }],
    });
    const radiant = effects.find((e) => e.id === "radiant")!;
    expect(generatedOf("ember-of-torches").effect).toMatchObject({
      trigger: { on: "hit", abilityKinds: ["melee"] },
      durationMs: { value: 8000 },
      parts: radiant.parts,
    });
  });

  it("melee bonuses go to the additive melee bucket (U6-4), the highest value of an item", () => {
    // Knockout names 160 % twice (Basic/Glaive and Charged): one bonus, not two; for the 6 s it grants
    expect(generatedOf("knockout")).toMatchObject({
      activation: "preBuilt",
      effect: {
        durationMs: { value: 6000 },
        parts: [{ bucketId: "melee", multiplier: { value: 2.6 }, damageSources: ["melee"] }],
      },
    });
    expect(generatedOf("offensive-bulwark")).toMatchObject({
      activation: "always",
      effect: { parts: [{ bucketId: "melee", multiplier: { value: 2.6 } }] },
    });
    // "67% | 133% | 200%": optimal play holds the third stack
    expect(generatedOf("roaring-flames-2").effect.parts[0]).toMatchObject({
      bucketId: "melee",
      multiplier: { value: 3 },
    });
  });

  it("bonuses on grenades and supers: scope from the words, own bucket", () => {
    expect(generatedOf("roaring-flames-3").effect.parts).toMatchObject([
      { bucketId: "aspectBonus", multiplier: { value: 1.73 }, damageSources: ["grenade", "super"], elements: ["solar"] },
    ]);
    const facet = result.effects
      .filter((e) => e.subclassItemId === "facet-of-courage")
      .flatMap((e) => e.effect.parts);
    expect(facet).toMatchObject([
      { bucketId: "aspectBonus", multiplier: { value: 1.1 }, elements: ["arc", "solar", "void"] },
      { bucketId: "melee", multiplier: { value: 1.5 } },
    ]);
  });

  it("keyword parts on named hits and prebuilt rounds (U4b)", () => {
    expect(generatedOf("spark-of-shock").effect.parts).toMatchObject([
      {
        type: "appliesKeyword",
        keywordId: "jolt",
        damageSources: ["grenade"],
        elements: ["arc"],
      },
    ]);
    expect(generatedOf("echo-of-instability")).toMatchObject({
      activation: "preBuilt",
      effect: {
        parts: [
          { type: "appliesKeyword", keywordId: "volatile", damageSources: ["weapon"], elements: ["void"] },
        ],
        durationMs: { value: 11250 },
      },
    });
  });

  it("gives every generated effect its own code, apart from the codes of effects.json", () => {
    const own = result.effects.filter((e) => !effects.some((k) => k.id === e.effect.id));
    const codes = own.map((e) => e.effect.code);
    expect(new Set(codes).size).toBe(codes.length);
    const taken = effects.flatMap((e) => [e.code, ...(e.formerCodes ?? []).map((f) => f.code)]);
    expect(codes.filter((c) => taken.includes(c))).toEqual([]);
  });

  it("keeps the codes once given", () => {
    for (const [id, code] of Object.entries(rawCodes))
      expect(result.codes[id], id).toBe(code);
  });
});

describe("loading the subclass effects", () => {
  it("leaves out the prebuilt ones without the option", () => {
    const ids = (preBuilt?: boolean) =>
      loadSubclassEffects(rawGenerated, { preBuilt }).map((e) => e.id);
    expect(ids()).toContain("ascension");
    expect(ids()).not.toContain("echo-of-instability");
    expect(ids(true)).toContain("echo-of-instability");
  });
});

describe("generated files are current (run npm run build:keywords)", () => {
  const kept = new Set(effects.map((e) => e.id));
  it("subclass-effects.json, without the effects kept in effects.json", () => {
    expect(SubclassEffect.array().parse(rawGenerated)).toEqual(
      result.effects.filter((e) => !kept.has(e.effect.id)),
    );
  });

  it("effect-codes.json", () => {
    expect(rawCodes).toEqual(result.codes);
  });

  it("docs/subclass-effects.md", () => {
    expect(
      readFileSync("docs/subclass-effects.md", "utf8").replace(/\r\n/g, "\n"),
    ).toBe(renderSubclassEffects(result.rows));
  });
});
