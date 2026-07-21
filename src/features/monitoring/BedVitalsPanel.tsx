import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchVitals, type VitalSeverity } from './monitoringSlice';
import { cn } from '@/lib/cn';
import { HeartPulse, Activity, Gauge, Wind, Thermometer } from 'lucide-react';

const ICONS: Record<string, typeof HeartPulse> = {
  heartRate: HeartPulse,
  spo2: Activity,
  bloodPressure: Gauge,
  respiratoryRate: Wind,
  temperature: Thermometer,
};

const TILE: Record<VitalSeverity, string> = {
  normal: 'border-gray-200 bg-gray-50 text-gray-900',
  warning: 'border-amber-300 bg-amber-50 text-amber-800',
  critical: 'border-red-300 bg-red-50 text-red-700',
};

/**
 * Constantes vitales « live » d'un lit occupé (données simulées par le backend).
 * Se rafraîchit via le poll global du monitoring (store Redux) ; déclenche aussi
 * un fetch immédiat à l'ouverture pour ne pas attendre le prochain tick.
 */
export function BedVitalsPanel({ bedId, flat = false }: { bedId: number; flat?: boolean }) {
  const dispatch = useAppDispatch();
  const entry = useAppSelector((s) => s.monitoring.entries.find((e) => e.bedId === bedId));

  useEffect(() => {
    dispatch(fetchVitals());
  }, [dispatch]);

  const tiles = !entry ? (
    <p className="py-3 text-center text-xs text-gray-400 font-poppins">Connexion au moniteur…</p>
  ) : (
    <div className="grid grid-cols-3 gap-2">
      {entry.metrics.map((m) => {
        const Icon = ICONS[m.key] ?? Activity;
        return (
          <div
            key={m.key}
            className={cn('rounded-md border p-2', TILE[m.severity], m.severity === 'critical' && 'animate-pulse')}
          >
            <div className="flex items-center gap-1 font-poppins text-[10px] font-medium opacity-70">
              <Icon className="h-3 w-3" /> {m.label}
            </div>
            <div className="mt-0.5 font-lexend text-sm font-semibold leading-none">
              {m.value}
              <span className="ml-0.5 text-[10px] font-normal opacity-70">{m.unit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Mode « flat » : uniquement les tuiles (le conteneur/en-tête est fourni par l'appelant).
  if (flat) return tiles;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-lexend text-xs font-semibold text-gray-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Monitoring branché
        </span>
        {entry && entry.severity !== 'normal' && (
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-[10px] font-medium font-poppins',
              entry.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            )}
          >
            {entry.severity === 'critical' ? 'Critique' : 'À surveiller'}
          </span>
        )}
      </div>

      {tiles}

      <p className="mt-2 font-poppins text-[10px] text-gray-400">Données simulées · rafraîchies automatiquement</p>
    </div>
  );
}
