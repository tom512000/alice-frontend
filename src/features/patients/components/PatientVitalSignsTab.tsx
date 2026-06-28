import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { vitalSignsActions } from '@/features/vitalSigns/vitalSignsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/Button';
import { formatDateTime, formatName } from '@/lib/format';
import { Plus, Heart } from 'lucide-react';
import type { VitalSignRead } from '@/types/entities';

export function PatientVitalSignsTab({ patientId }: { patientId: number }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading } = useAppSelector((s) => s.vitalSigns);

  useEffect(() => {
    dispatch(vitalSignsActions.fetchList({ page: 1, itemsPerPage: 20 }));
  }, [patientId, dispatch]);

  const filteredItems = items.filter((v) => {
    const pId = typeof v.patient === 'string' ? v.patient : v.patient?.id;
    return pId == patientId;
  });

  const columns: Column<VitalSignRead>[] = [
    { key: 'recordedAt', header: 'Date', render: (r) => <span>{formatDateTime(r.recordedAt)}</span> },
    { key: 'temperature', header: 'Temp. (°C)', render: (r) => <span>{r.temperature ?? '—'}</span> },
    {
      key: 'bloodPressure', header: 'TA (mmHg)',
      render: (r) => <span>{r.systolicBp && r.diastolicBp ? `${r.systolicBp}/${r.diastolicBp}` : '—'}</span>
    },
    { key: 'heartRate', header: 'FC (bpm)', render: (r) => <span>{r.heartRate ?? '—'}</span> },
    { key: 'oxygenSaturation', header: 'SpO2 (%)', render: (r) => <span>{r.oxygenSaturation ?? '—'}</span> },
    { key: 'weight', header: 'Poids (kg)', render: (r) => <span>{r.weight ?? '—'}</span> },
    { key: 'painScore', header: 'EVA', render: (r) => <span>{r.painScore ?? '—'}</span> },
    { key: 'recordedBy', header: 'Mesuré par', render: (r) => <span>{formatName(r.recordedBy?.lastname, r.recordedBy?.firstname)}</span> },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => navigate(`/vital-signs/new?patient=${patientId}`)} icon={<Plus className="h-3.5 w-3.5" />}>
          Nouvelles constantes
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        totalItems={filteredItems.length}
        emptyTitle="Aucune mesure"
        getRowKey={(r) => r.id}
      />
    </div>
  );
}
