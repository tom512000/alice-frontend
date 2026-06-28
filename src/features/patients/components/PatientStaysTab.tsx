import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { staysActions } from '@/features/stays/staysSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/format';
import { Plus } from 'lucide-react';
import { isDoctor, isAdmin, isNurse } from '@/lib/permissions';
import type { StayRead } from '@/types/entities';

export function PatientStaysTab({ patientId }: { patientId: number }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading } = useAppSelector((s) => s.stays);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles) || isNurse(roles);

  useEffect(() => {
    dispatch(staysActions.fetchList({ page: 1, itemsPerPage: 20 }));
  }, [patientId, dispatch]);

  const filteredItems = items.filter((s) => {
    const pId = typeof s.patient === 'string' ? s.patient : s.patient?.id;
    return pId == patientId;
  });

  const columns: Column<StayRead>[] = [
    { key: 'startDate', header: 'Début', render: (r) => <span>{formatDate(r.startDate)}</span> },
    { key: 'endDate', header: 'Fin', render: (r) => <span>{r.endDate ? formatDate(r.endDate) : <span className="text-green-600 font-medium">En cours</span>}</span> },
    { key: 'room', header: 'Chambre', render: (r) => <span>{r.room ?? '—'}</span> },
    { key: 'service', header: 'Service', render: (r) => <span>{r.service?.serviceName ?? '—'}</span> },
    { key: 'observations', header: 'Obs.', render: (r) => <span>{r.observations?.length ?? 0}</span> },
  ];

  return (
    <div className="space-y-3">
      {canWrite && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => navigate(`/stays/new?patient=${patientId}`)} icon={<Plus className="h-3.5 w-3.5" />}>
            Nouveau séjour
          </Button>
        </div>
      )}
      <DataTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        totalItems={filteredItems.length}
        emptyTitle="Aucun séjour"
        getRowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/stays/${r.id}`)}
      />
    </div>
  );
}
