// The website is English (owner, 2026-10-22): no German letters or common German words in src/ui.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const GERMAN =
  /[äöüÄÖÜß„]|\b(aktiv|und|oder|nicht|kein|keine|mit|ohne|für|nach|bei|wählen|gewählt|Schaden|Waffe|Rüstung|Katalysator|Fähigkeit\w*|Einsatz|Einsätze|Dauer|Vergleich|Übersicht|Rechner|wechseln|suchen|Stand)\b/i;

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(dir, entry.name))
      : /\.(ts|tsx)$/.test(entry.name)
        ? [join(dir, entry.name)]
        : [],
  );
}

describe("UI language", () => {
  it("has no German text in src/ui", () => {
    const hits = files("src/ui").flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .map((line, i) => ({ line: line.trim(), at: `${file}:${i + 1}` }))
        .filter(({ line }) => GERMAN.test(line))
        .map(({ line, at }) => `${at} ${line}`),
    );
    expect(hits).toEqual([]);
  });
});
