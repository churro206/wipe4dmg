// V1: the weapon status file (src/data/weapon-status.json). One row per weapon with what the model
// does, how it ends against Quantum and Aegis, and a status that is computed, not claimed.

import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { baselineFor } from "../scripts/lib/weaponChangesGit";
import { diffWeaponStatus } from "../src/ui/weaponChanges";
import rawLimits from "../src/data/status-limits.json";
import rawQuantum from "../src/data/quantum-weapons.json";
import rawStatus from "../src/data/weapon-status.json";
import { QuantumWeaponSnapshot, StatusLimits, WeaponStatusFile } from "../src/data/schema";
import {
  blockLine,
  blockWeaponProblems,
  causeOf,
  factorsOf,
  namedWeapons,
  planBlockOf,
  sentenceStates,
  statusOf,
  trustOf,
  type StatusRow,
} from "../scripts/lib/weaponStatus";
import { weapons } from "../src/ui/data";
import { fittedRows } from "./lib/fittedRows";
import { realWeaponStatus, weaponSources } from "./lib/weaponStatusData";

const limits = StatusLimits.parse(rawLimits);

const src = (status: string) => ({ name: "x", retrieved: "2026-11-05", status }) as never;

describe("blockLine", () => {
  const plan = "- [x] M2 Done: Vex Mythoclast. Gate: M-Gate. (abc)\r\n- [ ] M3 Ramp: Thunderlord. Gate: M-Gate.\r\nM4 is only text";

  it("finds a checklist line by its block id, open or ticked off", () => {
    expect(blockLine(plan, "M3")).toBe("M3 Ramp: Thunderlord. Gate: M-Gate.");
    expect(blockLine(plan, "M2")).toBe("M2 Done: Vex Mythoclast. Gate: M-Gate. (abc)");
  });

  it("knows no block outside the checklist and no partial id", () => {
    expect(blockLine(plan, "M4")).toBeUndefined();
    expect(blockLine(plan, "M")).toBeUndefined();
  });
});

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
  const ok = { open: 0, quoteDeviation: 0, estimated: false, tolerance: limits.quantumDeviation };
  it("is complete only without open sentences, within the limit of Quantum and not estimated", () => {
    expect(statusOf(ok)).toBe("complete");
    expect(statusOf({ ...ok, open: 1 })).toBe("partial");
    expect(statusOf({ ...ok, quoteDeviation: 0.05 })).toBe("partial");
    expect(statusOf({ ...ok, quoteDeviation: null })).toBe("partial");
    expect(statusOf({ ...ok, estimated: true })).toBe("estimated");
  });

  it("takes the limit as given", () => {
    expect(statusOf({ ...ok, quoteDeviation: 0.05, tolerance: 0.1 })).toBe("complete");
  });
});

