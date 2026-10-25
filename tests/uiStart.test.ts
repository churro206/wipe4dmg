import { describe, expect, it } from "vitest";
import {
  DEFAULT_DAMAGE_PHASE_SECONDS,
  linkFor,
  stateFromLink,
} from "../src/ui/buildState";

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
