import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { appointmentsActions } from '../appointmentsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { AppointmentStatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatName, formatDuration } from '@/lib/format';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { Plus, Eye, Pencil, Trash2, Search } from 'lucide-react';
import type { AppointmentRead } from '@/types/entities';

export function AppointmentListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.appointments);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);

  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AppointmentRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(p = page) {
    dispatch(appointmentsActions.fetchList({
      page: p,
      itemsPerPage: 30,
      ...(statusFilter && { status: statusFilter }),
      order: { scheduledAt: 'asc' },
    }));
  }

  useEffect(() => { load(1); }, [statusFilter]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await dispatch(appointmentsActions.deleteOne(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (appointmentsActions.deleteOne.fulfilled.match(res)) {
      toastSuccess('Rendez-vous supprimé.');
    } else {
      toastError('Suppression impossible.');
    }
  }

  const columns: Column<AppointmentRead>[] = [
    { key: 'scheduledAt', header: 'Date / Heure', sortable: true, render: (r) => <span>{formatDateTime(r.scheduledAt)}</span> },
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{formatName(r.patient?.lastname, r.patient?.firstname)}</span> },
    { key: 'doctor', header: 'Médecin', render: (r) => <span>{formatName(r.doctor?.lastname, r.doctor?.firstname)}</span> },
    { key: 'reason', header: 'Motif', render: (r) => <span className="truncate max-w-xs block">{r.reason ?? '—'}</span> },
    { key: 'durationMinutes', header: 'Durée', render: (r) => <span>{formatDuration(r.durationMinutes)}</span> },
    { key: 'status', header: 'Statut', render: (r) => <AppointmentStatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Planning & Rendez-vous"
        subtitle={`${totalItems} rendez-vous`}
        actions={
          canWrite && (
            <Button size="sm" onClick={() => navigate('/appointments/new')} icon={<Plus className="h-4 w-4" />}>
              Nouveau RDV
            </Button>
          )
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <Select
          options={[
            { value: 'scheduled', label: 'Planifié' },
            { value: 'completed', label: 'Terminé' },
            { value: 'cancelled', label: 'Annulé' },
            { value: 'no_show', label: 'Absent' },
          ]}
          placeholder="Tous les statuts"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        />
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        totalItems={totalItems}
        page={page}
        onPageChange={(p) => load(p)}
        getRowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/appointments/${r.id}`)}
        emptyTitle="Aucun rendez-vous"
        actions={(row) => (
          <>
            <Button size="icon" variant="ghost" onClick={() => navigate(`/appointments/${row.id}`)} icon={<Eye className="h-4 w-4" />} />
            {canWrite && <Button size="icon" variant="ghost" onClick={() => navigate(`/appointments/${row.id}/edit`)} icon={<Pencil className="h-4 w-4" />} />}
            {canWrite && <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />}
          </>
        )}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="Supprimer ce rendez-vous ?"
      />
    </div>
  );
}
