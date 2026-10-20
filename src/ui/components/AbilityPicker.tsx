import { useId } from "react";
import type {
  Ability,
  AbilityKind,
  AegisAbilityRow,
  Effect,
} from "../../data/schema";
import { describeAbility, describeAbilitySource } from "../describe";
import { Icon } from "./Icon";

export type AbilitySlot = {
  kind: AbilityKind;
  label: string; // e.g. "Super"
  options: Ability[]; // abilities of class and subclass
  selected: Ability | undefined;
};

/**
 * Three slots like the subclass screen in the game: super, grenade and melee. Their stats are in
 * the stats block (StatSliders).
 * A click on a slot opens the icon grid of the abilities that fit class and subclass.
 */
export function AbilityPicker({
  slots,
  openKind,
  aegisRows,
  effects,
  onOpen,
  onSelect,
}: {
  slots: AbilitySlot[];
  openKind: AbilityKind | null;
  aegisRows: AegisAbilityRow[];
  effects: Effect[];
  onOpen: (kind: AbilityKind | null) => void;
  onSelect: (kind: AbilityKind, abilityId: string | null) => void;
}) {
  const open = slots.find((slot) => slot.kind === openKind);
  const rowOf = (ability: Ability) =>
    aegisRows.find((row) => row.id === ability.aegisRowId);
  return (
    <div className="abilities">
      <div className="ability-slots">
        {slots.map((slot) => (
          <div key={slot.kind} className="ability-slot">
            <AbilityTile
              ability={slot.selected}
              label={slot.label}
              pressed={slot.kind === openKind}
              lines={
                slot.selected
                  ? describeAbility(
                      slot.selected,
                      rowOf(slot.selected),
                      effects,
                    )
                  : []
              }
              source={slot.selected && describeAbilitySource(slot.selected)}
              onClick={() => onOpen(slot.kind === openKind ? null : slot.kind)}
              ariaExpanded={slot.kind === openKind}
            />
          </div>
        ))}
      </div>
      {open && (
        <div
          className="tile-grid ability-options"
          aria-label={`${open.label} wählen`}
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
              <span className="tile-label">keine</span>
            </button>
          </span>
          {open.options.map((ability) => (
            <AbilityTile
              key={ability.id}
              ability={ability}
              label={ability.name}
              pressed={open.selected?.id === ability.id}
              lines={describeAbility(ability, rowOf(ability), effects)}
              source={describeAbilitySource(ability)}
              onClick={() => onSelect(open.kind, ability.id)}
            />
          ))}
          {open.options.length === 0 && (
            <p className="note">
              Für diese Subklasse ist noch nichts im Rechner.
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
  source: string | undefined;
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
            : `${label}: ${ability?.name ?? "keine"}`}
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
