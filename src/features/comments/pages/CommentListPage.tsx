import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { commentsActions } from '../commentsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatName } from '@/lib/format';
import { canWriteNursing, canDelete } from '@/lib/permissions';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { CommentRead } from '@/types/entities';

export function CommentListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.comments);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = canWriteNursing(roles);
  const [deleteTarget, setDeleteTarget] = useState<CommentRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(p = page) {
    dispatch(commentsActions.fetchList({ page: p, itemsPerPage: 30 }));
  }
  useEffect(() => { load(1); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await dispatch(commentsActions.deleteOne(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (commentsActions.deleteOne.fulfilled.match(res)) toastSuccess('Commentaire supprimé.');
    else toastError('Erreur.');
  }

  const columns: Column<CommentRead>[] = [
    { key: 'writtenAt', header: 'Date', sortable: true, render: (r) => <span>{formatDateTime(r.writtenAt)}</span> },
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{formatName(r.patient?.lastname, r.patient?.firstname)}</span> },
    { key: 'author', header: 'Auteur', render: (r) => <span>{formatName(r.author?.lastname, r.author?.firstname)}</span> },
    { key: 'content', header: 'Commentaire', render: (r) => <span className="block max-w-md truncate text-gray-600">{r.content}</span> },
  ];

  return (
    <div>
      <PageHeader title="Commentaires" subtitle={`${totalItems} commentaires`}
        actions={canWrite && <Button size="sm" onClick={() => navigate('/comments/new')} icon={<Plus className="h-4 w-4" />}>Nouveau commentaire</Button>}
      />
      <DataTable columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id} emptyTitle="Aucun commentaire"
        actions={(row) => (
          <>
            {canWrite && <Button size="icon" variant="ghost" onClick={() => navigate(`/comments/${row.id}/edit`)} icon={<Pencil className="h-4 w-4" />} />}
            {canDelete(roles) && <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />}
          </>
        )}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message="Supprimer ce commentaire ?" />
    </div>
  );
}
