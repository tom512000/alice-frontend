import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { apiClient, buildParams } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, AppointmentStatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatDateTime, formatName } from '@/lib/format';
import {
  UserSquare2, Calendar, BedDouble, FlaskConical, Scissors,
  Plus, ChevronRight, Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PatientRead, AppointmentRead, StayRead, MedicalExamRead, SurgicalOperationRead } from '@/types/entities';

interface DashboardStats {
  patients: number;
  todayAppointments: number;
  activeStays: number;
  pendingExams: number;
  scheduledOps: number;
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  loading?: boolean;
  color?: string;
}

function KpiCard({ icon, label, value, loading, color = 'text-gray-900' }: KpiCardProps) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className="rounded-lg bg-gray-100 p-3 text-gray-600 shrink-0">{icon}</div>
        <div>
          <p className="font-poppins text-xs text-gray-500">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <p className={`font-lexend text-2xl font-bold ${color}`}>{value}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export function Dashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPatients, setRecentPatients] = useState<PatientRead[]>([]);
  const [todayAppts, setTodayAppts] = useState<AppointmentRead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const today = new Date().toISOString().split('T')[0];

        const [patientsRes, apptsRes, staysRes, examsRes, opsRes] = await Promise.all([
          apiClient.get(`/${ENDPOINTS.PATIENTS}`, { params: buildParams({ page: 1, itemsPerPage: 5 }) }),
          apiClient.get(`/${ENDPOINTS.APPOINTMENTS}`, { params: buildParams({ page: 1, itemsPerPage: 10, [`scheduledAt[after]`]: today }) }),
          apiClient.get(`/${ENDPOINTS.STAYS}`, { params: buildParams({ page: 1, itemsPerPage: 1 }) }),
          apiClient.get(`/${ENDPOINTS.MEDICAL_EXAMS}`, { params: buildParams({ page: 1, itemsPerPage: 1 }) }),
          apiClient.get(`/${ENDPOINTS.SURGICAL_OPERATIONS}`, { params: buildParams({ page: 1, itemsPerPage: 1, status: 'scheduled' }) }),
        ]);

        setStats({
          patients: patientsRes.data['hydra:totalItems'],
          todayAppointments: apptsRes.data['hydra:totalItems'],
          activeStays: staysRes.data['hydra:totalItems'],
          pendingExams: examsRes.data['hydra:totalItems'],
          scheduledOps: opsRes.data['hydra:totalItems'],
        });

        setRecentPatients(patientsRes.data['hydra:member'].slice(0, 5));
        setTodayAppts(apptsRes.data['hydra:member'].slice(0, 6));
      } catch {
        // silently fail - network may be down
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const roles = user?.roles ?? [];
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isDoctor = roles.includes('ROLE_DOCTOR');

  return (
    <div>
      <PageHeader
        title={`Bonjour, ${user?.login ?? 'utilisateur'}`}
        subtitle={new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        actions={
          (isAdmin || isDoctor) && (
            <Button onClick={() => navigate('/patients/new')} icon={<Plus className="h-4 w-4" />} size="sm">
              Nouveau patient
            </Button>
          )
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <KpiCard icon={<UserSquare2 className="h-5 w-5" />} label="Patients" value={stats?.patients ?? 0} loading={loading} />
        <KpiCard icon={<Calendar className="h-5 w-5" />} label="RDV aujourd'hui" value={stats?.todayAppointments ?? 0} loading={loading} color="text-blue-700" />
        <KpiCard icon={<BedDouble className="h-5 w-5" />} label="Séjours actifs" value={stats?.activeStays ?? 0} loading={loading} color="text-amber-700" />
        <KpiCard icon={<FlaskConical className="h-5 w-5" />} label="Examens" value={stats?.pendingExams ?? 0} loading={loading} />
        <KpiCard icon={<Scissors className="h-5 w-5" />} label="Opérations prévues" value={stats?.scheduledOps ?? 0} loading={loading} color="text-red-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Rendez-vous du jour */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Rendez-vous récents</CardTitle>
              <button
                onClick={() => navigate('/appointments')}
                className="text-xs text-gray-500 hover:text-gray-800 font-poppins flex items-center gap-0.5"
              >
                Voir tout <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : todayAppts.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400 font-poppins">
                Aucun rendez-vous
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {todayAppts.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/appointments/${appt.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium font-poppins text-gray-800">
                        {formatName(appt.patient?.lastname, appt.patient?.firstname)}
                      </p>
                      <p className="text-xs text-gray-500 font-poppins">{formatDateTime(appt.scheduledAt)}</p>
                    </div>
                    <AppointmentStatusBadge status={appt.status} />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Derniers patients */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Derniers patients</CardTitle>
              <button
                onClick={() => navigate('/patients')}
                className="text-xs text-gray-500 hover:text-gray-800 font-poppins flex items-center gap-0.5"
              >
                Voir tout <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : recentPatients.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400 font-poppins">
                Aucun patient
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentPatients.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/patients/${p.id}`)}
                  >
                    <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-lexend font-semibold text-gray-600 shrink-0">
                      {(p.firstname?.[0] ?? '') + (p.lastname?.[0] ?? '')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium font-poppins text-gray-800 truncate">
                        {formatName(p.lastname, p.firstname)}
                      </p>
                      <p className="text-xs text-gray-500 font-poppins">
                        {p.nss ? `NSS: ${p.nss}` : formatDate(p.birthdate)}
                      </p>
                    </div>
                    {p.bloodType && (
                      <Badge variant="outline">{p.bloodType}</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Actions rapides */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Actions rapides</CardTitle></CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {(isAdmin || isDoctor) && (
                <>
                  <Button size="sm" variant="outline" onClick={() => navigate('/patients/new')} icon={<Plus className="h-3.5 w-3.5" />}>
                    Nouveau patient
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/appointments/new')} icon={<Plus className="h-3.5 w-3.5" />}>
                    Nouveau RDV
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/consultations/new')} icon={<Plus className="h-3.5 w-3.5" />}>
                    Nouvelle consultation
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/stays/new')} icon={<Plus className="h-3.5 w-3.5" />}>
                    Nouveau séjour
                  </Button>
                </>
              )}
              <Button size="sm" variant="outline" onClick={() => navigate('/vital-signs/new')} icon={<Activity className="h-3.5 w-3.5" />}>
                Constantes vitales
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/patients')} icon={<UserSquare2 className="h-3.5 w-3.5" />}>
                Chercher un patient
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
