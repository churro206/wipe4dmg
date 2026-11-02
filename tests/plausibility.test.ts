// Plausibility gate (plan 2026-10-22): scenarios an experienced Destiny 2 player knows, run through
// the same way as the UI (gameData, buildSimulation). Each expectation says why. A bug like
// "Cuirass changes nothing" or "an aspect is not offered" fails here.
// Table for a player's eye: npm run sanity

import { afterAll, describe, expect, it } from "vitest";
import type { Build, Weapon } from "../src/data/schema";
import { damageByMultiplier, damageShares } from "../src/engine/analysis";
import { fitArtifact } from "../src/engine/artifacts";
import { rotationWindows } from "../src/engine/effectWindows";
import { abilitiesFor } from "../src/engine/providers";
import { buildSimulation } from "../src/engine/buildSimulation";
import { simulate, type SimulationResult } from "../src/engine/simulate";
import { effectRelevantTo, neededStatuses } from "../src/engine/weaponInfo";
import { buckets, gameData, weaponById, weapons } from "../src/ui/data";
import rawSubclass from "../src/data/subclass-effects.json";
import rawBuffEffects from "../src/data/buff-effects.json";
import { loadEffects, loadSubclassEffects } from "../src/engine/loadData";
import { testWeapon } from "./support/testWeapon";

const table: string[] = [];
const note = (scenario: string, value: string, expected: string) =>
  table.push(`| ${scenario} | ${value} | ${expected} |`);
afterAll(() =>
  console.log(
    ["| Szenario | Modell | Erwartung |", "| --- | --- | --- |", ...table].join(
      "\n",
    ),
  ),
);

const run = (
  fields: Partial<Build>,
  weapon: Weapon = weaponById("one-thousand-voices"),
): SimulationResult => {
  const build: Build = {
    weaponId: weapon.id,
    guardianClass: "titan",
    subclass: "arc",
    catalyst: false,
    selections: [],
    effectWindows: {},
    damagePhaseSeconds: 30,
    ...fields,
  };
  // artifact perks need an artifact: take the one that holds the perks of the scenario
  const { artifactId } = fitArtifact(gameData.artifacts, build.artifactId, build.selections);
  if (artifactId) build.artifactId = artifactId;
  const { selected, options } = buildSimulation(build, gameData);
  return simulate(weapon, build.damagePhaseSeconds, selected, buckets, options);
};
const damageOf = (r: SimulationResult, source: string) =>
  r.damageInstances
    .filter((d) => d.damageSource === source)
    .reduce((s, d) => s + d.damage, 0);
const fmt = (x: number) => x.toFixed(2);
// An ignition itself, not the burn ticks of scorch that carry the keyword too (ADR 0017 S2)
const isIgnition = (d: { id: string; keywordId?: string }) =>
  d.keywordId === "ignition" && d.id !== "burn";

