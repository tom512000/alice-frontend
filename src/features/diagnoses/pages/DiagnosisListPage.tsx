import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { diagnosesActions } from '../diagnosesSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatName, DIAGNOSIS_TYPE_LABELS, DIAGNOSIS_CERTAINTY_LABELS } from '@/lib/format';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { DiagnosisRead } from '@/types/entities';

export function DiagnosisListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.diagnoses);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);
  const [deleteTarget, setDeleteTarget] = useState<DiagnosisRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(p = page) {
    dispatch(diagnosesActions.fetchList({ page: p, itemsPerPage: 30, order: { diagnosedAt: 'desc' } }));
  }
  useEffect(() => { load(1); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await dispatch(diagnosesActions.deleteOne(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (diagnosesActions.deleteOne.fulfilled.match(res)) toastSuccess('Diagnostic supprimé.');
    else toastError('Erreur.');
  }

  const columns: Column<DiagnosisRead>[] = [
    { key: 'diagnosedAt', header: 'Date', sortable: true, render: (r) => <span>{formatDate(r.diagnosedAt)}</span> },
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{formatName(r.patient?.lastname, r.patient?.firstname)}</span> },
    { key: 'icd10Code', header: 'Code CIM-10', render: (r) => <span className="font-mono text-xs">{r.icd10Code ?? '—'}</span> },
    { key: 'label', header: 'Libellé', render: (r) => <span>{r.label}</span>, className: 'max-w-xs' },
    { key: 'type', header: 'Type', render: (r) => <Badge>{DIAGNOSIS_TYPE_LABELS[r.type] ?? r.type}</Badge> },
    { key: 'certainty', header: 'Certitude', render: (r) => <Badge variant={r.certainty === 'confirmed' ? 'success' : r.certainty === 'suspected' ? 'warning' : 'danger'}>{DIAGNOSIS_CERTAINTY_LABELS[r.certainty] ?? r.certainty}</Badge> },
    { key: 'physician', header: 'Médecin', render: (r) => <span>{formatName(r.physician?.lastname, r.physician?.firstname)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Diagnostics" subtitle={`${totalItems} diagnostics`}
        actions={canWrite && <Button size="sm" onClick={() => navigate('/diagnoses/new')} icon={<Plus className="h-4 w-4" />}>Nouveau</Button>}
      />
      <DataTable columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id} emptyTitle="Aucun diagnostic"
        actions={(row) => (
          <>
            {canWrite && <Button size="icon" variant="ghost" onClick={() => navigate(`/diagnoses/${row.id}/edit`)} icon={<Pencil className="h-4 w-4" />} />}
            {canWrite && <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />}
          </>
        )}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message="Supprimer ce diagnostic ?" />
    </div>
  );
}
