import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { staysActions } from '../staysSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatName } from '@/lib/format';
import { isAdmin, isDoctor, isNurse } from '@/lib/permissions';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import type { StayRead } from '@/types/entities';

export function StayListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.stays);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles) || isNurse(roles);

  const [deleteTarget, setDeleteTarget] = useState<StayRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(p = page) {
    dispatch(staysActions.fetchList({ page: p, itemsPerPage: 30, order: { startDate: 'desc' } }));
  }

  useEffect(() => { load(1); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await dispatch(staysActions.deleteOne(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (staysActions.deleteOne.fulfilled.match(res)) toastSuccess('Séjour supprimé.');
    else toastError('Suppression impossible.');
  }

  const columns: Column<StayRead>[] = [
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{formatName(r.patient?.lastname, r.patient?.firstname)}</span> },
    { key: 'startDate', header: 'Entrée', sortable: true, render: (r) => <span>{formatDate(r.startDate)}</span> },
    { key: 'endDate', header: 'Sortie', render: (r) => <span>{r.endDate ? formatDate(r.endDate) : <Badge variant="success">En cours</Badge>}</span> },
    { key: 'room', header: 'Chambre', render: (r) => <span>{r.room ?? '—'}</span> },
    { key: 'service', header: 'Service', render: (r) => <span>{r.service?.serviceName ?? '—'}</span> },
    { key: 'observations', header: 'Obs.', render: (r) => <span>{r.observations?.length ?? 0}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Hospitalisations"
        subtitle={`${totalItems} séjours`}
        actions={canWrite && <Button size="sm" onClick={() => navigate('/stays/new')} icon={<Plus className="h-4 w-4" />}>Nouveau séjour</Button>}
      />
      <DataTable
        columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/stays/${r.id}`)}
        emptyTitle="Aucun séjour"
        actions={(row) => (
          <>
            <Button size="icon" variant="ghost" onClick={() => navigate(`/stays/${row.id}`)} icon={<Eye className="h-4 w-4" />} />
            {canWrite && <Button size="icon" variant="ghost" onClick={() => navigate(`/stays/${row.id}/edit`)} icon={<Pencil className="h-4 w-4" />} />}
            {isAdmin(roles) && <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />}
          </>
        )}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message="Supprimer ce séjour ?" />
    </div>
  );
}
