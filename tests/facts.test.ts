import { describe, expect, it } from "vitest";
import { findFacts } from "../scripts/lib/facts.ts";

const source = {
  name: "Aegis",
  url: "https://example.org",
  status: "verified",
};

const files = [
  {
    file: "aegis-weapons.json",
    data: {
      source,
      rows: [
        { id: "osteo", name: "Osteo Striga", critShot: 100, otherTicks: "" },
        { id: "gjally", name: "Gjallarhorn", critShot: 900 },
      ],
    },
  },
  {
    file: "clarity.json",
    data: {
      entries: [
        {
          name: "Osteo Striga Catalyst",
          text: "Increases Reload Speed by 20.",
          hash: 1,
        },
        {
          name: "Long text",
          text: "Mentions Osteo Striga only in a description and must not match.",
        },
      ],
    },
  },
  {
    file: "reload-formulas.json",
    data: {
      source,
      types: { submachineGun: { weapons: { "Osteo Striga": { evpp: 0.1 } } } },
    },
  },
  {
    file: "weapon-packages.json",
    data: [{ name: "Osteo Striga", reloadMs: { value: 1190, source } }],
  },
];

describe("findFacts", () => {
  it("lists every snapshot with the name, exact matches first, without source objects", () => {
    const lines = findFacts(files, "osteo striga");
    expect(lines).toEqual([
      "== aegis-weapons.json (1)",
      "  id=osteo; name=Osteo Striga; critShot=100",
      "== reload-formulas.json (1)",
      "  types.submachineGun.weapons.Osteo Striga: evpp=0.1",
      "== weapon-packages.json (1)",
      "  name=Osteo Striga; reloadMs=1190",
      "== clarity.json (1)",
      "  name=Osteo Striga Catalyst; text=Increases Reload Speed by 20.",
    ]);
  });

  it("ignores case and punctuation", () => {
    expect(findFacts(files, "GJALLARHORN!")).toEqual([
      "== aegis-weapons.json (1)",
      "  id=gjally; name=Gjallarhorn; critShot=900",
    ]);
  });

  it("keeps the output within the line limit and says how many hits it left out", () => {
    const many = [
      {
        file: "big.json",
        data: Array.from({ length: 10 }, (_, i) => ({
          name: `Osteo Shot ${i}`,
        })),
      },
    ];
    const lines = findFacts([...many, ...files], "osteo", 4);
    expect(lines.length).toBeLessThanOrEqual(4);
    expect(lines.at(-1)).toMatch(/more hits not shown/);
  });

  it("returns nothing for an empty or unknown name", () => {
    expect(findFacts(files, "  ")).toEqual([]);
    expect(findFacts(files, "Nonexistent")).toEqual([]);
  });
});
