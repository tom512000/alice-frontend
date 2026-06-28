import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { medicalHistoriesActions } from '../medicalHistoriesSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatName, MEDICAL_HISTORY_TYPE_LABELS } from '@/lib/format';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { MedicalHistoryRead } from '@/types/entities';

export function MedicalHistoryListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.medicalHistories);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);
  const [typeFilter, setTypeFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MedicalHistoryRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(p = page) {
    dispatch(medicalHistoriesActions.fetchList({ page: p, itemsPerPage: 30, ...(typeFilter && { type: typeFilter }) }));
  }
  useEffect(() => { load(1); }, [typeFilter]);

  const types = Object.entries(MEDICAL_HISTORY_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));

  const columns: Column<MedicalHistoryRead>[] = [
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{formatName(r.patient?.lastname, r.patient?.firstname)}</span> },
    { key: 'type', header: 'Type', render: (r) => <Badge>{MEDICAL_HISTORY_TYPE_LABELS[r.type] ?? r.type}</Badge> },
    { key: 'description', header: 'Description', render: (r) => <span className="truncate max-w-sm block">{r.description}</span> },
    { key: 'diagnosisYear', header: 'Année', render: (r) => <span className="text-xs text-gray-500">{r.diagnosisYear ?? '—'}</span> },
    { key: 'isActive', header: 'Statut', render: (r) => <Badge variant={r.isActive ? 'success' : 'outline'}>{r.isActive ? 'Actif' : 'Résolu'}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Antécédents médicaux" subtitle={`${totalItems} antécédents`}
        actions={canWrite && <Button size="sm" onClick={() => navigate('/medical-histories/new')} icon={<Plus className="h-4 w-4" />}>Ajouter</Button>}
      />
      <div className="flex gap-3 mb-4">
        <Select options={types} placeholder="Tous les types" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-56" />
      </div>
      <DataTable columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id} emptyTitle="Aucun antécédent"
        actions={(row) => (
          <>
            {canWrite && <Button size="icon" variant="ghost" onClick={() => navigate(`/medical-histories/${row.id}/edit`)} icon={<Pencil className="h-4 w-4" />} />}
            {isAdmin(roles) && <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />}
          </>
        )}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { setDeleting(true); const res = await dispatch(medicalHistoriesActions.deleteOne(deleteTarget!.id)); setDeleting(false); setDeleteTarget(null); if (medicalHistoriesActions.deleteOne.fulfilled.match(res)) toastSuccess('Antécédent supprimé.'); else toastError('Erreur.'); }} loading={deleting} message="Supprimer cet antécédent ?" />
    </div>
  );
}
