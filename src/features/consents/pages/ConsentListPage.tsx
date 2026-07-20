import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { consentsActions } from '../consentsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatName, CONSENT_TYPE_LABELS, CONSENT_STATUS_LABELS } from '@/lib/format';
import { canWrite, canDelete } from '@/lib/permissions';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { ConsentRead } from '@/types/entities';

const STATUS_VARIANT: Record<string, 'success' | 'danger' | 'warning'> = {
  granted: 'success',
  refused: 'danger',
  withdrawn: 'warning',
};

export function ConsentListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.consents);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const [deleteTarget, setDeleteTarget] = useState<ConsentRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(p = page) {
    dispatch(consentsActions.fetchList({ page: p, itemsPerPage: 30 }));
  }
  useEffect(() => { load(1); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await dispatch(consentsActions.deleteOne(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (consentsActions.deleteOne.fulfilled.match(res)) toastSuccess('Consentement supprimé.');
    else toastError('Erreur.');
  }

  const columns: Column<ConsentRead>[] = [
    {
      key: 'patient',
      header: 'Patient',
      render: (r) => <span className="font-medium">{typeof r.patient === 'object' ? formatName(r.patient.lastname, r.patient.firstname) : '—'}</span>,
    },
    { key: 'type', header: 'Type', render: (r) => <Badge variant="info">{CONSENT_TYPE_LABELS[r.type] ?? r.type}</Badge> },
    { key: 'status', header: 'Statut', render: (r) => <Badge variant={STATUS_VARIANT[r.status] ?? 'default'}>{CONSENT_STATUS_LABELS[r.status] ?? r.status}</Badge> },
    { key: 'recordedAt', header: 'Recueilli le', render: (r) => <span>{formatDate(r.recordedAt)}</span> },
    { key: 'notes', header: 'Notes', render: (r) => <span className="text-gray-500 text-sm">{r.notes ?? '—'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Consentements" subtitle={`${totalItems} consentements`}
        actions={canWrite(roles) && <Button size="sm" onClick={() => navigate('/consents/new')} icon={<Plus className="h-4 w-4" />}>Nouveau consentement</Button>}
      />
      <DataTable columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id} emptyTitle="Aucun consentement enregistré"
        actions={(row) => (
          <>
            {canWrite(roles) && <Button size="icon" variant="ghost" onClick={() => navigate(`/consents/${row.id}/edit`)} icon={<Pencil className="h-4 w-4" />} />}
            {canDelete(roles) && <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />}
          </>
        )}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message="Supprimer ce consentement ?" />
    </div>
  );
}
