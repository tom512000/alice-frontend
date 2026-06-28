import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { vitalSignsActions } from '../vitalSignsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { formatDateTime, formatName } from '@/lib/format';
import { Plus } from 'lucide-react';
import type { VitalSignRead } from '@/types/entities';

export function VitalSignListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.vitalSigns);

  function load(p = page) {
    dispatch(vitalSignsActions.fetchList({ page: p, itemsPerPage: 30, order: { recordedAt: 'desc' } }));
  }
  useEffect(() => { load(1); }, []);

  const columns: Column<VitalSignRead>[] = [
    { key: 'recordedAt', header: 'Date', render: (r) => <span>{formatDateTime(r.recordedAt)}</span> },
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{formatName(r.patient?.lastname, r.patient?.firstname)}</span> },
    { key: 'temperature', header: 'Temp (°C)', render: (r) => <span>{r.temperature ?? '—'}</span> },
    { key: 'bp', header: 'TA (mmHg)', render: (r) => <span>{r.systolicBp && r.diastolicBp ? `${r.systolicBp}/${r.diastolicBp}` : '—'}</span> },
    { key: 'heartRate', header: 'FC (bpm)', render: (r) => <span>{r.heartRate ?? '—'}</span> },
    { key: 'oxygenSaturation', header: 'SpO2 (%)', render: (r) => <span>{r.oxygenSaturation ?? '—'}</span> },
    { key: 'weight', header: 'Poids (kg)', render: (r) => <span>{r.weight ?? '—'}</span> },
    { key: 'painScore', header: 'EVA /10', render: (r) => <span>{r.painScore ?? '—'}</span> },
    { key: 'recordedBy', header: 'Saisi par', render: (r) => <span>{formatName(r.recordedBy?.lastname, r.recordedBy?.firstname)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Constantes vitales" subtitle={`${totalItems} mesures`}
        actions={<Button size="sm" onClick={() => navigate('/vital-signs/new')} icon={<Plus className="h-4 w-4" />}>Saisir</Button>}
      />
      <DataTable columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id} emptyTitle="Aucune mesure"
      />
    </div>
  );
}
