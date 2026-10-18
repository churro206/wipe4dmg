// Build link (US-05, ADR 0003): a build as short, readable query text, e.g.
//   v=1&w=one-thousand-voices&p=72&c=1&e=well-of-radiance:0:30,ember-of-ashes:0
// v: format version, w: weapon id, p: damage phase in seconds, c: catalyst (0 or 1),
// e: effects as id:start[:duration] in seconds; without a duration the effect lasts until the end.
// Pure string functions, so the Discord bot (US-13) can read the same links.

import { Build } from "../data/schema";

const FORMAT_VERSION = "1";
const MS_PER_SECOND = 1000;
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const secondsText = (ms: number) => String(ms / MS_PER_SECOND);

export function encodeBuild(build: Build): string {
  const effects = build.effectIds.map((id) => {
    const window = build.effectWindows[id] ?? { startMs: 0 };
    const parts = [id, secondsText(window.startMs)];
    if (window.durationMs !== undefined)
      parts.push(secondsText(window.durationMs));
    return parts.join(":");
  });
  return [
    `v=${FORMAT_VERSION}`,
    `w=${build.weaponId}`,
    `p=${String(build.damagePhaseSeconds)}`,
    `c=${build.catalyst ? 1 : 0}`,
    `e=${effects.join(",")}`,
  ].join("&");
}

/** Reads a build link (with or without a leading "?"). Unknown keys are ignored. Throws if invalid. */
export function decodeBuild(text: string): Build {
  const values = new Map<string, string>();
  for (const pair of text.replace(/^\?/, "").split("&")) {
    const separator = pair.indexOf("=");
    if (separator < 0) continue;
    values.set(
      pair.slice(0, separator),
      decodeURIComponent(pair.slice(separator + 1)),
    );
  }
  const required = (key: string) => {
    const value = values.get(key);
    if (value === undefined) throw new Error(`Build link: "${key}" is missing`);
    return value;
  };

  if (required("v") !== FORMAT_VERSION) {
    throw new Error(`Build link: unknown version "${values.get("v")}"`);
  }
  const weaponId = required("w");
  if (!ID.test(weaponId))
    throw new Error(`Build link: invalid weapon "${weaponId}"`);
  const catalystText = required("c");
  if (catalystText !== "0" && catalystText !== "1") {
    throw new Error(`Build link: invalid catalyst "${catalystText}"`);
  }

  const effectIds: string[] = [];
  const effectWindows: Build["effectWindows"] = {};
  const effectsText = required("e");
  for (const entry of effectsText === "" ? [] : effectsText.split(",")) {
    const [id, start, duration, ...rest] = entry.split(":");
    if (!ID.test(id) || start === undefined || rest.length > 0) {
      throw new Error(`Build link: invalid effect "${entry}"`);
    }
    effectIds.push(id);
    effectWindows[id] = {
      startMs: millisOf(start, entry),
      ...(duration === undefined
        ? {}
        : { durationMs: millisOf(duration, entry) }),
    };
  }

  return Build.parse({
    weaponId,
    catalyst: catalystText === "1",
    effectIds,
    effectWindows,
    damagePhaseSeconds: secondsOf(required("p"), "p"),
  });
}

function secondsOf(text: string, what: string): number {
  const value = Number(text);
  if (text.trim() === "" || !Number.isFinite(value) || value < 0) {
    throw new Error(`Build link: invalid number "${text}" in "${what}"`);
  }
  return value;
}

/** Seconds as text to whole milliseconds; rounding removes floating point noise (1.5 -> 1500). */
function millisOf(text: string, what: string): number {
  return Math.round(secondsOf(text, what) * MS_PER_SECOND);
}
