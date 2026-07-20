import { GRIDLINE, TEXT_SECONDARY } from '../chartPalette';

export const AXIS_TICK = { fontSize: 11, fill: TEXT_SECONDARY, fontFamily: 'Poppins, sans-serif' };
export const AXIS_LINE = { stroke: GRIDLINE };
export const LABEL_STYLE = { fill: TEXT_SECONDARY, fontSize: 11, fontFamily: 'Poppins, sans-serif' };

interface TooltipPayloadEntry {
  dataKey: string | number;
  name?: string;
  value?: number | string;
  color?: string;
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  labelMap?: Record<string, string>;
  valueFormatter?: (value: number | string) => string;
}

/** Tooltip commun à tous les graphiques : une ligne par série, pastille = couleur de la série, valeur en avant (texte gras), jamais de couleur portée par le texte. */
export function ChartTooltipContent({ active, payload, label, labelMap, valueFormatter }: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-md">
      {label && (
        <p className="mb-1 text-xs font-poppins text-gray-500">{labelMap?.[label] ?? label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={`${entry.dataKey}-${i}`} className="flex items-center gap-2 text-xs font-poppins">
            <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-500">{entry.name}</span>
            <span className="ml-auto font-semibold text-gray-900">
              {valueFormatter && entry.value !== undefined ? valueFormatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SimpleLegendProps {
  items: { key: string; label: string; color: string }[];
}

/** Légende toujours affichée dès 2 séries — une clé en trait (rect) par série, jamais de couleur seule. */
export function SimpleLegend({ items }: SimpleLegendProps) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-4">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5 text-xs font-poppins text-gray-600">
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

export function EmptyChartState({ message = 'Aucune donnée' }: { message?: string }) {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-gray-400 font-poppins">
      {message}
    </div>
  );
}