describe("factorsOf", () => {
  const tolerance = limits.quantumDeviation;
  const product = (f: NonNullable<ReturnType<typeof factorsOf>>) => f.shots * f.hitsPerShot * f.damagePerHit * f.mechanic;

  it("finds the hits of Trinity Ghoul: three arrows per shot in the row, one in the model", () => {
    const f = factorsOf({ measured: 219, rowShots: 1, rowDamages: [73, 56], modelShots: 1, modelHits: 1, modelDamage: 73, modelTotal: 73 }, tolerance)!;
    expect(f.hitsPerShot).toBeCloseTo(1 / 3, 4);
    expect(f.damagePerHit).toBe(1);
    expect(f.mechanic).toBe(1);
    expect(product(f)).toBeCloseTo(73 / 219, 6);
  });

  it("puts what the rules add on top of a plain row into the mechanic (Thorn)", () => {
    const f = factorsOf({ measured: 873, rowShots: 9, rowDamages: [97, 54], modelShots: 9, modelHits: 9, modelDamage: 97, modelTotal: 1953 }, tolerance)!;
    expect(f.rowPlain).toBe(true);
    expect(f.mechanic).toBeCloseTo(1953 / 873, 4);
    expect(product(f)).toBeCloseTo(1953 / 873, 6);
  });

  it("puts what a row holds beyond whole hits into the mechanic, below 1 (Hawkmoon)", () => {
    const f = factorsOf({ measured: 2785, rowShots: 9, rowDamages: [97, 54], modelShots: 9, modelHits: 9, modelDamage: 97, modelTotal: 873 }, tolerance)!;
    expect(f.rowPlain).toBe(false);
    expect(f.hitsPerShot).toBe(1);
    expect(f.damagePerHit).toBe(1);
    expect(f.mechanic).toBeCloseTo(873 / 2785, 4);
  });

  it("takes the damage value of the row that fits its total, not the one nearest the model (Legend of Acrius)", () => {
    const f = factorsOf({ measured: 37200, rowShots: 16, rowDamages: [1909, 2325], modelShots: 16, modelHits: 16, modelDamage: 1909, modelTotal: 30544 }, tolerance)!;
    expect(f.damagePerHit).toBeCloseTo(1909 / 2325, 4);
    expect(f.mechanic).toBe(1);
  });

  it("does not take a value the model does not read for several hits (Tommy's Matchbook: 28 × 2.03 is chance)", () => {
    const f = factorsOf({ measured: 5680, rowShots: 100, rowDamages: [47, 28], modelShots: 100, modelHits: 100, modelDamage: 47, modelTotal: 4700 }, tolerance)!;
    expect(f.hitsPerShot).toBe(1);
    expect(f.damagePerHit).toBe(1);
    expect(f.mechanic).toBeCloseTo(4700 / 5680, 4);
  });

  it("reads a row that counts ammo, not projectiles, by its total (Choir of One: 225 rounds, 45 projectiles)", () => {
    const f = factorsOf({ measured: 25650, rowShots: 225, rowDamages: [570], modelShots: 45, modelHits: 45, modelDamage: 692, modelTotal: 31140 }, tolerance)!;
    expect(f.shots).toBe(1);
    expect(f.damagePerHit).toBeCloseTo(692 / 570, 4);
  });

  it("has no factors without a damage value of the row or without a hit of the model", () => {
    const input = { measured: 100, rowShots: 1, rowDamages: [100], modelShots: 1, modelHits: 1, modelDamage: 100, modelTotal: 100 };
    expect(factorsOf({ ...input, rowDamages: [] }, tolerance)).toBeNull();
    expect(factorsOf({ ...input, modelHits: 0 }, tolerance)).toBeNull();
  });
});

