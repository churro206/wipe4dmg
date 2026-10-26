import type { ComponentProps } from "react";
import type { AbilityKind, Effect, Weapon } from "../../data/schema";
import { addCast, removeCast, setCast } from "../../engine/buildAbilities";
import type { EffectWindow } from "../../engine/effectWindows";
import type { SimulationResult } from "../../engine/simulate";
import { MS_PER_SECOND } from "../../engine/units";
import { defaultWindow, type WindowInput } from "../buildState";
import { RotationTimeline } from "../Charts";
import { iconUrl } from "../data";
import { effectIconKey } from "../describe";
import { AbilityCastEditor } from "./AbilityCastEditor";
import { RotationEditor } from "./RotationEditor";

/** Rotation tab: the timeline of the phase and the editors for effect windows and ability casts. */
export function RotationTab({
  weapon,
  result,
  selected,
  ownSelected,
  windows,
  castRows,
  windowInputs,
  damagePhaseSeconds,
  onWindowChange,
  onUpdateCasts,
}: {
  weapon: Weapon;
  result: SimulationResult;
  selected: Effect[];
  ownSelected: Effect[];
  windows: EffectWindow[];
  castRows: ComponentProps<typeof AbilityCastEditor>["rows"];
  windowInputs: Record<string, WindowInput>;
  damagePhaseSeconds: number;
  onWindowChange: (effect: Effect, patch: Partial<WindowInput>) => void;
  onUpdateCasts: (
    kind: AbilityKind,
    change: (castsMs: number[]) => number[],
  ) => void;
}) {
  return (
    <>
      <RotationTimeline
        rows={selected.flatMap((effect) => {
          const own = windows.filter((w) => w.effectId === effect.id);
          if (own.length === 0) return [];
          return [
            {
              windows: own,
              // a grant names its ability, e.g. "Radiant (Lightweight Knife)"
              label: effect.id.includes("@") ? effect.name : effect.shortName,
              iconUrl: iconUrl(effectIconKey(effect, weapon.element)),
            },
          ];
        })}
        abilityRows={castRows.map(({ ability, actualMs }) => ({
          label: ability.name,
          iconUrl: iconUrl(`ability:${ability.id}`),
          kind: ability.kind,
          castsMs: actualMs,
          windows: result.superWindows.filter((w) => w.abilityId === ability.id),
        }))}
        shotsMs={result.shots.map((s) => s.timeMs)}
        ignitionsMs={result.damageInstances
          .filter((d) => d.id === "ignition")
          .map((d) => d.timeMs)}
        damagePhaseSeconds={damagePhaseSeconds}
      />
      <RotationEditor
        weaponElement={weapon.element}
        effects={ownSelected}
        windowInputOf={(effect) =>
          windowInputs[effect.id] ?? defaultWindow(effect)
        }
        uptimeOf={(effect) =>
          windows
            .filter((w) => w.effectId === effect.id)
            .reduce<number | undefined>(
              (sum, w) => (sum ?? 0) + w.uptime,
              undefined,
            )
        }
        onChange={onWindowChange}
      />
      <AbilityCastEditor
        rows={castRows}
        onChange={(ability, index, value) =>
          onUpdateCasts(ability.kind, (casts) =>
            setCast(
              casts,
              index,
              value * MS_PER_SECOND,
              damagePhaseSeconds * MS_PER_SECOND,
            ),
          )
        }
        onAdd={(ability, atMs) =>
          onUpdateCasts(ability.kind, (casts) => addCast(casts, atMs))
        }
        onRemove={(ability, index) =>
          onUpdateCasts(ability.kind, (casts) => removeCast(casts, index))
        }
      />
    </>
  );
}
