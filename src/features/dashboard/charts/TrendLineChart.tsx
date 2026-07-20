import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SEQUENTIAL_BLUE } from '../chartPalette';
import { AXIS_LINE, AXIS_TICK, ChartTooltipContent, EmptyChartState } from './shared';

interface TrendLineChartProps {
  data: { date: string; count: number }[];
  xTickFormatter: (value: string) => string;
  color?: string;
  height?: number;
}

/** Série unique dans le temps : pas de légende (le titre de la carte suffit), ligne 2px + wash à 10% d'opacité, crosshair au survol. */
export function TrendLineChart({ data, xTickFormatter, color = SEQUENTIAL_BLUE, height = 260 }: TrendLineChartProps) {
  if (data.length === 0) return <EmptyChartState />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.12} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e1e0d9" />
        <XAxis
          dataKey="date"
          tickFormatter={xTickFormatter}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={AXIS_LINE}
          interval="preserveStartEnd"
        />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
        <Tooltip
          content={<ChartTooltipContent />}
          cursor={{ stroke: '#c3c2b7', strokeWidth: 1 }}
          labelFormatter={(v: string) => xTickFormatter(v)}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Rendez-vous"
          stroke={color}
          strokeWidth={2}
          fill="url(#trendFill)"
          dot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: color }}
          activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
