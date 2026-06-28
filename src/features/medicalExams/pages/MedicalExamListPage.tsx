import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { medicalExamsActions } from '../medicalExamsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatName, EXAM_TYPE_LABELS } from '@/lib/format';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import type { MedicalExamRead } from '@/types/entities';

export function MedicalExamListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.medicalExams);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);
  const [typeFilter, setTypeFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MedicalExamRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(p = page) {
    dispatch(medicalExamsActions.fetchList({ page: p, itemsPerPage: 30, ...(typeFilter && { type: typeFilter }), order: { requestDate: 'desc' } }));
  }
  useEffect(() => { load(1); }, [typeFilter]);

  const examTypes = Object.entries(EXAM_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));

  const columns: Column<MedicalExamRead>[] = [
    { key: 'requestDate', header: 'Demande', sortable: true, render: (r) => <span>{formatDate(r.requestDate)}</span> },
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{formatName(r.patient?.lastname, r.patient?.firstname)}</span> },
    { key: 'type', header: 'Type', render: (r) => <Badge>{EXAM_TYPE_LABELS[r.type] ?? r.type}</Badge> },
    { key: 'description', header: 'Description', render: (r) => <span className="truncate max-w-xs block">{r.description ?? '—'}</span> },
    { key: 'resultDate', header: 'Résultat', render: (r) => <span>{r.resultDate ? formatDate(r.resultDate) : <span className="text-amber-600 text-xs">En attente</span>}</span> },
    { key: 'prescribedBy', header: 'Prescrit par', render: (r) => <span>{formatName(r.prescribedBy?.lastname, r.prescribedBy?.firstname)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Examens médicaux" subtitle={`${totalItems} examens`}
        actions={canWrite && <Button size="sm" onClick={() => navigate('/medical-exams/new')} icon={<Plus className="h-4 w-4" />}>Nouvel examen</Button>}
      />
      <div className="flex gap-3 mb-4">
        <Select options={examTypes} placeholder="Tous les types" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-48" />
      </div>
      <DataTable columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id} onRowClick={(r) => navigate(`/medical-exams/${r.id}`)}
        emptyTitle="Aucun examen"
        actions={(row) => (
          <>
            <Button size="icon" variant="ghost" onClick={() => navigate(`/medical-exams/${row.id}`)} icon={<Eye className="h-4 w-4" />} />
            {canWrite && <Button size="icon" variant="ghost" onClick={() => navigate(`/medical-exams/${row.id}/edit`)} icon={<Pencil className="h-4 w-4" />} />}
            {canWrite && <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />}
          </>
        )}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { setDeleting(true); const res = await dispatch(medicalExamsActions.deleteOne(deleteTarget!.id)); setDeleting(false); setDeleteTarget(null); if (medicalExamsActions.deleteOne.fulfilled.match(res)) toastSuccess('Examen supprimé.'); else toastError('Erreur.'); }} loading={deleting} message="Supprimer cet examen ?" />
    </div>
  );
}
