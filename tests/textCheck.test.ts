// Text check (block "Text-Abgleich", owner 2026-10-24): every multiplier part, catalyst and grant
// against the texts of its item; every deviation has a reason or counts against openLimit.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Effect } from "../src/data/schema";
import { renderTextCheck, textCheckRows, type TextCheckInputs } from "../scripts/lib/textCheck";
import { loadTextCheckInputs } from "../scripts/lib/textCheckInputs";

const fixture = JSON.parse(readFileSync("tests/fixtures/text-check.json", "utf8")) as {
  openLimit: number;
  reasons: Record<string, string>;
};
const inputs = loadTextCheckInputs();
const rows = textCheckRows(inputs);

const source = (name: string, quote?: string) => ({ name, retrieved: "2026-10-24", status: "verified" as const, ...(quote ? { quote } : {}) });

const effect = (over: Partial<Effect> & { multiplier?: number; sourceName?: string; quote?: string }): Effect => ({
  id: "probe",
  name: "Probe",
  code: 1,
  shortName: "Probe",
  providers: [{ kind: "fireteamSupport" }],
  parts: [
    {
      type: "multiplier",
      bucketId: "empowering",
      multiplier: { value: over.multiplier ?? 1.25, source: source(over.sourceName ?? "Court", over.quote) },
      damageSources: ["weapon"],
    },
  ],
  ...over,
});

const only = (e: Effect, text: string): TextCheckInputs => ({
  effects: [{ file: "exotic-armor-effects.json", effect: e }],
  compendium: [{ tab: "Exotic Armors", section: "", name: e.name, text, extra: "" }],
  court: [],
  clarity: [],
  weapons: [],
  grants: [],
  abilityNames: {},
});

const verdict = (input: TextCheckInputs, check: string) => textCheckRows(input).find((r) => r.check === check)?.verdict;

describe("text check rule", () => {
  it("finds the value in the text, ignores PvP brackets", () => {
    expect(verdict(only(effect({}), "Weapons deal 25% [10%] more damage."), "value")).toBe("ok");
    expect(verdict(only(effect({}), "Weapons deal 30% [25%] more damage."), "value")).toBe("deviation");
  });

  it("accepts a measurement within ±25 % of a percentage in the text", () => {
    const measured = effect({ multiplier: 1.2, sourceName: "Aegis Sustained" });
    expect(verdict(only(measured, "Weapons deal 25% more damage."), "value")).toBe("measured");
    expect(verdict(only(measured, "Weapons deal 40% more damage."), "value")).toBe("deviation");
  });

  it("reads N stacks from the name, e.g. x4 at 10 % per stack", () => {
    const stacked = effect({ name: "Probe x4", multiplier: 1.4 });
    expect(verdict(only(stacked, "Each stack grants 10% weapon damage."), "value")).toBe("ok");
  });

  it("flags a duration the text does not name", () => {
    const timed = effect({ durationMs: { value: 8000, source: source("Compendium") } });
    expect(verdict(only(timed, "Weapons deal 25% more damage for 4 seconds."), "duration")).toBe("deviation");
    expect(verdict(only(timed, "Weapons deal 25% more damage for 8 seconds."), "duration")).toBe("ok");
  });

  it("flags a target the text does not name and a narrowing the part misses", () => {
    expect(verdict(only(effect({}), "Grenades deal 25% more damage."), "target")).toBe("deviation");
    expect(verdict(only(effect({}), "Solar weapons deal 25% more damage."), "target")).toBe("deviation");
    expect(verdict(only(effect({}), "Weapons deal 25% more damage."), "target")).toBe("ok");
  });

  it("skips the target of a debuff on every damage source", () => {
    const debuff = effect({});
    debuff.parts = [{ ...(debuff.parts[0] as Extract<Effect["parts"][number], { type: "multiplier" }>), damageSources: ["weapon", "grenade", "melee", "super", "classAbility", "keyword"] }];
    expect(verdict(only(debuff, "Trace rifle hits weaken targets by 25%."), "target")).toBe("ok");
  });
});

describe("text check of the data", () => {
  it("would catch the transcription errors found so far", () => {
    const probe = (id: string, change: (e: Effect) => Effect) => {
      const found = inputs.effects.find((e) => e.effect.id === id)!;
      return textCheckRows({ ...inputs, effects: [{ ...found, effect: change(found.effect) }] });
    };
    // Verity: level 5 lasts 4 s, not 8 s
    const verity = probe("exotic-armor:veritys-brow", (e) => ({ ...e, durationMs: { ...e.durationMs!, value: 8000 } }));
    expect(verity.find((r) => r.check === "duration")?.verdict).toBe("deviation");
    // Star-Eater: the bonus is on every super, the subject of another line (Thundercrash) is wrong
    const starEater = probe("exotic-armor:star-eater-scales", (e) => ({
      ...e,
      parts: e.parts.map((p) => (p.type === "multiplier" ? { ...p, abilityIds: ["thundercrash"] } : p)),
    }));
    expect(starEater.find((r) => r.check === "target")?.verdict).toBe("deviation");
  });

  it("every deviation has a reason, or counts against openLimit", () => {
    const open = rows.filter((r) => r.verdict === "deviation" && !fixture.reasons[r.key]);
    expect(open.length).toBeLessThanOrEqual(fixture.openLimit);
  });

  it("has no reason for a row that is no deviation", () => {
    const deviations = new Set(rows.filter((r) => r.verdict === "deviation").map((r) => r.key));
    expect(Object.keys(fixture.reasons).filter((k) => !deviations.has(k))).toEqual([]);
  });

  it("docs/text-check.md is current (run npm run check:text)", () => {
    expect(readFileSync("docs/text-check.md", "utf8").replace(/\r\n/g, "\n")).toBe(renderTextCheck(rows, fixture.reasons));
  });
});