describe("exotic armor changes its abilities", () => {
  it("Cuirass of the Falling Star makes Thundercrash much stronger", () => {
    const cast = { abilities: [{ abilityId: "thundercrash", castsMs: [0] }] };
    const ratio =
      damageOf(
        run({ ...cast, exoticArmorId: "cuirass-of-the-falling-star" }),
        "super",
      ) / damageOf(run(cast), "super");
    note(
      "Thundercrash mit / ohne Cuirass",
      `×${fmt(ratio)}`,
      "deutlich mehr, Aegis ≈ ×1,56",
    );
    expect(ratio).toBeGreaterThan(1.4);
    expect(ratio).toBeLessThan(1.7);
  });

  it("Celestial Nighthawk: one big shot, the super window ends soon after it", () => {
    const hunter = {
      guardianClass: "hunter" as const,
      subclass: "solar" as const,
      abilities: [{ abilityId: "golden-gun-marksman", castsMs: [0] }],
    };
    const withExotic = run({ ...hunter, exoticArmorId: "celestial-nighthawk" });
    const plain = run(hunter);
    const ratio = damageOf(withExotic, "super") / damageOf(plain, "super");
    const length = (r: SimulationResult) =>
      r.superWindows[0].endMs - r.superWindows[0].startMs;
    note(
      "Golden Gun mit / ohne Nighthawk",
      `×${fmt(ratio)}, Fenster ${length(withExotic)} / ${length(plain)} ms`,
      "ein Schuss mit viel mehr Schaden, Fenster kürzer als mit 3 Schüssen",
    );
    expect(ratio).toBeGreaterThan(1.5);
    expect(length(withExotic)).toBeLessThan(length(plain));
  });

  it("Knock 'Em Down: Blade Barrage throws 20 instead of 14 knives", () => {
    const hunter = {
      guardianClass: "hunter" as const,
      subclass: "solar" as const,
      abilities: [{ abilityId: "blade-barrage", castsMs: [0] }],
    };
    const ratio =
      damageOf(
        run({
          ...hunter,
          selections: [{ effectId: "knock-em-down", provider: "subclass" }],
        }),
        "super",
      ) / damageOf(run(hunter), "super");
    note(
      "Blade Barrage mit / ohne Knock 'Em Down",
      `×${fmt(ratio)}`,
      "Aegis-Zeilen ×1,37; Compendium nennt ×1,43 (20 statt 14 Messer)",
    );
    expect(ratio).toBeGreaterThan(1.3);
    expect(ratio).toBeLessThan(1.55);
  });

  it("Knockout: +160 % Thunderclap damage in its 6 s window (melee bucket)", () => {
    const titan = { abilities: [{ abilityId: "thunderclap", castsMs: [0] }] };
    const ratio =
      damageOf(
        run({ ...titan, selections: [{ effectId: "knockout", provider: "subclass" }] }),
        "melee",
      ) / damageOf(run(titan), "melee");
    note(
      "Thunderclap mit / ohne Knockout",
      `×${fmt(ratio)}`,
      "×2,6 (160 % Melee-Bonus, Compendium)",
    );
    expect(ratio).toBeGreaterThan(2.5);
    expect(ratio).toBeLessThan(2.7);
  });

  it("Facet of Courage: ×1.5 on a Light melee (not ×1.1 × 1.5), nothing on a Strand melee (K6)", () => {
    const facet = ["facet-of-courage", "facet-of-courage-2"].map((effectId) => ({
      effectId,
      provider: "subclass" as const,
    }));
    const ratio = (abilityId: string) => {
      const titan = { subclass: "prismatic" as const, abilities: [{ abilityId, castsMs: [0] }] };
      return (
        damageOf(run({ ...titan, selections: facet }), "melee") / damageOf(run(titan), "melee")
      );
    };
    const thunderclap = ratio("thunderclap");
    const frenzied = ratio("frenzied-blade");
    note(
      "Thunderclap / Frenzied Blade mit / ohne Facet of Courage",
      `×${fmt(thunderclap)} / ×${fmt(frenzied)}`,
      "×1,50 (Compendium „Light Powered Melee Abilities deal 50%“, Clarity „instead“) / ×1,00 (Strand ist kein Light)",
    );
    expect(thunderclap).toBeCloseTo(1.5, 2);
    expect(frenzied).toBeCloseTo(1, 6);
  });

  it("Offensive Bulwark: +160 % Shield Bash damage, and melee buffs add up", () => {
    const titan = {
      subclass: "void" as const,
      abilities: [{ abilityId: "shield-bash", castsMs: [0] }],
    };
    const ratio =
      damageOf(
        run({ ...titan, selections: [{ effectId: "offensive-bulwark", provider: "subclass" }] }),
        "melee",
      ) / damageOf(run(titan), "melee");
    note("Shield Bash mit / ohne Offensive Bulwark", `×${fmt(ratio)}`, "×2,6");
    expect(ratio).toBeGreaterThan(2.5);
    expect(ratio).toBeLessThan(2.7);
  });

  it("Transcendence: +5 % weapon damage for 20 s, so a 15 s phase gets all of it", () => {
    const prismatic = {
      subclass: "prismatic" as const,
      selections: [{ effectId: "transcendence", provider: "subclass" as const }],
    };
    const ratio = (seconds: number) =>
      damageOf(run({ ...prismatic, damagePhaseSeconds: seconds }), "weapon") /
      damageOf(run({ subclass: "prismatic", damagePhaseSeconds: seconds }), "weapon");
    note("One Thousand Voices (15 s) mit / ohne Transcendence", `×${fmt(ratio(15))}`, "×1,05 (Compendium: 5 % Weapon Damage, 20 s)");
    note("One Thousand Voices (30 s) mit / ohne Transcendence", `×${fmt(ratio(30))}`, "zwischen ×1,03 und ×1,05 (nur die ersten 20 s)");
    expect(ratio(15)).toBeCloseTo(1.05, 3);
    expect(ratio(30)).toBeGreaterThan(1.03);
    expect(ratio(30)).toBeLessThan(1.05);
  });

  it("Marksman's Dodge at the first reload saves one Gjallarhorn reload minus its cast time", () => {
    const gjallarhorn = weaponById("gjallarhorn");
    const hunter = { guardianClass: "hunter" as const, subclass: "solar" as const };
    const plain = run(hunter, gjallarhorn);
    const dodged = run(
      { ...hunter, abilities: [{ abilityId: "marksmans-dodge", castsMs: [plain.reloadsMs[0]] }] },
      gjallarhorn,
    );
    const savedMs = plain.shots[1].timeMs - dodged.shots[1].timeMs;
    note("Gjallarhorn: zweite Rakete mit Marksman's Dodge früher um", `${fmt(savedMs / 1000)} s`, "eine Nachladezeit (Compendium: „reloads all weapons“) abzüglich der Cast-Zeit (1 s, Schätzung) und der Ladezeit");
    // The dodge animation blocks the weapon: the rocket comes after the cast and its charge.
    const castMs = gameData.castTimes.defaultMs.value!;
    expect(dodged.shots[1].timeMs).toBeCloseTo(
      plain.reloadsMs[0] + castMs + gjallarhorn.chargeTimeMs.value!,
      0,
    );
    expect(savedMs).toBeGreaterThan(0);
    expect(savedMs).toBeLessThan(gjallarhorn.reloadTimeMs.value!);
    // Nothing changes for a later rocket: the dodge is spent (42 s cooldown).
    expect(dodged.reloadsMs.length).toBe(plain.reloadsMs.length - 1);
  });

  it("One Thousand Voices charges 1 s: before the first shot and again after a cast", () => {
    const otv = weaponById("one-thousand-voices");
    const hunter = { guardianClass: "hunter" as const, subclass: "solar" as const };
    const plain = run(hunter, otv);
    const grenade = run({ ...hunter, abilities: [{ abilityId: "thermite-grenade", castsMs: [0] }] }, otv);
    const castMs = gameData.castTimes.defaultMs.value!;
    note("One Thousand Voices: erster Schuss ohne / nach einer Granate bei 0 s", `${fmt(plain.shots[0].timeMs / 1000)} s / ${fmt(grenade.shots[0].timeMs / 1000)} s`, "1 s Ladezeit (Aegis: „1000ms charge“); nach dem Cast lädt die Waffe neu");
    expect(otv.chargeTimeMs.value).toBe(1000);
    expect(plain.shots[0].timeMs).toBe(1000);
    expect(grenade.shots[0].timeMs).toBeGreaterThanOrEqual(castMs + 1000);
  });

  it("Rally Barricade does not shorten Gjallarhorn's reload: Quantum and Aegis reload with Rally already (K1)", () => {
    const gjallarhorn = weaponById("gjallarhorn");
    const plain = run({}, gjallarhorn);
    const rally = run({ abilities: [{ abilityId: "rally-barricade", castsMs: [0] }] }, gjallarhorn);
    const gap = (r: SimulationResult) => r.shots[1].timeMs - r.reloadsMs[0];
    note("Gjallarhorn: Reload mit Rally ÷ ohne", fmt(gap(rally) / gap(plain)), "1,00 (Quantum: „All weapons assume the effects of Rally barricade“; Aegis-Reload = Quantum-Reload)");
    expect(gjallarhorn.reloadDurationIncluded?.value).toBe(0.9);
    expect(gap(rally)).toBeCloseTo(gap(plain), 0);
  });

  it("Gwisin Vest: Weaken (+15 %) for 10 s from the cast of a class ability, nothing without one", () => {
    const hunter = {
      guardianClass: "hunter" as const,
      subclass: "void" as const,
      exoticArmorId: "gwisin-vest",
      damagePhaseSeconds: 10,
    };
    const weaponDamage = (casts: number[]) =>
      damageOf(
        run({ ...hunter, abilities: [{ abilityId: "gamblers-dodge", castsMs: casts }] }),
        "weapon",
      );
    const plain = damageOf(run({ ...hunter, exoticArmorId: undefined }), "weapon");
    // The dodge costs its cast time and the charge: compare with the same dodge without the vest.
    const plainDodged = damageOf(
      run({
        ...hunter,
        exoticArmorId: undefined,
        abilities: [{ abilityId: "gamblers-dodge", castsMs: [0] }],
      }),
      "weapon",
    );
    note("One Thousand Voices (10 s) mit Gwisin Vest und Dodge bei 0 s / ohne Dodge", `×${fmt(weaponDamage([0]) / plainDodged)} / ×${fmt(weaponDamage([]) / plain)}`, "×1,15 (Court: Weaken 15 %, 10 s; gleicher Dodge ohne Vest) / ×1,00");
    expect(weaponDamage([0]) / plainDodged).toBeCloseTo(1.15, 3);
    expect(weaponDamage([])).toBeCloseTo(plain, 0);
  });

  it("Hazardous Propulsion pre-stacked: +35 % for 10 s on a rocket launcher only", () => {
    const titan = { guardianClass: "titan" as const, damagePhaseSeconds: 10 };
    const pre = { ...titan, exoticArmorId: "hazardous-propulsion", exoticPreBuilt: true };
    const gjallarhorn = weaponById("gjallarhorn");
    const ratio = (weapon?: Weapon, phase = titan) =>
      damageOf(run({ ...pre, damagePhaseSeconds: phase.damagePhaseSeconds }, weapon), "weapon") /
      damageOf(run(phase, weapon), "weapon");
    const long = { ...titan, damagePhaseSeconds: 30 };
    note("Gjallarhorn (10 s) mit / ohne Hazardous Propulsion", `×${fmt(ratio(gjallarhorn))}`, "×1,35 (Court: Empowering 35 % bei 6x, 10 s)");
    note("Gjallarhorn (30 s)", `×${fmt(ratio(gjallarhorn, long))}`, "zwischen ×1,05 und ×1,35 (nur die ersten 10 s)");
    note("One Thousand Voices (10 s)", `×${fmt(ratio())}`, "×1,00 (kein Rocket Launcher)");
    expect(ratio(gjallarhorn)).toBeGreaterThan(1.3);
    expect(ratio(gjallarhorn)).toBeLessThanOrEqual(1.35 + 1e-9);
    expect(ratio(gjallarhorn, long)).toBeGreaterThan(1.05);
    expect(ratio(gjallarhorn, long)).toBeLessThan(1.3);
    expect(ratio()).toBeCloseTo(1, 6);
  });

  it("Storm's Keep: a Bolt Charge discharge of 678 every 1.46 s, Weaken applies, weapon buffs do not", () => {
    const titan = { damagePhaseSeconds: 10 };
    const stormsKeep = { effectId: "storms-keep", provider: "subclass" as const };
    const weaken = { effectId: "weaken", provider: "subclass" as const };
    const gjallarhorn = weaponById("gjallarhorn");
    const plain = run(titan, gjallarhorn);
    const withAspect = run({ ...titan, selections: [stormsKeep] }, gjallarhorn);
    const own = (r: SimulationResult) =>
      r.damageInstances.filter((d) => d.id === "storms-keep").reduce((s, d) => s + d.damage, 0);
    const weakened = own(run({ ...titan, selections: [stormsKeep, weaken] }, gjallarhorn));
    note(
      "Gjallarhorn (10 s) mit / ohne Storm's Keep",
      `×${fmt(withAspect.totalDamage / plain.totalDamage)}, ${own(withAspect)} aus 6 Entladungen`,
      "6 × 678 (Aegis Sustained: 678 alle 1,46 s); ohne Buffs auf der Waffe groß, Aegis: 464 DPS gegen Gjallarhorn 1.846 DPS ohne Faktoren (5.000 mit allen), also ×1,25 mit Argent Ordnance und mit allen Buffs etwa ×1,1",
    );
    expect(own(withAspect)).toBeCloseTo(6 * 678, 6);
    expect(withAspect.totalDamage - plain.totalDamage).toBeCloseTo(6 * 678, 6);
    expect(weakened / own(withAspect)).toBeGreaterThan(1.1);
  });

  it("Hellion fires for 20 s after a class ability cast, not the whole phase", () => {
    const warlock = {
      guardianClass: "warlock" as const,
      subclass: "solar" as const,
      selections: [{ effectId: "hellion", provider: "subclass" as const }],
    };
    const hits = (casts: number[]) =>
      run({ ...warlock, abilities: [{ abilityId: "phoenix-dive", castsMs: casts }] }).damageInstances.filter(
        (d) => d.id === "hellion",
      ).length;
    note(
      "Hellion (30 s): Treffer mit Phoenix Dive bei 0 s / ohne Cast",
      `${hits([0])} / ${hits([])}`,
      "15 / 0 (Compendium: „On Class Ability Usage: Grants Hellion for 20 seconds“; Aegis Swap: 15 Schüsse pro Einsatz)",
    );
    expect(hits([0])).toBe(15);
    expect(hits([])).toBe(0);
  });

  it("Lightweight Knife and Acrobat's Dodge: Radiant for 10 s per cast, Gjallarhorn ×1.2 in 10 s", () => {
    const hunter = { guardianClass: "hunter" as const, subclass: "solar" as const, damagePhaseSeconds: 10 };
    const gjallarhorn = weaponById("gjallarhorn");
    const plain = damageOf(run(hunter, gjallarhorn), "weapon");
    const [knife, dodge] = ["lightweight-knife", "acrobats-dodge"].map(
      (abilityId) =>
        damageOf(run({ ...hunter, abilities: [{ abilityId, castsMs: [0] }] }, gjallarhorn), "weapon") /
        plain,
    );
    note(
      "Gjallarhorn (10 s) mit Lightweight Knife / Acrobat's Dodge bei 0 s",
      `Waffe ×${fmt(knife)} / ×${fmt(dodge)}`,
      "×1,2 (Radiant 10 s, Compendium); das Knife gibt Radiant erst beim Treffer, die erste Rakete kann davor liegen",
    );
    expect(dodge).toBeCloseTo(1.2, 6);
    expect(knife).toBeGreaterThan(1.1);
    expect(knife).toBeLessThanOrEqual(1.2 + 1e-9);
  });

  it("Peacekeepers: 20 stacks of +5 % on an SMG,a boss takes 33 % less from buffed shots, so ×1.34 at most", () => {
    const smg = weapons.find(
      (w) => w.weaponType === "submachineGun" && w.ammo === "primary",
    )!;
    const titan = { guardianClass: "titan" as const };
    const ratio =
      damageOf(run({ ...titan, exoticArmorId: "peacekeepers" }, smg), "weapon") /
      damageOf(run(titan, smg), "weapon");
    note(`${smg.name} mit / ohne Peacekeepers (30 s)`, `×${fmt(ratio)}`, "unter ×1,34, über ×1,05 (Nachladen beendet die Serie)");
    expect(ratio).toBeLessThan(1.34);
    expect(ratio).toBeGreaterThan(1.05);
  });

  // S4 part C: Barrow-Dyad's seekers come after the reload at the bullets' rate ("overwriting
  // regular shots"), so no gap over 1 s ends the run; Aegis measures ×1.32 (17 381 / 13 171).
  it("Peacekeepers on Barrow-Dyad: the seekers fill the reload, the stacks hold (core, Aegis ×1.32)", () => {
    const barrow = weaponById("barrow-dyad");
    const titan = { guardianClass: "titan" as const };
    const total = (fields: Partial<Build>) => {
      const build: Build = {
        weaponId: barrow.id,
        guardianClass: "titan",
        subclass: "arc",
        catalyst: false,
        selections: [],
        effectWindows: {},
        damagePhaseSeconds: 30,
        ...fields,
      };
      const { selected, options } = buildSimulation(build, gameData);
      return simulate(barrow, 30, selected, buckets, options).totalDamage;
    };
    const ratio = total({ ...titan, exoticArmorId: "peacekeepers" }) / total(titan);
    note("Barrow-Dyad mit / ohne Peacekeepers (30 s, neuer Kern)", `×${fmt(ratio)}`, "×1,30 bis ×1,34 (Aegis ×1,32)");
    expect(ratio).toBeGreaterThan(1.3);
    expect(ratio).toBeLessThanOrEqual(1.34);
  });

  it("Lucky Pants: 10 stacks of +45 % on a Hand Cannon for 6 s, then nothing more", () => {
    const handCannon = weapons.find(
      (w) => w.weaponType === "handCannon" && w.ammo === "primary",
    )!;
    const hunter = { guardianClass: "hunter" as const };
    const [short, long] = [6, 30].map(
      (damagePhaseSeconds) =>
        damageOf(
          run({ ...hunter, damagePhaseSeconds, exoticArmorId: "lucky-pants" }, handCannon),
          "weapon",
        ) / damageOf(run({ ...hunter, damagePhaseSeconds }, handCannon), "weapon"),
    );
    note(`${handCannon.name} mit / ohne Lucky Pants (6 s / 30 s)`, `×${fmt(short)} / ×${fmt(long)}`, "6 s weit über ×1,5, 30 s kleiner");
    expect(short).toBeGreaterThan(1.5);
    expect(long).toBeGreaterThan(1);
    expect(long).toBeLessThan(short);
  });

  it("Oathkeeper: every primary bow gains at least nothing, none loses; a held draw only when it pays", () => {
    const hunter = { guardianClass: "hunter" as const };
    const bows = weapons.filter((w) => w.weaponType === "bow" && w.ammo === "primary");
    expect(bows.length).toBeGreaterThan(0);
    const ratios = bows.map(
      (bow) =>
        damageOf(run({ ...hunter, exoticArmorId: "oathkeeper" }, bow), "weapon") /
        damageOf(run(hunter, bow), "weapon"),
    );
    note(
      `Primary-Bögen (${bows.length}) mit / ohne Oathkeeper`,
      `×${fmt(Math.min(...ratios))} bis ×${fmt(Math.max(...ratios))}`,
      "nie unter ×1,00; Halten nur, wenn der Zyklus lang genug ist",
    );
    ratios.forEach((ratio, i) => expect(ratio, bows[i].name).toBeGreaterThanOrEqual(0.999));
  });

  it("Exotic Class Item: Spirit of the Eternal Warrior surges the weapon after the super, Star-Eater boosts the super", () => {
    const prismatic = {
      subclass: "prismatic" as const,
      damagePhaseSeconds: 60,
      abilities: [{ abilityId: "hammer-of-sol", castsMs: [0] }],
    };
    const base = run(prismatic);
    const warrior = run({ ...prismatic, classPerkIds: ["spirit-of-the-eternal-warrior"] });
    const starEater = run({ ...prismatic, classPerkIds: ["spirit-of-the-star-eater"] });
    const surge = damageOf(warrior, "weapon") / damageOf(base, "weapon");
    const superBoost = damageOf(starEater, "super") / damageOf(base, "super");
    note(
      "Class Item Eternal Warrior: Waffe nach dem Super (60 s)",
      `×${fmt(surge)}`,
      "mehr als ×1,05, höchstens ×1,25 (x4 Surge, 30 s)",
    );
    note("Class Item Star-Eater: Hammer of Sol", `×${fmt(superBoost)}`, "bis +70 %, Court/Compendium");
    expect(surge).toBeGreaterThan(1.05);
    expect(surge).toBeLessThanOrEqual(1.25);
    expect(superBoost).toBeGreaterThan(1.5);
    expect(superBoost).toBeLessThanOrEqual(1.7);
    // Star-Eater and Verity both roll in the right column (Compendium), no item has both
    expect(() =>
      run({ ...prismatic, classPerkIds: ["spirit-of-the-star-eater", "spirit-of-verity"] }),
    ).toThrow(/column/);
  });

  it("well-known variants exist (Cuirass, Nighthawk, Dawn Chorus, Geomag)", () => {
    for (const id of [
      "cuirass-of-the-falling-star",
      "celestial-nighthawk",
      "dawn-chorus",
      "geomag-stabilizers",
    ])
      expect(
        gameData.abilities.some((a) => a.exoticArmorId === id),
        id,
      ).toBe(true);
  });
});

