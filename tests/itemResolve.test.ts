// Item files (docs/architecture.md section 5, B4a step 3): the resolver turns `$` references and
// expressions into SourcedNumbers with the status of their source, checks the texts by hash and
// hands the result to the runtime schema Weapon. The snapshots here are small fixtures.

import { describe, expect, it } from "vitest";
import rawAegis from "../src/data/aegis-weapons.json";
import rawClarity from "../src/data/clarity.json";
import rawQuantum from "../src/data/quantum-weapons.json";
import { AegisWeaponSnapshot, ClaritySnapshot, QuantumWeaponSnapshot } from "../src/data/schema";
import type { ItemSources } from "../scripts/lib/items/refs";
import { resolveValue } from "../scripts/lib/items/refs";
import { resolveWeaponItem } from "../scripts/lib/items/weaponItem";
import { textHash } from "../scripts/lib/hash";

const snapshotSource = (name: string) => ({
  name,
  url: "https://example.org",
  retrieved: "2026-10-30",
  status: "verified" as const,
});

const FIFTH_TEXT = [
  "Precision Hits refill 1 ammo.",
  "Scoring 4 Precision Hits loads a delayed Solar Explosive.",
  "Solar Explosive detonates after a 0.5? second delay, dealing 215 [78] damage and applying 40 Scorch stacks (60 with Ember of Ashes)",
].join("\n");

const QUANTUM_ROW = "primaries-scout-rifle-polaris-lance";
const AEGIS_ROW = "scout-rifle-polaris-lance-average-with-ignition";
const AEGIS_OTHER = "scout-rifle-polaris-lance-average-with-ignitions-ember-of-ashes";
const SUSTAINED_ROW = "polaris-lance";

const sources: ItemSources = {
  quantum: {
    source: snapshotSource("Quantum Damage-ics"),
    rows: [
      {
        id: QUANTUM_ROW,
        tab: "primaries",
        weaponType: "scoutRifle",
        name: "Polaris Lance",
        variant: "",
        totalDamage: null,
        magDamage: null,
        magazine: 14,
        totalShots: null,
        rpm: 150,
        reloadSeconds: 1.24,
        timeToEmptySeconds: null,
        bodyDamage: 49,
        precisionDamage: 97,
        textCells: { totalShots: "inf" },
        note: "",
      },
    ],
  },
  aegis: {
    source: snapshotSource("Aegis Weapons"),
    rows: [AEGIS_ROW, AEGIS_OTHER].map((id) => ({
      id,
      weaponType: "scoutRifle" as const,
      name: "Polaris Lance",
      critShot: 320,
      bodyShot: 159,
      otherTicks: "310 Perfect Fifth, 2345 ignition",
      assumptions: ["average", "with ignition"],
      wipe: 8417,
      shots: 15,
      fullModifiers: 3.31,
      perShot: 169.719,
      gameVersion: "9.7.0.3",
    })),
  },
  sustained: {
    source: snapshotSource("Aegis Sustained"),
    rows: [
      {
        id: SUSTAINED_ROW,
        name: "Polaris Lance",
        assumptions: [],
        ammo: "primary",
        family: "scout",
        shots: 50,
        magazines: [14],
        repeating: true,
        reloadMs: null,
        chargeMs: null,
        swapMs: null,
        notes: "",
        peakRateSeconds: 0.4,
        timeToEmptySeconds: null,
        base: 170,
      },
    ],
  },
  manifest: {
    manifestVersion: "manifest-1",
    retrieved: "2026-10-29",
    weapons: [
      {
        hash: 3089417789,
        name: "Polaris Lance",
        weaponType: "scoutRifle",
        element: "solar",
        ammo: "primary",
        intrinsics: ["The Perfect Fifth"],
        perks: [],
        mods: [],
        catalyst: null,
        description: "Precision hits return ammo to the mag.",
        stats: { Magazine: 14, "Rounds Per Minute": 150 },
      },
    ],
  },
  clarity: {
    source: snapshotSource("Clarity"),
    entries: [
      {
        hash: 1,
        name: "The Perfect Fifth",
        type: "Weapon Frame Exotic",
        itemName: "Polaris Lance",
        text: FIFTH_TEXT,
      },
    ],
  },
  compendium: {
    source: snapshotSource("Destiny Data Compendium"),
    entries: [
      {
        tab: "Exotic Weapons",
        section: "Energy Slot Weapons",
        name: "Polaris Lance The Perfect Fifth Zen Moment",
        text: "Precision Hits refill 1 Ammo.",
        extra: "",
      },
    ],
  },
  codes: { "polaris-lance": 68 },
};

