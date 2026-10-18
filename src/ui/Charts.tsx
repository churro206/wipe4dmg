// Charts of a simulation result (ADR 0007). Data comes from src/engine/analysis.ts.
// Colors are CSS custom properties from index.css, so light and dark mode swap in one place.

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CurvePoint, DamageShare } from "../engine/analysis";
import type { BreakdownEntry } from "../engine/breakdown";

const integer = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat("de-DE", {
  style: "percent",
  maximumFractionDigits: 1,
});
const seconds = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

// Color follows the kind of damage, never its rank (fixed slot per id).
const DAMAGE_KINDS: Record<string, { label: string; color: string }> = {
  shot: { label: "Shots", color: "var(--series-1)" },
  ignition: { label: "Ignitions", color: "var(--series-2)" },
  takenSeeker: { label: "Taken Seeker", color: "var(--series-3)" },
};
const kindOf = (id: string) =>
  DAMAGE_KINDS[id] ?? { label: id, color: "var(--muted)" };

const axisProps = {
  stroke: "var(--axis)",
  tick: { fill: "var(--muted)", fontSize: 12 },
  tickLine: false,
} as const;
const gridProps = {
  stroke: "var(--grid)",
  vertical: false,
} as const;
const tooltipProps = {
  contentStyle: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    color: "var(--text)",
    fontSize: 13,
  },
  labelStyle: { color: "var(--muted)" },
  itemStyle: { color: "var(--text)" },
  cursor: { stroke: "var(--axis)", strokeWidth: 1 },
} as const;

