import fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { Build } from "../src/data/schema";
import { decodeBuild, encodeBuild } from "../src/engine/buildLink";

// Test inputs, not game data.
const build: Build = {
  weaponId: "one-thousand-voices",
  catalyst: true,
  damagePhaseSeconds: 72,
  effectIds: ["well-of-radiance", "ember-of-ashes"],
  effectWindows: {
    "well-of-radiance": { startMs: 0, durationMs: 30_000 },
    "ember-of-ashes": { startMs: 0 },
  },
};

describe("encodeBuild", () => {
  it("writes a short, readable text", () => {
    expect(encodeBuild(build)).toBe(
      "v=1&w=one-thousand-voices&p=72&c=1&e=well-of-radiance:0:30,ember-of-ashes:0",
    );
  });

  it("writes an empty effect list without effects", () => {
    expect(
      encodeBuild({
        ...build,
        effectIds: [],
        effectWindows: {},
        catalyst: false,
      }),
    ).toBe("v=1&w=one-thousand-voices&p=72&c=0&e=");
  });
});

describe("decodeBuild", () => {
  it("reads what encodeBuild writes", () => {
    expect(decodeBuild(encodeBuild(build))).toEqual(build);
  });

  it("keeps decimal seconds", () => {
    const decimal: Build = {
      ...build,
      damagePhaseSeconds: 12.883,
      effectWindows: {
        "well-of-radiance": { startMs: 1500, durationMs: 7250 },
        "ember-of-ashes": { startMs: 0 },
      },
    };
    expect(decodeBuild(encodeBuild(decimal))).toEqual(decimal);
  });

  it("accepts a leading question mark", () => {
    expect(decodeBuild("?" + encodeBuild(build))).toEqual(build);
  });

  it.each([
    ["an unknown version", "v=2&w=x&p=1&c=0&e="],
    ["a missing damage phase", "v=1&w=x&c=0&e="],
    ["a negative damage phase", "v=1&w=x&p=-1&c=0&e="],
    ["an invalid catalyst flag", "v=1&w=x&p=1&c=yes&e="],
    ["an invalid effect window", "v=1&w=x&p=1&c=0&e=well:abc"],
    ["an invalid effect id", "v=1&w=x&p=1&c=0&e=Well Of Radiance:0"],
    ["text that is no build", "hello"],
  ])("rejects %s", (_, text) => {
    expect(() => decodeBuild(text)).toThrow();
  });

  it("round-trips any build", () => {
    const id = fc.stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    const millis = fc.integer({ min: 0, max: 600_000 });
    const arbitraryBuild = fc
      .record({
        weaponId: id,
        catalyst: fc.boolean(),
        damagePhaseSeconds: fc
          .integer({ min: 0, max: 600_000 })
          .map((ms) => ms / 1000),
        windows: fc.uniqueArray(
          fc.record({
            id,
            startMs: millis,
            durationMs: fc.option(millis, { nil: undefined }),
          }),
          { selector: (w) => w.id, maxLength: 6 },
        ),
      })
      .map(({ windows, ...rest }): Build => ({
        ...rest,
        effectIds: windows.map((w) => w.id),
        effectWindows: Object.fromEntries(
          windows.map((w) => [
            w.id,
            w.durationMs === undefined
              ? { startMs: w.startMs }
              : { startMs: w.startMs, durationMs: w.durationMs },
          ]),
        ),
      }));
    fc.assert(
      fc.property(arbitraryBuild, (b) => {
        expect(decodeBuild(encodeBuild(b))).toEqual(b);
      }),
    );
  });
});
