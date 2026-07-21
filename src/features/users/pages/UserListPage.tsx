import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { usersActions } from '../usersSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatName } from '@/lib/format';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { UserRead } from '@/types/entities';

const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: 'Admin',
  ROLE_DOCTOR: 'Médecin',
  ROLE_NURSE: 'Infirmier',
  ROLE_USER: 'Utilisateur',
};

export function UserListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.users);
  const [deleteTarget, setDeleteTarget] = useState<UserRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load(p = page) {
    dispatch(usersActions.fetchList({ page: p, itemsPerPage: 30 }));
  }
  useEffect(() => { load(1); }, []);

  const columns: Column<UserRead>[] = [
    { key: 'login', header: 'Login', render: (r) => <span className="font-mono text-sm">{r.login}</span> },
    { key: 'name', header: 'Nom', render: (r) => <span className="font-medium">{formatName(r.lastname, r.firstname)}</span> },
    { key: 'email', header: 'Email', render: (r) => <span className="text-xs text-gray-500">{r.email ?? '—'}</span> },
    { key: 'roles', header: 'Rôles', render: (r) => <div className="flex gap-1 flex-wrap">{r.roles.filter((role) => role !== 'ROLE_USER' || r.roles.length === 1).map((role) => <Badge key={role} variant="outline">{ROLE_LABELS[role] ?? role}</Badge>)}</div> },
    { key: 'service', header: 'Service', render: (r) => <span className="text-xs text-gray-500">{r.service?.serviceName ?? '—'}</span> },
    { key: 'specialty', header: 'Spécialité', render: (r) => <span className="text-xs text-gray-500">{r.specialty?.name ?? '—'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Utilisateurs" subtitle={`${totalItems} utilisateurs`}
        actions={<Button size="sm" onClick={() => navigate('/admin/users/new')} icon={<Plus className="h-4 w-4" />}>Nouvel utilisateur</Button>}
      />
      <DataTable columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id} emptyTitle="Aucun utilisateur"
        actions={(row) => (
          <>
            <Button size="icon" variant="ghost" onClick={() => navigate(`/admin/users/${row.id}/edit`)} icon={<Pencil className="h-4 w-4" />} />
            <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} icon={<Trash2 className="h-4 w-4 text-red-500" />} />
          </>
        )}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { setDeleting(true); const res = await dispatch(usersActions.deleteOne(deleteTarget!.id)); setDeleting(false); setDeleteTarget(null); if (usersActions.deleteOne.fulfilled.match(res)) toastSuccess('Utilisateur supprimé.'); else toastError('Erreur.'); }} loading={deleting} message={`Supprimer l'utilisateur "${deleteTarget?.login}" ?`} />
    </div>
  );
}
