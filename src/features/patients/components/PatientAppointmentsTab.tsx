import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { appointmentsActions } from '@/features/appointments/appointmentsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/Button';
import { AppointmentStatusBadge } from '@/components/ui/Badge';
import { formatDateTime, formatDuration, formatName } from '@/lib/format';
import { Plus } from 'lucide-react';
import { isDoctor, isAdmin } from '@/lib/permissions';
import type { AppointmentRead } from '@/types/entities';

export function PatientAppointmentsTab({ patientId }: { patientId: number }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading } = useAppSelector((s) => s.appointments);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);

  useEffect(() => {
    dispatch(appointmentsActions.fetchList({ page: 1, itemsPerPage: 20 }));
  }, [patientId, dispatch]);

  const filteredItems = items.filter((a) => {
    const pId = typeof a.patient === 'string' ? a.patient : a.patient?.id;
    return pId == patientId;
  });

  const columns: Column<AppointmentRead>[] = [
    { key: 'scheduledAt', header: 'Date / Heure', render: (r) => <span>{formatDateTime(r.scheduledAt)}</span> },
    { key: 'doctor', header: 'Médecin', render: (r) => <span>{formatName(r.doctor?.lastname, r.doctor?.firstname)}</span> },
    { key: 'reason', header: 'Motif', render: (r) => <span className="truncate max-w-xs block">{r.reason ?? '—'}</span> },
    { key: 'durationMinutes', header: 'Durée', render: (r) => <span>{formatDuration(r.durationMinutes)}</span> },
    { key: 'status', header: 'Statut', render: (r) => <AppointmentStatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-3">
      {canWrite && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => navigate(`/appointments/new?patient=${patientId}`)} icon={<Plus className="h-3.5 w-3.5" />}>
            Nouveau RDV
          </Button>
        </div>
      )}
      <DataTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        totalItems={filteredItems.length}
        emptyTitle="Aucun rendez-vous"
        getRowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/appointments/${r.id}`)}
      />
    </div>
  );
}
