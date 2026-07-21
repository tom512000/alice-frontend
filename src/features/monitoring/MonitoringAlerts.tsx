import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setVitals, type BedVitals } from './monitoringSlice';
import { formatName } from '@/lib/format';
import { AlertTriangle, ChevronRight, X } from 'lucide-react';

const STREAM_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/api/monitoring/stream`;

/**
 * Surveillance globale des constantes vitales : monté une seule fois dans le
 * Layout, il ouvre un flux SSE (Server-Sent Events) vers le backend et affiche
 * un bandeau rouge — visible sur TOUTES les pages — dès qu'un lit occupé passe
 * en critique. Le flux est consommé via fetch + ReadableStream (et non via
 * EventSource) pour pouvoir transmettre le JWT dans l'en-tête Authorization.
 */
export function MonitoringAlerts() {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((s) => s.monitoring.entries);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let stopped = false;
    let retry: ReturnType<typeof setTimeout>;

    async function connect() {
      try {
        const token = localStorage.getItem('alice_token');
        const res = await fetch(STREAM_URL, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error('stream indisponible');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!stopped) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split('\n\n');
          buffer = frames.pop() ?? ''; // le dernier fragment peut être incomplet
          for (const frame of frames) {
            const dataLine = frame.split('\n').find((l) => l.startsWith('data:'));
            if (!dataLine) continue;
            try {
              dispatch(setVitals(JSON.parse(dataLine.slice(5).trim()) as BedVitals[]));
            } catch {
              /* trame partielle / non-JSON : on ignore */
            }
          }
        }
      } catch {
        /* réseau coupé ou fin de flux : on retentera */
      }
      // Le serveur ferme le flux périodiquement (borne anti-worker) → on reconnecte.
      if (!stopped) retry = setTimeout(connect, 2000);
    }

    connect();
    return () => {
      stopped = true;
      controller.abort();
      clearTimeout(retry);
    };
  }, [dispatch]);

  const critical = useMemo(() => entries.filter((e) => e.severity === 'critical'), [entries]);
  // Clé = ensemble des lits critiques : si elle change (nouveau lit en alerte),
  // le bandeau réapparaît même après avoir été masqué.
  const key = useMemo(() => critical.map((e) => e.bedId).sort((a, b) => a - b).join(','), [critical]);

  if (critical.length === 0 || key === dismissedKey) return null;

  const first = critical[0];
  const worst = first.metrics.find((m) => m.severity === 'critical');

  return (
    <div className="sticky top-14 z-30 border-b border-red-800 bg-red-600 text-white shadow-md">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <AlertTriangle className="h-5 w-5 shrink-0 animate-pulse" />
        <div className="min-w-0 flex-1 truncate text-sm font-poppins">
          <span className="font-semibold">Alerte constantes vitales</span>
          {' — '}
          {first.patient ? formatName(first.patient.lastname, first.patient.firstname) : 'Patient'}
          {' ('}Lit {first.bedLabel}
          {first.roomName ? `, ${first.roomName}` : ''}
          {')'}
          {worst && (
            <span className="font-semibold"> · {worst.label} {worst.value} {worst.unit}</span>
          )}
          {critical.length > 1 && (
            <span className="ml-1 opacity-90">+{critical.length - 1} autre{critical.length - 1 > 1 ? 's' : ''}</span>
          )}
        </div>
        <Link
          to="/beds"
          className="hidden shrink-0 items-center gap-1 rounded-md bg-white/15 px-2.5 py-1 text-xs font-medium hover:bg-white/25 sm:inline-flex"
        >
          Voir le plan <ChevronRight className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={() => setDismissedKey(key)}
          className="shrink-0 rounded-md p-1 hover:bg-white/15"
          aria-label="Masquer l'alerte"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
