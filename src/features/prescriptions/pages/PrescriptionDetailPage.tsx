import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { prescriptionsActions } from '../prescriptionsSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatDate, formatName } from '@/lib/format';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { ArrowLeft, Pencil, Pill } from 'lucide-react';

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

  useEffect(() => {
    if (id) dispatch(prescriptionsActions.fetchOne(id));
  }, [id, dispatch]);

  if (loading || !current) return <CardSkeleton />;

  return (
    <div>
      <PageHeader
        title={`Prescription ${current.number ? `#${current.number}` : `#${current.id}`}`}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>
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
            <InfoRow label="Valable jusqu'au" value={current.validUntil ? formatDate(current.validUntil) : null} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Traitements prescrits</CardTitle></CardHeader>
          <CardBody>
            {current.treatments && current.treatments.length > 0 ? (
              <ul className="space-y-3">
                {current.treatments.map((t: any) => (
                  <li key={t['@id'] ?? t.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-md">
                    <Pill className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
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
