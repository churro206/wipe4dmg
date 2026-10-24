import { useId, useRef, useState } from "react";
import type { ExoticArmorEntry } from "../../data/schema";
import { Icon } from "./Icon";
import { useDismiss } from "./useDismiss";

const SLOT_LABELS: Record<ExoticArmorEntry["slot"], string> = {
  helmet: "Helmet",
  gauntlets: "Arms",
  chest: "Chest",
  legs: "Legs",
  classItem: "Class Item",
  classPerk: "Class Item perk", // not offered here, see ClassPerkPicker
};

const CLASS_ITEM_NAME = "Exotic Class Item";

/**
 * The chosen exotic armor as a tile; a click opens a list with search and a filter by slot (U8).
 * Like the weapon picker, it renders the tile and the list as two grid items of the tile grid.
 */
export function ExoticPicker({
  entries,
  selected,
  onSelect,
  classItem,
  describe,
}: {
  describe: (entry: ExoticArmorEntry) => string[]; // tooltip lines of the chosen piece
  entries: ExoticArmorEntry[]; // selectable pieces of the class
  selected: ExoticArmorEntry | undefined;
  onSelect: (exoticArmorId: string | undefined) => void;
  // The Prismatic Exotic Class Item (its Spirit perks are a separate picker); omitted: not offered.
  classItem?: { chosen: boolean; onChoose: () => void };
}) {
  const cardId = useId();
  const [open, setOpen] = useState(false);
  const tileRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useDismiss([tileRef, listRef], open, () => setOpen(false));
  const [query, setQuery] = useState("");
  const [slot, setSlot] = useState<ExoticArmorEntry["slot"] | "all">("all");
  const slots = (Object.keys(SLOT_LABELS) as ExoticArmorEntry["slot"][]).filter(
    (s) =>
      s === "classItem"
        ? classItem !== undefined || entries.some((e) => e.slot === s)
        : entries.some((e) => e.slot === s),
  );
  const needle = query.trim().toLowerCase();
  const shown = entries.filter(
    (e) =>
      (slot === "all" || e.slot === slot) &&
      e.name.toLowerCase().includes(needle),
  );
  const showClassItem =
    classItem !== undefined &&
    (slot === "all" || slot === "classItem") &&
    CLASS_ITEM_NAME.toLowerCase().includes(needle);
  const choose = (id: string | undefined) => {
    onSelect(id);
    setOpen(false);
  };
  const chooseClassItem = () => {
    classItem?.onChoose();
    setOpen(false);
  };
  const classItemChosen = classItem?.chosen === true && selected === undefined;

  return (
    <>
      <span ref={tileRef} className="tile-wrap weapon-wrap">
        <button
          type="button"
          className="tile weapon-tile"
          aria-describedby={selected ? cardId : undefined}
          aria-expanded={open}
          onClick={() => setOpen((on) => !on)}
        >
          {selected ? (
            <Icon iconKey={`armor:${selected.id}`} label={selected.name} />
          ) : (
            <span className="icon ability-none" style={{ width: 40, height: 40 }}>
              {classItemChosen ? "◈" : "–"}
            </span>
          )}
          <span className="tile-label">
            {selected?.name ?? (classItemChosen ? CLASS_ITEM_NAME : "No exotic")}
            <span className="tile-sub">
              {selected ? `${SLOT_LABELS[selected.slot]} · ` : ""}change
            </span>
          </span>
        </button>
        {selected && (
          <span role="tooltip" id={cardId} className="hover-card">
            <strong>{selected.name}</strong>
            <span>{SLOT_LABELS[selected.slot]}</span>
            {describe(selected).map((line) => (
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
                aria-pressed={selected === undefined && !classItemChosen}
                onClick={() => choose(undefined)}
              >
                <span className="icon ability-none" style={{ width: 32, height: 32 }}>
                  –
                </span>
                <span>No exotic</span>
                <span className="muted" />
              </button>
            </li>
            {showClassItem && (
              <li>
                <button
                  type="button"
                  aria-pressed={classItemChosen}
                  onClick={chooseClassItem}
                >
                  <span className="icon ability-none" style={{ width: 32, height: 32 }}>
                    ◈
                  </span>
                  <span>{CLASS_ITEM_NAME}</span>
                  <span className="muted">{SLOT_LABELS.classItem}</span>
                </button>
              </li>
            )}
            {shown.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  aria-pressed={e.id === selected?.id}
                  onClick={() => choose(e.id)}
                >
                  <Icon iconKey={`armor:${e.id}`} label={e.name} size={32} />
                  <span>{e.name}</span>
                  <span className="muted">{SLOT_LABELS[e.slot]}</span>
                </button>
              </li>
            ))}
          </ul>
          {shown.length === 0 && !showClassItem && <p className="note">No exotic found.</p>}
        </div>
      )}
    </>
  );
}
