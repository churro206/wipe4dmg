// Uptime of effects (block "Uptime", owner 2026-10-24): every effect whose text names a duration has
// a window, or a verdict why it lasts the whole phase.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderUptime, uptimeRows } from "../scripts/lib/uptime";
import { loadUptimeInputs } from "../scripts/lib/uptimeInputs";

const rows = uptimeRows(loadUptimeInputs());
const verdictOf = (id: string) => rows.find((r) => r.effectId === id)?.verdict;

describe("uptime of effects", () => {
  it("leaves no effect open whose text names a duration", () => {
    expect(rows.filter((r) => r.verdict === "open").map((r) => `${r.name}: ${r.quote}`)).toEqual([]);
  });

  it("keeps teammate buffs, events and states the whole phase, own buffs with a duration in a window", () => {
    expect(verdictOf("radiant")).toBe("fireteam"); // a teammate keeps it up
    expect(verdictOf("exotic-armor:peacekeepers")).toBe("event"); // stacks per hit
    expect(verdictOf("diamond-lance")).toBe("state");
    expect(verdictOf("limit-break")).toBe("held");
    expect(verdictOf("hellion")).toBe("window");
    expect(verdictOf("spark-of-feedback")).toBe("window");
  });

  it("finds a duration in a Court source name, a Court row and Clarity", () => {
    const inputs = loadUptimeInputs();
    const probe = (id: string) => {
      const found = inputs.effects.find((e) => e.effect.id === id)!;
      const effect = { ...found.effect, durationMs: undefined, trigger: undefined };
      return uptimeRows({ ...inputs, effects: [{ ...found, effect }] })[0];
    };
    // without its window, each would be open again
    expect(probe("exotic-armor:chromatic-fire")).toMatchObject({ verdict: "open", seconds: 6 });
    expect(probe("spark-of-feedback")).toMatchObject({ verdict: "open", seconds: 5 });
    expect(probe("hellion")).toMatchObject({ verdict: "open", seconds: 20 });
  });

  it("docs/uptime-import.md is current (run npm run build:uptime)", () => {
    expect(readFileSync("docs/uptime-import.md", "utf8").replace(/\r\n/g, "\n")).toBe(renderUptime(rows));
  });
});
