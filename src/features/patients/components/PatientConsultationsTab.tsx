import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { consultationsActions } from '@/features/consultations/consultationsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/Button';
import { formatDateTime, formatPrice, formatName } from '@/lib/format';
import { Plus, Eye } from 'lucide-react';
import { isDoctor, isAdmin } from '@/lib/permissions';
import type { ConsultationRead } from '@/types/entities';

export function PatientConsultationsTab({ patientId }: { patientId: number }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading, totalItems } = useAppSelector((s) => s.consultations);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);

  useEffect(() => {
    dispatch(consultationsActions.fetchList({ page: 1, itemsPerPage: 10 }));
  }, [patientId, dispatch]);

  const filteredItems = items.filter((c) => {
    const pId = typeof c.patient === 'string' ? c.patient : c.patient?.id;
    return pId == patientId;
  });

  const columns: Column<ConsultationRead>[] = [
    { key: 'consultationDate', header: 'Date', render: (r) => <span>{formatDateTime(r.consultationDate)}</span> },
    { key: 'user', header: 'Médecin', render: (r) => <span>{formatName(r.user?.lastname, r.user?.firstname)}</span> },
    { key: 'details', header: 'Détails', render: (r) => <span className="truncate max-w-xs block">{r.details ?? '—'}</span>, className: 'max-w-xs' },
    { key: 'price', header: 'Prix', render: (r) => <span>{formatPrice(r.price)}</span> },
  ];

  return (
    <div className="space-y-3">
      {canWrite && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => navigate(`/consultations/new?patient=${patientId}`)} icon={<Plus className="h-3.5 w-3.5" />}>
            Nouvelle consultation
          </Button>
        </div>
      )}
      <DataTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        totalItems={filteredItems.length}
        emptyTitle="Aucune consultation"
        getRowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/consultations/${r.id}`)}
        actions={(r) => (
          <Button size="icon" variant="ghost" onClick={() => navigate(`/consultations/${r.id}`)} icon={<Eye className="h-4 w-4" />} />
        )}
      />
    </div>
  );
}
