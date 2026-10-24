// Ability energy (block 3, "Energie einfach"): when the casts of the rotation are possible. Each
// ability starts the damage phase with full charges and regenerates from its cooldown, sped up by its
// stat and the modifiers of the build (ability-energy.json). A cast without energy moves to the time
// the energy is back; a cast after the end of the damage phase is dropped. The rotation still sets the
// casts, the energy only gives the earliest time.

import type {
  Ability,
  Build,
  EnergyAbilities,
  EnergyData,
  EnergyModifier,
} from "../data/schema";

// Resolution of the energy timeline; a technical step, not a game value.
const STEP_MS = 10;
const MS_PER_SECOND = 1000;
const EPSILON = 1e-9;

export type EnergyContext = {
  data: EnergyData;
  stats?: Build["abilityStats"]; // omitted: the stat with the full effect (100)
  exoticArmorId?: string;
  effectIds: Set<string>; // selected effects and effects the abilities grant
  damagePhaseMs: number;
};

export type CastRequest = { ability: Ability; castsMs: number[] };

const baseId = (ability: Ability) => ability.variantOf ?? ability.id;

const matches = (abilities: EnergyAbilities, ability: Ability) =>
  abilities.kinds.includes(ability.kind) &&
  (!abilities.abilityIds || abilities.abilityIds.includes(baseId(ability))) &&
  (!abilities.elements || abilities.elements.includes(ability.element));

/** Modifiers of the build: from its exotic, its effects or its abilities, with their conditions. */
function activeModifiers(requests: CastRequest[], ctx: EnergyContext): EnergyModifier[] {
  const abilityIds = new Set(requests.map((r) => baseId(r.ability)));
  return ctx.data.modifiers.filter((m) => {
    const from =
      "exoticArmorId" in m.from
        ? m.from.exoticArmorId === ctx.exoticArmorId
        : "effectId" in m.from
          ? ctx.effectIds.has(m.from.effectId)
          : abilityIds.has(m.from.abilityId);
    return (
      from &&
      m.value.value !== null &&
      (!m.requiresAnyEffectIds || m.requiresAnyEffectIds.some((id) => ctx.effectIds.has(id)))
    );
  });
}

type State = {
  ability: Ability;
  pending: number[]; // requested casts, sorted
  done: number[];
  cooldownMs: number;
  charges: number;
  energy: number; // in charges
  readyAt: number; // since when one charge is full; Infinity while empty
  regen: number; // stat factor plus passive additional base rates
  speed: number; // regeneration speed factor
  gainFactor: number; // chunk scalar times stat gain factor, for gains that are not fixed
  weaponRatePerMs: number;
  windows: { untilMs: number; value: number }[]; // regen bonuses after a trigger
};

function initialState(
  request: CastRequest,
  modifiers: EnergyModifier[],
  ctx: EnergyContext,
): State | undefined {
  const { ability } = request;
  const energy = ctx.data.abilities.find((a) => a.abilityId === baseId(ability));
  const cooldownSeconds = energy?.cooldownSeconds.value;
  if (!cooldownSeconds) return undefined; // unknown cooldown: the rotation decides alone
  // no stat for class abilities: their cooldown is the base cooldown (U7)
  const stat = ctx.data.stats.find((s) => s.kind === ability.kind);
  const share = stat
    ? Math.min(ctx.stats?.[stat.kind] ?? stat.fullAtStat, stat.fullAtStat) / stat.fullAtStat
    : 0;
  const regenAtFull = stat?.regenAtFullStat.value ?? 1;
  const gainBonus = stat?.gainBonusAtFullStat.value ?? 0;
  const gainFactor = (energy.chunkScalar?.value ?? 1) * (1 + gainBonus * share);
  const own = modifiers.filter((m) => matches(m.target, ability));
  const passive = (change: EnergyModifier["change"]) =>
    own.filter((m) => m.change === change && !m.trigger).map((m) => m.value.value!);
  const charges = 1 + passive("charges").reduce((a, b) => a + b, 0);
  return {
    ability,
    pending: [...request.castsMs].sort((a, b) => a - b),
    done: [],
    cooldownMs: cooldownSeconds * MS_PER_SECOND,
    charges,
    energy: charges,
    readyAt: 0,
    regen: 1 + (regenAtFull - 1) * share + passive("regenBase").reduce((a, b) => a + b, 0),
    speed: passive("regenSpeed").reduce((a, b) => a * b, 1),
    gainFactor,
    weaponRatePerMs: own
      .filter((m) => m.change === "energy" && m.trigger?.on === "weaponHit")
      .reduce(
        (sum, m) =>
          sum +
          (m.value.value! * (m.fixed ? 1 : gainFactor)) /
            ((m.trigger as { cooldownSeconds: number }).cooldownSeconds * MS_PER_SECOND),
        0,
      ),
    windows: [],
  };
}