describe("Weapons stat", () => {
  it("Weapons 130 gives a heavy about +3 % (owner's check: +2.9 %), 200 gives +10 %; a primary +15 % at 200", () => {
    const heavy = weaponById("gjallarhorn");
    const base = damageOf(run({}, heavy), "weapon");
    const at130 = damageOf(run({ weaponsStat: 130 }, heavy), "weapon") / base;
    const at200 = damageOf(run({ weaponsStat: 200 }, heavy), "weapon") / base;
    const primary = weaponById("sunshot");
    const primaryRatio =
      damageOf(run({ weaponsStat: 200 }, primary), "weapon") /
      damageOf(run({}, primary), "weapon");
    note(
      "Weapons-Stat 130 / 200 bei Gjallarhorn, 200 bei Sunshot",
      `×${fmt(at130)} / ×${fmt(at200)} / ×${fmt(primaryRatio)}`,
      "×1,03 / ×1,10 / ×1,15 (nur der Teil über 100 zählt gegen Bosse)",
    );
    expect(at130).toBeCloseTo(1.03, 3);
    expect(at200).toBeCloseTo(1.1, 3);
    expect(primaryRatio).toBeCloseTo(1.15, 3);
  });
});

describe("primary weapons", () => {
  it("are selectable and fire the whole damage phase with reloads (unlimited ammo)", () => {
    const juju = weapons.find((w) => w.id === "bad-juju");
    expect(juju?.ammo).toBe("primary");
    const short = run({ damagePhaseSeconds: 30 }, juju!).shots.length;
    const long = run({ damagePhaseSeconds: 300 }, juju!).shots.length;
    note(
      "Bad Juju: Shots in 30 s / 300 s",
      `${short} / ${long}`,
      "etwa ×10, nie leer",
    );
    expect(long / short).toBeGreaterThan(9);
  });

  it("deal less boss damage than a heavy, but more than nothing", () => {
    const juju = run({}, weaponById("bad-juju")).totalDamage;
    const gjally = run({}, weaponById("gjallarhorn")).totalDamage;
    note(
      "Bad Juju / Gjallarhorn in 30 s",
      fmt(juju / gjally),
      "deutlich unter 1",
    );
    expect(juju / gjally).toBeLessThan(0.5);
    expect(juju).toBeGreaterThan(0);
  });

  it("count a pulse burst bullet by bullet: Bad Juju about 3 × 32 per burst", () => {
    const perBullet =
      weaponById("bad-juju").damageInstances[0].damagePerTick.value!;
    note("Bad Juju pro Kugel", fmt(perBullet), "≈ 32 (Quantum Precision)");
    expect(perBullet).toBeGreaterThan(28);
    expect(perBullet).toBeLessThan(36);
  });
});

describe("all weapons (2026-10-23)", () => {
  it("at least 136 of 141 exotic weapons are selectable", () => {
    note("Wählbare exotische Waffen", String(weapons.length), "≥ 136 von 141");
    expect(weapons.length).toBeGreaterThanOrEqual(136);
  });

  // Catches a unit error in a source, e.g. a whole magazine or a 5-ammo projectile counted as one
  // shot (Fourth Horseman ×4, Choir of One ×5 before the overrides). Such errors are ×4 or more, so
  // a primary may reach 1.5×: Hierarchy of Needs deals 1.07× with Aegis' 917 per arrow and its
  // 1.0 to 1.4 s per arrow (Aegis peak rate 1.017 s, Quantum 44 rpm) once the bow's nock is no
  // longer counted twice (2026-10-26). Barrow-Dyad deals about 1.4× (2026-10-31): Aegis Sustained
  // measures 4150 per 4.6 s (902 per second on the scale "visual", Tarrabah 607), Gjallarhorn's 11
  // rockets of 1892 about 20 800 in 30 s.
  it("rule: in 30 s every special and heavy deals 0.3 to 2.5 times Gjallarhorn, every primary at most 1.5×", () => {
    const gjally = run({}, weaponById("gjallarhorn")).totalDamage;
    const ratios = weapons.map(
      (w) => [w, run({}, w).totalDamage / gjally] as const,
    );
    const off = ratios
      .filter(([w, r]) =>
        w.ammo === "primary" ? r > 1.5 || r <= 0 : r < 0.3 || r > 2.5,
      )
      .map(([w, r]) => `${w.name} ${fmt(r)}`);
    const top = [...ratios].sort((a, b) => b[1] - a[1])[0];
    note(
      "Stärkste Waffe / Gjallarhorn (30 s)",
      `${top[0].name} ${fmt(top[1])}`,
      "≤ 2,5",
    );
    expect(off).toEqual([]);
  });

  // Catches a catalyst timing that skips a unit fix of the base (Choir of One ×5 with the catalyst,
  // 2026-10-23); no catalyst more than doubles the damage in 30 s.
  // Ager's Scepter: Will Given Form spends the Super for +80 % damage and a magazine of 192.
  const STRONG_CATALYSTS = ["ager-s-scepter"];
  it("rule: the catalyst changes the damage in 30 s by at most ×2", () => {
    const off = weapons
      .filter((w) => w.catalyst && !STRONG_CATALYSTS.includes(w.id))
      .map(
        (w) =>
          [
            w,
            run({ catalyst: true }, w).totalDamage / run({}, w).totalDamage,
          ] as const,
      )
      .filter(([, r]) => r > 2 || r < 0.9)
      .map(([w, r]) => `${w.name} ${fmt(r)}`);
    expect(off).toEqual([]);
  });
});

describe("catalysts from texts (2026-10-23)", () => {
  it("Touch of Malice: Precision Instrument at 6 stacks gives ×1.25 on the last round", () => {
    const off = run({}, weaponById("touch-of-malice")).totalDamage;
    const on = run(
      { catalyst: true },
      weaponById("touch-of-malice"),
    ).totalDamage;
    note("Touch of Malice Catalyst an / aus", fmt(on / off), "1,25");
    expect(on / off).toBeCloseTo(1.25, 2);
  });

  it("The Chaperone: precision hits refill the magazine, 27 slugs instead of 18", () => {
    const off = run({}, weaponById("the-chaperone")).totalDamage;
    const on = run({ catalyst: true }, weaponById("the-chaperone")).totalDamage;
    note(
      "The Chaperone Catalyst an / aus",
      fmt(on / off),
      "> 1,3 (18 → 27 Slugs)",
    );
    expect(on / off).toBeGreaterThan(1.3);
  });

  it("Osteo Striga: the catalyst's reload stat reloads faster, a few percent more damage", () => {
    const off = run({}, weaponById("osteo-striga")).totalDamage;
    const on = run({ catalyst: true }, weaponById("osteo-striga")).totalDamage;
    note(
      "Osteo Striga Catalyst an / aus",
      fmt(on / off),
      "1,03 bis 1,15 (Reload-Stat 18 → 48)",
    );
    expect(on / off).toBeGreaterThan(1.03);
    expect(on / off).toBeLessThan(1.15);
  });

  it("Wish-Ender: a catalyst that needs several enemies does nothing against one boss", () => {
    expect(weaponById("wish-ender").catalyst!.effect).toBe("none");
  });
});

describe("catalysts", () => {
  it("Gjallarhorn: the catalyst's second rocket per magazine gives more damage in 30 s", () => {
    const off = run({}, weaponById("gjallarhorn")).totalDamage;
    const on = run({ catalyst: true }, weaponById("gjallarhorn")).totalDamage;
    note(
      "Gjallarhorn Catalyst an / aus (30 s)",
      fmt(on / off),
      "> 1 (Magazin 1 → 2)",
    );
    expect(on / off).toBeGreaterThan(1.05);
  });

  it("Thunderlord: lightning strikes refill, so the catalyst empties the ammo sooner", () => {
    const shots = (catalyst: boolean) =>
      run(
        { catalyst, damagePhaseSeconds: 50 },
        weaponById("thunderlord"),
      ).shots.at(-1)!.timeMs;
    note(
      "Thunderlord letzter Schuss ohne / mit Catalyst",
      `${(shots(false) / 1000).toFixed(1)} s / ${(shots(true) / 1000).toFixed(1)} s`,
      "mit früher (kein Reload)",
    );
    expect(shots(true)).toBeLessThan(shots(false));
  });

  it("every weapon with a catalyst offers the switch", () => {
    const without = weapons.filter(
      (w) => w.catalyst === undefined && w.options === undefined,
    ).length;
    expect(weapons.length - without).toBeGreaterThan(80);
  });
});

describe("buffs and debuffs have their game values on the weapon", () => {
  const firstShot = (r: SimulationResult) =>
    r.damageInstances.find((d) => d.damageSource === "weapon")!.damage;
  const plain = firstShot(run({}));
  it.each([
    ["weaken", "fireteamSupport", 1.15],
    ["radiant", "fireteamSupport", 1.2],
    ["surge-3x", "armor", 1.22],
    ["well-of-radiance", "fireteamSupport", 1.25],
  ] as const)("%s ×%s", (effectId, provider, factor) => {
    const ratio =
      firstShot(run({ selections: [{ effectId, provider }] })) / plain;
    note(effectId, `×${fmt(ratio)}`, `×${factor}`);
    expect(ratio).toBeCloseTo(factor, 3);
  });
});

