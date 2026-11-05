import type { CatalogEntry, CatalogStatus } from "../../data/schema";
import { coverageCatalog, iconUrl, weaponStatus } from "../data";
import { lightOf, rankWeapons, type SortKey, type WeaponState } from "../weaponRanking";
import { isLongText } from "../coverageText";
import { Icon } from "./Icon";
import { useState } from "react";

const STATUSES: { status: CatalogStatus; mark: string; label: string; meaning: string }[] = [
  { status: "full", mark: "✓", label: "Implemented", meaning: "Its damage or its effect counts in a build." },
  { status: "approx", mark: "≈", label: "Approximated", meaning: "In, with a known estimate or a part that is still open." },
  { status: "missing", mark: "✕", label: "Missing", meaning: "Does something for damage in the game; not in yet." },
  { status: "leftOut", mark: "–", label: "Left out", meaning: "No damage effect, or left out on purpose." },
];
const BY_STATUS = Object.fromEntries(STATUSES.map((s) => [s.status, s]));
const COLUMNS = ["Name", "Status", "In-game", "Calculator"];

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
  const long = isLongText(entry.inGame);
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
        <div className={long && !expanded ? "coverage-text clamped" : "coverage-text"}>
          {entry.inGame}
        </div>
        {long && (
          <button
            type="button"
            className="coverage-more"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </td>
      <td data-label="Calculator" className="coverage-text">
        {entry.inCalculator}
      </td>
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
            <col />
            <col />
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
              <tr className="coverage-group">
                <th colSpan={COLUMNS.length} scope="colgroup">
                  {group}
                  <span className="coverage-group-count">{rows.length}</span>
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

const TIMES: { key: "s10" | "s30" | "s60"; label: string }[] = [
  { key: "s10", label: "10 s" },
  { key: "s30", label: "30 s" },
  { key: "s60", label: "60 s" },
];

const nf = new Intl.NumberFormat("en-US");

/** Ranking of the exotic weapons by damage over 10, 30 and 60 s; the light is the status of the data file. */
function WeaponRanking() {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>("s60");
  const [ascending, setAscending] = useState(false);
  const [status, setStatus] = useState<WeaponState | "all">("all");
  const [text, setText] = useState("");
  const ranked = rankWeapons(weaponStatus, { sort, ascending, status, text });

  const head = (key: SortKey, label: string) => (
    <th scope="col" aria-sort={sort === key ? (ascending ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        className="ranking-sort"
        onClick={() => {
          if (sort === key) setAscending(!ascending);
          else {
            setSort(key);
            setAscending(key === "name");
          }
        }}
      >
        {label}
        {sort === key && <span aria-hidden="true">{ascending ? " ▲" : " ▼"}</span>}
      </button>
    </th>
  );

  return (
    <details
      className="coverage-category"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <strong>Weapon ranking</strong>
        <span className="coverage-counts">{weaponStatus.length} exotic weapons · damage over 10, 30 and 60 s</span>
      </summary>
      {open && (
        <div className="ranking">
          <div className="ranking-controls">
            <input
              type="search"
              placeholder="Filter by name"
              aria-label="Filter by name"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => setStatus(event.target.value as WeaponState | "all")}
            >
              <option value="all">All statuses</option>
              {(["complete", "partial", "estimated"] as const).map((s) => (
                <option key={s} value={s}>
                  {lightOf(s).label}
                </option>
              ))}
            </select>
            <span className="coverage-counts">{ranked.length} shown</span>
          </div>
          <table className="coverage-table ranking-table">
            <thead>
              <tr>
                {head("name", "Weapon")}
                {head("status", "Status")}
                {TIMES.map(({ key, label }) => head(key, label))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((weapon) => {
                const light = lightOf(weapon.status);
                return (
                  <tr key={weapon.id}>
                    <th scope="row">{weapon.name}</th>
                    <td data-label="Status">
                      <span className="ranking-light" data-light={light.color}>
                        <span aria-hidden="true">●</span> {light.label}
                      </span>
                    </td>
                    {TIMES.map(({ key, label }) => (
                      <td key={key} data-label={label} className="ranking-number">
                        {nf.format(Math.round(weapon.damage.base[key]))}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
        game and what the calculator does with it. Open a category to see its entries. Legendary weapons
        are not listed; they come with the Legendary Frames in 2.0.
      </p>
      <ul className="coverage-legend">
        {STATUSES.map(({ status, meaning }) => (
          <li key={status}>
            <StatusMark status={status} /> {meaning}
          </li>
        ))}
      </ul>
      <WeaponRanking />
      {coverageCatalog.map((category) => (
        <Category key={category.id} id={category.id} title={category.title} entries={category.entries} />
      ))}
    </div>
  );
}
