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
          <YAxis {...axisProps} type="category" dataKey="name" width={120} />
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
