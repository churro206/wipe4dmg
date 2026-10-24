import { useId } from "react";
import type { ExoticArmorEntry } from "../../data/schema";
import { Icon } from "./Icon";

const COLUMNS = [1, 2] as const;

/**
 * The two Spirit perks of the Prismatic Exotic Class Item as tiles (ADR 0015, U6-3), one row per
 * column of the class item. A pick replaces the perk of its column. The class item is the build's
 * exotic, so the parent drops the exotic piece.
 */
export function ClassPerkPicker({
  entries,
  selectedIds,
  describe,
  onChange,
}: {
  entries: ExoticArmorEntry[]; // selectable perks of the class
  selectedIds: string[];
  describe: (entry: ExoticArmorEntry) => string[];
  onChange: (classPerkIds: string[]) => void;
}) {
  const columnOf = (id: string) => entries.find((e) => e.id === id)?.column;
  const toggle = (entry: ExoticArmorEntry) =>
    onChange(
      selectedIds.includes(entry.id)
        ? selectedIds.filter((s) => s !== entry.id)
        : [...selectedIds.filter((s) => columnOf(s) !== entry.column), entry.id],
    );
  return COLUMNS.map((column) => {
    const inColumn = entries.filter((e) => e.column === column);
    if (inColumn.length === 0) return null;
    return (
      <div
        key={column}
        className="tile-grid"
        role="group"
        aria-label={`Exotic Class Item perks, column ${column}`}
      >
        {inColumn.map((entry) => (
          <PerkTile
            key={entry.id}
            entry={entry}
            pressed={selectedIds.includes(entry.id)}
            lines={describe(entry)}
            onClick={() => toggle(entry)}
          />
        ))}
      </div>
    );
  });
}

function PerkTile({
  entry,
  pressed,
  lines,
  onClick,
}: {
  entry: ExoticArmorEntry;
  pressed: boolean;
  lines: string[];
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
        <Icon iconKey={`armor:${entry.id}`} label={entry.name} />
        <span className="tile-label">
          {entry.name.replace(/^Spirit of (the )?/, "")}
        </span>
      </button>
      <span role="tooltip" id={cardId} className="hover-card">
        <strong>{entry.name}</strong>
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </span>
    </span>
  );
}