describe("buffs, debuffs and artifact perks from Court (2026-10-23)", () => {
  const firstShot = (r: SimulationResult) =>
    r.damageInstances.find((d) => d.damageSource === "weapon")!.damage;
  const ratioOn = (weapon: Weapon, effectIds: string[]) =>
    firstShot(
      run(
        {
          selections: effectIds.map((effectId) => ({
            effectId,
            provider: gameData.effects
              .find((e) => e.id === effectId)!
              .providers[0].kind,
          })),
        },
        weapon,
      ),
    ) / firstShot(run({}, weapon));
  const buffEffects = loadEffects(rawBuffEffects);

  it("rule: every switch gives exactly its Court value on a weapon it fits", () => {
    const rows = buffEffects
      // improving parts and parts that need a Void Super (Debilitating Wave) have their own tests
      .filter(
        (e) =>
          !e.modifiers.some(
            (p) =>
              p.type === "multiplier" && (p.requiresEffectIds || p.superElements),
          ),
      )
      .map((effect) => {
        const part = effect.modifiers.find(
          (p) => p.type === "multiplier" && p.damageSources.includes("weapon"),
        );
        if (part?.type !== "multiplier") throw new Error(effect.id);
        const weapon = weapons.find(
          (w) =>
            (part.weaponTypes === undefined || part.weaponTypes.includes(w.weaponType)) &&
            (part.elements === undefined || part.elements.includes(w.element)),
        );
        return { effect, part, weapon };
      });
    const missing = rows.filter((r) => !r.weapon).map((r) => r.effect.id);
    note("Court-Schalter ohne passende Waffe", String(missing.length), "0");
    expect(missing).toEqual([]);
    const wrong = rows
      .filter(
        (r) =>
          Math.abs(ratioOn(r.weapon!, [r.effect.id]) - r.part.multiplier.value!) > 0.001,
      )
      .map((r) => r.effect.id);
    note("Court-Schalter mit falschem Wert", String(wrong.length), "0");
    expect(wrong).toEqual([]);
  });

  it("Expanding Abyss raises Weaken from 15 % to 25 % on Void weapons, not on Solar", () => {
    const void_ = weapons.find((w) => w.element === "void")!;
    const solar = weapons.find((w) => w.element === "solar")!;
    const gain = (weapon: Weapon) =>
      ratioOn(weapon, ["weaken", "expanding-abyss"]);
    note(
      "Weaken + Expanding Abyss: Void / Solar",
      `×${fmt(gain(void_))} / ×${fmt(gain(solar))}`,
      "×1,25 / ×1,15",
    );
    expect(gain(void_)).toBeCloseTo(1.25, 3);
    expect(gain(solar)).toBeCloseTo(1.15, 3);
    // alone it does nothing: it only improves Weaken
    expect(ratioOn(void_, ["expanding-abyss"])).toBe(1);
  });

  it("Argent Blade only helps Swords", () => {
    const sword = weapons.find((w) => w.weaponType === "sword")!;
    const other = weapons.find((w) => w.weaponType !== "sword")!;
    expect(ratioOn(sword, ["argent-blade"])).toBeCloseTo(1.15, 3);
    expect(ratioOn(other, ["argent-blade"])).toBe(1);
  });
});

describe("seasonal artifact (2026-10-24)", () => {
  const artifactSel = (...effectIds: string[]) =>
    effectIds.map((effectId) => ({ effectId, provider: "artifact" as const }));
  const journal = gameData.artifacts.artifacts.find((a) => a.id === "hunter-s-journal")!;
  const firstShot = (r: SimulationResult) =>
    r.damageInstances.find((d) => d.damageSource === "weapon")!.damage;

  it("rule: perks of one tier fit its slots, as on the artifact screen of the game", () => {
    const tier3 = journal.perks.filter((p) => p.tier === 3).map((p) => p.effectId);
    const slots = gameData.artifacts.slots[2].value!;
    note("Hunter's Journal: Perks mit drei Rauten", `${tier3.length} wählbar, ${slots} Slots`, "2 Slots");
    expect(tier3.length).toBeGreaterThan(slots);
    expect(() =>
      run({ artifactId: journal.id, selections: artifactSel(...tier3.slice(0, slots)) }),
    ).not.toThrow();
    expect(() =>
      run({ artifactId: journal.id, selections: artifactSel(...tier3.slice(0, slots + 1)) }),
    ).toThrow(/slots in tier 3/);
  });

  it("rule: a perk works only with an artifact that has it", () => {
    // Limit Break belongs to the Tablet of Ruin, not to the Hunter's Journal
    expect(() =>
      run({ artifactId: journal.id, selections: artifactSel("limit-break") }),
    ).toThrow(/not a perk of/);
    expect(() => run({ selections: artifactSel("limit-break") })).not.toThrow(); // the helper picks the artifact
  });

  it("Sniper's Meditation is on both artifacts that have it, in the top row", () => {
    const holders = gameData.artifacts.artifacts
      .filter((a) => a.perks.some((p) => p.effectId === "sniper-meditation"))
      .map((a) => [a.name, a.perks.find((p) => p.effectId === "sniper-meditation")!.tier]);
    note("Sniper's Meditation", holders.map((h) => `${h[0]} (${h[1]})`).join(", "), "Data Disk und Journal, Tier 3");
    expect(holders).toEqual([
      ["Encrypted Data Disk", 3],
      ["Hunter's Journal", 3],
    ]);
  });

  it("Limit Break: +15 % super damage, none on the weapon", () => {
    const cast = { abilities: [{ abilityId: "thundercrash", castsMs: [0] }] };
    const withPerk = run({ ...cast, selections: artifactSel("limit-break") });
    const plain = run(cast);
    const ratio = damageOf(withPerk, "super") / damageOf(plain, "super");
    note("Thundercrash mit / ohne Limit Break", `×${fmt(ratio)}`, "×1,15");
    expect(ratio).toBeCloseTo(1.15, 3);
    expect(firstShot(withPerk)).toBe(firstShot(plain));
  });

  it("Thunderous Retort: +30 % for Arc supers, not for a Solar super", () => {
    const retort = artifactSel("thunderous-retort");
    const arc = { abilities: [{ abilityId: "thundercrash", castsMs: [0] }] };
    const solar = {
      guardianClass: "hunter" as const,
      subclass: "solar" as const,
      abilities: [{ abilityId: "golden-gun-marksman", castsMs: [0] }],
    };
    const gain = (build: Partial<Build>) =>
      damageOf(run({ ...build, selections: retort }), "super") / damageOf(run(build), "super");
    note("Thunderous Retort: Arc / Solar Super", `×${fmt(gain(arc))} / ×${fmt(gain(solar))}`, "×1,30 / ×1,00");
    expect(gain(arc)).toBeCloseTo(1.3, 3);
    expect(gain(solar)).toBe(1);
  });

  it("Fever and Chill: Radiant for Solar weapons, not on top of Radiant", () => {
    const solar = weapons.find((w) => w.element === "solar")!;
    const arc = weapons.find((w) => w.element === "arc")!;
    const fever = artifactSel("fever-and-chill");
    const radiant = [{ effectId: "radiant", provider: "subclass" as const }];
    const gain = (weapon: Weapon, selections: Build["selections"]) =>
      firstShot(run({ selections }, weapon)) / firstShot(run({}, weapon));
    note(
      "Fever and Chill: Solar / Arc / mit Radiant",
      `×${fmt(gain(solar, fever))} / ×${fmt(gain(arc, fever))} / ×${fmt(gain(solar, [...fever, ...radiant]))}`,
      "×1,20 / ×1,00 / ×1,20",
    );
    expect(gain(solar, fever)).toBeCloseTo(1.2, 3);
    expect(gain(arc, fever)).toBe(1);
    expect(gain(solar, [...fever, ...radiant])).toBeCloseTo(1.2, 3); // empowering buffs do not stack
  });

  it("Shieldcrush: +50 % melee only with Frost Armor, Void Overshield or Woven Mail", () => {
    const melee = { abilities: [{ abilityId: "shield-bash", castsMs: [0] }], subclass: "void" as const };
    const vigilance = [{ effectId: "echo-of-vigilance", provider: "subclass" as const }];
    const crush = artifactSel("shieldcrush");
    const meleeDamage = (selections: Build["selections"]) =>
      damageOf(run({ ...melee, selections }), "melee");
    const base = meleeDamage(vigilance);
    note(
      "Shieldcrush auf Shield Bash: mit / ohne Overshield",
      `×${fmt(meleeDamage([...vigilance, ...crush]) / base)} / ×${fmt(meleeDamage(crush) / meleeDamage([]))}`,
      "×1,50 / ×1,00",
    );
    expect(meleeDamage([...vigilance, ...crush]) / base).toBeCloseTo(1.5, 3);
    expect(meleeDamage(crush)).toBe(meleeDamage([]));
  });

  it("Transference: +10 % grenade damage while Transcendent, none without Transcendence", () => {
    const grenade = abilitiesFor(gameData.abilities, "grenade", "titan", "prismatic").find(
      (a) => a.duringEffectId === undefined,
    )!;
    const cast = {
      guardianClass: "titan" as const,
      subclass: "prismatic" as const,
      abilities: [{ abilityId: grenade.id, castsMs: [0] }],
    };
    const transcendence = [{ effectId: "transcendence", provider: "subclass" as const }];
    const grenadeDamage = (selections: Build["selections"]) =>
      damageOf(run({ ...cast, selections }), "grenade");
    const during = grenadeDamage([...transcendence, ...artifactSel("transference")]) / grenadeDamage(transcendence);
    const without = grenadeDamage(artifactSel("transference")) / grenadeDamage([]);
    note("Transference: mit / ohne Transcendence", `×${fmt(during)} / ×${fmt(without)}`, "×1,10 / ×1,00");
    expect(during).toBeCloseTo(1.1, 3);
    expect(without).toBe(1);
  });
});

