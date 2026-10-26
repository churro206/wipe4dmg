import type { ComponentProps } from "react";
import type { AbilityKind, Effect, Weapon } from "../../data/schema";
import { addCast, removeCast, setCast } from "../../engine/buildAbilities";
import type { EffectWindow } from "../../engine/effectWindows";
import type { SimulationResult } from "../../engine/simulate";
import { MS_PER_SECOND } from "../../engine/units";
import { defaultWindow, type WindowInput } from "../buildState";
import { RotationTimeline } from "../Charts";
import { iconUrl, keywords } from "../data";
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
  castRows: (ComponentProps<typeof AbilityCastEditor>["rows"][number] & {
    castMs?: number; // time a cast keeps the player busy; a super uses its window
  })[];
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
        abilityRows={castRows.map(({ ability, actualMs, castMs }) => ({
          label: ability.name,
          iconUrl: iconUrl(`ability:${ability.id}`),
          kind: ability.kind,
          castsMs: actualMs,
          // a super blocks the weapon for its window, other abilities for their cast time
          windows:
            ability.kind === "super"
              ? result.superWindows.filter((w) => w.abilityId === ability.id)
              : actualMs.map((startMs) => ({
                  startMs,
                  endMs: startMs + (castMs ?? 0),
                  exact: false,
                })),
        }))}
        shotsMs={result.shots.map((s) => s.timeMs)}
        procRows={keywords.flatMap((keyword) => {
          const timesMs = result.damageInstances
            .filter((d) => d.keywordId === keyword.id)
            .map((d) => d.timeMs);
          return timesMs.length === 0
            ? []
            : [
                {
                  label: `${keyword.name} procs`,
                  color: `var(--element-${keyword.element})`,
                  timesMs,
                },
              ];
        })}
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
