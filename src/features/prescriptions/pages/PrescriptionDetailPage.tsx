import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { prescriptionsActions, downloadPrescriptionPdf } from '../prescriptionsSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatName } from '@/lib/format';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { ArrowLeft, Download, Pencil, Pill } from 'lucide-react';
import type { MedicineRead, TreatmentRead } from '@/types/entities';

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm">{value ?? '—'}</span>
    </div>
  );
}

export function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current, loading } = useAppSelector((s) => s.prescriptions);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);
  const { toastError } = useToast();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) dispatch(prescriptionsActions.fetchOne(id));
  }, [id, dispatch]);

  async function handleDownload() {
    if (!current) return;
    setDownloading(true);
    try {
      await downloadPrescriptionPdf(current);
    } catch {
      toastError("Impossible de générer le PDF de l'ordonnance.");
    } finally {
      setDownloading(false);
    }
  }

  if (loading || !current) return <CardSkeleton />;

  return (
    <div>
      <PageHeader
        title={`Prescription ${current.number ? `#${current.number}` : `#${current.id}`}`}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading} icon={<Download className="h-4 w-4" />}>
              {downloading ? 'Génération…' : "Télécharger l'ordonnance"}
            </Button>
            {canWrite && <Button size="sm" onClick={() => navigate(`/prescriptions/${id}/edit`)} icon={<Pencil className="h-4 w-4" />}>Modifier</Button>}
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardBody>
            <InfoRow label="Prescripteur" value={formatName(current.user?.lastname, current.user?.firstname)} />
            <InfoRow label="Patient" value={formatName(current.consultation?.patient?.lastname, current.consultation?.patient?.firstname)} />
            <InfoRow label="Numéro" value={current.number} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Traitements prescrits</CardTitle></CardHeader>
          <CardBody>
            {current.treatments && current.treatments.length > 0 ? (
              <ul className="space-y-3">
                {current.treatments.map((t: TreatmentRead) => (
                  <li key={t['@id'] ?? t.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-md">
                    <Pill className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      {t.posology && <p className="text-xs text-gray-500 mt-0.5">{t.posology}</p>}
                      {t.medicines && t.medicines.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">{t.medicines.map((m: MedicineRead) => m.name).join(', ')}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Aucun traitement.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