describe("exotic effects from the rotation", () => {
  it("Star-Eater Scales: super damage ×1.7 after the cast", () => {
    const hunter = {
      guardianClass: "hunter" as const,
      subclass: "solar" as const,
      abilities: [{ abilityId: "golden-gun-marksman", castsMs: [0] }],
    };
    const ratio =
      damageOf(
        run({ ...hunter, exoticArmorId: "star-eater-scales" }),
        "super",
      ) / damageOf(run(hunter), "super");
    note("Star-Eater auf Golden Gun", `×${fmt(ratio)}`, "×1,70");
    expect(ratio).toBeCloseTo(1.7, 2);
  });

  it("Star-Eater Scales: Needlestorm only ×1.35 (Compendium cap), not ×1.7", () => {
    const hunter = {
      guardianClass: "hunter" as const,
      subclass: "arc" as const,
      abilities: [{ abilityId: "needlestorm", castsMs: [0] }],
    };
    const ratio =
      damageOf(
        run({ ...hunter, exoticArmorId: "star-eater-scales" }),
        "super",
      ) / damageOf(run(hunter), "super");
    note("Star-Eater auf Needlestorm", `×${fmt(ratio)}`, "×1,35");
    expect(ratio).toBeCloseTo(1.35, 2);
  });

  it("Stormdancer's Brace: Stormtrance as Aegis measures Ascending Amplitude, not ×3", () => {
    const warlock = {
      guardianClass: "warlock" as const,
      subclass: "arc" as const,
      abilities: [{ abilityId: "stormtrance", castsMs: [0] }],
    };
    const ratio =
      damageOf(run({ ...warlock, exoticArmorId: "stormdancers-brace" }), "super") /
      damageOf(run(warlock), "super");
    // both Aegis rows hold the same Jolt (13 × 228 / 2.3), which runs as its own keyword damage
    const jolt = (13 * 228) / 2.3;
    note(
      "Stormdancer's Brace auf Stormtrance (ohne Jolt)",
      `×${fmt(ratio)}`,
      "×2,23 (Aegis (27 512 − 1289) / (13 045 − 1289); mit Jolt ×2,11)",
    );
    expect(ratio).toBeCloseTo((27512.174 - jolt) / (13045.217 - jolt), 2);
  });

  it("Sol Invictus from a teammate: Chaos Reach lasts longer (Aegis ×1.463)", () => {
    const chaosReach = {
      guardianClass: "warlock" as const,
      subclass: "arc" as const,
      abilities: [{ abilityId: "chaos-reach", castsMs: [0] }],
      exoticArmorId: "geomag-stabilizers",
    };
    const sunspots = [{ effectId: "sol-invictus", provider: "fireteamSupport" as const }];
    const ratio =
      damageOf(run({ ...chaosReach, selections: sunspots }), "super") /
      damageOf(run(chaosReach), "super");
    note("Sol Invictus auf Chaos Reach (Geomag)", `×${fmt(ratio)}`, "×1,463");
    expect(ratio).toBeCloseTo(79840 / 54572, 2);
  });

  it("Dawn Chorus: Ignitions of One Thousand Voices ×2, its shots unchanged", () => {
    const warlock = { guardianClass: "warlock" as const, subclass: "solar" as const };
    const plain = run(warlock);
    const worn = run({ ...warlock, exoticArmorId: "dawn-chorus" });
    const sum = (r: SimulationResult, id: string) =>
      r.damageInstances.filter((d) => d.id === id).reduce((s, d) => s + d.damage, 0);
    note(
      "Dawn Chorus auf OTV: Ignition / Shot",
      `×${fmt(sum(worn, "ignition") / sum(plain, "ignition"))} / ×${fmt(sum(worn, "shot") / sum(plain, "shot"))}`,
      "×2,00 / ×1,00",
    );
    expect(sum(worn, "ignition") / sum(plain, "ignition")).toBeCloseTo(2, 3);
    expect(sum(worn, "shot")).toBeCloseTo(sum(plain, "shot"), 3);
  });

  it("Foetracer: x4 surge only for weapons of the grenade's element", () => {
    const weaponDamage = (grenade: string, exotic?: string) =>
      damageOf(
        run({
          guardianClass: "hunter",
          subclass: "solar",
          abilities: [{ abilityId: grenade, castsMs: [0] }],
          ...(exotic ? { exoticArmorId: exotic } : {}),
        }),
        "weapon",
      );
    const solar =
      weaponDamage("fusion-grenade", "foetracer") /
      weaponDamage("fusion-grenade");
    const arc =
      weaponDamage("arcbolt-grenade", "foetracer") /
      weaponDamage("arcbolt-grenade");
    note(
      "Foetracer, Solar-Waffe mit Solar / Arc-Grenade",
      `×${fmt(solar)} / ×${fmt(arc)}`,
      "mehr / unverändert",
    );
    expect(solar).toBeGreaterThan(1.05);
    expect(arc).toBeCloseTo(1, 6);
  });
});

describe("every Nth shot (2026-10-30, ADR 0017 S3)", () => {
  it("Truth: every 3rd rocket adds its 8 cluster munitions", () => {
    const result = run(
      { guardianClass: "titan", subclass: "void", catalyst: false, damagePhaseSeconds: 30 },
      weaponById("truth"),
    );
    const rockets = result.damageInstances.filter((d) => d.id === "shot").length;
    const clusters = result.damageInstances.filter((d) => d.id === "cluster").length;
    note("Truth: Raketen / Cluster-Bomblets", `${rockets} / ${clusters}`, "14 Raketen, alle 3 acht Bomblets: 4 × 8 = 32");
    expect(rockets).toBe(14);
    expect(clusters).toBe(32);
  });

  it("Polaris Lance: every 5th shot Perfect Fifth with x40 scorch, ignites; with Ember of Ashes more often", () => {
    const polaris = (ember: boolean) =>
      run(
        {
          guardianClass: "warlock",
          subclass: "solar",
          damagePhaseSeconds: 30,
          ...(ember ? { selections: [{ effectId: "ember-of-ashes", provider: "subclass" as const }] } : {}),
        },
        weaponById("polaris-lance"),
      );
    const count = (r: SimulationResult, pick: (d: SimulationResult["damageInstances"][number]) => boolean) =>
      r.damageInstances.filter(pick).length;
    const plain = polaris(false);
    const ember = polaris(true);
    const fifths = count(plain, (d) => d.id === "perfect-fifth"); // the item file's part (B4a)
    const ignitions = (r: SimulationResult) => count(r, isIgnition);
    note(
      "Polaris 30 s: Schüsse / Perfect Fifth / Ignitions ohne, mit Ember",
      `${plain.shots.length} / ${fifths} / ${ignitions(plain)}, ${ignitions(ember)}`,
      "jeder 5. Schuss; Ignition alle 3 (mit Ember alle 2) Perfect Fifths",
    );
    // the last one may detonate after the phase (0.5 s delay)
    expect(fifths).toBeGreaterThanOrEqual(Math.floor(plain.shots.length / 5) - 1);
    expect(fifths).toBeLessThanOrEqual(Math.floor(plain.shots.length / 5));
    expect(ignitions(plain)).toBeGreaterThanOrEqual(Math.floor(fifths / 3));
    expect(ignitions(ember)).toBeGreaterThan(ignitions(plain));
  });
});

describe("playstyles (2026-10-30, ADR 0017 S4)", () => {
  const ovation = (playstyle?: string) =>
    run({ subclass: "strand", damagePhaseSeconds: 60, ...(playstyle ? { playstyle } : {}) }, weaponById("whirling-ovation"));

  it("Whirling Ovation: full charge deals the most with its 7 rockets, a lower charge fires them faster", () => {
    const full = ovation();
    const lower = ["2-3-charge", "1-3-charge", "no-charge"].map(ovation);
    note(
      "Whirling Ovation 60 s: voll / 2/3 / 1/3 / ohne",
      [full, ...lower].map((r) => Math.round(r.totalDamage)).join(" / "),
      "voll vorn (7 Raketen × 6344), Verhältnisse wie Aegis 1 : 0,66 : 0,49 : 0,16",
    );
    for (const r of lower) {
      expect(r.shots.length).toBe(7);
      expect(r.totalDamage).toBeLessThan(full.totalDamage);
    }
    const lastNoChargeS = lower[2].shots.at(-1)!.timeMs / 1000;
    note("Whirling Ovation ohne Ladung: letzte Rakete", `${fmt(lastNoChargeS)} s`, "6 × 2,133 ≈ 12,8 s");
    expect(lastNoChargeS).toBeCloseTo(12.8, 0);
  });
});

describe("Choir of One modes as playstyles (B6)", () => {
  const choir = (playstyle?: string) =>
    run({ subclass: "void", damagePhaseSeconds: 120, ...(playstyle ? { playstyle } : {}) }, weaponById("choir-of-one"));

  it("Choir of One: all ammo is 45 projectiles or 45 shots of five hitscan rounds; hitscan deals about ×1.9 in about 66 s", () => {
    const projectile = choir();
    const hitscan = choir("hitscan-mode");
    const ratio = hitscan.totalDamage / projectile.totalDamage;
    const lastS = (r: SimulationResult) => r.shots.at(-1)!.timeMs / 1000;
    note(
      "Choir of One 120 s: Schüsse, letzter Schuss, Verhältnis hitscan ÷ Projektil",
      `${projectile.shots.length} / ${hitscan.shots.length}, ${fmt(lastS(projectile))} s / ${fmt(lastS(hitscan))} s, ×${fmt(ratio)}`,
      "225 Munition ÷ 5; Aegis Sustained 17,7 s / 65,8 s, Gesamtschaden 76 676 / 144 867 = ×1,89",
    );
    expect(projectile.shots.length).toBe(45);
    expect(hitscan.shots.length).toBe(45);
    expect(lastS(projectile)).toBeGreaterThan(14);
    expect(lastS(projectile)).toBeLessThan(18.5);
    expect(lastS(hitscan)).toBeGreaterThan(60);
    expect(lastS(hitscan)).toBeLessThan(67);
    expect(ratio).toBeGreaterThan(1.7);
    expect(ratio).toBeLessThan(2.1);
  });
});

describe("Salvation's Grip charge as playstyle (B6)", () => {
  const grip = (playstyle?: string) =>
    run({ subclass: "stasis", damagePhaseSeconds: 120, ...(playstyle ? { playstyle } : {}) }, weaponById("salvation-s-grip"));

  it("Salvation's Grip: 25 shots either way; charged takes about twice as long and deals about ×1.6 per shot", () => {
    const uncharged = grip();
    const charged = grip("charged");
    const lastS = (r: SimulationResult) => r.shots.at(-1)!.timeMs / 1000;
    const ratio = charged.totalDamage / uncharged.totalDamage;
    note(
      "Salvation's Grip 120 s: Schüsse, letzter Schuss, Verhältnis geladen ÷ ungeladen",
      `${uncharged.shots.length} / ${charged.shots.length}, ${fmt(lastS(uncharged))} s / ${fmt(lastS(charged))} s, ×${fmt(ratio)}`,
      "Aegis Sustained 19,3 s / 35,5 s, Gesamtschaden 46 806 / 83 906 (mit Hail the Storm; ohne ×1,59 pro Schuss laut Weapons)",
    );
    expect(uncharged.shots.length).toBe(25);
    expect(charged.shots.length).toBe(25);
    expect(lastS(uncharged)).toBeGreaterThan(16);
    expect(lastS(uncharged)).toBeLessThan(20);
    expect(lastS(charged)).toBeGreaterThan(28);
    expect(lastS(charged)).toBeLessThan(36);
    expect(ratio).toBeGreaterThan(1.3);
    expect(ratio).toBeLessThan(1.9);
  });
});

describe("Delicate Tomb hipfire and ADS as playstyles (B6)", () => {
  const tomb = (playstyle?: string) =>
    run({ subclass: "arc", damagePhaseSeconds: 60, ...(playstyle ? { playstyle } : {}) }, weaponById("delicate-tomb"));

  it("Delicate Tomb: hipfire is the base shot, ADS deals about 0.84 per shot (Aegis 745 / 890), same timing", () => {
    const hip = tomb();
    const ads = tomb("ads");
    const ratio = ads.totalDamage / hip.totalDamage;
    const lastS = hip.shots.at(-1)!.timeMs / 1000;
    note(
      "Delicate Tomb 60 s: Schüsse hipfire / ADS, letzter Schuss, ADS ÷ hipfire",
      `${hip.shots.length} / ${ads.shots.length}, ${fmt(lastS)} s, ×${fmt(ratio)}`,
      "Aegis Weapons 890,4 / 745,3 pro Schuss (×0,837); Quantum 26 Schüsse, Zeit bis leer 32 s",
    );
    expect(hip.shots.length).toBe(26);
    expect(ads.shots.length).toBe(26);
    expect(lastS).toBeGreaterThan(26);
    expect(lastS).toBeLessThan(36);
    expect(ratio).toBeGreaterThan(0.8);
    expect(ratio).toBeLessThan(0.87);
  });
});

