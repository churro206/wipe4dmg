// Plausibility gate (plan 2026-10-22): scenarios an experienced Destiny 2 player knows, run through
// the same way as the UI (gameData, buildSimulation). Each expectation says why. A bug like
// "Cuirass changes nothing" or "an aspect is not offered" fails here.
// Table for a player's eye: npm run sanity

import { afterAll, describe, expect, it } from "vitest";
import type { Build, Weapon } from "../src/data/schema";
import { buildSimulation } from "../src/engine/buildSimulation";
import { simulate, type SimulationResult } from "../src/engine/simulate";
import { effectRelevantTo, neededStatuses } from "../src/engine/weaponInfo";
import { buckets, gameData, weaponById, weapons } from "../src/ui/data";
import rawSubclass from "../src/data/subclass-effects.json";
import { loadSubclassEffects } from "../src/engine/loadData";
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
  const { selected, options } = buildSimulation(build, gameData);
  return simulate(weapon, build.damagePhaseSeconds, selected, buckets, options);
};
const damageOf = (r: SimulationResult, source: string) =>
  r.damageInstances
    .filter((d) => d.damageSource === source)
    .reduce((s, d) => s + d.damage, 0);
const fmt = (x: number) => x.toFixed(2);

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
  it("at least 135 of 141 exotic weapons are selectable", () => {
    note("Wählbare exotische Waffen", String(weapons.length), "≥ 135 von 141");
    expect(weapons.length).toBeGreaterThanOrEqual(135);
  });

  // Catches a unit error in a source, e.g. a whole magazine or a 5-ammo projectile counted as one
  // shot (Fourth Horseman ×4, Choir of One ×5 before the overrides).
  it("rule: in 30 s every special and heavy deals 0.3 to 2.5 times Gjallarhorn, every primary at most 1×", () => {
    const gjally = run({}, weaponById("gjallarhorn")).totalDamage;
    const ratios = weapons.map(
      (w) => [w, run({}, w).totalDamage / gjally] as const,
    );
    const off = ratios
      .filter(([w, r]) =>
        w.ammo === "primary" ? r > 1 || r <= 0 : r < 0.3 || r > 2.5,
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

describe("keywords", () => {
  const ignitions = (castsMs: number[], ember: boolean) =>
    run(
      {
        guardianClass: "warlock",
        subclass: "solar",
        abilities: [{ abilityId: "fusion-grenade", castsMs }],
        selections: ember
          ? [{ effectId: "ember-of-ashes", provider: "subclass" }]
          : [],
      },
      testWeapon,
    ).damageInstances.filter((d) => d.keywordId === "ignition").length;
  it("three Fusion Grenades ignite once, with Ember of Ashes two already do", () => {
    const three = ignitions([0, 5000, 10000], false);
    const twoEmber = ignitions([0, 5000], true);
    note(
      "Ignitions: 3 Fusion / 2 Fusion mit Ember",
      `${three} / ${twoEmber}`,
      "1 / 1 (x40 bzw. x60 Scorch)",
    );
    expect(three).toBe(1);
    expect(twoEmber).toBe(1);
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
        effect.parts.length === 0 &&
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
    const ignition = r.damageInstances.find((d) => d.keywordId === "ignition");
    const window = r.superWindows[0];
    note(
      "Golden Gun Marksman: Schüsse, Ignition, Fenster",
      `${shots.join(" / ")} ms, Ignition ${ignition?.timeMs} ms, Fenster ${window.endMs} ms`,
      "3 Schüsse in gut 2 s, Ignition beim 3. Schuss",
    );
    expect(shots).toHaveLength(3);
    expect(ignition?.timeMs).toBe(shots[2]);
    expect(window.endMs).toBeLessThan(3000);
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
    const ignitions = r.damageInstances.filter(
      (d) => d.keywordId === "ignition",
    );
    const end = r.superWindows[0].endMs;
    note(
      "Daybreak: Ignitions während der Super",
      `${ignitions.filter((d) => d.timeMs <= end).length}`,
      "etwa 5 (15 Geschosse × 50 Scorch, Abklingzeit)",
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
      "etwa 15 Treffer, 12–14 s",
    );
    expect(new Set(hits(r)).size).toBeGreaterThan(10);
    expect(window.endMs).toBeLessThan(15_000);
  });

  it("Nova Bomb: the bomb needs its cast before it hits", () => {
    const r = superRun("warlock", "void", "nova-bomb-cataclysm");
    note(
      "Nova Bomb: Treffer, Fenster",
      `${hits(r)[0]} ms, Fenster ${r.superWindows[0].endMs} ms`,
      "Treffer nach etwa 1,5 s, Fenster knapp 2 s",
    );
    expect(hits(r)[0]).toBeGreaterThan(1000);
    expect(r.superWindows[0].endMs).toBeGreaterThan(1000);
  });
});
