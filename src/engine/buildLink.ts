// Build link (US-05, ADR 0003): a build, and optionally a comparison, packed into a short
// base64url text without a server. Layout (all numbers as unsigned LEB128 varints):
//   version (2) | build | hasComparison (0 or 1) | build of the comparison
//   build = weapon code | class | catalyst (0 or 1) | damage phase in ms | selection count |
//           per selection: effect code | provider | start in ms | duration in ms + 1 (0: until end)
// Codes come from the Data Files and are never reused, so old links stay readable.
// Pure functions without browser APIs, so the Discord bot (US-13) can read the same links.

import { Build, type GuardianClass, type ProviderKind } from "../data/schema";

const FORMAT_VERSION = 2;
const MS_PER_SECOND = 1000;
const CLASSES: GuardianClass[] = ["titan", "hunter", "warlock"];
const PROVIDERS: ProviderKind[] = [
  "subclass",
  "armor",
  "artifact",
  "fireteamSupport",
];
const BASE64URL =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export type LinkRegistry = {
  weapons: { id: string; code: number }[];
  effects: { id: string; code: number }[];
};

export type LinkContent = {
  build: Build;
  comparison?: Build | null;
};

export type DecodedLink = {
  build: Build;
  comparison: Build | null;
  unknownEffectCodes: number[]; // effects of a newer version; skipped
};

export function encodeLink(
  content: LinkContent,
  registry: LinkRegistry,
): string {
  const bytes: number[] = [];
  writeVarint(bytes, FORMAT_VERSION);
  writeBuild(bytes, content.build, registry);
  if (content.comparison) {
    writeVarint(bytes, 1);
    writeBuild(bytes, content.comparison, registry);
  } else {
    writeVarint(bytes, 0);
  }
  return toBase64url(bytes);
}

/** Reads a link text. Throws if it is not a valid link; skips effects with unknown codes. */
export function decodeLink(text: string, registry: LinkRegistry): DecodedLink {
  const reader = new Reader(fromBase64url(text));
  const version = reader.varint();
  if (version !== FORMAT_VERSION) {
    throw new Error(`Build link: unknown version ${version}`);
  }
  const unknownEffectCodes: number[] = [];
  const build = readBuild(reader, registry, unknownEffectCodes);
  const comparison =
    reader.varint() === 1
      ? readBuild(reader, registry, unknownEffectCodes)
      : null;
  if (!reader.done()) throw new Error("Build link: unexpected data at the end");
  return { build, comparison, unknownEffectCodes };
}

function writeBuild(bytes: number[], build: Build, registry: LinkRegistry) {
  writeVarint(bytes, codeOf(registry.weapons, build.weaponId, "weapon"));
  writeVarint(bytes, CLASSES.indexOf(build.guardianClass));
  writeVarint(bytes, build.catalyst ? 1 : 0);
  writeVarint(bytes, Math.round(build.damagePhaseSeconds * MS_PER_SECOND));
  writeVarint(bytes, build.selections.length);
  for (const selection of build.selections) {
    const window = build.effectWindows[selection.effectId] ?? { startMs: 0 };
    writeVarint(bytes, codeOf(registry.effects, selection.effectId, "effect"));
    writeVarint(bytes, PROVIDERS.indexOf(selection.provider));
    writeVarint(bytes, Math.round(window.startMs));
    writeVarint(
      bytes,
      window.durationMs === undefined ? 0 : Math.round(window.durationMs) + 1,
    );
  }
}

function readBuild(
  reader: Reader,
  registry: LinkRegistry,
  unknownEffectCodes: number[],
): Build {
  const weaponCode = reader.varint();
  const weapon = registry.weapons.find((w) => w.code === weaponCode);
  if (!weapon) throw new Error(`Build link: unknown weapon code ${weaponCode}`);
  const guardianClass = CLASSES[reader.varint()];
  const catalyst = reader.varint() === 1;
  const damagePhaseSeconds = reader.varint() / MS_PER_SECOND;

  const selections: Build["selections"] = [];
  const effectWindows: Build["effectWindows"] = {};
  const count = reader.varint();
  for (let i = 0; i < count; i++) {
    const code = reader.varint();
    const provider = PROVIDERS[reader.varint()];
    const startMs = reader.varint();
    const durationPlusOne = reader.varint();
    const effect = registry.effects.find((e) => e.code === code);
    if (!effect) {
      unknownEffectCodes.push(code);
      continue;
    }
    selections.push({ effectId: effect.id, provider });
    effectWindows[effect.id] =
      durationPlusOne === 0
        ? { startMs }
        : { startMs, durationMs: durationPlusOne - 1 };
  }
  // Zod rejects an invalid class or provider index (undefined).
  return Build.parse({
    weaponId: weapon.id,
    guardianClass,
    catalyst,
    selections,
    effectWindows,
    damagePhaseSeconds,
  });
}

function codeOf(
  entries: { id: string; code: number }[],
  id: string,
  what: string,
): number {
  const entry = entries.find((e) => e.id === id);
  if (!entry) throw new Error(`Build link: unknown ${what} "${id}"`);
  return entry.code;
}

/** Unsigned LEB128: 7 bits per byte, the high bit marks a following byte. */
function writeVarint(bytes: number[], value: number) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Build link: cannot write ${value}`);
  }
  let rest = value;
  while (rest >= 0x80) {
    bytes.push((rest % 0x80) | 0x80);
    rest = Math.floor(rest / 0x80);
  }
  bytes.push(rest);
}

class Reader {
  private position = 0;
  private readonly bytes: number[];

  constructor(bytes: number[]) {
    this.bytes = bytes;
  }

  varint(): number {
    let value = 0;
    let factor = 1;
    for (;;) {
      if (this.position >= this.bytes.length) {
        throw new Error("Build link: data ends too early");
      }
      const byte = this.bytes[this.position++];
      value += (byte & 0x7f) * factor;
      if (byte < 0x80) return value;
      factor *= 0x80;
    }
  }

  done(): boolean {
    return this.position === this.bytes.length;
  }
}

function toBase64url(bytes: number[]): string {
  let text = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const chunk =
      (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    const chars = i + 2 < bytes.length ? 4 : i + 1 < bytes.length ? 3 : 2;
    for (let c = 0; c < chars; c++) {
      text += BASE64URL[(chunk >> (18 - 6 * c)) & 0x3f];
    }
  }
  return text;
}

function fromBase64url(text: string): number[] {
  if (!/^[A-Za-z0-9_-]+$/.test(text) || text.length % 4 === 1) {
    throw new Error("Build link: not a base64url text");
  }
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i += 4) {
    const group = text.slice(i, i + 4);
    let chunk = 0;
    for (let c = 0; c < 4; c++) {
      chunk =
        (chunk << 6) | (c < group.length ? BASE64URL.indexOf(group[c]) : 0);
    }
    bytes.push((chunk >> 16) & 0xff);
    if (group.length > 2) bytes.push((chunk >> 8) & 0xff);
    if (group.length > 3) bytes.push(chunk & 0xff);
  }
  return bytes;
}