describe("Catalyst timing from a row with the catalyst (B6.2)", () => {
  const duality = (fields: Partial<Build> = {}) =>
    run({ subclass: "solar", damagePhaseSeconds: 60, ...fields }, weaponById("duality"));
  const queenbreaker = (fields: Partial<Build> = {}) =>
    run({ subclass: "arc", damagePhaseSeconds: 60, ...fields }, weaponById("the-queenbreaker"));
  const graviton = (fields: Partial<Build> = {}) =>
    run({ subclass: "arc", damagePhaseSeconds: 60, ...fields }, weaponById("graviton-spike"));
  const lastS = (r: SimulationResult) => r.shots.at(-1)!.timeMs / 1000;

  it("Duality: magazine 6 and 15 shots without the catalyst, 17 with it (Quantum measures only with it)", () => {
    const off = duality();
    const on = duality({ catalyst: true });
    note(
      "Duality 60 s: Schüsse und letzter Schuss ohne / mit Katalysator",
      `${off.shots.length} / ${on.shots.length}, ${fmt(lastS(off))} s / ${fmt(lastS(on))} s`,
      "Clarity „Magazine Size by 2 (6🠚8)“; mit Katalysator Quantum 14,3 s (Quelle des Takts, nur Verdrahtung), Gegenprobe Aegis Sustained 15,0 s für 17 Schüsse",
    );
    expect(off.shots.length).toBe(15);
    expect(on.shots.length).toBe(17);
    // Quantums 14,3 s ist die Quelle des Takts (Verdrahtung); Aegis Sustained (15,0 s, Reload 1,1 s) liegt darüber
    expect(lastS(on)).toBeGreaterThan(13.3);
    expect(lastS(on)).toBeLessThan(15.3);
    expect(lastS(off)).toBeLessThan(lastS(on));
  });

  it("Duality: hipfire pellets deal about 0.66 of the ADS slug per shot at the same timing", () => {
    const ads = duality();
    const hip = duality({ playstyle: "hipfire" });
    const ratio = hip.totalDamage / ads.totalDamage;
    note(
      "Duality 60 s: Hipfire ÷ ADS",
      `×${fmt(ratio)}, ${hip.shots.length} / ${ads.shots.length} Schüsse`,
      "Aegis 829,9 / 1262 (×0,66); Quantum Pellet Body 828 gegen Slug Precision 1263",
    );
    expect(hip.shots.length).toBe(ads.shots.length);
    expect(ratio).toBeGreaterThan(0.6);
    expect(ratio).toBeLessThan(0.72);
  });

  it("The Queenbreaker: magazine 5 without the catalyst (4 reloads), the Aegis row's 11 with it (1 reload)", () => {
    const off = queenbreaker();
    const on = queenbreaker({ catalyst: true });
    note(
      "The Queenbreaker 60 s: Schüsse, letzter Schuss ohne / mit Katalysator",
      `${off.shots.length} / ${on.shots.length}, ${fmt(lastS(off))} s / ${fmt(lastS(on))} s`,
      "mit Katalysator Aegis Sustained 26,3 s (Quelle des Takts, nur Verdrahtung); ohne: Quantum Magazin 5, 33 s bei 42 rpm (Gegenprobe)",
    );
    expect(off.shots.length).toBe(21);
    expect(on.shots.length).toBe(21);
    expect(lastS(on)).toBeGreaterThan(24.5);
    expect(lastS(on)).toBeLessThan(28);
    // 3 Reloads mehr à etwa 1,05 s + Zwischenschuss, zwischen Aegis mit und Quantum (33 s)
    expect(lastS(off)).toBeGreaterThan(lastS(on) + 2);
    expect(lastS(off)).toBeLessThan(33);
  });

  it("The Queenbreaker: Marksman Sights deal about 0.77 of Combat Sights (Aegis Sustained 74475 / 97261)", () => {
    const combat = queenbreaker();
    const marksman = queenbreaker({ playstyle: "marksman-sights" });
    const ratio = marksman.totalDamage / combat.totalDamage;
    note(
      "The Queenbreaker 60 s: Marksman ÷ Combat Sights",
      `×${fmt(ratio)}`,
      "Quantum 31626 / 41328 (×0,77), Aegis Sustained 74475 / 97261 (×0,77)",
    );
    expect(marksman.shots.length).toBe(21);
    expect(ratio).toBeGreaterThan(0.7);
    expect(ratio).toBeLessThan(0.83);
  });

  it("Graviton Spike: Stasis mode is the base shot, Arc mode deals about 0.76 of it (Quantum per magazine)", () => {
    const stasis = graviton();
    const arc = graviton({ playstyle: "arc-mode" });
    const ratio = arc.totalDamage / stasis.totalDamage;
    note(
      "Graviton Spike 60 s: Schüsse Stasis / Arc, Arc ÷ Stasis",
      `${stasis.shots.length} / ${arc.shots.length}, ×${fmt(ratio)}`,
      "Quantum je Magazin 2314 (95 rpm) gegen 1222 (150 rpm), 13 Schuss, Reload 1,61 s: etwa ×0,76",
    );
    expect(stasis.shots.length).toBeGreaterThan(70);
    expect(stasis.shots.length).toBeLessThan(90);
    expect(arc.shots.length).toBeGreaterThan(105);
    expect(arc.shots.length).toBeLessThan(125);
    expect(ratio).toBeGreaterThan(0.7);
    expect(ratio).toBeLessThan(0.85);
  });
});

describe("Black Talon combo from its Aegis rows (B6)", () => {
  it("Black Talon: one shot is a 2H2L combo of two heavy projectiles and two light attacks (Aegis base 3141)", () => {
    const r = run({ subclass: "void", damagePhaseSeconds: 60 }, weaponById("black-talon"));
    const lastS = r.shots.at(-1)!.timeMs / 1000;
    const perCombo = r.totalDamage / r.shots.length;
    note(
      "Black Talon 60 s: Schüsse (Combos), letzter Schuss, Schaden pro Combo",
      `${r.shots.length}, ${fmt(lastS)} s, ${fmt(perCombo)}`,
      "Aegis Sustained 9 Combos + 1H in 25,1 s, Grundwert 3141 pro Combo (vor Buffs)",
    );
    // Without buffs the combo is 2 × 1177.5 + 2 × 392.7 = 3141, plus Void's own multipliers
    expect(perCombo).toBeGreaterThan(3000);
    expect(r.shots.length).toBe(9);
    expect(lastS).toBeGreaterThan(20);
    expect(lastS).toBeLessThan(26);
  });
});

describe("sword combos as playstyles (B6)", () => {
  const lament = (fields: Partial<Build>) =>
    run({ subclass: "solar", damagePhaseSeconds: 30, ...fields }, weaponById("the-lament"));

  it("The Lament: a longer combo is slower (Aegis Sustained 2.506 / 3.116 / 3.583 / 4.167 s) and hits harder", () => {
    const styles = ["2l1h", undefined, "3l1h1r", "4l1h1r"].map((playstyle) =>
      lament(playstyle ? { playstyle } : {}),
    );
    note(
      "The Lament 30 s: Combos 2L1H / 2L1H1R / 3L1H1R / 4L1H1R",
      styles.map((r) => r.shots.length).join(" / "),
      "30 s ÷ 2,5 / 3,1 / 3,6 / 4,2 s je Combo",
    );
    const counts = styles.map((r) => r.shots.length);
    expect(counts[0]).toBeGreaterThan(counts[1]);
    expect(counts[1]).toBeGreaterThan(counts[2]);
    expect(counts[2]).toBeGreaterThan(counts[3]);
    const intervalS = (styles[3].shots[1].timeMs - styles[3].shots[0].timeMs) / 1000;
    expect(intervalS).toBeCloseTo(4.167, 1);
    const perCombo = (r: SimulationResult) => r.totalDamage / r.shots.length;
    expect(perCombo(styles[3])).toBeGreaterThan(perCombo(styles[1]));
  });

  it("The Lament: Burning Ambition adds Scorch and with it ignitions, about +10 to +15 %", () => {
    const plain = lament({ catalyst: false });
    const catalyst = lament({ catalyst: true });
    const gain = catalyst.totalDamage / plain.totalDamage;
    note("The Lament 30 s: mit / ohne Katalysator", fmt(gain), "Aegis ×1,113");
    expect(gain).toBeGreaterThan(1.08);
    expect(gain).toBeLessThan(1.16);
  });
});

describe("bow charge levels as playstyles (B6)", () => {
  const heirloom = (fields: Partial<Build>) =>
    run({ subclass: "solar", damagePhaseSeconds: 30, ...fields }, weaponById("heirloom"));

  it("Heirloom: a higher charge level is slower per arrow (Aegis Sustained 1.083 / 1.35 / 2 / 3.017 s) and hits harder", () => {
    const styles = [undefined, "1-charge", "2-charges", "fully-charged"].map((playstyle) =>
      heirloom({ catalyst: true, ...(playstyle ? { playstyle } : {}) }),
    );
    note(
      "Heirloom 30 s: Pfeile uncharged / 1 / 2 / voll",
      styles.map((r) => r.shots.length).join(" / "),
      "höchstens 20 Pfeile (Munition); 30 s ÷ 2,0 / 3,0 s bei 2 / 3 Ladungen",
    );
    // 20 arrows are all the ammunition: the first two levels use it up inside 30 s
    const intervals = styles.map((r) => (r.shots[1].timeMs - r.shots[0].timeMs) / 1000);
    expect(intervals[0]).toBeCloseTo(1.083, 1);
    expect(intervals[1]).toBeCloseTo(1.35, 1);
    expect(intervals[2]).toBeCloseTo(2, 1);
    expect(intervals[3]).toBeCloseTo(3.017, 1);
    expect(styles[0].shots.length).toBe(20);
    expect(styles[2].shots.length).toBeGreaterThan(styles[3].shots.length);
    const perArrow = (r: SimulationResult) => r.totalDamage / r.shots.length;
    expect(perArrow(styles[3])).toBeGreaterThan(perArrow(styles[2]));
    expect(perArrow(styles[2])).toBeGreaterThan(perArrow(styles[1]));
    expect(perArrow(styles[1])).toBeGreaterThan(perArrow(styles[0]));
  });

  it("Heirloom: the catalyst adds Scorch on a charged arrow, about +5 to +25 %", () => {
    const plain = heirloom({ playstyle: "fully-charged", catalyst: false });
    const catalyst = heirloom({ playstyle: "fully-charged", catalyst: true });
    const gain = catalyst.totalDamage / plain.totalDamage;
    note("Heirloom 30 s voll geladen: mit / ohne Katalysator", fmt(gain), "Aegis-Zeile misst nur mit (×1,1 herausgerechnet)");
    expect(gain).toBeGreaterThan(1.05);
    expect(gain).toBeLessThan(1.25);
  });
});

