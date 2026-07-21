import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { staysActions } from '../staysSlice';
import { generateDischargeSummary } from '@/api/aiApi';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatDateTime, formatName } from '@/lib/format';
import { isAdmin, isDoctor, isNurse } from '@/lib/permissions';
import { Pencil, ArrowLeft, Activity, Sparkles, Copy } from 'lucide-react';

export function StayDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current, loading } = useAppSelector((s) => s.stays);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles) || isNurse(roles);
  const { toastSuccess, toastError } = useToast();

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => { if (id) dispatch(staysActions.fetchOne(id)); }, [id, dispatch]);

  async function handleGenerateSummary() {
    if (!id) return;
    setGenerating(true);
    setSummaryOpen(true);
    try {
      setSummary(await generateDischargeSummary(id));
    } catch {
      setSummaryOpen(false);
      toastError('Génération IA indisponible pour le moment.');
    } finally {
      setGenerating(false);
    }
  }

  async function copySummary() {
    await navigator.clipboard.writeText(summary);
    toastSuccess('Copié dans le presse-papiers.');
  }

  if (loading) return <Skeleton className="h-96" />;
  if (!current) return null;

  return (
    <div>
      <PageHeader
        title={`Séjour — ${formatName(current.patient?.lastname, current.patient?.firstname)}`}
        subtitle={`${formatDate(current.startDate)} → ${current.endDate ? formatDate(current.endDate) : 'En cours'}`}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/stays')} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>
            <Button variant="outline" size="sm" onClick={handleGenerateSummary} icon={<Sparkles className="h-4 w-4" />}>
              Compte-rendu de sortie (IA)
            </Button>
            {canWrite && <Button size="sm" onClick={() => navigate(`/stays/${id}/edit`)} icon={<Pencil className="h-4 w-4" />}>Modifier</Button>}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-5xl">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardBody className="space-y-2 text-sm font-poppins">
            <div className="flex justify-between"><span className="text-gray-500">Patient</span><span className="font-medium">{formatName(current.patient?.lastname, current.patient?.firstname)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Service</span><span>{current.service?.serviceName ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Chambre</span><span>{current.room ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Entrée</span><span>{formatDate(current.startDate)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Sortie</span><span>{current.endDate ? formatDate(current.endDate) : <Badge variant="success">En cours</Badge>}</span></div>
          </CardBody>
        </Card>

        {current.observation && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Observation générale</CardTitle></CardHeader>
            <CardBody>
              <p className="text-sm font-poppins text-gray-700 whitespace-pre-wrap">{current.observation}</p>
            </CardBody>
          </Card>
        )}

        {current.observations && current.observations.length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <CardTitle>Observations infirmières ({current.observations.length})</CardTitle>
              </div>
            </CardHeader>
            <CardBody className="divide-y divide-gray-50 p-0">
              {current.observations.map((obs: { id: number; observationDate: string; note: string; user?: { lastname?: string; firstname?: string } }) => (
                <div key={obs.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 font-poppins">{formatDateTime(obs.observationDate)}</span>
                  </div>
                  <p className="text-sm font-poppins text-gray-800 whitespace-pre-wrap">{obs.note}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        )}
      </div>

      <Modal open={summaryOpen} onClose={() => setSummaryOpen(false)} title="Compte-rendu de sortie (brouillon IA)" size="lg">
        {generating ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 font-poppins mb-3">
              Brouillon généré à partir des données du séjour — à relire et valider avant tout usage.
            </p>
            <div className="max-h-96 overflow-y-auto rounded-md bg-gray-50 p-4">
              <p className="text-sm font-poppins text-gray-800 whitespace-pre-wrap">{summary}</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setSummaryOpen(false)}>Fermer</Button>
              <Button size="sm" onClick={copySummary} icon={<Copy className="h-3.5 w-3.5" />}>Copier</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
