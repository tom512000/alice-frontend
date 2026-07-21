import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { BedVitalsPanel } from './BedVitalsPanel';
import { VitalsChart } from './VitalsChart';
import { togglePin, type VitalSeverity } from './monitoringSlice';
import { formatName } from '@/lib/format';
import { cn } from '@/lib/cn';
import { BedDouble, Activity, Pin } from 'lucide-react';

const RANK: Record<VitalSeverity, number> = { critical: 0, warning: 1, normal: 2 };

const BADGE: Record<VitalSeverity, string> = {
  critical: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  normal: 'bg-emerald-100 text-emerald-700',
};

const BADGE_LABEL: Record<VitalSeverity, string> = {
  critical: 'Critique',
  warning: 'À surveiller',
  normal: 'Stable',
};

/**
 * Tableau de bord « temps réel » de tous les patients branchés à un moniteur
 * (lits occupés). Alimenté par le flux SSE global ; les plus critiques en tête.
 */
export function LiveVitalsBoard() {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((s) => s.monitoring.entries);
  const pinned = useAppSelector((s) => s.monitoring.pinnedBedIds);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => RANK[a.severity] - RANK[b.severity]),
    [entries]
  );

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
        <Activity className="h-8 w-8 text-gray-300" />
        <p className="font-poppins text-sm text-gray-500">Aucun patient branché à un moniteur pour le moment.</p>
        <p className="font-poppins text-xs text-gray-400">Un lit occupé apparaît ici automatiquement.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {sorted.map((e) => (
        <div
          key={e.bedId}
          className={cn(
            'rounded-xl border bg-white p-4 shadow-sm',
            e.severity === 'critical' ? 'border-red-300' : e.severity === 'warning' ? 'border-amber-300' : 'border-gray-200'
          )}
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-lexend text-sm font-semibold text-gray-900">
                {e.patient ? formatName(e.patient.lastname, e.patient.firstname) : 'Patient'}
              </p>
              <p className="flex items-center gap-1 font-poppins text-xs text-gray-500">
                <BedDouble className="h-3 w-3" /> Lit {e.bedLabel}
                {e.roomName ? `, ${e.roomName}` : ''}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className={cn('rounded px-1.5 py-0.5 font-poppins text-[10px] font-medium', BADGE[e.severity])}>
                {BADGE_LABEL[e.severity]}
              </span>
              <button
                type="button"
                onClick={() => dispatch(togglePin(e.bedId))}
                title={pinned.includes(e.bedId) ? 'Désépingler' : 'Épingler (suit sur toute l\'app)'}
                className={cn(
                  'rounded-md p-1 transition-colors',
                  pinned.includes(e.bedId) ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                )}
              >
                <Pin className={cn('h-3.5 w-3.5', pinned.includes(e.bedId) && 'fill-current')} />
              </button>
            </div>
          </div>

          <BedVitalsPanel bedId={e.bedId} flat />

          <div className="mt-3 border-t border-gray-100 pt-3">
            <VitalsChart bedId={e.bedId} />
          </div>
        </div>
      ))}
    </div>
  );
}
