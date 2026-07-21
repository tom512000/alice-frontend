import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { surgicalOperationsActions } from '../surgicalOperationsSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SurgicalStatusBadge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatDateTime, formatName, formatDuration } from '@/lib/format';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { ArrowLeft, Pencil } from 'lucide-react';

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 break-words text-sm">{value ?? '—'}</p>
    </div>
  );
}

export function SurgicalOperationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current, loading } = useAppSelector((s) => s.surgicalOperations);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);

  useEffect(() => {
    if (id) dispatch(surgicalOperationsActions.fetchOne(id));
  }, [id, dispatch]);

  if (loading || !current) return <CardSkeleton />;

  return (
    <div>
      <PageHeader
        title={current.operationType}
        subtitle={<SurgicalStatusBadge status={current.status} />}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>
            {canWrite && <Button size="sm" onClick={() => navigate(`/surgical-operations/${id}/edit`)} icon={<Pencil className="h-4 w-4" />}>Modifier</Button>}
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl">
        <Card>
          <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
          <CardBody>
            <InfoRow label="Patient" value={formatName(current.patient?.lastname, current.patient?.firstname)} />
            <InfoRow label="Type d'intervention" value={current.operationType} />
            <InfoRow label="Code CCAM" value={current.ccamCode} />
            <InfoRow label="Chirurgien principal" value={formatName(current.leadSurgeon?.lastname, current.leadSurgeon?.firstname)} />
            <InfoRow label="Anesthésiste" value={current.anesthesiologist ? formatName(current.anesthesiologist?.lastname, current.anesthesiologist?.firstname) : null} />
            <InfoRow label="Type d'anesthésie" value={current.anesthesiaType} />
            <InfoRow label="Salle d'opération" value={current.operatingRoom} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Planification</CardTitle></CardHeader>
          <CardBody>
            <InfoRow label="Date prévue" value={formatDateTime(current.scheduledAt)} />
            <InfoRow label="Date réalisée" value={current.performedAt ? formatDateTime(current.performedAt) : null} />
            <InfoRow label="Durée" value={formatDuration(current.durationMinutes)} />
            <InfoRow label="Statut" value={current.status} />
          </CardBody>
        </Card>
        {current.preoperativeNotes && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Notes préopératoires</CardTitle></CardHeader>
            <CardBody>
              <p className="text-sm whitespace-pre-wrap">{current.preoperativeNotes}</p>
            </CardBody>
          </Card>
        )}
        {current.operativeReport && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Compte-rendu opératoire</CardTitle></CardHeader>
            <CardBody>
              <p className="text-sm whitespace-pre-wrap">{current.operativeReport}</p>
            </CardBody>
          </Card>
        )}
        {current.complications && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-red-600">Complications</CardTitle></CardHeader>
            <CardBody>
              <p className="text-sm whitespace-pre-wrap text-red-700">{current.complications}</p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