/** Donut: share of each kind of damage. Legend with values doubles as the table view. */
export function DamageShareChart({ entries }: { entries: DamageShare[] }) {
  return (
    <figure className="chart">
      <figcaption>Schaden nach Art</figcaption>
      <div className="donut">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={entries}
              dataKey="damage"
              nameKey="id"
              innerRadius="60%"
              outerRadius="95%"
              stroke="var(--bg)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {entries.map((entry) => (
                <Cell key={entry.id} fill={kindOf(entry.id).color} />
              ))}
            </Pie>
            <Tooltip
              {...tooltipProps}
              formatter={(value, name) => [
                integer.format(Number(value)),
                kindOf(String(name)).label,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <table className="legend">
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <span
                    className="swatch"
                    style={{ background: kindOf(entry.id).color }}
                  />
                  {kindOf(entry.id).label}
                </td>
                <td>{integer.format(entry.damage)}</td>
                <td>{percent.format(entry.share)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/** Damage Curve: cumulative damage over the damage phase (one series, so no legend). */
export function DamageCurveChart({ points }: { points: CurvePoint[] }) {
  const data = points.map((p) => ({
    seconds: p.timeMs / 1000,
    totalDamage: p.totalDamage,
  }));
  return (
    <figure className="chart">
      <figcaption>Damage Curve</figcaption>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8 }}>
          <CartesianGrid {...gridProps} />
          <XAxis
            {...axisProps}
            dataKey="seconds"
            type="number"
            domain={[0, "dataMax"]}
            tickFormatter={(s: number) => `${seconds.format(s)} s`}
          />
          <YAxis
            {...axisProps}
            width={64}
            tickFormatter={(d: number) => integer.format(d)}
          />
          <Tooltip
            {...tooltipProps}
            labelFormatter={(s) => `${seconds.format(Number(s))} s`}
            formatter={(value) => [
              integer.format(Number(value)),
              "Total Damage",
            ]}
          />
          <Line
            type="stepAfter"
            dataKey="totalDamage"
            stroke="var(--series-1)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}

/** DPS of the same build for each damage phase length; the reference line marks the chosen length. */
export function DpsByLengthChart({
  points,
  currentSeconds,
}: {
  points: { seconds: number; dps: number }[];
  currentSeconds: number;
}) {
  return (
    <figure className="chart">
      <figcaption>DPS je Länge der Damage Phase</figcaption>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={points} margin={{ top: 24, right: 16, left: 8 }}>
          <CartesianGrid {...gridProps} />
          <XAxis
            {...axisProps}
            dataKey="seconds"
            type="number"
            domain={[0, "dataMax"]}
            tickFormatter={(s: number) => `${seconds.format(s)} s`}
          />
          <YAxis
            {...axisProps}
            width={64}
            tickFormatter={(d: number) => integer.format(d)}
          />
          <Tooltip
            {...tooltipProps}
            labelFormatter={(s) => `${seconds.format(Number(s))} s`}
            formatter={(value) => [integer.format(Number(value)), "DPS"]}
          />
          <ReferenceLine
            x={currentSeconds}
            stroke="var(--muted)"
            label={{
              value: "gewählt",
              position: "top",
              fill: "var(--muted)",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="dps"
            stroke="var(--series-1)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}

/** Contribution of each bucket: total damage minus total damage without it. The table is the table view. */
export function BreakdownChart({
  entries,
  totalDamage,
}: {
  entries: BreakdownEntry[];
  totalDamage: number;
}) {
  const data = entries.map((entry) => ({
    name: entry.name,
    contribution: totalDamage - entry.totalDamageWithout,
  }));
  return (
    <figure className="chart">
      <figcaption>Beitrag pro Bucket</figcaption>
      <ResponsiveContainer width="100%" height={40 + data.length * 36}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8 }}
          barCategoryGap={8}
        >
          <CartesianGrid {...gridProps} vertical horizontal={false} />
          <XAxis
            {...axisProps}
            type="number"
            tickFormatter={(d: number) => integer.format(d)}
          />
          <YAxis {...axisProps} type="category" dataKey="name" width={136} />
          <Tooltip
            {...tooltipProps}
            cursor={{ fill: "var(--grid)" }}
            formatter={(value) => [
              `+${integer.format(Number(value))}`,
              "Beitrag",
            ]}
          />
          <Bar
            dataKey="contribution"
            fill="var(--series-1)"
            radius={[0, 4, 4, 0]}
            maxBarSize={20}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </figure>
  );
}

// Range steps for the time axis of the rotation timeline; the smallest step with at most 6 ticks wins.
const TIME_STEPS_SECONDS = [1, 2, 5, 10, 15, 20, 30, 60, 120];
const MAX_TIME_TICKS = 6;
// Size of the effect icon in front of a timeline row.
const ICON_SIZE = 18;
// Longer effect names are cut with an ellipsis; the full name shows on hover.
const MAX_LABEL_CHARS = 24;

/**
 * Rotation timeline (US-07): one bar per effect window, the shots as thin marks and the
 * ignitions as dots. Bars carry a native tooltip; the rotation table is the table view.
 */
export function RotationTimeline({
  rows,
  shotsMs,
  ignitionsMs,
  damagePhaseSeconds,
}: {
  rows: {
    label: string;
    iconUrl?: string;
    startMs: number;
    endMs: number;
    uptime: number;
  }[];
  shotsMs: number[];
  ignitionsMs: number[];
  damagePhaseSeconds: number;
}) {
  const width = 560;
  const labelWidth = 170;
  const rowHeight = 26;
  const axisHeight = 22;
  const plotWidth = width - labelWidth - 12;
  const phaseMs = Math.max(damagePhaseSeconds * 1000, 1);
  const x = (ms: number) =>
    labelWidth + (Math.min(Math.max(ms, 0), phaseMs) / phaseMs) * plotWidth;

  const lines = [
    ...rows.map((row) => ({ kind: "effect" as const, row })),
    { kind: "shots" as const },
    ...(ignitionsMs.length > 0 ? [{ kind: "ignitions" as const }] : []),
  ];
  const plotHeight = lines.length * rowHeight;
  const step =
    TIME_STEPS_SECONDS.find((s) => damagePhaseSeconds / s <= MAX_TIME_TICKS) ??
    TIME_STEPS_SECONDS[TIME_STEPS_SECONDS.length - 1];
  const ticks = Array.from(
    { length: Math.floor(damagePhaseSeconds / step) + 1 },
    (_, i) => i * step,
  );

  return (
    <figure className="chart">
      <figcaption>Rotation</figcaption>
      <svg
        viewBox={`0 0 ${width} ${plotHeight + axisHeight}`}
        width="100%"
        role="img"
        aria-label="Zeitleiste: Zeitfenster der Effects, Shots und Ignitions"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={x(t * 1000)}
              x2={x(t * 1000)}
              y1={0}
              y2={plotHeight}
              stroke="var(--grid)"
            />
            <text
              x={x(t * 1000)}
              y={plotHeight + 15}
              textAnchor="middle"
              fill="var(--muted)"
              fontSize={11}
            >
              {seconds.format(t)} s
            </text>
          </g>
        ))}
        <line
          x1={labelWidth}
          x2={labelWidth + plotWidth}
          y1={plotHeight}
          y2={plotHeight}
          stroke="var(--axis)"
        />
        {lines.map((line, i) => {
          const y = i * rowHeight;
          const middle = y + rowHeight / 2;
          const label =
            line.kind === "effect"
              ? line.row.label
              : line.kind === "shots"
                ? "Shots"
                : "Ignitions";
          return (
            <g key={label + i}>
              {line.kind === "effect" && line.row.iconUrl && (
                <image
                  href={line.row.iconUrl}
                  x={labelWidth - ICON_SIZE - 6}
                  y={middle - ICON_SIZE / 2}
                  width={ICON_SIZE}
                  height={ICON_SIZE}
                />
              )}
              <text
                x={labelWidth - ICON_SIZE - 12}
                y={middle + 4}
                textAnchor="end"
                fill="var(--text)"
                fontSize={12}
              >
                <title>{label}</title>
                {label.length > MAX_LABEL_CHARS
                  ? `${label.slice(0, MAX_LABEL_CHARS - 1)}…`
                  : label}
              </text>
              {line.kind === "effect" && line.row.endMs > line.row.startMs && (
                <rect
                  x={x(line.row.startMs)}
                  y={middle - 6}
                  width={x(line.row.endMs) - x(line.row.startMs)}
                  height={12}
                  rx={4}
                  fill="var(--muted)"
                >
                  <title>
                    {`${label}: ${seconds.format(line.row.startMs / 1000)}–${seconds.format(line.row.endMs / 1000)} s (${percent.format(line.row.uptime)})`}
                  </title>
                </rect>
              )}
              {line.kind === "shots" &&
                shotsMs.map((ms) => (
                  <line
                    key={ms}
                    x1={x(ms)}
                    x2={x(ms)}
                    y1={middle - 7}
                    y2={middle + 7}
                    stroke="var(--series-1)"
                    strokeWidth={2}
                  >
                    <title>{`Shot bei ${seconds.format(ms / 1000)} s`}</title>
                  </line>
                ))}
              {line.kind === "ignitions" &&
                ignitionsMs.map((ms) => (
                  <circle
                    key={ms}
                    cx={x(ms)}
                    cy={middle}
                    r={4}
                    fill="var(--series-2)"
                    stroke="var(--bg)"
                    strokeWidth={2}
                  >
                    <title>{`Ignition bei ${seconds.format(ms / 1000)} s`}</title>
                  </circle>
                ))}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

/**
 * Damage Curve of the current build and the comparison (US-09). Two series: legend above,
 * direct labels at the line ends; the comparison table is the table view.
 */
export function CompareCurveChart({
  current,
  comparison,
}: {
  current: CurvePoint[];
  comparison: CurvePoint[];
}) {
  const series = [
    { name: "Aktuell", color: "var(--series-1)", points: current },
    { name: "Vergleich", color: "var(--series-5)", points: comparison },
  ].map((s) => ({
    ...s,
    data: s.points.map((p) => ({
      seconds: p.timeMs / 1000,
      totalDamage: p.totalDamage,
    })),
  }));
  return (
    <figure className="chart">
      <figcaption>Damage Curve im Vergleich</figcaption>
      <div className="legend-row">
        {series.map((s) => (
          <span key={s.name}>
            <span className="swatch" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart margin={{ top: 8, right: 72, left: 8 }}>
          <CartesianGrid {...gridProps} />
          <XAxis
            {...axisProps}
            dataKey="seconds"
            type="number"
            domain={[0, "dataMax"]}
            allowDuplicatedCategory={false}
            tickFormatter={(s: number) => `${seconds.format(s)} s`}
          />
          <YAxis
            {...axisProps}
            width={64}
            tickFormatter={(d: number) => integer.format(d)}
          />
          <Tooltip
            {...tooltipProps}
            labelFormatter={(s) => `${seconds.format(Number(s))} s`}
            formatter={(value, name) => [
              integer.format(Number(value)),
              String(name),
            ]}
          />
          {series.map((s) => (
            <Line
              key={s.name}
              name={s.name}
              data={s.data}
              type="stepAfter"
              dataKey="totalDamage"
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              label={({
                index,
                x,
                y,
              }: {
                index?: number;
                x?: number | string;
                y?: number | string;
              }) =>
                index === s.data.length - 1 ? (
                  <text
                    x={Number(x) + 6}
                    y={Number(y) + 4}
                    fill="var(--text)"
                    fontSize={12}
                  >
                    {s.name}
                  </text>
                ) : null
              }
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}
