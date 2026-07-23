import {
  Bar,
  BarChart as ReBarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface BarDatum {
  label: string;
  value: number;
  highlight?: boolean;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
  /** Format the tooltip/value (e.g. count). */
  formatValue?: (v: number) => string;
  unit?: string;
}

function ChartTooltip({
  active,
  payload,
  formatValue,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ payload: BarDatum }>;
  formatValue?: (v: number) => string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-hairline bg-surface-3 px-3 py-2 shadow-xl">
      <p className="text-2xs uppercase tracking-wide text-text-tertiary">{d.label}</p>
      <p className="font-mono text-sm font-semibold tabular-nums text-text-primary">
        {formatValue ? formatValue(d.value) : d.value}
        {unit ? <span className="ml-1 text-text-tertiary">{unit}</span> : null}
      </p>
    </div>
  );
}

/**
 * Styled Recharts bar chart — considered axes, a faint baseline grid via ticks,
 * an emphasized peak bar (brand) against muted bars, and a token-styled tooltip.
 * Not a default Recharts render.
 */
export function BarChart({ data, height = 220, formatValue, unit }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart
        data={data}
        margin={{ top: 8, right: 4, bottom: 4, left: -18 }}
        barCategoryGap="28%"
      >
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "rgb(var(--text-tertiary))", fontSize: 11 }}
          dy={4}
        />
        <YAxis
          domain={[0, Math.ceil(max / 20) * 20]}
          tickCount={5}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "rgb(var(--text-tertiary))", fontSize: 11 }}
          width={44}
        />
        <Tooltip
          cursor={{ fill: "rgb(var(--surface-2))", opacity: 0.5 }}
          content={<ChartTooltip formatValue={formatValue} unit={unit} />}
        />
        <Bar dataKey="value" radius={[6, 6, 2, 2]} maxBarSize={44} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.highlight ? "rgb(var(--brand))" : "rgb(var(--surface-3))"} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
}
