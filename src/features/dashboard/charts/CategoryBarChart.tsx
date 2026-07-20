import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SEQUENTIAL_BLUE } from '../chartPalette';
import { AXIS_LINE, AXIS_TICK, LABEL_STYLE } from './chartStyles';
import { ChartTooltipContent, EmptyChartState } from './shared';

interface CategoryBarChartProps {
  data: { label: string; count: number }[];
  labelMap?: Record<string, string>;
  colorFor?: (label: string) => string;
  color?: string;
  height?: number;
}

/** Une seule série, une couleur par catégorie (identité) : pas de légende, l'axe X porte déjà le nom de chaque catégorie. */
export function CategoryBarChart({ data, labelMap, colorFor, color = SEQUENTIAL_BLUE, height = 260 }: CategoryBarChartProps) {
  if (data.length === 0) return <EmptyChartState />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e1e0d9" />
        <XAxis
          dataKey="label"
          tickFormatter={(v: string) => labelMap?.[v] ?? v}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={AXIS_LINE}
        />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
        <Tooltip
          content={<ChartTooltipContent labelMap={labelMap} />}
          cursor={{ fill: 'rgba(11,11,11,0.03)' }}
        />
        <Bar dataKey="count" name="Nombre" radius={[4, 4, 0, 0]} maxBarSize={24}>
          {data.map((entry) => (
            <Cell key={entry.label} fill={colorFor ? colorFor(entry.label) : color} />
          ))}
          <LabelList dataKey="count" position="top" style={LABEL_STYLE} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
