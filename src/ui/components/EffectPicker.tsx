import { useId } from "react";
import type { Effect, ProviderKind } from "../../data/schema";
import {
  describeDuration,
  describeEffect,
  describeSources,
  GROUP_LABELS,
} from "../describe";
import { Icon } from "./Icon";

/**
 * Effects of one provider as icon tiles (like DIM or light.gg). A tile is a toggle button; the
 * hover card shows name, effect, duration and sources.
 */
export function EffectPicker({
  effects,
  provider,
  isSelected,
  onToggle,
}: {
  effects: Effect[];
  provider: ProviderKind;
  isSelected: (effect: Effect) => boolean;
  onToggle: (effect: Effect) => void;
}) {
  return (
    <div className="tile-grid">
      {effects.map((effect) => (
        <EffectTile
          key={effect.id}
          effect={effect}
          provider={provider}
          selected={isSelected(effect)}
          onToggle={() => onToggle(effect)}
        />
      ))}
    </div>
  );
}

function EffectTile({
  effect,
  provider,
  selected,
  onToggle,
}: {
  effect: Effect;
  provider: ProviderKind;
  selected: boolean;
  onToggle: () => void;
}) {
  const cardId = useId();
  const group =
    provider !== "fireteamSupport" && effect.exclusiveGroup
      ? (GROUP_LABELS[effect.exclusiveGroup] ?? effect.exclusiveGroup)
      : undefined;
  return (
    <span className="tile-wrap">
      <button
        type="button"
        className="tile"
        aria-pressed={selected}
        aria-describedby={cardId}
        onClick={onToggle}
      >
        <Icon iconKey={`effect:${effect.id}`} label={effect.shortName} />
        <span className="tile-label">{effect.shortName}</span>
      </button>
      <span role="tooltip" id={cardId} className="hover-card">
        <strong>{effect.name}</strong>
        <span>{describeEffect(effect)}</span>
        <span>Dauer: {describeDuration(effect)}</span>
        {group && <span>Pro Build nur {group}</span>}
        <span className="hover-card-sources">
          {describeSources(effect).join(" · ")}
        </span>
      </span>
    </span>
  );
}