describe("causeOf (the table of Plan W)", () => {
  const plain = { shots: 1, hitsPerShot: 1, damagePerHit: 1, mechanic: 1, rowPlain: true };
  const quantum = (deviation: number, factors: Partial<typeof plain> | null = {}) => ({
    deviation,
    circular: false,
    strippedRow: false,
    factors: factors && { ...plain, ...factors },
  });
  const row = (deviation: number, assumptions = ["average"]) => ({ row: "a", deviation, assumptions });
  const cause = (e: Partial<Parameters<typeof causeOf>[0]>) =>
    causeOf({ quantum: null, aegis: [], open: 0, ruleShares: [], tolerance: limits.quantumDeviation, ...e }).class;
  const circular = { ...quantum(0), circular: true };

  it("Quantum ok but not 0, Aegis ok: matches", () => {
    expect(cause({ quantum: quantum(0.01), aegis: [row(0.01)] })).toBe("ok");
    expect(cause({ quantum: quantum(0.01), open: 8 })).toBe("ok");
    expect(cause({ aegis: [row(0.01)] })).toBe("ok");
  });

  it("Quantum exactly 0 by reading the row, Aegis ok: reads Quantum while sentences are open", () => {
    expect(cause({ quantum: circular, aegis: [row(0.01)], open: 3 })).toBe("reads-quantum");
    expect(cause({ quantum: circular, open: 3 })).toBe("reads-quantum");
    expect(cause({ quantum: circular, aegis: [row(0.01)] })).toBe("ok");
  });

  it("Quantum exactly 0, Aegis off: the assumptions of the row decide, the rest is a missing mechanic", () => {
    expect(cause({ quantum: circular, aegis: [row(-0.3)] })).toBe("mechanic-missing");
    expect(cause({ quantum: circular, aegis: [row(-0.05, [])] })).toBe("source-conflict");
    expect(cause({ quantum: circular, aegis: [row(0.18, [])] })).toBe("source-conflict");
    expect(cause({ aegis: [row(-0.44)] })).toBe("mechanic-missing");
  });

  it("the model above an Aegis row: a rule that large, another row that fits, or neither", () => {
    expect(cause({ quantum: quantum(0), aegis: [row(0.15)], ruleShares: [{ id: "r", share: 0.2 }] })).toBe("rule-too-strong");
    expect(cause({ quantum: quantum(0), aegis: [row(0.5)], ruleShares: [{ id: "r", share: 0.2 }] })).toBe("source-conflict");
    expect(cause({ quantum: quantum(0), aegis: [row(0.01), row(0.99)] })).toBe("wrong-row");
    expect(cause({ aegis: [row(5.8)] })).toBe("wrong-row");
  });

  it("Quantum off, Aegis ok: the Quantum row does not hold what is modelled", () => {
    expect(cause({ quantum: quantum(0.05), aegis: [row(-0.01)] })).toBe("wrong-row");
  });

  it("a row that leaves out what the model carries is the wrong row (Divinity, Deterministic Chaos)", () => {
    expect(cause({ quantum: { ...quantum(1.9, { mechanic: 2.9 }), strippedRow: true } })).toBe("wrong-row");
    expect(cause({ quantum: { ...quantum(-0.1, { mechanic: 0.9 }), strippedRow: true } })).toBe("mechanic-missing");
  });

  it("Quantum and Aegis off in the same direction: our error, the largest factor names it", () => {
    const a = (d: number) => [row(d)];
    expect(cause({ quantum: quantum(-0.67, { hitsPerShot: 1 / 3 }), aegis: a(-0.66) })).toBe("counting");
    expect(cause({ quantum: quantum(-0.12, { shots: 0.88 }) })).toBe("counting");
    expect(cause({ quantum: quantum(0.21, { damagePerHit: 1.21 }), aegis: a(0.2) })).toBe("base-damage");
    expect(cause({ quantum: quantum(1.2, { mechanic: 2.2 }), aegis: a(0.6) })).toBe("rule-too-strong");
    expect(cause({ quantum: quantum(-0.69, { mechanic: 0.31 }), aegis: a(-0.79) })).toBe("mechanic-missing");
    expect(cause({ quantum: quantum(-0.3, null), aegis: a(-0.2) })).toBe("mechanic-missing");
    expect(cause({ quantum: quantum(0.3, null), aegis: a(0.2) })).toBe("rule-too-strong");
  });

  it("Quantum and Aegis off in opposite directions: sources disagree, unless the row is the bare weapon", () => {
    const notPlain = { mechanic: 1.24, rowPlain: false };
    expect(cause({ quantum: quantum(0.24, notPlain), aegis: [row(-0.2)] })).toBe("source-conflict");
    expect(cause({ quantum: quantum(0.4, { mechanic: 1.4 }), aegis: [row(-0.11)] })).toBe("wrong-row");
  });

  it("neither Quantum nor Aegis: no check", () => {
    expect(cause({ open: 8 })).toBe("no-check");
  });

  it("explains itself in a sentence for the tooltip", () => {
    const why = causeOf({ quantum: quantum(-0.67, { hitsPerShot: 1 / 3 }), aegis: [], open: 0, ruleShares: [], tolerance: 0.02 }).why;
    expect(why).toContain("×0.33");
  });
});

describe("src/data/status-limits.json", () => {
  it("keeps the dead zone of the calibration (ADR 0018) with a source", () => {
    expect(limits.quantumDeviation).toBe(0.02);
    expect(limits.source.name).not.toBe("");
  });
});

