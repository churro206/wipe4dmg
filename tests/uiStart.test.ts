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

describe("boss in the link", () => {
  const start = stateFromLink("");
  const buildFor = (damagePhaseSeconds: number) =>
    ({
      weaponId: start.weaponId,
      guardianClass: start.guardianClass,
      subclass: start.subclass,
      catalyst: false,
      selections: [],
      effectWindows: {},
      damagePhaseSeconds,
    }) as never;

  it("keeps the chosen boss, also when another boss has the same duration", () => {
    const boss = bosses[bosses.length - 1];
    const link = linkFor(
      buildFor(boss.damagePhaseSeconds.value as number),
      null,
      boss.id,
    );
    expect(stateFromLink(`?${link}`).bossId).toBe(boss.id);
  });

  it("drops a boss whose duration does not match the link", () => {
    const boss = bosses[0];
    const link = linkFor(buildFor(12345), null, boss.id);
    expect(stateFromLink(`?${link}`).bossId).toBe("");
  });

  it("opens an old link without a boss as custom", () => {
    const link = linkFor(buildFor(30), null);
    expect(stateFromLink(`?${link}`).bossId).toBe("");
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
