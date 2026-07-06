import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { takesActions } from '../takesSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/format';
import { canWriteNursing, canDelete } from '@/lib/permissions';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { TakeRead } from '@/types/entities';

export function TakeListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.takes);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = canWriteNursing(roles);
  const [deleteTarget, setDeleteTarget] = useState<TakeRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(p = page) {
    dispatch(takesActions.fetchList({ page: p, itemsPerPage: 30 }));
  }
  useEffect(() => { load(1); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await dispatch(takesActions.deleteOne(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (takesActions.deleteOne.fulfilled.match(res)) toastSuccess('Prise supprimée.');
    else toastError('Erreur.');
  }

  const columns: Column<TakeRead>[] = [
    { key: 'datetime', header: 'Date et heure', sortable: true, render: (r) => <span>{formatDateTime(r.datetime)}</span> },
    { key: 'treatment', header: 'Traitement', render: (r) => <span className="font-medium">{r.treatment?.name ?? '—'}</span> },
    { key: 'posology', header: 'Posologie', render: (r) => <span className="text-gray-500">{r.treatment?.posology ?? '—'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Prises de traitement" subtitle={`${totalItems} prises`}
        actions={canWrite && <Button size="sm" onClick={() => navigate('/takes/new')} icon={<Plus className="h-4 w-4" />}>Nouvelle prise</Button>}
      />
      <DataTable columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id} emptyTitle="Aucune prise enregistrée"
        actions={(row) => (
          <>
            {canWrite && <Button size="icon" variant="ghost" onClick={() => navigate(`/takes/${row.id}/edit`)} icon={<Pencil className="h-4 w-4" />} />}
            {canDelete(roles) && <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />}
          </>
        )}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message="Supprimer cette prise ?" />
    </div>
  );
}
