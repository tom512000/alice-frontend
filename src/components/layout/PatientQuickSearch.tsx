import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, X } from 'lucide-react';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { formatDate, formatName } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { PatientSearchResult } from '@/types/entities';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

interface PatientQuickSearchProps {
  /** Overlay pleine largeur sous le header (mobile) au lieu d'un champ inline. */
  variant?: 'inline' | 'mobile-overlay';
  onClose?: () => void;
}

export function PatientQuickSearch({ variant = 'inline', onClose }: PatientQuickSearchProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      return;
    }

    const currentRequest = ++requestId.current;
    setLoading(true);
    const timer = setTimeout(() => {
      apiClient
        .get<PatientSearchResult[]>(`/${ENDPOINTS.PATIENT_SEARCH}`, { params: { q: trimmed } })
        .then((res) => {
          if (currentRequest === requestId.current) {
            setResults(res.data);
            setActiveIndex(-1);
          }
        })
        .catch(() => {
          if (currentRequest === requestId.current) setResults([]);
        })
        .finally(() => {
          if (currentRequest === requestId.current) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectPatient(patient: PatientSearchResult) {
    navigate(`/patients/${patient.id}`);
    setQuery('');
    setResults([]);
    setOpen(false);
    onClose?.();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectPatient(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      (e.target as HTMLInputElement).blur();
    }
  }

  const showDropdown = open && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative',
        variant === 'inline' ? 'w-full max-w-sm' : 'w-full px-3 py-2'
      )}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher un patient…"
          autoFocus={variant === 'mobile-overlay'}
          className="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-8 text-sm font-poppins text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none"
        />
        {loading && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </span>
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Effacer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {loading && results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-gray-400 font-poppins">Recherche…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-gray-400 font-poppins">Aucun patient trouvé.</p>
          ) : (
            results.map((patient, i) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => selectPatient(patient)}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-3 py-2 text-left font-poppins transition-colors',
                  i === activeIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                )}
              >
                <span className="text-sm font-medium text-gray-800 truncate">
                  {formatName(patient.lastname, patient.firstname)}
                </span>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatDate(patient.birthdate)}{patient.nss ? ` · ${patient.nss}` : ''}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
