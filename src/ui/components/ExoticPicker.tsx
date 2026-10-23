import { useState } from "react";
import type { ExoticArmorEntry } from "../../data/schema";
import { Icon } from "./Icon";

const SLOT_LABELS: Record<ExoticArmorEntry["slot"], string> = {
  helmet: "Helmet",
  gauntlets: "Arms",
  chest: "Chest",
  legs: "Legs",
  classItem: "Class Item",
  classPerk: "Class Item perk", // not offered here, see ClassPerkPicker
};

/**
 * The chosen exotic armor as a tile; a click opens a list with search and a filter by slot (U8).
 * Like the weapon picker, it renders the tile and the list as two grid items of the tile grid.
 */
export function ExoticPicker({
  entries,
  selected,
  onSelect,
}: {
  entries: ExoticArmorEntry[]; // selectable pieces of the class
  selected: ExoticArmorEntry | undefined;
  onSelect: (exoticArmorId: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [slot, setSlot] = useState<ExoticArmorEntry["slot"] | "all">("all");
  const slots = (Object.keys(SLOT_LABELS) as ExoticArmorEntry["slot"][]).filter(
    (s) => entries.some((e) => e.slot === s),
  );
  const needle = query.trim().toLowerCase();
  const shown = entries.filter(
    (e) =>
      (slot === "all" || e.slot === slot) &&
      e.name.toLowerCase().includes(needle),
  );
  const choose = (id: string | undefined) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <>
      <span className="tile-wrap weapon-wrap">
        <button
          type="button"
          className="tile weapon-tile"
          aria-expanded={open}
          onClick={() => setOpen((on) => !on)}
        >
          {selected ? (
            <Icon iconKey={`armor:${selected.id}`} label={selected.name} />
          ) : (
            <span className="icon ability-none" style={{ width: 40, height: 40 }}>
              –
            </span>
          )}
          <span className="tile-label">
            {selected?.name ?? "No exotic"}
            <span className="tile-sub">
              {selected ? `${SLOT_LABELS[selected.slot]} · ` : ""}change
            </span>
          </span>
        </button>
      </span>
      {open && (
        <div className="weapon-picker" role="group" aria-label="Choose exotic">
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
                aria-pressed={selected === undefined}
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
          {shown.length === 0 && <p className="note">No exotic found.</p>}
        </div>
      )}
    </>
  );
}
