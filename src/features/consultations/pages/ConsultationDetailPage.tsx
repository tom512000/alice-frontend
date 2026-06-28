import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { consultationsActions } from '../consultationsSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateTime, formatName, formatPrice } from '@/lib/format';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { Pencil, ArrowLeft } from 'lucide-react';

export function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current, loading } = useAppSelector((s) => s.consultations);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);

  useEffect(() => { if (id) dispatch(consultationsActions.fetchOne(id)); }, [id, dispatch]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40" /></div>;
  if (!current) return null;

  return (
    <div>
      <PageHeader
        title={`Consultation du ${formatDateTime(current.consultationDate)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>Retour</Button>
            {(isAdmin(roles) || isDoctor(roles)) && (
              <Button size="sm" onClick={() => navigate(`/consultations/${id}/edit`)} icon={<Pencil className="h-4 w-4" />}>Modifier</Button>
            )}
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-4xl">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardBody className="space-y-2 text-sm font-poppins">
            <div className="flex justify-between"><span className="text-gray-500">Patient</span><span className="font-medium">{formatName(current.patient?.lastname, current.patient?.firstname)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Médecin</span><span>{formatName(current.user?.lastname, current.user?.firstname)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{formatDateTime(current.consultationDate)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Prix</span><span>{formatPrice(current.price)}</span></div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Détails cliniques</CardTitle></CardHeader>
          <CardBody>
            {current.details ? (
              <p className="text-sm font-poppins text-gray-700 whitespace-pre-wrap">{current.details}</p>
            ) : (
              <p className="text-sm text-gray-400 font-poppins">Aucun détail</p>
            )}
          </CardBody>
        </Card>

        {current.recommendations && (
          <Card className="lg:col-span-3">
            <CardHeader><CardTitle>Recommandations</CardTitle></CardHeader>
            <CardBody>
              <p className="text-sm font-poppins text-gray-700 whitespace-pre-wrap">{current.recommendations}</p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
