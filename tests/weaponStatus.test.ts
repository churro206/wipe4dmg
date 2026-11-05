// V1: the weapon status file (src/data/weapon-status.json). One row per weapon with what the model
// does, how it ends against Quantum and Aegis, and a status that is computed, not claimed.

import { describe, expect, it } from "vitest";
import rawLimits from "../src/data/status-limits.json";
import rawStatus from "../src/data/weapon-status.json";
import { StatusLimits, WeaponStatusFile } from "../src/data/schema";
import {
  blockWeaponProblems,
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

  it("the sources of a hand-made item with $aegis (Truth) count even without a package", () => {
    const truth = weapons.find((w) => w.id === "truth")!;
    const sources = weaponSources(truth, undefined);
    expect(sources.some((s) => s.status === "fitted")).toBe(true);
    expect(trustOf(sources)).toBe("estimated");
  });

  it("a hand-made item never lists a row it fits as an independent check", () => {
    for (const id of ["truth", "polaris-lance", "choir-of-one"]) {
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
