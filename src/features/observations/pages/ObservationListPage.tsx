import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { observationsActions } from '../observationsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatName } from '@/lib/format';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { ObservationRead } from '@/types/entities';

export function ObservationListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.observations);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const [deleteTarget, setDeleteTarget] = useState<ObservationRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(p = page) {
    dispatch(observationsActions.fetchList({ page: p, itemsPerPage: 30, order: { observationDate: 'desc' } }));
  }
  useEffect(() => { load(1); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await dispatch(observationsActions.deleteOne(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (observationsActions.deleteOne.fulfilled.match(res)) toastSuccess('Observation supprimée.');
    else toastError('Erreur.');
  }

  const columns: Column<ObservationRead>[] = [
    { key: 'observationDate', header: 'Date', render: (r) => <span>{formatDateTime(r.observationDate)}</span> },
    { key: 'user', header: 'Auteur', render: (r) => <span>{formatName(r.user?.lastname, r.user?.firstname)}</span> },
    { key: 'note', header: 'Note', render: (r) => <span className="truncate max-w-xs block">{r.note}</span> },
  ];

  return (
    <div>
      <PageHeader title="Observations infirmières" subtitle={`${totalItems} observations`}
        actions={<Button size="sm" onClick={() => navigate('/observations/new')} icon={<Plus className="h-4 w-4" />}>Nouvelle observation</Button>}
      />
      <DataTable columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id} emptyTitle="Aucune observation"
        actions={(row) => (
          <>
            <Button size="icon" variant="ghost" onClick={() => navigate(`/observations/${row.id}/edit`)} icon={<Pencil className="h-4 w-4" />} />
            {(isAdmin(roles) || isDoctor(roles)) && <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />}
          </>
        )}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message="Supprimer cette observation ?" />
    </div>
  );
}
