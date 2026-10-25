import { useState } from "react";
import type { CatalogEntry, CatalogStatus } from "../../data/schema";
import { coverageCatalog, iconUrl } from "../data";
import { Icon } from "./Icon";

const STATUSES: { status: CatalogStatus; mark: string; label: string; meaning: string }[] = [
  { status: "full", mark: "✓", label: "Implemented", meaning: "Its damage or its effect counts in a build." },
  { status: "approx", mark: "≈", label: "Approximated", meaning: "In, with a known estimate or a part that is still open." },
  { status: "missing", mark: "✕", label: "Missing", meaning: "Does something for damage in the game; not in yet." },
  { status: "leftOut", mark: "–", label: "Left out", meaning: "No damage effect, or left out on purpose." },
];
const BY_STATUS = Object.fromEntries(STATUSES.map((s) => [s.status, s]));
const COLUMNS = ["Name", "Status", "In-game", "Calculator"];
// Subclass elements have a colour of their own (index.css); the group bar takes it from the name.
const ELEMENTS = ["arc", "solar", "void", "stasis", "strand"];

function StatusMark({ status }: { status: CatalogStatus }) {
  const { mark, label } = BY_STATUS[status];
  return (
    <span className="coverage-status" data-status={status}>
      <span aria-hidden="true">{mark}</span> {label}
    </span>
  );
}

/** "136 implemented · 5 missing" of one category. */
function counts(entries: CatalogEntry[]) {
  return STATUSES.flatMap(({ status, label }) => {
    const n = entries.filter((e) => e.status === status).length;
    return n > 0 ? [`${n} ${label.toLowerCase()}`] : [];
  }).join(" · ");
}

/** Entries by group, in the order of the first entry of each group. */
function byGroup(entries: CatalogEntry[]) {
  const groups = new Map<string, CatalogEntry[]>();
  for (const entry of entries) {
    groups.set(entry.group, [...(groups.get(entry.group) ?? []), entry]);
  }
  return [...groups];
}

const elementOf = (group: string) =>
  ELEMENTS.find((element) => group.toLowerCase().includes(element));

/**
 * The icon of an entry; a glossary term the manifest has no item for (Jolted, Freeze) shows the
 * emblem of its subclass instead.
 */
function iconKeyOf(entry: CatalogEntry, categoryId: string) {
  if (entry.iconKey && iconUrl(entry.iconKey)) return entry.iconKey;
  return categoryId === "subclass"
    ? `subclass:hunter:${entry.group.toLowerCase()}`
    : (entry.iconKey ?? "none");
}

function Row({ entry, categoryId }: { entry: CatalogEntry; categoryId: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <tr>
      <th scope="row">
        <span className="coverage-name">
          <Icon iconKey={iconKeyOf(entry, categoryId)} label={entry.name} size={28} />
          <span>
            {entry.name}
            {entry.detail && <span className="coverage-detail">{entry.detail}</span>}
          </span>
        </span>
      </th>
      <td data-label="Status">
        <StatusMark status={entry.status} />
      </td>
      <td data-label="In-game">
        <button
          type="button"
          className={expanded ? "coverage-text" : "coverage-text clamped"}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {entry.inGame}
        </button>
      </td>
      <td data-label="Calculator">{entry.inCalculator}</td>
    </tr>
  );
}

function Category({
  id,
  title,
  entries,
}: {
  id: string;
  title: string;
  entries: CatalogEntry[];
}) {
  // The rows (and their icons) are only built once the category is opened.
  const [open, setOpen] = useState(false);
  return (
    <details
      className="coverage-category"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <strong>{title}</strong>
        <span className="coverage-counts">{counts(entries)}</span>
      </summary>
      {open && (
        <table className="coverage-table">
          <colgroup>
            <col className="coverage-col-name" />
            <col className="coverage-col-status" />
            <col className="coverage-col-text" />
            <col className="coverage-col-text" />
          </colgroup>
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          {byGroup(entries).map(([group, rows]) => (
            <tbody key={group}>
              <tr className="coverage-group" data-element={elementOf(group)}>
                <th colSpan={COLUMNS.length} scope="colgroup">
                  {group}
                </th>
              </tr>
              {rows.map((entry) => (
                <Row key={entry.name} entry={entry} categoryId={id} />
              ))}
            </tbody>
          ))}
        </table>
      )}
    </details>
  );
}

/** Wiki page "Coverage of the calculator" (US-15): what the game has, what the calculator does with it. */
export function CoveragePage() {
  return (
    <div className="coverage">
      <p>
        Everything in Destiny 2 that can change the damage of a build, by category: what it does in the
        game and what the calculator does with it. Open a category to see its entries; tap a game text
        to read all of it. Legendary weapons are not listed; they come with the Legendary Frames in 2.0.
      </p>
      <ul className="coverage-legend">
        {STATUSES.map(({ status, meaning }) => (
          <li key={status}>
            <StatusMark status={status} /> {meaning}
          </li>
        ))}
      </ul>
      {coverageCatalog.map((category) => (
        <Category key={category.id} id={category.id} title={category.title} entries={category.entries} />
      ))}
    </div>
  );
}
