import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { documentsActions, downloadDocument } from '../documentsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatName, DOCUMENT_TYPE_LABELS } from '@/lib/format';
import { canWriteNursing, canDelete } from '@/lib/permissions';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import type { DocumentRead } from '@/types/entities';

export function DocumentListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.documents);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = canWriteNursing(roles);
  const [deleteTarget, setDeleteTarget] = useState<DocumentRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(p = page) {
    dispatch(documentsActions.fetchList({ page: p, itemsPerPage: 30 }));
  }
  useEffect(() => { load(1); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await dispatch(documentsActions.deleteOne(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (documentsActions.deleteOne.fulfilled.match(res)) toastSuccess('Document supprimé.');
    else toastError('Erreur.');
  }

  async function handleDownload(doc: DocumentRead) {
    try {
      await downloadDocument(doc);
    } catch {
      toastError('Téléchargement impossible.');
    }
  }

  const columns: Column<DocumentRead>[] = [
    { key: 'uploadedAt', header: 'Ajouté le', sortable: true, render: (r) => <span>{formatDateTime(r.uploadedAt)}</span> },
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{formatName(r.patient?.lastname, r.patient?.firstname)}</span> },
    { key: 'type', header: 'Type', render: (r) => <Badge>{DOCUMENT_TYPE_LABELS[r.type] ?? r.type}</Badge> },
    { key: 'title', header: 'Titre', render: (r) => <span>{r.title ?? '—'}</span> },
    { key: 'originalName', header: 'Fichier', render: (r) => <span className="font-mono text-xs text-gray-500">{r.originalName ?? '—'}</span> },
    { key: 'uploadedBy', header: 'Déposé par', render: (r) => <span>{r.uploadedBy ? formatName(r.uploadedBy.lastname, r.uploadedBy.firstname) : '—'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Documents" subtitle={`${totalItems} documents`}
        actions={canWrite && <Button size="sm" onClick={() => navigate('/documents/new')} icon={<Plus className="h-4 w-4" />}>Nouveau document</Button>}
      />
      <DataTable columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id} emptyTitle="Aucun document"
        actions={(row) => (
          <>
            {row.filePath && <Button size="icon" variant="ghost" onClick={() => handleDownload(row)} icon={<Download className="h-4 w-4" />} />}
            {canWrite && <Button size="icon" variant="ghost" onClick={() => navigate(`/documents/${row.id}/edit`)} icon={<Pencil className="h-4 w-4" />} />}
            {canDelete(roles) && <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />}
          </>
        )}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message="Supprimer ce document ?" />
    </div>
  );
}
