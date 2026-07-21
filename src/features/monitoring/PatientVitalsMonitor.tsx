import { useAppSelector } from '@/app/hooks';
import { BedVitalsPanel } from './BedVitalsPanel';
import { VitalsChart } from './VitalsChart';
import { BedDouble, MonitorOff } from 'lucide-react';

/**
 * Monitoring temps réel d'un patient donné : retrouve, parmi les lits branchés
 * (flux SSE global), celui du patient et affiche ses constantes live + la courbe.
 */
export function PatientVitalsMonitor({ patientId }: { patientId: number }) {
  const entry = useAppSelector((s) => s.monitoring.entries.find((e) => e.patient?.id === patientId));

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
        <MonitorOff className="h-7 w-7 text-gray-300" />
        <p className="font-poppins text-sm text-gray-500">Aucun monitoring en cours</p>
        <p className="font-poppins text-xs text-gray-400">Ce patient n'est pas branché à un moniteur (aucun lit occupé).</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-1.5 font-poppins text-xs text-gray-500">
        <BedDouble className="h-3.5 w-3.5" /> Lit {entry.bedLabel}
        {entry.roomName ? `, ${entry.roomName}` : ''}
      </p>

      <BedVitalsPanel bedId={entry.bedId} />

      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <p className="mb-1 font-lexend text-xs font-semibold text-gray-700">Courbe (30 dernières minutes)</p>
        <VitalsChart bedId={entry.bedId} />
      </div>
    </div>
  );
}
