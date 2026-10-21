import { describe, expect, it } from "vitest";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { loadWeapon } from "../src/engine/loadWeapon";

describe("loadWeapon", () => {
  it("accepts the One Thousand Voices data file", () => {
    const weapon = loadWeapon(raw);
    expect(weapon.id).toBe(raw.id);
  });

  it("rejects data that does not match the schema", () => {
    expect(() => loadWeapon({ ...raw, magazine: "four" })).toThrow();
  });
});
