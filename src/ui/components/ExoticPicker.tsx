import { useId, useRef, useState } from "react";
import type { ExoticArmorEntry } from "../../data/schema";
import { Icon } from "./Icon";
import { useDismiss } from "./useDismiss";

// Order of the armor screen in the game; the Spirit perks are not pieces, see ClassPerkPicker.
const SLOT_ORDER: ExoticArmorEntry["slot"][] = [
  "helmet",
  "gauntlets",
  "chest",
  "legs",
  "classItem",
];
const SLOT_LABELS: Record<ExoticArmorEntry["slot"], string> = {
  helmet: "Helmet",
  gauntlets: "Arms",
  chest: "Chest",
  legs: "Legs",
  classItem: "Class",
  classPerk: "Class Item perk",
};

/**
 * The chosen exotic armor as a tile; a click opens a list with search and a filter by slot (U8),
 * sorted like the game: slot, then alphabetical. Like the weapon picker, it renders the tile and
 * the list as two grid items of the tile grid.
 */
export function ExoticPicker({
  entries,
  selected,
  onSelect,
  classItem,
  describe,
}: {
  entries: ExoticArmorEntry[]; // selectable pieces of the class
  selected: ExoticArmorEntry | undefined;
  describe: (entry: ExoticArmorEntry) => string[]; // tooltip lines of the chosen piece
  onSelect: (exoticArmorId: string | undefined) => void;
  // The Exotic Class Item of the class (its Spirit perks are a separate picker); omitted: not offered.
  classItem?: { entry: ExoticArmorEntry; chosen: boolean; onChoose: () => void };
}) {
  const cardId = useId();
  const [open, setOpen] = useState(false);
  const tileRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useDismiss([tileRef, listRef], open, () => setOpen(false));
  const [query, setQuery] = useState("");
  const [slot, setSlot] = useState<ExoticArmorEntry["slot"] | "all">("all");
  const pieces = [...entries, ...(classItem ? [classItem.entry] : [])].sort(
    (a, b) =>
      SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot) ||
      a.name.localeCompare(b.name),
  );
  const slots = SLOT_ORDER.filter((s) => pieces.some((e) => e.slot === s));
  const needle = query.trim().toLowerCase();
  const shown = pieces.filter(
    (e) =>
      (slot === "all" || e.slot === slot) &&
      e.name.toLowerCase().includes(needle),
  );
  const isClassItem = (e: ExoticArmorEntry) => e.id === classItem?.entry.id;
  const classItemChosen = classItem?.chosen === true && selected === undefined;
  const worn = classItemChosen ? classItem?.entry : selected;
  const choose = (entry: ExoticArmorEntry | undefined) => {
    if (entry && isClassItem(entry)) classItem?.onChoose();
    else onSelect(entry?.id);
    setOpen(false);
  };

  return (
    <>
      <span ref={tileRef} className="tile-wrap weapon-wrap">
        <button
          type="button"
          className="tile weapon-tile"
          aria-describedby={worn ? cardId : undefined}
          aria-expanded={open}
          onClick={() => setOpen((on) => !on)}
        >
          {worn ? (
            <Icon iconKey={`armor:${worn.id}`} label={worn.name} />
          ) : (
            <span className="icon ability-none" style={{ width: 40, height: 40 }}>
              –
            </span>
          )}
          <span className="tile-label">
            {worn?.name ?? "No exotic"}
            <span className="tile-sub">
              {worn ? `${SLOT_LABELS[worn.slot]} · ` : ""}change
            </span>
          </span>
        </button>
        {worn && (
          <span role="tooltip" id={cardId} className="hover-card">
            <strong>{worn.name}</strong>
            <span>{SLOT_LABELS[worn.slot]}</span>
            {(classItemChosen
              ? ["Choose its two Spirit perks below."]
              : describe(worn)
            ).map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
        )}
      </span>
      {open && (
        <div
          ref={listRef}
          className="weapon-picker"
          role="group"
          aria-label="Choose exotic"
        >
          <input
            type="search"
            placeholder="Search exotic"
            aria-label="Search exotic"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
          <div className="chips" role="group" aria-label="Slot">
            {(["all", ...slots] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={slot === s}
                onClick={() => setSlot(s)}
              >
                {s === "all" ? "All" : SLOT_LABELS[s]}
              </button>
            ))}
          </div>
          <ul className="weapon-list">
            <li>
              <button
                type="button"
                aria-pressed={worn === undefined}
                onClick={() => choose(undefined)}
              >
                <span className="icon ability-none" style={{ width: 32, height: 32 }}>
                  –
                </span>
                <span>No exotic</span>
                <span className="muted" />
              </button>
            </li>
            {shown.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  aria-pressed={e.id === worn?.id}
                  onClick={() => choose(e)}
                >
                  <Icon iconKey={`armor:${e.id}`} label={e.name} size={32} />
                  <span>{e.name}</span>
                  <span className="muted">{SLOT_LABELS[e.slot]}</span>
                </button>
              </li>
            ))}
          </ul>
          {shown.length === 0 && <p className="note">No exotic found.</p>}
        </div>
      )}
    </>
  );
}