const ctx = () => ({ sources, itemName: "Polaris Lance", fittedRows: [] as string[] });
const value = (ref: string | { expr: string; note: string }) => resolveValue(ref, ctx());

describe("text hash", () => {
  it("is FNV-1a as eight hex digits", () => {
    expect(textHash("")).toBe("811c9dc5");
    expect(textHash("a")).toBe("e40c292c");
  });
});

describe("references", () => {
  it("$quantum: a field of the row, verified", () => {
    const n = value(`$quantum[${QUANTUM_ROW}].precisionDamage`);
    expect(n.value).toBe(97);
    expect(n.source.status).toBe("verified");
    expect(n.source.name).toContain(QUANTUM_ROW);
  });

  it("$quantum .timing: rate, magazine and reload through timingFromQuantum", () => {
    expect(value(`$quantum[${QUANTUM_ROW}].timing.fireRateRpm`).value).toBe(150);
    expect(value(`$quantum[${QUANTUM_ROW}].timing.magazine`).value).toBe(14);
    expect(value(`$quantum[${QUANTUM_ROW}].timing.reloadTimeMs`).value).toBe(1240);
    // primary ammo is unlimited: null is the value, not a gap
    const total = value(`$quantum[${QUANTUM_ROW}].timing.totalShots`);
    expect(total.value).toBeNull();
    expect(total.source.status).toBe("verified");
  });

  it("$quantum: an empty field or a text field is an error", () => {
    expect(() => value(`$quantum[${QUANTUM_ROW}].totalShots`)).toThrow(/totalShots/);
    expect(() => value(`$quantum[${QUANTUM_ROW}].note`)).toThrow(/note/);
    expect(() => value(`$quantum[${QUANTUM_ROW}].timing.chargeMs`)).toThrow(/chargeMs/);
  });

  it("$aegis .critShot: the hit ÷ Full Modifiers, fitted with its row", () => {
    const n = value(`$aegis[${AEGIS_ROW}].critShot`);
    expect(n.value).toBe(96.677); // 320 ÷ 3.31
    expect(n.source.status).toBe("fitted");
    expect(n.source.row).toBe(AEGIS_ROW);
  });

  it("$aegis .tick: a named tick ÷ Full Modifiers", () => {
    const n = value(`$aegis[${AEGIS_ROW}].tick("Perfect Fifth")`);
    expect(n.value).toBe(93.656); // 310 ÷ 3.31
    expect(n.source.row).toBe(AEGIS_ROW);
    expect(() => value(`$aegis[${AEGIS_ROW}].tick("cluster")`)).toThrow(/cluster/);
    expect(() => value(`$aegis[${AEGIS_ROW}].bodyShot`)).toThrow(/bodyShot/);
  });

  it("$aegisSustained: a field of the row, fitted", () => {
    const n = value(`$aegisSustained[${SUSTAINED_ROW}].shots`);
    expect(n.value).toBe(50);
    expect(n.source.status).toBe("fitted");
    expect(n.source.row).toBe(SUSTAINED_ROW);
    expect(() => value(`$aegisSustained[${SUSTAINED_ROW}].reloadMs`)).toThrow(/reloadMs/);
  });

  it("$manifest .stat: a displayed stat, verified", () => {
    const n = value(`$manifest[Polaris Lance].stat("Magazine")`);
    expect(n.value).toBe(14);
    expect(n.source.status).toBe("verified");
    expect(() => value(`$manifest[Polaris Lance].stat("Charge Time")`)).toThrow(/Charge Time/);
  });

  it("$clarity: the one number of a quote that stands in the text, derived", () => {
    const n = value(`$clarity[The Perfect Fifth]("applying 40 Scorch stacks")`);
    expect(n.value).toBe(40);
    expect(n.source.status).toBe("derived");
    expect(n.source.quote).toBe("applying 40 Scorch stacks");
    expect(value(`$clarity[The Perfect Fifth]("after a 0.5? second delay")`).value).toBe(0.5);
  });

  it("$clarity: a quote outside the text, or with no or several numbers, is an error", () => {
    expect(() => value(`$clarity[The Perfect Fifth]("applying 60 Scorch stacks")`)).toThrow(
      /not in the text/,
    );
    expect(() => value(`$clarity[The Perfect Fifth]("dealing 215 [78] damage")`)).toThrow(
      /exactly one number/,
    );
    expect(() => value(`$clarity[The Perfect Fifth]("loads a delayed Solar Explosive")`)).toThrow(
      /exactly one number/,
    );
    expect(() => value(`$clarity[Truth]("1")`)).toThrow(/Truth/);
  });

  it("$compendium: the entry by its name or the start of it, derived", () => {
    const n = value(`$compendium[Polaris Lance]("refill 1 Ammo")`);
    expect(n.value).toBe(1);
    expect(n.source.status).toBe("derived");
  });

  it("an unknown source, row or a broken reference is an error", () => {
    expect(() => value("$court[Polaris Lance].x")).toThrow(/court/);
    expect(() => value("$quantum[no-such-row].rpm")).toThrow(/no-such-row/);
    expect(() => value(`$quantum[${QUANTUM_ROW}.rpm`)).toThrow();
    expect(() => value(`$quantum[${QUANTUM_ROW}].rpm trailing`)).toThrow();
  });
});