describe("bows (2026-10-26)", () => {
  const hierarchy = (fields: Partial<Build>) =>
    run({ guardianClass: "hunter", subclass: "solar", catalyst: true, ...fields }, weaponById("hierarchy-of-needs"));
  const ignitionsOf = (r: SimulationResult) =>
    r.damageInstances.filter(isIgnition).length;

  it("Hierarchy of Needs: Pre-stacked deploys the Guidance Ring with the first arrow, without it the 4th", () => {
    const short = (weaponPreBuilt: boolean) =>
      hierarchy({ damagePhaseSeconds: 10, weaponPreBuilt }).totalDamage;
    const ratio = short(true) / short(false);
    note("Hierarchy 10 s: Pre-stacked / ohne", fmt(ratio), "deutlich über 1 (3 Pfeile mehr mit Ring)");
    expect(ratio).toBeGreaterThan(1.3);
  });

  // without the catalyst pace (1.36 s per arrow) the arrows are further apart than the cooldown (1.3 s)
  it("Hierarchy of Needs: the seekers ignite, every 3rd arrow, with Ember of Ashes every 2nd", () => {
    const plain = hierarchy({ weaponPreBuilt: true, catalyst: false });
    const ember = hierarchy({
      weaponPreBuilt: true,
      catalyst: false,
      selections: [{ effectId: "ember-of-ashes", provider: "subclass" }],
    });
    const arrows = plain.shots.length;
    note(
      "Hierarchy 30 s: Ignitions ohne / mit Ember",
      `${ignitionsOf(plain)} / ${ignitionsOf(ember)} bei ${arrows} Pfeilen`,
      "etwa jeder 3. / 2. Pfeil",
    );
    expect(ignitionsOf(plain)).toBeGreaterThanOrEqual(Math.floor((arrows - 2) / 3) - 1);
    expect(ignitionsOf(ember)).toBeGreaterThan(ignitionsOf(plain) * 1.3);
  });

  it("Hierarchy of Needs through two rings: twice the seekers of one ring (ADR 0017 S4)", () => {
    const seekers = (r: SimulationResult) =>
      r.damageInstances.filter((d) => d.id.startsWith("seekers")).length;
    const one = hierarchy({ weaponPreBuilt: true });
    const two = hierarchy({ weaponPreBuilt: true, playstyle: "two-rings" });
    note(
      "Hierarchy 30 s: Seeker ein / zwei Ringe",
      `${seekers(one)} / ${seekers(two)}`,
      "doppelt so viele, gleiche Pfeile",
    );
    expect(two.shots.length).toBe(one.shots.length);
    expect(seekers(two)).toBe(2 * seekers(one));
  });

  it("Leviathan's Breath: with Archer's Tempo the 14 arrows are out by about 19 s", () => {
    const r = run({ catalyst: true }, weaponById("leviathan-s-breath"));
    const lastS = r.shots.at(-1)!.timeMs / 1000;
    note("Leviathan's Breath mit Catalyst: letzter Pfeil", `${fmt(lastS)} s`, "1,33 + 13 × 1,33 ≈ 18,7 s");
    expect(r.shots).toHaveLength(14);
    expect(lastS).toBeCloseTo(18.66, 0);
  });
});

describe("keywords", () => {
  // Starfire Protocol while Radiant: two charges and weapon hits refill the Fusion Grenade (block 3).
  const ignitions = (castsMs: number[], ember: boolean) =>
    run(
      {
        guardianClass: "warlock",
        subclass: "solar",
        exoticArmorId: "starfire-protocol",
        abilities: [{ abilityId: "fusion-grenade", castsMs }],
        selections: [
          { effectId: "radiant", provider: "subclass" },
          ...(ember ? [{ effectId: "ember-of-ashes", provider: "subclass" as const }] : []),
        ],
      },
      testWeapon,
    ).damageInstances;
  // Scorch stacks fall after 2.3 s without new ones (burn, ADR 0017 S2). Starfire Protocol gives two
  // charges at once; the third grenade waits for the energy the weapon hits refill, so its x40 meets
  // stacks that have fallen away. The unlimited-energy case is in tests/abilityKeywordsEngine.test.ts.
  it("with Ember of Ashes two Fusion Grenades ignite; the third without it comes after the stacks fell", () => {
    const castTimes = (hits: ReturnType<typeof ignitions>) => [
      ...new Set(hits.filter((d) => d.abilityId === "fusion-grenade").map((d) => d.timeMs)),
    ];
    const threeHits = ignitions([0, 1500, 3000], false);
    const three = threeHits.filter(isIgnition).length;
    const twoEmber = ignitions([0, 1500], true).filter(isIgnition).length;
    const casts = castTimes(threeHits);
    note(
      "Ignitions: 3 Fusion / 2 Fusion mit Ember",
      `${three} / ${twoEmber}, Grenade-Treffer bei ${casts.map((ms) => Math.round(ms)).join(" / ")} ms`,
      "0 / 1: die dritte Grenade kommt mit der Energie nach über 2,3 s (Halten der Stacks), x40 reicht nicht",
    );
    expect(casts).toHaveLength(3);
    expect(casts[2] - casts[1]).toBeGreaterThan(2300);
    expect(three).toBe(0);
    expect(twoEmber).toBe(1);
  });
  it("Jolt has a slice of its own in the donut (Spark of Shock and Pulse Grenade)", () => {
    const shares = damageShares(
      run({
        abilities: [{ abilityId: "pulse-grenade", castsMs: [0] }],
        selections: [{ effectId: "spark-of-shock", provider: "subclass" }],
      }),
    );
    const jolt = shares.find((s) => s.id === "jolt");
    note(
      "Donut: Jolt aus Spark of Shock + Pulse Grenade",
      jolt ? `${Math.round(jolt.damage)} (${(jolt.share * 100).toFixed(1)} %)` : "fehlt",
      "eigenes Segment",
    );
    expect(jolt?.damageSource).toBe("keyword");
    expect(jolt!.damage).toBeGreaterThan(0);
  });
});

describe("donut by multiplier (2026-10-24)", () => {
  const otv = weaponById("one-thousand-voices");
  const radiant = { selections: [{ effectId: "radiant", provider: "subclass" as const }] };
  it("Radiant on One Thousand Voices: its slice is 1 − 1/1.2 of the damage it covers", () => {
    const result = run(radiant, otv);
    const shares = damageByMultiplier(result);
    const empowering = shares.find((s) => s.id === "empowering")!;
    const covered = result.damageInstances
      .filter((d) => d.factors.empowering === 1.2)
      .reduce((s, d) => s + d.damage, 0);
    note(
      "Donut außen: Radiant-Anteil an OTV (30 s)",
      `${(empowering.share * 100).toFixed(1)} %`,
      "16,7 % des Schadens, den Radiant trifft",
    );
    expect(empowering.damage / covered).toBeCloseTo(1 - 1 / 1.2);
    expect(shares.reduce((s, x) => s + x.damage, 0)).toBeCloseTo(result.totalDamage);
  });
  it("the catalyst slice is the damage the catalyst adds", () => {
    const withCatalyst = run({ ...radiant, catalyst: true }, otv);
    const without = run(radiant, otv);
    const shares = damageByMultiplier(withCatalyst, without);
    const catalyst = shares.find((s) => s.id === "catalyst")!;
    note(
      "Donut außen: Catalyst-Anteil an OTV (30 s)",
      `${(catalyst.share * 100).toFixed(1)} %`,
      "Total mit − ohne Catalyst",
    );
    expect(catalyst.damage).toBeCloseTo(withCatalyst.totalDamage - without.totalDamage);
    expect(shares.reduce((s, x) => s + x.damage, 0)).toBeCloseTo(withCatalyst.totalDamage);
  });
});

describe("ability energy (block 3)", () => {
  const grenadeDamage = (fields: Partial<Build>) => {
    const build = {
      guardianClass: "warlock" as const,
      subclass: "solar" as const,
      abilities: [{ abilityId: "fusion-grenade", castsMs: [0, 1500, 3000] }],
      ...fields,
    };
    return {
      total: run(build, testWeapon).totalDamage - run({ ...build, abilities: [] }, testWeapon).totalDamage,
    };
  };
  it("a Fusion Grenade needs its energy back, Starfire Protocol while Radiant refills it", () => {
    const one = grenadeDamage({
      abilities: [{ abilityId: "fusion-grenade", castsMs: [0] }],
    }).total;
    const three = grenadeDamage({}).total; // the casts at 1.5 and 3 s have no energy
    const radiant = [{ effectId: "radiant", provider: "subclass" as const }];
    const starfire = grenadeDamage({ exoticArmorId: "starfire-protocol", selections: radiant });
    const radiantOnly = grenadeDamage({ selections: radiant }).total;
    note(
      "Fusion Grenades bei 0/5/10 s: ohne Exotic / Starfire + Radiant (je Grenade-Schaden ÷ eine Grenade)",
      `×${fmt(three / one)} / ×${fmt(starfire.total / radiantOnly)}`,
      "×1 (Cooldown ~39 s) / ab ×3 (drei Grenades, dazu eine Ignition)",
    );
    expect(three / one).toBeCloseTo(1, 6);
    expect(starfire.total / radiantOnly).toBeGreaterThan(3);
  });

  const fusionSecondCast = (
    guardianClass: Build["guardianClass"],
    patch: Partial<Build> = {},
  ) => {
    const build: Build = {
      weaponId: testWeapon.id,
      guardianClass,
      subclass: "solar",
      catalyst: false,
      selections: [],
      effectWindows: {},
      damagePhaseSeconds: 60,
      abilities: [{ abilityId: "fusion-grenade", castsMs: [0, 0] }],
      ...patch,
    };
    const { options } = buildSimulation(build, gameData);
    return options.abilities!.find((a) => a.ability.id === "fusion-grenade")!.castsMs[1];
  };

  it("Fusion Grenade at stat 100: 106 s ÷ 3.115 on a Titan, 1.1× faster on a Warlock (K3, K5)", () => {
    const titan = fusionSecondCast("titan");
    const warlock = fusionSecondCast("warlock");
    note(
      "Fusion Grenade, zweiter Wurf (Stat 100): Titan / Warlock",
      `${fmt(titan / 1000)} s / ${fmt(warlock / 1000)} s`,
      "106 s ÷ 3,115 ≈ 34,0 s (Flat Gain T0, RyTako Base Regen Units) / ÷ 1,1 ≈ 30,9 s (RyTako: Warlock ×1,1 Grenade-Regen)",
    );
    expect(titan / 1000).toBeCloseTo(106 / 3.115, 0);
    expect(titan / warlock).toBeCloseTo(1.1, 2);
  });

  it("Arcane Needle: 3 innate charges, the fourth throw after 146 s ÷ (3.115 × 1.16) (Q3)", () => {
    const build: Build = {
      weaponId: testWeapon.id,
      guardianClass: "warlock",
      subclass: "strand",
      catalyst: false,
      selections: [],
      effectWindows: {},
      damagePhaseSeconds: 60,
      abilities: [{ abilityId: "arcane-needle", castsMs: [0, 0, 0, 0, 0] }],
    };
    const { options } = buildSimulation(build, gameData);
    const casts = options.abilities!.find((a) => a.ability.id === "arcane-needle")!.castsMs;
    note(
      "Arcane Needle, Würfe in 60 s (Stat 100)",
      casts.map((c) => `${fmt(c / 1000)} s`).join(", "),
      "3 Ladungen hintereinander (je eine Cast-Zeit Abstand); die vierte 146 s ÷ (3,115 × 1,16 bei 0 Ladungen) ≈ 40,4 s nach der Energie-Leerung bei 0 s; die fünfte läge nach 80 s, außerhalb der Phase",
    );
    expect(casts[2]).toBeLessThan(5000);
    expect(casts).toHaveLength(4);
    expect(casts[3] / 1000).toBeCloseTo(146 / (3.115 * 1.16), 0);
  });

  it("Eye of Another World adds 58 % of the base regeneration at stat 100, not 45 % (K4)", () => {
    const plain = fusionSecondCast("warlock");
    const eye = fusionSecondCast("warlock", { exoticArmorId: "eye-of-another-world" });
    note(
      "Fusion Grenade, zweiter Wurf mit Eye of Another World (Stat 100)",
      `${fmt(plain / 1000)} s → ${fmt(eye / 1000)} s`,
      "Flat Gain: Eye 20 % bei Stat 0, 58 % bei Stat 100; (3,115 + 0,58) / 3,115 ≈ 1,19 schneller",
    );
    expect(plain / eye).toBeCloseTo((3.115 + 0.58) / 3.115, 2);
  });
});

