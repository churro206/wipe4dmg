// Entry of the simulator (ADR 0018, I2): there is one simulator, the core in core/. Timing model and
// mechanics are described there (simulateCore.ts, weaponActor.ts, ADR 0001, ADR 0017).

export { simulate } from "./core/simulateCore";
export {
  abilityHitEvents,
  EVENT_GROUP,
  periodicEvents,
  superWindowsOf,
} from "./core/castEvents";
export type {
  AbilityCast,
  AbilityStatValue,
  Shot,
  SimulationOptions,
  SimulationResult,
  SuperWindow,
  TimedDamageInstance,
} from "./core/types";
