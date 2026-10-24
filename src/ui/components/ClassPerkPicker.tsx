import { useId } from "react";
import type { ExoticArmorEntry } from "../../data/schema";
import { Icon } from "./Icon";

const MAX_PERKS = 2;

/**
 * The two Spirit perks of the Prismatic Exotic Class Item as tiles (ADR 0015, U6-3). A third pick
 * replaces the oldest one. The class item is the build's exotic, so the parent drops the exotic piece.
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
  const toggle = (id: string) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id].slice(-MAX_PERKS),
    );
  return (
    <div className="tile-grid" role="group" aria-label="Exotic Class Item perks">
      {entries.map((entry) => (
        <PerkTile
          key={entry.id}
          entry={entry}
          pressed={selectedIds.includes(entry.id)}
          lines={describe(entry)}
          onClick={() => toggle(entry.id)}
        />
      ))}
    </div>
  );
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
