import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { cn } from '@/lib/cn';

interface HistoryPoint {
  ts: number;
  heartRate: number;
  spo2: number;
  systolic: number;
  diastolic: number;
  respiratoryRate: number;
  temperature: number;
}

type MetricKey = 'heartRate' | 'spo2' | 'bloodPressure' | 'respiratoryRate' | 'temperature';

interface MetricDef {
  key: MetricKey;
  label: string;
  unit: string;
  domain: [number, number];
  lines: { dataKey: keyof HistoryPoint; name: string; color: string }[];
  warn: { low?: number; high?: number };
  crit: { low?: number; high?: number };
}

// Seuils alignés sur le backend (MonitoringController::classify).
const METRICS: MetricDef[] = [
  { key: 'heartRate', label: 'FC', unit: 'bpm', domain: [30, 160], lines: [{ dataKey: 'heartRate', name: 'FC', color: '#0ea5e9' }], warn: { low: 50, high: 110 }, crit: { low: 40, high: 130 } },
  { key: 'spo2', label: 'SpO₂', unit: '%', domain: [80, 100], lines: [{ dataKey: 'spo2', name: 'SpO₂', color: '#10b981' }], warn: { low: 94 }, crit: { low: 90 } },
  { key: 'bloodPressure', label: 'TA', unit: 'mmHg', domain: [40, 200], lines: [{ dataKey: 'systolic', name: 'Systolique', color: '#8b5cf6' }, { dataKey: 'diastolic', name: 'Diastolique', color: '#c4b5fd' }], warn: { low: 100, high: 160 }, crit: { low: 90, high: 180 } },
  { key: 'respiratoryRate', label: 'FR', unit: '/min', domain: [4, 32], lines: [{ dataKey: 'respiratoryRate', name: 'FR', color: '#f59e0b' }], warn: { low: 10, high: 24 }, crit: { low: 8, high: 28 } },
  { key: 'temperature', label: 'T°', unit: '°C', domain: [34, 41], lines: [{ dataKey: 'temperature', name: 'T°', color: '#f43f5e' }], warn: { low: 35.8, high: 38.3 }, crit: { low: 35, high: 39.5 } },
];

const POLL_MS = 5000;

interface VitalsChartProps {
  bedId: number;
  minutes?: number;
  compact?: boolean;
  /** Fixe la constante affichée (masque le sélecteur). */
  metric?: MetricKey;
}

/**
 * Courbe des constantes d'un lit (données reconstruites à la volée par le
 * backend — option A, sans stockage). Rafraîchie toutes les 5 s pour glisser
 * la fenêtre temporelle.
 */
export function VitalsChart({ bedId, minutes = 30, compact = false, metric }: VitalsChartProps) {
  const [points, setPoints] = useState<HistoryPoint[]>([]);
  const [selected, setSelected] = useState<MetricKey>(metric ?? 'heartRate');
  const def = METRICS.find((m) => m.key === selected)!;

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await apiClient.get<{ points: HistoryPoint[] }>(ENDPOINTS.MONITORING_HISTORY, {
          params: { bedId, minutes, points: compact ? 40 : 90 },
        });
        if (alive) setPoints(res.data.points);
      } catch {
        /* ignore */
      }
    }
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [bedId, minutes, compact]);

  return (
    <div>
      {!metric && !compact && (
        <div className="mb-2 flex flex-wrap gap-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setSelected(m.key)}
              className={cn(
                'rounded-md px-2 py-1 font-poppins text-xs transition-colors',
                selected === m.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height={compact ? 96 : 240}>
        <LineChart data={points} margin={{ top: 8, right: 10, left: -6, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f0efe9" />
          <XAxis
            dataKey="ts"
            type="number"
            domain={['dataMin', 'dataMax']}
            scale="time"
            tickFormatter={(v) => format(new Date(v), 'HH:mm')}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            minTickGap={40}
            hide={compact}
          />
          <YAxis domain={def.domain} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={compact ? 26 : 34} />
          {!compact && (
            <Tooltip
              labelFormatter={(v) => format(new Date(Number(v)), 'HH:mm:ss')}
              formatter={(val, name) => [`${val} ${def.unit}`, name]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
          )}

          {def.crit.low != null && <ReferenceLine y={def.crit.low} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />}
          {def.crit.high != null && <ReferenceLine y={def.crit.high} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />}
          {def.warn.low != null && <ReferenceLine y={def.warn.low} stroke="#f59e0b" strokeDasharray="2 4" strokeOpacity={0.4} />}
          {def.warn.high != null && <ReferenceLine y={def.warn.high} stroke="#f59e0b" strokeDasharray="2 4" strokeOpacity={0.4} />}

          {def.lines.map((l) => (
            <Line key={l.dataKey} type="monotone" dataKey={l.dataKey} name={l.name} stroke={l.color} strokeWidth={2} dot={false} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