describe("planBlockOf", () => {
  const plan = [
    "- [x] M2 Zusatzteile: Cloudstrike.",
    "- [ ] M3 Ramp: Coldheart, Sunshot. Gate: M-Gate. Wiederherstellen: Thunderlord.",
    "- [ ] V1 Status. Gate: Cloudstrike 0 %.",
    "- [ ] V2 Tabelle.",
  ].join("\n");
  it("finds the first open block that names the weapon in its target", () => {
    expect(planBlockOf("Coldheart", plan)).toBe("M3");
    expect(planBlockOf("Cloudstrike", plan)).toBeNull();
    expect(planBlockOf("Nothing", plan)).toBeNull();
  });

  it("ignores Gate and Wiederherstellen", () => {
    expect(planBlockOf("Thunderlord", plan)).toBeNull();
  });
});

describe("namedWeapons", () => {
  const names = ["Vex Mythoclast", "Vex", "Sunshot", "Rat King"];
  it("names the weapons before Gate, whole words only", () => {
    expect(namedWeapons("M3 Ramp: Sunshot, Rat King. Gate: Vex Mythoclast.", names)).toEqual(["Sunshot", "Rat King"]);
    expect(namedWeapons("V3 Zeitachse. Gate: Vex zeigt die Kette.", names)).toEqual([]);
    expect(namedWeapons("M3 Ramp: Sunshots.", names)).toEqual([]);
  });
});