describe("expressions", () => {
  it("compute + − × ÷ with brackets, derived, with the note", () => {
    const n = value({
      expr: `($quantum[${QUANTUM_ROW}].precisionDamage - $quantum[${QUANTUM_ROW}].bodyDamage) / 2 * 3`,
      note: "half the gap, three times",
    });
    expect(n.value).toBe(72);
    expect(n.source.status).toBe("derived");
    expect(n.source.note).toContain("half the gap, three times");
    expect(value({ expr: `-$quantum[${QUANTUM_ROW}].rpm + 200`, note: "x" }).value).toBe(50);
  });

  it("is fitted with its row when an Aegis row is in it", () => {
    const n = value({ expr: `$aegis[${AEGIS_ROW}].critShot * 2`, note: "two hits" });
    expect(n.source.status).toBe("fitted");
    expect(n.source.row).toBe(AEGIS_ROW);
  });

  it("refuses two Aegis rows, no reference, a syntax error and ÷ 0", () => {
    expect(() =>
      value({
        expr: `$aegis[${AEGIS_ROW}].critShot - $aegis[${AEGIS_OTHER}].critShot`,
        note: "x",
      }),
    ).toThrow(/one Aegis row/);
    expect(() => value({ expr: "2 * 3", note: "x" })).toThrow(/reference/);
    expect(() => value({ expr: `$quantum[${QUANTUM_ROW}].rpm *`, note: "x" })).toThrow();
    expect(() => value({ expr: `$quantum[${QUANTUM_ROW}].rpm / 0`, note: "x" })).toThrow(/0/);
    expect(() =>
      value({ expr: `$quantum[${QUANTUM_ROW}].timing.totalShots + 1`, note: "x" }),
    ).toThrow(/null/);
  });
});

// The rules of architecture section 5.4 with references
const precisionHit = { on: "hit", part: "shot", precision: true };
const polarisItem = (hash = textHash(FIFTH_TEXT)) => ({
  id: "polaris-lance",
  kind: "exoticWeapon",
  name: "Polaris Lance",
  texts: [{ source: "clarity", entry: "The Perfect Fifth", hash }],
  chargeTimeMs: {
    value: 0,
    source: { name: "test", retrieved: "2026-11-01", status: "derived", note: "Derived: no charge" },
  },
  fireRateRpm: `$quantum[${QUANTUM_ROW}].timing.fireRateRpm`,
  magazine: `$quantum[${QUANTUM_ROW}].timing.magazine`,
  totalShots: `$quantum[${QUANTUM_ROW}].timing.totalShots`,
  reloadTimeMs: `$quantum[${QUANTUM_ROW}].timing.reloadTimeMs`,
  parts: {
    shot: {
      name: "Shot",
      damage: `$quantum[${QUANTUM_ROW}].precisionDamage`,
      precision: true,
      delivery: "impact",
    },
    "perfect-fifth": {
      name: "Perfect Fifth",
      damage: `$aegis[${AEGIS_ROW}].tick("Perfect Fifth")`,
      delivery: "splash",
    },
  },
  rules: [
    { id: "shot", on: { on: "shot" }, do: [{ type: "spawn", part: "shot" }] },
    {
      id: "refill",
      on: precisionHit,
      do: [{ type: "refill", rounds: `$clarity[The Perfect Fifth]("refill 1 ammo")` }],
    },
    {
      id: "count",
      on: precisionHit,
      if: [
        {
          type: "counter",
          id: "fifth",
          op: "<",
          value: `$clarity[The Perfect Fifth]("Scoring 4 Precision Hits")`,
        },
      ],
      do: [{ type: "addStacks", counter: "fifth" }],
    },
    {
      id: "fifth",
      on: precisionHit,
      if: [
        {
          type: "counter",
          id: "fifth",
          op: "=",
          value: `$clarity[The Perfect Fifth]("Scoring 4 Precision Hits")`,
        },
      ],
      do: [
        { type: "resetCounter", counter: "fifth" },
        {
          type: "spawn",
          part: "perfect-fifth",
          delayMs: {
            expr: `$clarity[The Perfect Fifth]("after a 0.5? second delay") * 1000`,
            note: "seconds to ms",
          },
        },
      ],
    },
    {
      id: "scorch",
      on: { on: "hit", part: "perfect-fifth" },
      do: [
        {
          type: "applyStatus",
          status: "scorch",
          stacks: `$clarity[The Perfect Fifth]("applying 40 Scorch stacks")`,
        },
      ],
    },
  ],
});

