import { useId } from "react";
import type { Artifact, ArtifactData, Effect, Element } from "../../data/schema";
import { freeSlots, perksOfTier, slotsOfTier } from "../../engine/artifacts";
import { EffectPicker } from "./EffectPicker";
import { Icon } from "./Icon";

// The screen of the game shows the top row (three diamonds) first.
const TIERS_TOP_DOWN = [3, 2, 1] as const;

/**
 * The seasonal artifact: a tile per artifact, and for the chosen one its perks per tier with the
 * slots left, as in the game (two slots for one diamond, three for two, two for three). Only perks
 * that change damage are listed; the other slots can hold the perks that do not. A tier without a
 * free slot disables its remaining tiles.
 */
export function ArtifactPicker({
  data,
  artifactId,
  effects,
  selectedEffectIds,
  weaponElement,
  onChoose,
  onToggle,
}: {
  data: ArtifactData;
  artifactId: string | undefined;
  effects: Effect[]; // the effects to show, e.g. without those that do nothing for the weapon
  selectedEffectIds: string[]; // the artifact perks that are on
  weaponElement: Element;
  onChoose: (artifactId: string | undefined) => void;
  onToggle: (effect: Effect) => void;
}) {
  const artifact = data.artifacts.find((a) => a.id === artifactId);
  const free: Record<number, number> = artifact
    ? freeSlots(data, artifact, selectedEffectIds)
    : {};
  return (
    <>
      <div className="tile-grid" role="group" aria-label="Artifact">
        {data.artifacts.map((entry) => (
          <ArtifactTile
            key={entry.id}
            artifact={entry}
            pressed={entry.id === artifactId}
            onClick={() => onChoose(entry.id === artifactId ? undefined : entry.id)}
          />
        ))}
      </div>
      {artifact &&
        TIERS_TOP_DOWN.map((tier) => {
          const shown = perksOfTier(artifact, tier).flatMap((perk) =>
            effects.filter((e) => e.id === perk.effectId),
          );
          if (shown.length === 0) return null;
          const slots = slotsOfTier(data, tier);
          return (
            <div key={tier}>
              <h3 className="sub">
                {"◆".repeat(tier)} {slots - free[tier]}/{slots} slots
              </h3>
              <EffectPicker
                weaponElement={weaponElement}
                effects={shown}
                provider="artifact"
                isSelected={(effect) => selectedEffectIds.includes(effect.id)}
                isDisabled={() => free[tier] <= 0}
                onToggle={onToggle}
              />
            </div>
          );
        })}
    </>
  );
}

function ArtifactTile({
  artifact,
  pressed,
  onClick,
}: {
  artifact: Artifact;
  pressed: boolean;
  onClick: () => void;
}) {
  const cardId = useId();
  return (
    <span className="tile-wrap">
      <button
        type="button"
        className="tile"
        aria-pressed={pressed}
        aria-describedby={cardId}
        onClick={onClick}
      >
        <Icon iconKey={`artifact:${artifact.id}`} label={artifact.name} />
        <span className="tile-label">{artifact.name}</span>
      </button>
      <span role="tooltip" id={cardId} className="hover-card">
        <strong>{artifact.name}</strong>
        <span>Season: {artifact.season}</span>
        <span>
          Perks that change damage: {artifact.perks.map((p) => p.name).join(", ")}
        </span>
      </span>
    </span>
  );
}
