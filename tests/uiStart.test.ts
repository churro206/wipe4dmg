import { describe, expect, it } from "vitest";
import {
  DEFAULT_DAMAGE_PHASE_SECONDS,
  linkFor,
  stateFromLink,
} from "../src/ui/buildState";
import { activities, bosses } from "../src/ui/data";

describe("boss list", () => {
  it("sorts raids and dungeons alphabetically, encounters keep the data order", () => {
    expect(activities.length).toBeGreaterThan(1);
    expect(activities).toEqual(
      [...activities].sort((a, b) => a.localeCompare(b, "en")),
    );
    const lastWish = bosses
      .filter((b) => b.activity === "Last Wish")
      .map((b) => b.name);
    expect(lastWish.slice(0, 2)).toEqual(["Kalli", "Shuro Chi"]);
  });
});

describe("start state", () => {
  it("starts with a default Damage Phase so a result shows at once", () => {
    const state = stateFromLink("");
    expect(state.input).toBe(String(DEFAULT_DAMAGE_PHASE_SECONDS));
    expect(Number(state.input)).toBeGreaterThan(0);
  });

  it("lets a shared link override the default", () => {
    const start = stateFromLink("");
    const link = linkFor(
      {
        weaponId: start.weaponId,
        guardianClass: start.guardianClass,
        subclass: start.subclass,
        catalyst: false,
        selections: [],
        effectWindows: {},
        damagePhaseSeconds: DEFAULT_DAMAGE_PHASE_SECONDS + 17,
      } as never,
      null,
    );
    const state = stateFromLink(`?${link}`);
    expect(state.input).toBe(String(DEFAULT_DAMAGE_PHASE_SECONDS + 17));
  });
});
