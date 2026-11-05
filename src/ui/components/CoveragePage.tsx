import type { CatalogEntry, CatalogStatus } from "../../data/schema";
import { coverageCatalog, iconUrl, statusLimits, weaponStatus } from "../data";
import {
  TIMES,
  aegisCell,
  comesIn,
  damageOf,
  damageRanks,
  openCount,
  quantumLight,
  rankWeapons,
  statusLabel,
  type SortKey,
  type Time,
  type WeaponState,
} from "../weaponRanking";
import { isLongText } from "../coverageText";
import { Icon } from "./Icon";
import { Tabs } from "./Tabs";
import { WeaponDetail } from "./WeaponDetail";
import { Fragment, useState } from "react";

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

const nf = new Intl.NumberFormat("en-US");

type PageTab = "catalog" | "weapons";
const PAGE_TABS: { id: PageTab; label: string }[] = [
  { id: "catalog", label: "Catalog" },
  { id: "weapons", label: "Weapons" },
];

/**
 * Table of the exotic weapons: damage over the chosen time (default sort, with rank), the deviation
 * against Quantum with a traffic light (limits: status-limits.json), the check against Aegis (report
 * only, ADR 0018), the trust and the open sentences.
 */
function WeaponTable() {
  const [time, setTime] = useState<Time>("s30");
  const [sort, setSort] = useState<SortKey>("damage");
  const [ascending, setAscending] = useState(false);
  const [status, setStatus] = useState<WeaponState | "all">("all");
  const [text, setText] = useState("");
  const [openId, setOpenId] = useState<string | null>(null); // the expanded row; it is only computed while open
  const [catalyst, setCatalyst] = useState(false); // the Catalyst switch: damage, rank and expanded row
  const ranked = rankWeapons(weaponStatus, { sort, time, catalyst, ascending, status, text });
  const ranks = damageRanks(weaponStatus, time, catalyst);
  const timeLabel = TIMES.find((t) => t.key === time)!.label;

  const head = (key: SortKey, label: string, hint?: string) => (
    <th scope="col" aria-sort={sort === key ? (ascending ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        className="ranking-sort"
        title={hint}
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
    <div className="ranking">
      <div className="ranking-controls">
        <div className="ranking-times" role="group" aria-label="Time">
          {TIMES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className="ranking-time"
              aria-pressed={time === key}
              onClick={() => setTime(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="ranking-time ranking-catalyst"
          aria-pressed={catalyst}
          title="Damage, rank and the expanded row with the weapon's catalyst; weapons without one stay the same"
          onClick={() => setCatalyst(!catalyst)}
        >
          Catalyst
        </button>
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
              {statusLabel(s)}
            </option>
          ))}
        </select>
        <span className="coverage-counts">
          {ranked.length} of {weaponStatus.length} exotic weapons
        </span>
      </div>
      <table className="coverage-table ranking-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            {head("name", "Weapon")}
            {head("status", "Status")}
            {head("damage", `Damage ${timeLabel}`)}
            {head("quantum", "vs Quantum", "Deviation of the weapon without the catalyst (Quantum's base row); the Catalyst switch does not change it")}
            {head("aegis", "vs Aegis", "Largest deviation of the Aegis rows, each with its own assumptions (some include the catalyst); the Catalyst switch does not change it")}
            {head("trust", "Trust")}
            {head("open", "Not in yet")}
          </tr>
        </thead>
        <tbody>
          {ranked.map((weapon) => {
            const light = quantumLight(weapon.quantum?.deviation ?? null, statusLimits);
            const aegis = aegisCell(weapon);
            const comes = comesIn(weapon);
            const expanded = openId === weapon.id;
            return (
              <Fragment key={weapon.id}>
              <tr className="ranking-row">
                <td data-label="#" className="ranking-number">
                  {ranks.get(weapon.id)}
                </td>
                <th scope="row">
                  <button
                    type="button"
                    className="ranking-sort"
                    aria-expanded={expanded}
                    onClick={() => setOpenId(expanded ? null : weapon.id)}
                  >
                    <span aria-hidden="true">{expanded ? "▾ " : "▸ "}</span>
                    {weapon.name}
                  </button>
                </th>
                <td data-label="Status">{statusLabel(weapon.status)}</td>
                <td data-label={`Damage ${timeLabel}`} className="ranking-number">
                  {nf.format(Math.round(damageOf(weapon, time, catalyst)))}
                </td>
                <td data-label="vs Quantum" className="ranking-number">
                  {light.color === null ? (
                    <span className="ranking-none">{light.label}</span>
                  ) : (
                    <span className="ranking-light" data-light={light.color}>
                      <span aria-hidden="true">●</span> {light.label}
                    </span>
                  )}
                </td>
                <td data-label="vs Aegis" className="ranking-number">
                  <span className={aegis.deviation === null ? "ranking-none" : undefined}>{aegis.text}</span>
                </td>
                <td data-label="Trust">{weapon.trust}</td>
                <td data-label="Not in yet" className="ranking-number">
                  {openCount(weapon)}
                  {comes && <span className="ranking-comes"> · {comes}</span>}
                </td>
              </tr>
              {expanded && (
                <tr className="ranking-detail-row">
                  <td colSpan={8}>
                    <WeaponDetail
                      weapon={weapon}
                      seconds={TIMES.find((t) => t.key === time)!.seconds}
                      catalyst={catalyst}
                    />
                  </td>
                </tr>
              )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Wiki page "Coverage of the calculator" (US-15): what the game has, what the calculator does with it. */
export function CoveragePage() {
  const [tab, setTab] = useState<PageTab>("catalog");
  return (
    <div className="coverage">
      <Tabs tabs={PAGE_TABS} active={tab} onChange={setTab}>
        {tab === "weapons" ? (
          <WeaponTable />
        ) : (
          <>
            <p>
              Everything in Destiny 2 that can change the damage of a build, by category: what it does in
              the game and what the calculator does with it. Open a category to see its entries. Legendary
              weapons are not listed; they come with the Legendary Frames in 2.0.
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
          </>
        )}
      </Tabs>
    </div>
  );
}
