import { describe, expect, it } from "vitest";
import {
  abilities,
  artifactData,
  effects,
  exoticArmor,
  iconUrl,
  weapons,
} from "../src/ui/data";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { effectIconKey } from "../src/ui/describe";
import { Icon } from "../src/ui/components/Icon";

// Every icon is named for screen readers and as a tooltip, with or without an imported image.
describe("icon names", () => {
  it("gives an image icon an alt text and a tooltip", () => {
    const weapon = weapons[0]!;
    const html = renderToStaticMarkup(
      createElement(Icon, { iconKey: `weapon:${weapon.id}`, label: weapon.name }),
    );
    expect(html).toContain(`alt="${weapon.name.replace(/'/g, "&#x27;")}"`);
    expect(html).toContain("title=");
  });

  it("names the monogram fallback", () => {
    const html = renderToStaticMarkup(
      createElement(Icon, { iconKey: "nothing:here", label: "Some Name" }),
    );
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Some Name"');
    expect(html).toContain('title="Some Name"');
  });
});

// Every key the UI asks for has a Bungie icon, so no tile or legend falls back to initials.
describe("icons in the UI", () => {
  const missing = (keys: string[]) => keys.filter((key) => !iconUrl(key));

  it("has an icon for every ability, also variants with exotic armor or an effect", () => {
    expect(abilities.some((a) => a.variantOf)).toBe(true);
    expect(missing(abilities.map((a) => `ability:${a.id}`))).toEqual([]);
  });

  it("has an icon for every effect, for every weapon element", () => {
    const elements = [...new Set(weapons.map((w) => w.element))];
    expect(
      missing(effects.flatMap((e) => elements.map((el) => effectIconKey(e, el)))),
    ).toEqual([]);
  });

  it("has an icon for every seasonal artifact", () => {
    expect(missing(artifactData.artifacts.map((a) => `artifact:${a.id}`))).toEqual([]);
  });

  it("has an icon for every exotic armor piece and weapon", () => {
    expect(
      missing([
        ...exoticArmor.map((x) => `armor:${x.id}`),
        ...weapons.map((w) => `weapon:${w.id}`),
      ]),
    ).toEqual([]);
  });
});
