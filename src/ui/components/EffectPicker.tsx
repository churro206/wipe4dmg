import { useId } from "react";
import type { Effect, Element, ProviderKind } from "../../data/schema";
import {
  describeDuration,
  describeEffect,
  effectIconKey,
  GROUP_LABELS,
} from "../describe";
import { tilesOf } from "../effectSections";
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
  weaponElement,
  isDisabled,
}: {
  weaponElement: Element; // surge icons follow the element of the weapon
  effects: Effect[];
  provider: ProviderKind;
  isSelected: (effect: Effect) => boolean;
  onToggle: (effect: Effect) => void;
  // A tile that cannot be switched on, e.g. an artifact perk of a full tier; a selected tile can always be switched off.
  isDisabled?: (effect: Effect) => boolean;
}) {
  return (
    <div className="tile-grid">
      {tilesOf(effects).map((tile) => {
        const selected = isSelected(tile[0]);
        return (
          <EffectTile
            key={tile[0].id}
            tile={tile}
            provider={provider}
            selected={selected}
            disabled={!selected && (isDisabled?.(tile[0]) ?? false)}
            // All effects of the item switch together.
            onToggle={() =>
              tile
                .filter((effect) => isSelected(effect) === selected)
                .forEach(onToggle)
            }
            weaponElement={weaponElement}
          />
        );
      })}
    </div>
  );
}

function EffectTile({
  tile,
  provider,
  selected,
  disabled,
  onToggle,
  weaponElement,
}: {
  tile: Effect[];
  weaponElement: Element;
  provider: ProviderKind;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const cardId = useId();
  const effect = tile[0];
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
        disabled={disabled}
        onClick={onToggle}
      >
        <Icon
          iconKey={effectIconKey(effect, weaponElement)}
          label={effect.shortName}
        />
        <span className="tile-label">{effect.shortName}</span>
      </button>
      <span role="tooltip" id={cardId} className="hover-card">
        <strong>{effect.name}</strong>
        {/* each effect of the item with its own active time below it */}
        {tile
          .flatMap((e) => [
            ...describeEffect(e),
            `Active: ${describeDuration(e)}`,
          ])
          .map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        {group && <span>Only {group} per build</span>}
      </span>
    </span>
  );
}
