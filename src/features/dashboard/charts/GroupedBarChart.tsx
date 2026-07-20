import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_LINE, AXIS_TICK, ChartTooltipContent, EmptyChartState, SimpleLegend } from './shared';

interface Series {
  key: string;
  name: string;
  color: string;
}

interface GroupedBarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  series: Series[];
  xTickFormatter?: (value: string) => string;
  height?: number;
}

/** Plusieurs séries à comparer par date : légende toujours visible (jamais l'identité portée par la seule couleur). */
export function GroupedBarChart({ data, xKey, series, xTickFormatter, height = 260 }: GroupedBarChartProps) {
  if (data.length === 0) return <EmptyChartState />;

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e1e0d9" />
          <XAxis
            dataKey={xKey}
            tickFormatter={xTickFormatter}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={AXIS_LINE}
            interval="preserveStartEnd"
          />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
          <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(11,11,11,0.03)' }} />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={16} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <SimpleLegend items={series.map((s) => ({ key: s.key, label: s.name, color: s.color }))} />
    </div>
  );
}
