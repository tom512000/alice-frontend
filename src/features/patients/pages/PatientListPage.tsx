import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { patientsActions } from '../patientsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/api/client';
import { formatDate, formatName, getAge, formatGender, IDENTITY_STATUS_LABELS } from '@/lib/format';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { Plus, Eye, Pencil, Trash2, Search, FileJson } from 'lucide-react';
import type { PatientRead, IdentityStatus } from '@/types/entities';

const IDENTITY_VARIANT: Record<IdentityStatus, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  provisional: 'default',
  retrieved: 'info',
  validated: 'warning',
  qualified: 'success',
  doubtful: 'danger',
};

export function PatientListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { items, loading, totalItems, page, itemsPerPage } = useAppSelector((s) => s.patients);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);

  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PatientRead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sortKey, setSortKey] = useState('lastname');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function load(p: number = page) {
    dispatch(patientsActions.fetchList({
      page: p,
      itemsPerPage,
      ...(search && { 'lastname': search }),
      order: { [sortKey]: sortDir },
    }));
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortKey, sortDir]);

  async function handleExportFhir(patient: PatientRead) {
    try {
      const res = await apiClient.get(`/patients/${patient.id}/fhir`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/fhir+json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient-${patient.id}-fhir.json`;
      a.click();
      URL.revokeObjectURL(url);
      toastSuccess('Export FHIR téléchargé.');
    } catch {
      toastError("Échec de l'export FHIR.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await dispatch(patientsActions.deleteOne(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (patientsActions.deleteOne.fulfilled.match(result)) {
      toastSuccess('Patient supprimé.');
    } else {
      toastError('Suppression impossible.');
    }
  }

  const columns: Column<PatientRead>[] = [
    {
      key: 'lastname',
      header: 'Patient',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{formatName(row.lastname, row.firstname)}</p>
          <p className="text-xs text-gray-500">{row.nss ? `NSS ${row.nss}` : '—'}</p>
        </div>
      ),
    },
    {
      key: 'identityStatus',
      header: 'Identité',
      render: (row) => (
        <Badge variant={IDENTITY_VARIANT[row.identityStatus] ?? 'default'}>
          {IDENTITY_STATUS_LABELS[row.identityStatus] ?? row.identityStatus}
        </Badge>
      ),
    },
    {
      key: 'birthdate',
      header: 'Âge',
      sortable: true,
      render: (row) => (
        <span>{getAge(row.birthdate)}</span>
      ),
    },
    {
      key: 'gender',
      header: 'Genre',
      render: (row) => <span>{formatGender(row.gender)}</span>,
    },
    {
      key: 'bloodType',
      header: 'Groupe',
      render: (row) => row.bloodType ? <Badge variant="outline">{row.bloodType}</Badge> : <span className="text-gray-400">—</span>,
    },
    {
      key: 'phoneNumber',
      header: 'Téléphone',
      render: (row) => <span>{row.phoneNumber ?? '—'}</span>,
    },
    {
      key: 'treatingDoctor',
      header: 'Médecin traitant',
      render: (row) => (
        <span>{row.treatingDoctor ? formatName(row.treatingDoctor.lastname, row.treatingDoctor.firstname) : '—'}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Créé le',
      sortable: true,
      render: (row) => <span>{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={`${totalItems} patient${totalItems > 1 ? 's' : ''}`}
        actions={
          canWrite && (
            <Button size="sm" onClick={() => navigate('/patients/new')} icon={<Plus className="h-4 w-4" />}>
              Nouveau patient
            </Button>
          )
        }
      />

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom..."
            className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        totalItems={totalItems}
        page={page}
        itemsPerPage={itemsPerPage}
        onPageChange={(p) => load(p)}
        onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
        sortKey={sortKey}
        sortDir={sortDir}
        getRowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/patients/${r.id}`)}
        emptyTitle="Aucun patient"
        emptyDescription="Aucun patient ne correspond à votre recherche."
        actions={(row) => (
          <>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/patients/${row.id}`)}
              icon={<Eye className="h-4 w-4" />}
            />
            <Button
              size="icon"
              variant="ghost"
              title="Exporter au format FHIR"
              onClick={() => handleExportFhir(row)}
              icon={<FileJson className="h-4 w-4" />}
            />
            {canWrite && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate(`/patients/${row.id}/edit`)}
                icon={<Pencil className="h-4 w-4" />}
              />
            )}
            {isAdmin(roles) && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setDeleteTarget(row)}
                icon={<Trash2 className="h-4 w-4 text-red-500" />}
              />
            )}
          </>
        )}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`Supprimer ${formatName(deleteTarget?.lastname ?? null, deleteTarget?.firstname ?? null)} ? Cette action est irréversible.`}
      />
    </div>
  );
}
