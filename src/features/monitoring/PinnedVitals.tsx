import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { unpin } from './monitoringSlice';
import { BedVitalsPanel } from './BedVitalsPanel';
import { VitalsChart } from './VitalsChart';
import { formatName } from '@/lib/format';
import { cn } from '@/lib/cn';
import { GripVertical, X, BedDouble } from 'lucide-react';

const CARD_W = 288; // w-72

/**
 * Calque global (monté dans le Layout) des cards de monitoring épinglées :
 * elles suivent l'utilisateur sur toutes les pages, sont déplaçables à la
 * souris et se ferment via la croix. La liste des lits épinglés est persistée
 * (localStorage) dans le slice monitoring.
 */
export function PinnedVitals() {
  const dispatch = useAppDispatch();
  const pinned = useAppSelector((s) => s.monitoring.pinnedBedIds);

  useEffect(() => {
    localStorage.setItem('alice_pinned_beds', JSON.stringify(pinned));
  }, [pinned]);

  return (
    <>
      {pinned.map((bedId, i) => (
        <PinnedCard key={bedId} bedId={bedId} index={i} onClose={() => dispatch(unpin(bedId))} />
      ))}
    </>
  );
}

function PinnedCard({ bedId, index, onClose }: { bedId: number; index: number; onClose: () => void }) {
  const entry = useAppSelector((s) => s.monitoring.entries.find((e) => e.bedId === bedId));

  const [pos, setPos] = useState(() => ({
    x: Math.max(8, window.innerWidth - CARD_W - 24 - index * 26),
    y: 76 + index * 26,
  }));
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const x = Math.min(Math.max(0, e.clientX - drag.current.dx), window.innerWidth - CARD_W);
    const y = Math.min(Math.max(0, e.clientY - drag.current.dy), window.innerHeight - 60);
    setPos({ x, y });
  }
  function onPointerUp(e: React.PointerEvent) {
    e.currentTarget.releasePointerCapture(e.pointerId);
    drag.current = null;
  }

  const ring =
    entry?.severity === 'critical' ? 'border-red-400' : entry?.severity === 'warning' ? 'border-amber-400' : 'border-gray-200';

  return (
    <div
      className={cn('fixed z-40 w-72 overflow-hidden rounded-xl border bg-white shadow-xl', ring)}
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="flex cursor-move touch-none items-center gap-2 bg-gray-900 px-3 py-2 text-white"
      >
        <GripVertical className="h-4 w-4 shrink-0 opacity-60" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-lexend text-xs font-semibold leading-tight">
            {entry?.patient ? formatName(entry.patient.lastname, entry.patient.firstname) : `Lit ${bedId}`}
          </p>
          <p className="flex items-center gap-1 font-poppins text-[10px] text-gray-300">
            <BedDouble className="h-2.5 w-2.5" /> Lit {entry?.bedLabel ?? bedId}
            {entry?.roomName ? `, ${entry.roomName}` : ''}
          </p>
        </div>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="shrink-0 rounded p-1 text-gray-300 hover:bg-white/15 hover:text-white"
          aria-label="Désépingler"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-2 p-2.5">
        <BedVitalsPanel bedId={bedId} flat />
        <VitalsChart bedId={bedId} compact metric="heartRate" />
      </div>
    </div>
  );
}