describe("blockWeaponProblems", () => {
  const row = (name: string, over: Partial<StatusRow> = {}): StatusRow => ({
    name,
    sentences: [],
    quantum: { row: "q", measured: 100, model: 100, deviation: 0 },
    ...over,
  });
  const section = (body: string) => `## Quantum-Abweichungen\n\n${body}\n\n## Offene Lücken\n\n- Alpha: x\n`;
  const check = (line: string, rows: StatusRow[], inaccuracies = "") =>
    blockWeaponProblems(line, rows, ["Alpha", "Beta", "Gamma"], inaccuracies, 0.02);

  it("is green for a block without weapon names", () => {
    expect(check("V2 Tabelle, Rangliste. Gate: Test.", [])).toEqual({ problems: [], reported: [] });
  });

  it("checks only M blocks: a line without Gate that is not an M block (Q-Bilanz) stays green", () => {
    const open = { text: "x", state: "open" as const };
    const rows = [row("Alpha", { sentences: [open] })];
    expect(check("Q-Bilanz (Opus): Waffen mit Item. Wiederherstellen ohne M-Block: Alpha.", rows)).toEqual({
      problems: [],
      reported: [],
    });
    expect(check("M3: Alpha.", rows).problems).toHaveLength(1);
  });

  it("checks W1 to W4 like M blocks, not the balance W5 that only decides on weapons", () => {
    expect(check("W2: Alpha, Gamma. Gate: x.", [row("Alpha")]).problems).toHaveLength(1);
    expect(check("W5: Alpha, Gamma. Gate: x.", [row("Alpha")]).problems).toEqual([]);
  });

  it("is green for weapons within the limit and without open sentences", () => {
    const sentence = { text: "x", state: "rule" as const };
    expect(check("M3: Alpha, Beta. Gate: x.", [row("Alpha"), row("Beta", { sentences: [sentence] })]).problems).toEqual([]);
  });

  it("is red over the limit, with weapon and value", () => {
    const quantum = { row: "q", measured: 100, model: 105, deviation: 0.05 };
    const { problems } = check("M3: Alpha. Gate: x.", [row("Alpha", { quantum })]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("Alpha");
    expect(problems[0]).toContain("+5.0 %");
  });

  it("is red for open sentences, with weapon and count", () => {
    const open = { text: "x", state: "open" as const };
    const { problems } = check("M3: Alpha. Gate: x.", [row("Alpha", { sentences: [open, open] })]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("Alpha");
    expect(problems[0]).toContain("2 open");
  });

  it("is red for a named weapon without a row", () => {
    const { problems } = check("M3: Alpha, Gamma. Gate: x.", [row("Alpha")]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("Gamma");
  });

  it("reports but keeps green a deviation that known-inaccuracies explains", () => {
    const quantum = { row: "q", measured: 100, model: 90, deviation: -0.1 };
    const result = check("M3: Alpha. Gate: x.", [row("Alpha", { quantum })], section("- **M1:** Alpha: Fernzuendung fehlt."));
    expect(result.problems).toEqual([]);
    expect(result.reported).toHaveLength(1);
    expect(result.reported[0]).toContain("Alpha");
  });

  it("does not excuse a deviation with a line outside the Quantum section", () => {
    const quantum = { row: "q", measured: 100, model: 90, deviation: -0.1 };
    const outside = "## Ungenauigkeiten\n\n- **Q1 abgeschaltete Tests:** Alpha, Beta.\n\n" + section("- Beta: anders.");
    expect(check("M3: Alpha. Gate: x.", [row("Alpha", { quantum })], outside).problems).toHaveLength(1);
    expect(check("M3: Alpha. Gate: x.", [row("Alpha", { quantum })], "").problems).toHaveLength(1);
  });

  it("does not excuse open sentences with known-inaccuracies", () => {
    const open = { text: "x", state: "open" as const };
    const { problems } = check("M3: Alpha. Gate: x.", [row("Alpha", { sentences: [open] })], "Alpha: etwas");
    expect(problems).toHaveLength(1);
  });
});

describe("src/data/weapon-status.json", () => {
  const status = realWeaponStatus();

  // planBlock follows the plan, which ticking off a block changes; only `npm run coverage`
  // (--update) writes it, the comparison leaves it as the file has it.
  const stored = new Map(WeaponStatusFile.parse(rawStatus).weapons.map((w) => [w.id, w.planBlock]));

  it("is up to date; run npm run coverage after changing data files", async () => {
    // Read inside the test: the snapshot state exists only while a test runs.
    const updating = (expect.getState() as { snapshotState?: { _updateSnapshot?: string } }).snapshotState
      ?._updateSnapshot === "all";
    const compared = {
      weapons: status.weapons.map((w) => (updating ? w : { ...w, planBlock: stored.get(w.id) ?? null })),
    };
    await expect(JSON.stringify(compared, null, 2) + "\n").toMatchFileSnapshot("../src/data/weapon-status.json");
    // V4: `npm run coverage` also writes "What changed" against the newest stand in git that differs.
    if (updating) {
      const { weapons: before, commit } = baselineFor(compared.weapons, true);
      const changes = { baseline: commit, changes: diffWeaponStatus(before, compared.weapons) };
      writeFileSync("src/data/weapon-changes.json", JSON.stringify(changes, null, 2) + "\n");
    }
  });

  it("follows the schema, one row per weapon", () => {
    const file = WeaponStatusFile.parse(rawStatus);
    expect(new Set(file.weapons.map((w) => w.id)).size).toBe(file.weapons.length);
    expect(file.weapons.length).toBeGreaterThan(100);
  });

  describe("the cause of every weapon (W0)", () => {
    const of = (id: string) => status.weapons.find((w) => w.id === id)!;

    it("the samples of Plan W", () => {
      expect(of("duality").cause.class).toBe("counting");
      expect(of("thorn").cause.class).toBe("rule-too-strong");
      expect(of("divinity").cause.class).toBe("wrong-row");
      expect(of("hawkmoon").cause.class).toBe("mechanic-missing");
    });

    // docs/known-inaccuracies.md, "Einordnung der Ausreißer (P0)"
    it.each([
      ["le-monarque", "rule-too-strong"],
      ["alethonym", "rule-too-strong"],
      ["still-hunt", "mechanic-missing"],
      ["izanagi-s-burden", "mechanic-missing"],
      ["barrow-dyad", "rule-too-strong"],
      ["ager-s-scepter", "mechanic-missing"],
      ["whisper-of-the-worm", "mechanic-missing"],
      ["tarrabah", "mechanic-missing"],
      ["symmetry", "mechanic-missing"],
      ["forerunner", "mechanic-missing"],
      ["final-warning", "mechanic-missing"],
      ["wicked-implement", "mechanic-missing"],
      ["osteo-striga", "wrong-row"],
      ["outbreak-perfected", "wrong-row"],
      ["deterministic-chaos", "wrong-row"],
      ["truth", "rule-too-strong"],
      ["heartshadow", "no-check"],
      ["the-lament", "wrong-row"],
      ["grand-overture", "wrong-row"],
      ["witherhoard", "wrong-row"],
      ["malfeasance", "wrong-row"],
      ["choir-of-one", "wrong-row"],
      ["duality", "counting"],
      ["dragon-s-breath", "source-conflict"],
    ])("P0 sample %s is %s", (id, cls) => {
      expect(of(id).cause.class).toBe(cls);
    });

    // W1 class 2. Trinity Ghoul: the 3 arrows come from the Compendium, the check from another cell and Aegis.
    it("Trinity Ghoul fires three arrows per draw", () => {
      const w = of("trinity-ghoul");
      expect(w.quantum!.model).toBe(219);
      expect(w.quantum!.deviation).toBeCloseTo(0, 2);
      expect(Math.abs(w.aegis!.rows![0]!.deviation)).toBeLessThan(0.02);
    });

    // Quantum's History: the precision value of Acrius is a formula, its total counts the body value.
    it("Legend of Acrius reads the value the Quantum row totals, not its precision formula", () => {
      const w = of("legend-of-acrius");
      expect(w.quantum!.model).toBe(37200);
      expect(w.quantum!.deviation).toBeCloseTo(0, 2);
    });

    it("every weapon has exactly one class and a sentence", () => {
      for (const w of status.weapons) {
        expect(typeof w.cause.class, w.id).toBe("string");
        expect(w.cause.why, w.id).not.toBe("");
      }
    });

    it("the factors multiply to the deviation", () => {
      for (const w of status.weapons) {
        const f = w.quantum?.factors;
        if (!f) continue;
        expect(f.shots * f.hitsPerShot * f.damagePerHit * f.mechanic, w.id).toBeCloseTo(1 + w.quantum!.deviation, 2);
      }
    });

    it("a weapon that takes damage and count from its row is marked, a mechanic that lands on the row is not", () => {
      expect(of("forerunner").quantum?.circular).toBe(true);
      expect(of("cloudstrike").quantum?.circular).toBe(false);
      expect(of("malfeasance").quantum?.circular).toBe(false);
    });

    it("a weapon without a rule has no rule shares, the rules of Thorn and Cloudstrike carry damage", () => {
      expect(of("forerunner").ruleShares).toEqual([]);
      const share = (id: string, rule: string) => of(id).ruleShares.find((r) => r.id === rule)?.share ?? 0;
      expect(share("thorn", "corruption")).toBeGreaterThan(0);
      expect(share("cloudstrike", "storm")).toBeGreaterThan(0);
    });

    it("the rows with 'cata' are the only rows Quantum has for these weapons", () => {
      const quantum = QuantumWeaponSnapshot.parse(rawQuantum).rows;
      const flagged = status.weapons.filter((w) => w.quantum?.catalystRow).map((w) => w.id);
      expect(flagged).toEqual([
        "arbalest",
        "duality",
        "hawkmoon",
        "legend-of-acrius",
        "sleeper-simulant",
        "telesto",
        "the-colony",
        "the-prospector",
        "traveler-s-chosen",
        "trinity-ghoul",
      ]);
      for (const id of flagged) {
        const rows = quantum.filter((r) => r.name === of(id).name);
        expect(rows.every((r) => r.variant.includes("cata")), id).toBe(true);
      }
    });
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

  it("the sources of a hand-made item with $aegis (Truth) count even without a package", () => {
    const truth = weapons.find((w) => w.id === "heirloom")!;
    const sources = weaponSources(truth, undefined);
    expect(sources.some((s) => s.status === "fitted")).toBe(true);
    expect(trustOf(sources)).toBe("estimated");
  });

  it("a hand-made item never lists a row it fits as an independent check", () => {
    for (const id of ["heirloom"]) {
      const w = status.weapons.find((x) => x.id === id)!;
      const fitted = fittedRows(weapons.filter((x) => x.id === id), []).weaponRows;
      expect(w.trust, id).toBe("estimated");
      expect(w.aegis.rows.filter((r) => fitted.has(r.row)), id).toEqual([]);
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
          tolerance: limits.quantumDeviation,
        }),
      );
    }
  });
});
