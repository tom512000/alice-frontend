import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { medicalExamsActions } from '@/features/medicalExams/medicalExamsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatName, EXAM_TYPE_LABELS } from '@/lib/format';
import { Plus } from 'lucide-react';
import { isDoctor, isAdmin } from '@/lib/permissions';
import type { MedicalExamRead } from '@/types/entities';

export function PatientExamsTab({ patientId }: { patientId: number }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading } = useAppSelector((s) => s.medicalExams);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);

  useEffect(() => {
    dispatch(medicalExamsActions.fetchList({ page: 1, itemsPerPage: 20 }));
  }, [patientId, dispatch]);

  const filteredItems = items.filter((e) => {
    const pId = typeof e.patient === 'string' ? e.patient : e.patient?.id;
    return pId == patientId;
  });

  const columns: Column<MedicalExamRead>[] = [
    { key: 'requestDate', header: 'Demande', render: (r) => <span>{formatDate(r.requestDate)}</span> },
    { key: 'type', header: 'Type', render: (r) => <Badge>{EXAM_TYPE_LABELS[r.type] ?? r.type}</Badge> },
    { key: 'description', header: 'Description', render: (r) => <span className="truncate max-w-xs block">{r.description ?? '—'}</span> },
    { key: 'resultDate', header: 'Résultat', render: (r) => <span>{r.resultDate ? formatDate(r.resultDate) : <span className="text-amber-500">En attente</span>}</span> },
    { key: 'prescribedBy', header: 'Prescrit par', render: (r) => <span>{formatName(r.prescribedBy?.lastname, r.prescribedBy?.firstname)}</span> },
  ];

  return (
    <div className="space-y-3">
      {canWrite && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => navigate(`/medical-exams/new?patient=${patientId}`)} icon={<Plus className="h-3.5 w-3.5" />}>
            Nouvel examen
          </Button>
        </div>
      )}
      <DataTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        totalItems={filteredItems.length}
        emptyTitle="Aucun examen"
        getRowKey={(r) => r.id}
      />
    </div>
  );
}
