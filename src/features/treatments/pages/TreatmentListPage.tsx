import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { treatmentsActions } from '../treatmentsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { TreatmentRead, MedicineRead, PathologyRead } from '@/types/entities';

export function TreatmentListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.treatments);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);
  const [deleteTarget, setDeleteTarget] = useState<TreatmentRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(p = page) {
    dispatch(treatmentsActions.fetchList({ page: p, itemsPerPage: 30 }));
  }
  useEffect(() => { load(1); }, []);

  const columns: Column<TreatmentRead>[] = [
    { key: 'name', header: 'Nom', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'posology', header: 'Posologie', render: (r) => <span className="truncate max-w-sm block text-gray-600">{r.posology ?? '—'}</span> },
    { key: 'medicines', header: 'Médicaments', render: (r) => <span className="text-xs text-gray-500">{r.medicines?.map((m: MedicineRead) => m.name).join(', ') || '—'}</span> },
    { key: 'pathologies', header: 'Pathologies', render: (r) => <span className="text-xs text-gray-500">{r.pathologies?.map((p: PathologyRead) => p.name).join(', ') || '—'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Traitements" subtitle={`${totalItems} traitements`}
        actions={canWrite && <Button size="sm" onClick={() => navigate('/treatments/new')} icon={<Plus className="h-4 w-4" />}>Nouveau traitement</Button>}
      />
      <DataTable columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id} emptyTitle="Aucun traitement"
        actions={(row) => (
          <>
            {canWrite && <Button size="icon" variant="ghost" onClick={() => navigate(`/treatments/${row.id}/edit`)} icon={<Pencil className="h-4 w-4" />} />}
            {isAdmin(roles) && <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />}
          </>
        )}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { setDeleting(true); const res = await dispatch(treatmentsActions.deleteOne(deleteTarget!.id)); setDeleting(false); setDeleteTarget(null); if (treatmentsActions.deleteOne.fulfilled.match(res)) toastSuccess('Traitement supprimé.'); else toastError('Erreur.'); }} loading={deleting} message="Supprimer ce traitement ?" />
    </div>
  );
}
