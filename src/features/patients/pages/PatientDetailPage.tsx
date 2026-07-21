import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { patientsActions } from '../patientsSlice';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabTrigger, TabPanel } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatName, getAge, formatGender } from '@/lib/format';
import { isAdmin, isDoctor } from '@/lib/permissions';
import { Pencil, ArrowLeft, User, Phone, MapPin, Heart, AlertTriangle } from 'lucide-react';
import { PatientConsultationsTab } from '../components/PatientConsultationsTab';
import { PatientAppointmentsTab } from '../components/PatientAppointmentsTab';
import { PatientStaysTab } from '../components/PatientStaysTab';
import { PatientVitalSignsTab } from '../components/PatientVitalSignsTab';
import { PatientVitalsMonitor } from '@/features/monitoring/PatientVitalsMonitor';
import { PatientDiagnosesTab } from '../components/PatientDiagnosesTab';
import { PatientExamsTab } from '../components/PatientExamsTab';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 font-poppins shrink-0 w-36">{label}</span>
      <span className="text-sm text-gray-800 font-poppins text-right">{value ?? '—'}</span>
    </div>
  );
}

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current: patient, loading } = useAppSelector((s) => s.patients);
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const canWrite = isAdmin(roles) || isDoctor(roles);

  useEffect(() => {
    if (id) dispatch(patientsActions.fetchOne(id));
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48 col-span-2" />
        </div>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div>
      <PageHeader
        title={formatName(patient.lastname, patient.firstname)}
        subtitle={`${getAge(patient.birthdate)} • ${formatGender(patient.gender)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/patients')} icon={<ArrowLeft className="h-4 w-4" />}>
              Retour
            </Button>
            {canWrite && (
              <Button size="sm" onClick={() => navigate(`/patients/${id}/edit`)} icon={<Pencil className="h-4 w-4" />}>
                Modifier
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-5">
        {/* Fiche identité */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-lexend text-sm font-bold">
                {(patient.firstname?.[0] ?? '') + (patient.lastname?.[0] ?? '')}
              </div>
              <div>
                <CardTitle>{formatName(patient.lastname, patient.firstname)}</CardTitle>
                <p className="text-xs text-gray-500 font-poppins mt-0.5">{patient.nss ?? '—'}</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <InfoRow label="Date de naissance" value={formatDate(patient.birthdate)} />
            <InfoRow label="Âge" value={getAge(patient.birthdate)} />
            <InfoRow label="Genre" value={formatGender(patient.gender)} />
            <InfoRow label="Groupe sanguin" value={patient.bloodType ? <Badge variant="outline">{patient.bloodType}</Badge> : null} />
            <InfoRow
              label="Médecin traitant"
              value={patient.treatingDoctor ? formatName(patient.treatingDoctor.lastname, patient.treatingDoctor.firstname) : null}
            />
            <InfoRow label="Créé le" value={formatDate(patient.createdAt)} />
          </CardBody>
        </Card>

        {/* Contact + Allergies */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle><span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Contact</span></CardTitle></CardHeader>
            <CardBody>
              <InfoRow label="Email" value={patient.email} />
              <InfoRow label="Téléphone" value={patient.phoneNumber} />
              <InfoRow label="Adresse" value={patient.street} />
              <InfoRow label="Ville" value={patient.city ? `${patient.city} ${patient.postalCode ?? ''}`.trim() : null} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle><span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Urgence</span></CardTitle></CardHeader>
            <CardBody>
              <InfoRow label="Nom" value={patient.emergencyContactName} />
              <InfoRow label="Téléphone" value={patient.emergencyContactPhone} />
            </CardBody>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Allergies connues
                </span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              {patient.allergies?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((a: { id: number; name: string; '@id': string }) => (
                    <Badge key={a.id} variant="warning">{a.name}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 font-poppins">Aucune allergie connue</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultTab="consultations">
        <TabsList>
          <TabTrigger value="consultations">Consultations</TabTrigger>
          <TabTrigger value="appointments">Rendez-vous</TabTrigger>
          <TabTrigger value="stays">Séjours</TabTrigger>
          <TabTrigger value="vital-signs">Constantes</TabTrigger>
          <TabTrigger value="diagnoses">Diagnostics</TabTrigger>
          <TabTrigger value="exams">Examens</TabTrigger>
        </TabsList>
        <TabPanel value="consultations"><PatientConsultationsTab patientId={Number(id)} /></TabPanel>
        <TabPanel value="appointments"><PatientAppointmentsTab patientId={Number(id)} /></TabPanel>
        <TabPanel value="stays"><PatientStaysTab patientId={Number(id)} /></TabPanel>
        <TabPanel value="vital-signs">
          <Tabs defaultTab="live">
            <TabsList>
              <TabTrigger value="live">Temps réel</TabTrigger>
              <TabTrigger value="records">Relevés</TabTrigger>
            </TabsList>
            <TabPanel value="live"><PatientVitalsMonitor patientId={Number(id)} /></TabPanel>
            <TabPanel value="records"><PatientVitalSignsTab patientId={Number(id)} /></TabPanel>
          </Tabs>
        </TabPanel>
        <TabPanel value="diagnoses"><PatientDiagnosesTab patientId={Number(id)} /></TabPanel>
        <TabPanel value="exams"><PatientExamsTab patientId={Number(id)} /></TabPanel>
      </Tabs>
    </div>
  );
}
