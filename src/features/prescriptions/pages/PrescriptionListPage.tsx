import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { prescriptionsActions, downloadPrescriptionPdf } from '../prescriptionsSlice';
import { DataTable, type Column } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { formatName } from '@/lib/format';
import { Plus, Eye, Download } from 'lucide-react';
import type { PrescriptionRead } from '@/types/entities';

export function PrescriptionListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading, totalItems, page } = useAppSelector((s) => s.prescriptions);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_DOCTOR');
  const { toastError } = useToast();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  async function handleDownload(prescription: PrescriptionRead) {
    setDownloadingId(prescription.id);
    try {
      await downloadPrescriptionPdf(prescription);
    } catch {
      toastError("Impossible de générer le PDF de l'ordonnance.");
    } finally {
      setDownloadingId(null);
    }
  }

  function load(p = page) {
    dispatch(prescriptionsActions.fetchList({ page: p, itemsPerPage: 30 }));
  }
  useEffect(() => { load(1); }, []);

  const columns: Column<PrescriptionRead>[] = [
    { key: 'number', header: 'N°', render: (r) => <span className="font-mono text-xs">{r.number ?? '—'}</span> },
    { key: 'user', header: 'Prescripteur', render: (r) => <span className="font-medium">{formatName(r.user?.lastname, r.user?.firstname)}</span> },
    { key: 'patient', header: 'Patient', render: (r) => <span>{formatName(r.consultation?.patient?.lastname, r.consultation?.patient?.firstname)}</span> },
    { key: 'treatments', header: 'Traitements', render: (r) => <span>{r.treatments?.map((t) => t.name).join(', ') || '—'}</span>, className: 'max-w-xs' },
  ];

  return (
    <div>
      <PageHeader title="Prescriptions" subtitle={`${totalItems} prescriptions`}
        actions={canWrite && <Button size="sm" onClick={() => navigate('/prescriptions/new')} icon={<Plus className="h-4 w-4" />}>Nouvelle</Button>}
      />
      <DataTable columns={columns} data={items} loading={loading} totalItems={totalItems} page={page}
        onPageChange={(p) => load(p)} getRowKey={(r) => r.id} emptyTitle="Aucune prescription"
        actions={(row) => (
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => navigate(`/prescriptions/${row.id}`)} icon={<Eye className="h-4 w-4" />} />
            <Button
              size="icon"
              variant="ghost"
              disabled={downloadingId === row.id}
              onClick={() => handleDownload(row)}
              icon={<Download className="h-4 w-4" />}
            />
          </div>
        )}
      />
    </div>
  );
}
