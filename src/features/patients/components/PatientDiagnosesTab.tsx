import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { diagnosesActions } from '@/features/diagnoses/diagnosesSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatName, DIAGNOSIS_TYPE_LABELS, DIAGNOSIS_CERTAINTY_LABELS } from '@/lib/format';
import { Plus } from 'lucide-react';
import { isDoctor, isAdmin } from '@/lib/permissions';
import type { DiagnosisRead } from '@/types/entities';

export function PatientDiagnosesTab({ patientId }: { patientId: number }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading } = useAppSelector((s) => s.diagnoses);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);

  useEffect(() => {
    dispatch(diagnosesActions.fetchList({ page: 1, itemsPerPage: 20 }));
  }, [patientId, dispatch]);

  const filteredItems = items.filter((d) => {
    const pId = typeof d.patient === 'string' ? d.patient : d.patient?.id;
    return pId == patientId;
  });

  const columns: Column<DiagnosisRead>[] = [
    { key: 'diagnosedAt', header: 'Date', render: (r) => <span>{formatDate(r.diagnosedAt)}</span> },
    { key: 'icd10Code', header: 'Code CIM-10', render: (r) => <span className="font-mono text-xs">{r.icd10Code ?? '—'}</span> },
    { key: 'label', header: 'Libellé', render: (r) => <span className="font-medium">{r.label}</span>, className: 'max-w-xs' },
    { key: 'type', header: 'Type', render: (r) => <Badge>{DIAGNOSIS_TYPE_LABELS[r.type] ?? r.type}</Badge> },
    { key: 'certainty', header: 'Certitude', render: (r) => <Badge variant={r.certainty === 'confirmed' ? 'success' : r.certainty === 'suspected' ? 'warning' : 'danger'}>{DIAGNOSIS_CERTAINTY_LABELS[r.certainty] ?? r.certainty}</Badge> },
    { key: 'physician', header: 'Médecin', render: (r) => <span>{formatName(r.physician?.lastname, r.physician?.firstname)}</span> },
  ];

  return (
    <div className="space-y-3">
      {canWrite && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => navigate(`/diagnoses/new?patient=${patientId}`)} icon={<Plus className="h-3.5 w-3.5" />}>
            Nouveau diagnostic
          </Button>
        </div>
      )}
      <DataTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        totalItems={filteredItems.length}
        emptyTitle="Aucun diagnostic"
        getRowKey={(r) => r.id}
      />
    </div>
  );
}
