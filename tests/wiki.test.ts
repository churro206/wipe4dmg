import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  pageTitle,
  playerSection,
  rewriteLinks,
  wikiPages,
} from "../src/ui/wikiText";

const mechanic = `# Scorch und Ignition

Kategorie: Damage over Time

## Kurzfassung

Technisch.

## Für Spieler

Scorch zündet bei 100 Stacks.

### Beispiel

Ein Shot gibt 9 Explosionen.

## Regeln

1. Stacks addieren sich.
`;

describe("playerSection", () => {
  it("returns the text under 'Für Spieler' up to the next level-2 heading", () => {
    expect(playerSection(mechanic)).toBe(
      "Scorch zündet bei 100 Stacks.\n\n### Beispiel\n\nEin Shot gibt 9 Explosionen.",
    );
  });

  it("returns null without the section", () => {
    expect(playerSection("# Titel\n\n## Regeln\n\n1. x\n")).toBeNull();
  });

  it("reads Windows line endings", () => {
    expect(playerSection(mechanic.replace(/\n/g, "\r\n"))).toBe(
      "Scorch zündet bei 100 Stacks.\n\n### Beispiel\n\nEin Shot gibt 9 Explosionen.",
    );
  });
});

describe("pageTitle", () => {
  it("is the level-1 heading", () => {
    expect(pageTitle(mechanic)).toBe("Scorch und Ignition");
  });
});

describe("rewriteLinks", () => {
  const pages = new Set(["damage-stacking", "coverage"]);

  it("turns links to wiki pages into wiki links", () => {
    expect(
      rewriteLinks("Siehe [Stacking](damage-stacking.md), Regel 12.", pages),
    ).toBe("Siehe [Stacking](#wiki/damage-stacking), Regel 12.");
  });

  it("ignores folders and anchors of the target", () => {
    expect(rewriteLinks("[Abdeckung](../coverage.md#supers)", pages)).toBe(
      "[Abdeckung](#wiki/coverage)",
    );
  });

  it("keeps only the text of links to documents outside the wiki", () => {
    expect(rewriteLinks("Plan: [Optimizer](plans/optimizer.md).", pages)).toBe(
      "Plan: Optimizer.",
    );
  });

  it("keeps web links", () => {
    const text = "[Aegis](https://example.org/a.md)";
    expect(rewriteLinks(text, pages)).toBe(text);
  });
});

describe("wikiPages", () => {
  const files = {
    "/docs/mechanics/how-it-works.md":
      "# Wie rechnet der Rechner?\n\n## Für Spieler\n\nSo.\n",
    "/docs/mechanics/scorch-and-ignition.md": mechanic,
    "/docs/mechanics/damage-stacking.md":
      "# Damage Stacking\n\n## Für Spieler\n\nSiehe [Scorch](scorch-and-ignition.md).\n",
    "/docs/mechanics/bolt-charge.md": "# Bolt Charge\n\n## Regeln\n\n1. x\n",
    "/docs/mechanics/README.md":
      "# Mechanics: Übersicht\n\n## Für Spieler\n\nNein.\n",
    "/docs/coverage.md": "# Abdeckung des Rechners\n\nTabelle.\n",
    "/docs/roadmap.md": "# Roadmap\n\nSiehe [Abdeckung](coverage.md).\n",
  };
  const pages = wikiPages(files);

  it("starts with how it works, then mechanics by title, then coverage and roadmap", () => {
    expect(pages.map((p) => p.id)).toEqual([
      "how-it-works",
      "damage-stacking",
      "scorch-and-ignition",
      "coverage",
      "roadmap",
    ]);
  });

  it("shows only the player section of mechanics, without README and files lacking it", () => {
    const scorch = pages.find((p) => p.id === "scorch-and-ignition")!;
    expect(scorch.title).toBe("Scorch und Ignition");
    expect(scorch.markdown).not.toContain("Technisch");
    expect(pages.some((p) => p.id === "bolt-charge")).toBe(false);
    expect(pages.some((p) => p.id === "README")).toBe(false);
  });

  it("raises the headings of a player section by one level", () => {
    const scorch = pages.find((p) => p.id === "scorch-and-ignition")!;
    expect(scorch.markdown).toContain("\n## Beispiel\n");
    expect(scorch.markdown).not.toContain("###");
  });

  it("shows coverage and roadmap whole, without their level-1 heading", () => {
    const roadmap = pages.find((p) => p.id === "roadmap")!;
    expect(roadmap.title).toBe("Roadmap");
    expect(roadmap.markdown).toBe("Siehe [Abdeckung](#wiki/coverage).");
  });

  it("links between pages point into the wiki", () => {
    const stacking = pages.find((p) => p.id === "damage-stacking")!;
    expect(stacking.markdown).toBe(
      "Siehe [Scorch](#wiki/scorch-and-ignition).",
    );
  });

  it("groups the pages for the navigation", () => {
    expect(pages.map((p) => p.group)).toEqual([
      "start",
      "mechanics",
      "mechanics",
      "status",
      "status",
    ]);
  });
});

describe("wiki pages from the real documents", () => {
  const docs = (path: string) => readFileSync(path, "utf8");
  const mechanics = readdirSync("docs/mechanics").filter((f) =>
    f.endsWith(".md"),
  );
  const files = Object.fromEntries([
    ...mechanics.map((f) => [
      `/docs/mechanics/${f}`,
      docs(`docs/mechanics/${f}`),
    ]),
    ["/docs/coverage.md", docs("docs/coverage.md")],
    ["/docs/roadmap.md", docs("docs/roadmap.md")],
  ]);
  const pages = wikiPages(files);

  it("open with 'Wie rechnet der Rechner?'", () => {
    expect(pages[0].id).toBe("how-it-works");
    expect(pages[0].title).toBe("Wie rechnet der Rechner?");
    expect(pages[0].markdown.length).toBeGreaterThan(0);
  });
});