describe("the rotation shows what the simulation uses", () => {
  it("Lightweight Knife: a Radiant window of 10 s per cast in the rotation", () => {
    const build: Build = {
      weaponId: "gjallarhorn",
      guardianClass: "hunter",
      subclass: "solar",
      catalyst: false,
      selections: [],
      effectWindows: {},
      damagePhaseSeconds: 30,
      abilities: [{ abilityId: "lightweight-knife", castsMs: [0] }],
    };
    const weapon = weaponById("gjallarhorn");
    const { selected, options } = buildSimulation(build, gameData);
    const result = simulate(weapon, 30, selected, buckets, options);
    const radiant = rotationWindows(
      selected,
      30,
      options,
      result.superWindows,
      weapon.element,
    ).filter((w) => w.effectId === "radiant@lightweight-knife");
    const casts = options.abilities?.[0].castsMs ?? [];
    note(
      "Rotation: Radiant-Fenster nach Lightweight Knife (Cast bei 0 s)",
      radiant.map((w) => `${w.startMs}–${w.endMs} ms`).join(", ") || "keins",
      "10 s ab Treffer",
    );
    expect(casts).toEqual([0]);
    expect(radiant).toHaveLength(1);
    for (const w of radiant) expect(w.endMs - w.startMs).toBe(10_000);
  });
});

describe("the UI offers what works", () => {
  const subclassEffects = loadSubclassEffects(rawSubclass, { preBuilt: true });
  const neededByExotics = neededStatuses(
    gameData.exoticArmorEffects.map((g) => g.effect),
  );

  it("every generated aspect and fragment is shown for some weapon and exotic", () => {
    const hidden = subclassEffects.filter(
      (effect) =>
        !weapons.some((w) => effectRelevantTo(effect, w, neededByExotics)),
    );
    note("Aspects/Fragments ausgeblendet", String(hidden.length), "0");
    expect(hidden.map((e) => e.id)).toEqual([]);
  });

  it("rule: without an exotic, every shown aspect and fragment changes damage itself", () => {
    const stateOnly = subclassEffects.filter(
      (effect) =>
        weapons.some((w) => effectRelevantTo(effect, w)) &&
        effect.modifiers.length === 0 &&
        (effect.rules?.length ?? 0) === 0 &&
        effect.changesAbilityIds === undefined,
    );
    note(
      "Ohne Exotic: angeboten, aber ohne Wirkung",
      String(stateOnly.length),
      "0 (z. B. On Your Mark, Ascension)",
    );
    expect(stateOnly.map((e) => e.id)).toEqual([]);
  });

  it("No Backup Plans: Ascension (Amplified) is offered and raises shotgun damage", () => {
    const shotgun = weapons.find((w) => w.weaponType === "shotgun")!;
    const hunter = {
      guardianClass: "hunter" as const,
      subclass: "arc" as const,
      exoticArmorId: "no-backup-plans",
    };
    const needed = neededStatuses(
      buildSimulation(
        {
          weaponId: shotgun.id,
          catalyst: false,
          selections: [],
          effectWindows: {},
          damagePhaseSeconds: 30,
          ...hunter,
        },
        gameData,
      ).selected,
    );
    const ascension = subclassEffects.find((e) => e.id === "ascension")!;
    const ratio =
      damageOf(
        run(
          {
            ...hunter,
            selections: [{ effectId: "ascension", provider: "subclass" }],
          },
          shotgun,
        ),
        "weapon",
      ) / damageOf(run(hunter, shotgun), "weapon");
    note(
      "No Backup Plans: Ascension angeboten, Shotgun mit / ohne",
      `${effectRelevantTo(ascension, shotgun, needed)}, ×${fmt(ratio)}`,
      "true, ×1,35",
    );
    expect(effectRelevantTo(ascension, shotgun, needed)).toBe(true);
    expect(ratio).toBeCloseTo(1.35, 2);
  });
});

describe("supers take time like in the game", () => {
  const superRun = (
    guardianClass: Build["guardianClass"],
    subclass: Build["subclass"],
    abilityId: string,
  ) =>
    run({ guardianClass, subclass, abilities: [{ abilityId, castsMs: [0] }] });
  const hits = (r: SimulationResult) =>
    r.damageInstances
      .filter((d) => d.damageSource === "super")
      .map((d) => d.timeMs);

  it("Golden Gun Marksman: three shots, the ignition comes with the last one", () => {
    const r = superRun("hunter", "solar", "golden-gun-marksman");
    const shots = [...new Set(hits(r))];
    const ignition = r.damageInstances.find(isIgnition);
    const window = r.superWindows[0];
    note(
      "Golden Gun Marksman: Schüsse, Ignition, Fenster",
      `${shots.join(" / ")} ms, Ignition ${ignition?.timeMs} ms, Fenster ${window.endMs} ms`,
      "3 Schüsse in gut 2 s, Ignition beim 3. Schuss, Fenster 3,23 s (Flat Gain „Cast Time / Lock“)",
    );
    expect(shots).toHaveLength(3);
    expect(ignition?.timeMs).toBe(shots[2]);
    expect(window.endMs).toBe(3230);
  });

  it("Daybreak ignites during the super: x50 Scorch per projectile", () => {
    const r = run(
      {
        guardianClass: "warlock",
        subclass: "solar",
        abilities: [{ abilityId: "daybreak", castsMs: [0] }],
      },
      testWeapon,
    );
    const ignitions = r.damageInstances.filter(isIgnition);
    const end = r.superWindows[0].endMs;
    note(
      "Daybreak: Ignitions während der Super",
      `${ignitions.filter((d) => d.timeMs <= end).length}`,
      "4 bis 5 (15 Geschosse × 50 Scorch in 9,55 s, Abklingzeit 1,3 s)",
    );
    expect(
      ignitions.filter((d) => d.timeMs <= end).length,
    ).toBeGreaterThanOrEqual(4);
  });

  it("Daybreak: light attacks spread over the super, the weapon waits far less than 24 s", () => {
    const r = superRun("warlock", "solar", "daybreak");
    const window = r.superWindows[0];
    note(
      "Daybreak: Treffer, Fenster",
      `${new Set(hits(r)).size} Treffer, Fenster ${window.endMs} ms`,
      "etwa 15 Treffer, 9,55 s (Flat Gain „Cast Time / Lock“, K2; vorher Gemini 13 s)",
    );
    expect(new Set(hits(r)).size).toBeGreaterThan(10);
    expect(window.endMs).toBe(9550);
  });

  it("Thundercrash from Compendium parts: aftershocks follow the explosion for 4 s, about Aegis' value", () => {
    const r = superRun("titan", "arc", "thundercrash");
    const times = [...new Set(hits(r))];
    const total = damageOf(r, "super");
    note(
      "Thundercrash: Treffer, Summe",
      `${times.join(" / ")} ms, ${Math.round(total)}`,
      "Einschlag, dann 4 Aftershocks im Sekundentakt; Aegis 10 136 (±15 %)",
    );
    expect(times).toHaveLength(5);
    expect(times[4] - times[0]).toBeGreaterThanOrEqual(3500);
    expect(total / 10136).toBeGreaterThan(0.85);
  });

  it("Glacial Quake: heavy slams over the Flat Gain window, Aegis' value without buffs (Q2)", () => {
    const r = superRun("titan", "stasis", "glacial-quake");
    const total = damageOf(r, "super");
    note(
      "Glacial Quake: Treffer, Fenster, Summe",
      `${new Set(hits(r)).size} Treffer, Fenster ${r.superWindows[0].endMs} ms, ${Math.round(total)}`,
      "15 Treffer, 15,72 s (Flat Gain), Aegis „heavy attacks“ 44 790; Testing: Punch 681 + 9 Kristalle × 646 = 6495 je Slam, 5 bis 7 Slams",
    );
    expect(new Set(hits(r)).size).toBe(15);
    expect(r.superWindows[0].endMs).toBe(15720);
    expect(total / 44790).toBeCloseTo(1, 2);
    expect(total).toBeGreaterThan(5 * 6495);
    expect(total).toBeLessThan(7 * 6495);
  });

  it("Bladefury: Aegis' Feast of Light row without the Feast factor Aegis measures on Glacial Quake (Q2)", () => {
    const r = superRun("titan", "strand", "bladefury");
    const total = damageOf(r, "super");
    // second way: the Banner of War row without Biotic Enhancements (×1.405 on Glacial Quake)
    const viaBiotic = 20713.913 / (62925 / 44790);
    note(
      "Bladefury: Treffer, Fenster, Summe",
      `${new Set(hits(r)).size} Treffer, Fenster ${r.superWindows[0].endMs} ms, ${Math.round(total)}`,
      `30 Treffer, 11,1 s (Flat Gain); 20 208 ÷ 1,431 = 14 121; Gegenprobe über Biotic ${Math.round(viaBiotic)} (±10 %); Testing: 12 Light × 568 = 6816 darunter`,
    );
    expect(new Set(hits(r)).size).toBe(30);
    expect(r.superWindows[0].endMs).toBe(11100);
    expect(total).toBeCloseTo(20207.826 / (64095 / 44790), 0);
    expect(Math.abs(total / viaBiotic - 1)).toBeLessThan(0.1);
    expect(total).toBeGreaterThan(12 * 568);
  });

  it("Song of Flame: snap spam over the Flat Gain window, Aegis' value without buffs (Q2)", () => {
    const r = superRun("warlock", "solar", "song-of-flame");
    // the weapon (One Thousand Voices) ignites after the window
    const ignitions = r.damageInstances.filter(
      (d) => isIgnition(d) && d.timeMs < r.superWindows[0].endMs,
    );
    const total = damageOf(r, "super");
    const snaps = new Set(hits(r)).size;
    const snap = 176 + 676; // Aegis Testing, base column
    note(
      "Song of Flame: Snaps, eigene Ignitions, Fenster, Summe",
      `${snaps} Snaps, ${ignitions.length}, Fenster ${r.superWindows[0].endMs} ms, ${Math.round(total)}`,
      "7 Snaps à 852 (Testing) + je eine Ignition à 1553 im Paket = 16 835, Aegis „snap spam“ 16 658; keine zweite Ignition obendrauf; 12,53 s (Flat Gain)",
    );
    expect(snaps).toBe(7);
    expect(ignitions).toHaveLength(0);
    expect(r.superWindows[0].endMs).toBe(12530);
    expect(total / 16658).toBeCloseTo(1, 2);
    expect(Math.abs((snaps * (snap + 1553)) / 16658 - 1)).toBeLessThan(0.05);
  });

  it("Nova Bomb: the bomb needs its cast before it hits", () => {
    const r = superRun("warlock", "void", "nova-bomb-cataclysm");
    note(
      "Nova Bomb: Treffer, Fenster",
      `${hits(r)[0]} ms, Fenster ${r.superWindows[0].endMs} ms`,
      "Treffer nach etwa 1,3 s, Fenster 1,52 s (Flat Gain „Cast Time / Lock“)",
    );
    expect(hits(r)[0]).toBeGreaterThan(1000);
    expect(r.superWindows[0].endMs).toBe(1520);
  });

  it("Nova Warp and Arc Staff keep the weapon away as long as Flat Gain measures (K2)", () => {
    const warp = superRun("warlock", "void", "nova-warp").superWindows[0].endMs;
    const staff = superRun("hunter", "arc", "arc-staff").superWindows[0].endMs;
    note(
      "Super-Fenster Nova Warp / Arc Staff",
      `${fmt(warp / 1000)} s / ${fmt(staff / 1000)} s`,
      "25,00 s / 16,80 s (Flat Gain „Cast Time / Lock“; vorher Gemini 14,5 s / 9,5 s)",
    );
    expect(warp).toBe(25_000);
    expect(staff).toBe(16_800);
  });
});
