import { useState } from "react";
import type { CatalogEntry, CatalogStatus } from "../../data/schema";
import { coverageCatalog } from "../data";
import { Icon } from "./Icon";

const STATUSES: { status: CatalogStatus; mark: string; label: string; meaning: string }[] = [
  { status: "full", mark: "✓", label: "In the calculator", meaning: "Its damage or its effect counts in a build." },
  { status: "approx", mark: "≈", label: "Approximated", meaning: "In, with a known estimate or a part that is still open." },
  { status: "missing", mark: "✕", label: "Missing", meaning: "Does something for damage in the game; not in yet." },
  { status: "leftOut", mark: "–", label: "Left out", meaning: "No damage effect, or left out on purpose." },
];
const BY_STATUS = Object.fromEntries(STATUSES.map((s) => [s.status, s]));

function StatusMark({ status }: { status: CatalogStatus }) {
  const { mark, label } = BY_STATUS[status];
  return (
    <span className="coverage-status" data-status={status}>
      <span aria-hidden="true">{mark}</span> {label}
    </span>
  );
}

/** "136 in the calculator, 5 missing" of one category. */
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

function Row({ entry }: { entry: CatalogEntry }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <tr>
      <th scope="row" className="coverage-name">
        <Icon iconKey={entry.iconKey ?? "none"} label={entry.name} size={28} />

        <span>{entry.name}</span>
      </th>
      <td data-label="Status">
        <StatusMark status={entry.status} />
      </td>
      <td data-label="In the game">
        <button
          type="button"
          className={expanded ? "coverage-text" : "coverage-text clamped"}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {entry.inGame}
        </button>
      </td>
      <td data-label="In the calculator">{entry.inCalculator}</td>
    </tr>
  );
}

function Category({ title, entries }: { title: string; entries: CatalogEntry[] }) {
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
      {open &&
        byGroup(entries).map(([group, rows]) => (
          <section key={group}>
            <h3 className="sub">{group}</h3>
            <table className="coverage-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Status</th>
                  <th scope="col">In the game</th>
                  <th scope="col">In the calculator</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <Row key={entry.name} entry={entry} />
                ))}
              </tbody>
            </table>
          </section>
        ))}
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
        <Category key={category.id} title={category.title} entries={category.entries} />
      ))}
    </div>
  );
}
