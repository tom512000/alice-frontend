import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SEQUENTIAL_BLUE } from '../chartPalette';
import { AXIS_TICK, ChartTooltipContent, EmptyChartState, LABEL_STYLE } from './shared';

interface RankingBarChartProps {
  data: { label: string; count: number }[];
  color?: string;
  height?: number;
}

/** Classement horizontal (magnitude) : une seule teinte pour toutes les barres, l'identité est déjà sur l'axe Y. */
export function RankingBarChart({ data, color = SEQUENTIAL_BLUE, height = 220 }: RankingBarChartProps) {
  if (data.length === 0) return <EmptyChartState />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 32, left: 0, bottom: 0 }}
      >
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(11,11,11,0.03)' }} />
        <Bar dataKey="count" name="Diagnostics" fill={color} radius={[0, 4, 4, 0]} maxBarSize={20}>
          <LabelList dataKey="count" position="right" style={LABEL_STYLE} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