describe("weapon item", () => {
  it("resolves to a Weapon: identity and intrinsics from the manifest, parts as single hits", () => {
    const { weapon, review } = resolveWeaponItem(polarisItem(), sources);
    expect(review).toEqual([]);
    expect(weapon).toMatchObject({
      id: "polaris-lance",
      code: 68,
      name: "Polaris Lance",
      manifestHash: 3089417789,
      gameVersion: "9.7.0.3", // from the Aegis row it uses
      weaponType: "scoutRifle",
      element: "solar",
      ammo: "primary",
    });
    expect(weapon.fireRateRpm.value).toBe(150);
    expect(weapon.reloadTimeMs.value).toBe(1240);
    expect(weapon.intrinsics.map((i) => i.name)).toEqual(["The Perfect Fifth"]);
    const [shot, fifth] = weapon.damageInstances;
    expect(shot).toMatchObject({ id: "shot", canPrecision: true, delivery: "impact" });
    expect(shot.damagePerTick.value).toBe(97);
    expect(shot.ticks.value).toBe(1);
    expect(fifth).toMatchObject({ id: "perfect-fifth", canPrecision: false, delivery: "splash" });
    expect(fifth.damagePerTick.source.row).toBe(AEGIS_ROW);
    const spawn = weapon.rules![3].do[1];
    expect(spawn.type === "spawn" && spawn.delayMs?.value).toBe(500);
  });

  it("a changed text is a review, and the item still resolves", () => {
    const { weapon, review } = resolveWeaponItem(polarisItem("00000000"), sources);
    expect(weapon.id).toBe("polaris-lance");
    expect(review).toHaveLength(1);
    expect(review[0]).toContain("The Perfect Fifth");
  });

  it("refuses a missing text, identity in the file, a missing code and unknown fields", () => {
    expect(() =>
      resolveWeaponItem(
        { ...polarisItem(), texts: [{ source: "clarity", entry: "Nope", hash: "00000000" }] },
        sources,
      ),
    ).toThrow(/Nope/);
    expect(() => resolveWeaponItem({ ...polarisItem(), code: 68 }, sources)).toThrow(/code/);
    expect(() =>
      resolveWeaponItem(polarisItem(), { ...sources, codes: {} }),
    ).toThrow(/code/);
    expect(() => resolveWeaponItem({ ...polarisItem(), fireRate: 1 }, sources)).toThrow(
      /fireRate/,
    );
  });

  it("the runtime schema checks the result: a number where a name belongs is an error", () => {
    const item = polarisItem();
    item.rules[0] = { ...item.rules[0], id: `$quantum[${QUANTUM_ROW}].rpm` };
    expect(() => resolveWeaponItem(item, sources)).toThrow(/rules/);
  });

  it("the references planned for Polaris resolve against the real snapshots", () => {
    const real: ItemSources = {
      ...sources,
      quantum: QuantumWeaponSnapshot.parse(rawQuantum),
      aegis: AegisWeaponSnapshot.parse(rawAegis),
      clarity: ClaritySnapshot.parse(rawClarity),
    };
    const at = (ref: string) => resolveValue(ref, { ...ctx(), sources: real }).value;
    expect(at(`$quantum[${QUANTUM_ROW}].precisionDamage`)).toBe(97);
    expect(at(`$quantum[${QUANTUM_ROW}].timing.fireRateRpm`)).toBe(150);
    expect(at(`$aegis[${AEGIS_ROW}].tick("Perfect Fifth")`)).toBe(93.656); // 310 ÷ 3.31
    expect(at(`$clarity[The Perfect Fifth]("refill 1 ammo")`)).toBe(1);
    expect(at(`$clarity[The Perfect Fifth]("Scoring 4 Precision Hits")`)).toBe(4);
    expect(at(`$clarity[The Perfect Fifth]("applying 40 Scorch stacks")`)).toBe(40);
  });

  it("names the path of a reference that does not resolve", () => {
    const item = polarisItem();
    item.fireRateRpm = "$quantum[gone].rpm";
    expect(() => resolveWeaponItem(item, sources)).toThrow(/fireRateRpm/);
  });
});
