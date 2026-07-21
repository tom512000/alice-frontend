import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { medicalExamsActions } from '../medicalExamsSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatDate, formatName, EXAM_TYPE_LABELS } from '@/lib/format';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { ArrowLeft, Pencil, CheckCircle, Clock } from 'lucide-react';

function InfoRow({ label, value }: { label: string; value?: string | null | React.ReactNode }) {
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 break-words text-sm">{value ?? '—'}</p>
    </div>
  );
}

export function MedicalExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current, loading } = useAppSelector((s) => s.medicalExams);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);

  useEffect(() => {
    if (id) dispatch(medicalExamsActions.fetchOne(id));
  }, [id, dispatch]);

  if (loading || !current) return <CardSkeleton />;

  const hasResult = !!current.resultDate;

  return (
    <div>
      <PageHeader
        title={EXAM_TYPE_LABELS[current.type] ?? current.type}
        subtitle={
          hasResult
            ? <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="h-4 w-4" /> Résultats disponibles</span>
            : <span className="flex items-center gap-1 text-amber-600 text-sm"><Clock className="h-4 w-4" /> En attente de résultats</span>
        }
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>
            {canWrite && <Button size="sm" onClick={() => navigate(`/medical-exams/${id}/edit`)} icon={<Pencil className="h-4 w-4" />}>Modifier</Button>}
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardBody>
            <InfoRow label="Patient" value={formatName(current.patient?.lastname, current.patient?.firstname)} />
            <InfoRow label="Type" value={<Badge>{EXAM_TYPE_LABELS[current.type] ?? current.type}</Badge>} />
            <InfoRow label="Date de demande" value={formatDate(current.requestDate)} />
            <InfoRow label="Date de résultat" value={current.resultDate ? formatDate(current.resultDate) : null} />
            <InfoRow label="Prescrit par" value={formatName(current.prescribedBy?.lastname, current.prescribedBy?.firstname)} />
          </CardBody>
        </Card>
        {current.description && (
          <Card>
            <CardHeader><CardTitle>Description / Indication</CardTitle></CardHeader>
            <CardBody>
              <p className="text-sm whitespace-pre-wrap">{current.description}</p>
            </CardBody>
          </Card>
        )}
        {current.results && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Résultats</CardTitle></CardHeader>
            <CardBody>
              <p className="text-sm whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-md">{current.results}</p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