function gain(state: State, amount: number, atMs: number) {
  const before = state.energy;
  state.energy = Math.min(state.charges, state.energy + amount);
  if (before < 1 - EPSILON && state.energy >= 1 - EPSILON) state.readyAt = atMs;
}

function regenerate(state: State, fromMs: number) {
  const bonus = state.windows
    .filter((w) => w.untilMs > fromMs)
    .reduce((sum, w) => sum + w.value, 0);
  const rate = ((state.regen + bonus) * state.speed) / state.cooldownMs + state.weaponRatePerMs;
  const before = state.energy;
  state.energy = Math.min(state.charges, before + rate * STEP_MS);
  if (before < 1 - EPSILON && state.energy >= 1 - EPSILON)
    state.readyAt = fromMs + (1 - before) / rate;
}

function cast(state: State, atMs: number, states: State[], modifiers: EnergyModifier[]) {
  state.done.push(atMs);
  state.energy -= 1;
  state.readyAt = state.energy >= 1 - EPSILON ? atMs : Infinity;
  for (const m of modifiers) {
    if (m.trigger?.on !== "cast" || !matches(m.trigger.abilities, state.ability)) continue;
    for (const target of states.filter((s) => matches(m.target, s.ability))) {
      if (m.change === "energy")
        gain(target, m.value.value! * (m.fixed ? 1 : target.gainFactor), atMs);
      else if (m.change === "regenBase" && m.trigger.durationSeconds)
        target.windows.push({
          untilMs: atMs + m.trigger.durationSeconds * MS_PER_SECOND,
          value: m.value.value!,
        });
    }
  }
}

/** The casts the energy allows: each one at its requested time or as soon as a charge is full. */
export function energyCasts(requests: CastRequest[], ctx: EnergyContext): CastRequest[] {
  const modifiers = activeModifiers(requests, ctx);
  const states = requests.map((r) => initialState(r, modifiers, ctx));
  const tracked = states.filter((s): s is State => s !== undefined);
  for (let t = 0; t <= ctx.damagePhaseMs; t += STEP_MS) {
    for (const state of tracked) {
      while (
        state.pending.length > 0 &&
        state.pending[0] <= t &&
        state.energy >= 1 - EPSILON
      ) {
        const atMs = Math.min(Math.max(state.pending.shift()!, state.readyAt), ctx.damagePhaseMs);
        cast(state, atMs, tracked, modifiers);
      }
    }
    for (const state of tracked) regenerate(state, t);
  }
  return requests.map((request, i) => {
    const state = states[i];
    return state ? { ability: request.ability, castsMs: state.done } : request;
  });
}

/**
 * Earliest time of one more cast of the ability; undefined if it is not possible in the phase.
 * `settle` moves the casts further after the energy, e.g. behind the cast times.
 */
export function nextCastMs(
  requests: CastRequest[],
  ability: Ability,
  ctx: EnergyContext,
  settle: (casts: CastRequest[]) => CastRequest[] = (casts) => casts,
): number | undefined {
  const index = requests.findIndex((r) => r.ability.id === ability.id);
  const castsMs = requests[index]?.castsMs ?? [];
  const lastMs = castsMs.length > 0 ? Math.max(...castsMs) : 0;
  const withOneMore = requests.map((r, i) =>
    i === index ? { ...r, castsMs: [...r.castsMs, lastMs] } : r,
  );
  if (index < 0) withOneMore.push({ ability, castsMs: [lastMs] });
  const result = settle(energyCasts(withOneMore, ctx)).find((r) => r.ability.id === ability.id)!;
  return result.castsMs.length > castsMs.length ? Math.max(...result.castsMs) : undefined;
}
