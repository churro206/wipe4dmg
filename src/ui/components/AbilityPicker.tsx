import { useId, useRef } from "react";
import type {
  Ability,
  AbilityKind,
  Effect,
} from "../../data/schema";
import { describeAbility } from "../describe";
import { Icon } from "./Icon";
import { useDismiss } from "./useDismiss";

export type AbilitySlot = {
  kind: AbilityKind;
  label: string; // e.g. "Super"
  options: Ability[]; // abilities of class and subclass
  selected: Ability | undefined;
};

/**
 * Slots like the subclass screen in the game: the super in a row of its own, then grenade, melee
 * and class ability. Their stats are in the stats block (StatSliders).
 * A click on a slot opens the icon grid of the abilities that fit class and subclass.
 */
export function AbilityPicker({
  slots,
  openKind,
  effects,
  onOpen,
  onSelect,
}: {
  slots: AbilitySlot[];
  openKind: AbilityKind | null;
  effects: Effect[];
  onOpen: (kind: AbilityKind | null) => void;
  onSelect: (kind: AbilityKind, abilityId: string | null) => void;
}) {
  const open = slots.find((slot) => slot.kind === openKind);
  const rootRef = useRef<HTMLDivElement>(null);
  useDismiss([rootRef], open !== undefined, () => onOpen(null));
  return (
    <div ref={rootRef} className="abilities">
      <div className="ability-slots">
        {slots.map((slot) => (
          <div key={slot.kind} className="ability-slot">
            <AbilityTile
              ability={slot.selected}
              label={slot.label}
              pressed={slot.kind === openKind}
              lines={
                slot.selected ? describeAbility(slot.selected, effects) : []
              }
              onClick={() => onOpen(slot.kind === openKind ? null : slot.kind)}
              ariaExpanded={slot.kind === openKind}
            />
          </div>
        ))}
      </div>
      {open && (
        <div
          className="tile-grid ability-options"
          aria-label={`Choose ${open.label}`}
        >
          <span className="tile-wrap">
            <button
              type="button"
              className="tile"
              aria-pressed={!open.selected}
              onClick={() => onSelect(open.kind, null)}
            >
              <span
                className="icon ability-none"
                style={{ width: 40, height: 40 }}
              >
                –
              </span>
              <span className="tile-label">none</span>
            </button>
          </span>
          {open.options.map((ability) => (
            <AbilityTile
              key={ability.id}
              ability={ability}
              label={ability.name}
              pressed={open.selected?.id === ability.id}
              lines={describeAbility(ability, effects)}
              onClick={() => onSelect(open.kind, ability.id)}
            />
          ))}
          {open.options.length === 0 && (
            <p className="note">
              Nothing for this subclass in the calculator yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function AbilityTile({
  ability,
  label,
  pressed,
  lines,
  source,
  onClick,
  ariaExpanded,
}: {
  ability: Ability | undefined;
  label: string;
  pressed: boolean;
  lines: string[];
  source?: string;
  onClick: () => void;
  ariaExpanded?: boolean;
}) {
  const cardId = useId();
  return (
    <span className="tile-wrap">
      <button
        type="button"
        className="tile"
        aria-pressed={ariaExpanded === undefined ? pressed : undefined}
        aria-expanded={ariaExpanded}
        aria-describedby={ability ? cardId : undefined}
        onClick={onClick}
      >
        {ability ? (
          <Icon iconKey={`ability:${ability.id}`} label={ability.name} />
        ) : (
          <span className="icon ability-none" style={{ width: 40, height: 40 }}>
            +
          </span>
        )}
        <span className="tile-label">
          {ariaExpanded === undefined
            ? label
            : `${label}: ${ability?.name ?? "none"}`}
        </span>
      </button>
      {ability && (
        <span role="tooltip" id={cardId} className="hover-card">
          <strong>{ability.name}</strong>
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
          {source && <span className="hover-card-sources">{source}</span>}
        </span>
      )}
    </span>
  );
}
