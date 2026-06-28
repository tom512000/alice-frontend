import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { surgicalOperationsActions } from '../surgicalOperationsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { SurgicalStatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatName, formatDuration } from '@/lib/format';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import type { SurgicalOperationRead } from '@/types/entities';

export function SurgicalOperationListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.surgicalOperations);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<SurgicalOperationRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(p = page) {
    dispatch(surgicalOperationsActions.fetchList({ page: p, itemsPerPage: 30, ...(statusFilter && { status: statusFilter }), order: { scheduledAt: 'asc' } }));
  }
  useEffect(() => { load(1); }, [statusFilter]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await dispatch(surgicalOperationsActions.deleteOne(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (surgicalOperationsActions.deleteOne.fulfilled.match(res)) toastSuccess('Opération supprimée.');
    else toastError('Suppression impossible.');
  }

  const columns: Column<SurgicalOperationRead>[] = [
    { key: 'scheduledAt', header: 'Date prévue', sortable: true, render: (r) => <span>{formatDateTime(r.scheduledAt)}</span> },
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{formatName(r.patient?.lastname, r.patient?.firstname)}</span> },
    { key: 'operationType', header: 'Intervention', render: (r) => <span>{r.operationType}</span> },
    { key: 'leadSurgeon', header: 'Chirurgien', render: (r) => <span>{formatName(r.leadSurgeon?.lastname, r.leadSurgeon?.firstname)}</span> },
    { key: 'operatingRoom', header: 'Salle', render: (r) => <span>{r.operatingRoom ?? '—'}</span> },
    { key: 'status', header: 'Statut', render: (r) => <SurgicalStatusBadge status={r.status} /> },
    { key: 'durationMinutes', header: 'Durée', render: (r) => <span>{formatDuration(r.durationMinutes)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Bloc opératoire" subtitle={`${totalItems} interventions`}
        actions={canWrite && <Button size="sm" onClick={() => navigate('/surgical-operations/new')} icon={<Plus className="h-4 w-4" />}>Nouvelle intervention</Button>}
      />
      <div className="flex gap-3 mb-4">
        <Select
          options={[{ value: 'scheduled', label: 'Planifiée' }, { value: 'performed', label: 'Réalisée' }, { value: 'cancelled', label: 'Annulée' }, { value: 'postponed', label: 'Reportée' }]}
          placeholder="Tous les statuts"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        />
      </div>
      <DataTable columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id} onRowClick={(r) => navigate(`/surgical-operations/${r.id}`)}
        emptyTitle="Aucune intervention"
        actions={(row) => (
          <>
            <Button size="icon" variant="ghost" onClick={() => navigate(`/surgical-operations/${row.id}`)} icon={<Eye className="h-4 w-4" />} />
            {canWrite && <Button size="icon" variant="ghost" onClick={() => navigate(`/surgical-operations/${row.id}/edit`)} icon={<Pencil className="h-4 w-4" />} />}
            {isAdmin(roles) && <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />}
          </>
        )}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message="Supprimer cette intervention ?" />
    </div>
  );
}
