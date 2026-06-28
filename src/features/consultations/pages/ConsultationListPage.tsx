import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { consultationsActions } from '../consultationsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatName, formatPrice } from '@/lib/format';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { Plus, Eye, Pencil, Trash2, Search } from 'lucide-react';
import type { ConsultationRead } from '@/types/entities';

export function ConsultationListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.consultations);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);

  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ConsultationRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(p = page) {
    dispatch(consultationsActions.fetchList({
      page: p, itemsPerPage: 30,
      ...(search && { 'patient.lastname': search }),
      order: { consultationDate: 'desc' },
    }));
  }

  useEffect(() => { load(1); }, [search]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await dispatch(consultationsActions.deleteOne(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (consultationsActions.deleteOne.fulfilled.match(res)) toastSuccess('Consultation supprimée.');
    else toastError('Suppression impossible.');
  }

  const columns: Column<ConsultationRead>[] = [
    { key: 'consultationDate', header: 'Date', sortable: true, render: (r) => <span>{formatDateTime(r.consultationDate)}</span> },
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{formatName(r.patient?.lastname, r.patient?.firstname)}</span> },
    { key: 'user', header: 'Médecin', render: (r) => <span>{formatName(r.user?.lastname, r.user?.firstname)}</span> },
    { key: 'details', header: 'Détails', render: (r) => <span className="truncate max-w-xs block text-gray-600">{r.details ?? '—'}</span> },
    { key: 'price', header: 'Prix', render: (r) => <span>{formatPrice(r.price)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Consultations"
        subtitle={`${totalItems} consultations`}
        actions={canWrite && <Button size="sm" onClick={() => navigate('/consultations/new')} icon={<Plus className="h-4 w-4" />}>Nouvelle</Button>}
      />
      <div className="flex gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par patient..."
            className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>
      <DataTable
        columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/consultations/${r.id}`)}
        emptyTitle="Aucune consultation"
        actions={(row) => (
          <>
            <Button size="icon" variant="ghost" onClick={() => navigate(`/consultations/${row.id}`)} icon={<Eye className="h-4 w-4" />} />
            {canWrite && <Button size="icon" variant="ghost" onClick={() => navigate(`/consultations/${row.id}/edit`)} icon={<Pencil className="h-4 w-4" />} />}
            {isAdmin(roles) && <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />}
          </>
        )}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message="Supprimer cette consultation ?" />
    </div>
  );
}
