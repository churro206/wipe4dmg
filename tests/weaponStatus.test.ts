// V1: the weapon status file (src/data/weapon-status.json). One row per weapon with what the model
// does, how it ends against Quantum and Aegis, and a status that is computed, not claimed.

import { describe, expect, it } from "vitest";
import rawStatus from "../src/data/weapon-status.json";
import { WeaponStatusFile } from "../src/data/schema";
import {
  planBlockOf,
  sentenceStates,
  statusOf,
  trustOf,
} from "../scripts/lib/weaponStatus";
import { realWeaponStatus } from "./lib/weaponStatusData";

const src = (status: string) => ({ name: "x", retrieved: "2026-11-05", status }) as never;

describe("sentenceStates", () => {
  const item = {
    a: '$clarity[Frame]("Fires at 300 RPM")',
    notModelled: [{ quote: "Kills refill", reason: "no adds (ADR 0015)" }],
  };
  const texts = ["Fires at 300 RPM. Kills refill the magazine by 2.\nGrants 40 Reload Speed."];

  it("tells rule, notModelled with its reason and open apart", () => {
    expect(sentenceStates(texts, item)).toEqual([
      { text: "Fires at 300 RPM.", state: "rule" },
      { text: "Kills refill the magazine by 2.", state: "notModelled", reason: "no adds (ADR 0015)" },
      { text: "Grants 40 Reload Speed.", state: "open" },
    ]);
  });

  it("leaves every sentence with a number open for a weapon without an item file", () => {
    expect(sentenceStates(texts, null).map((s) => s.state)).toEqual(["open", "open", "open"]);
  });
});

describe("trustOf", () => {
  it("is estimated for fitted or missing, derived for derived or unverified, else measured", () => {
    expect(trustOf([src("verified"), src("measured")])).toBe("measured");
    expect(trustOf([src("verified"), src("derived")])).toBe("derived");
    expect(trustOf([src("derived"), src("fitted")])).toBe("estimated");
    expect(trustOf([src("missing")])).toBe("estimated");
  });
});

describe("statusOf", () => {
  const ok = { open: 0, quoteDeviation: 0, estimated: false };
  it("is complete only without open sentences, within 2 % of Quantum and not estimated", () => {
    expect(statusOf(ok)).toBe("complete");
    expect(statusOf({ ...ok, open: 1 })).toBe("partial");
    expect(statusOf({ ...ok, quoteDeviation: 0.05 })).toBe("partial");
    expect(statusOf({ ...ok, quoteDeviation: null })).toBe("partial");
    expect(statusOf({ ...ok, estimated: true })).toBe("estimated");
  });
});

describe("planBlockOf", () => {
  const plan = ["- [x] M2 Zusatzteile: Cloudstrike.", "- [ ] M3 Ramp: Coldheart, Sunshot.", "- [ ] V2 Tabelle."].join("\n");
  it("finds the first open block that names the weapon", () => {
    expect(planBlockOf("Coldheart", plan)).toBe("M3");
    expect(planBlockOf("Cloudstrike", plan)).toBeNull();
    expect(planBlockOf("Nothing", plan)).toBeNull();
  });
});

describe("src/data/weapon-status.json", () => {
  const status = realWeaponStatus();

  it("is up to date; run npm run coverage after changing data files", async () => {
    await expect(JSON.stringify(status, null, 2) + "\n").toMatchFileSnapshot(
      "../src/data/weapon-status.json",
    );
  });

  it("follows the schema, one row per weapon", () => {
    const file = WeaponStatusFile.parse(rawStatus);
    expect(new Set(file.weapons.map((w) => w.id)).size).toBe(file.weapons.length);
    expect(file.weapons.length).toBeGreaterThan(100);
  });

  it("Cloudstrike ends 0 % from Quantum's total damage", () => {
    const row = status.weapons.find((w) => w.id === "cloudstrike")!;
    expect(row.quantum?.deviation).toBeCloseTo(0, 2);
  });

  it("a weapon with an $aegis value says there is no independent check", () => {
    const rows = status.weapons.filter((w) => w.aegis.check === "no independent check");
    expect(rows.length).toBeGreaterThan(0);
    for (const w of rows) {
      expect(w.trust).toBe("estimated");
      expect(w.status).toBe("estimated");
    }
  });

  it("the status is computed from its parts", () => {
    for (const w of status.weapons) {
      const open = w.sentences.filter((s) => s.state === "open").length;
      expect(w.status, w.id).toBe(
        statusOf({
          open,
          quoteDeviation: w.quantum?.deviation ?? null,
          estimated: w.trust === "estimated",
        }),
      );
    }
  });
});
