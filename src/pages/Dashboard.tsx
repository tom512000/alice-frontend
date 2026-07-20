import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { apiClient, buildParams, extractMembers } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, AppointmentStatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatDateTime, formatName, formatGender, DIAGNOSIS_TYPE_LABELS, SURGICAL_STATUS_LABELS, CONSENT_STATUS_LABELS, AUDIT_ACTION_LABELS } from '@/lib/format';
import {
  UserSquare2, Calendar, BedDouble, FlaskConical, Scissors,
  Plus, ChevronRight, Activity, DoorOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PatientRead, AppointmentRead } from '@/types/entities';
import { getDashboardStats, type DashboardStats } from '@/features/dashboard/dashboardApi';
import { CategoryBarChart } from '@/features/dashboard/charts/CategoryBarChart';
import { GroupedBarChart } from '@/features/dashboard/charts/GroupedBarChart';
import { TrendLineChart } from '@/features/dashboard/charts/TrendLineChart';
import { RankingBarChart } from '@/features/dashboard/charts/RankingBarChart';
import {
  BED_STATUS, BED_STATUS_LABELS, DIAGNOSIS_TYPE_COLORS, GENDER_COLORS,
  AUDIT_ACTION_COLORS, SURGICAL_STATUS_COLORS, CONSENT_STATUS_COLORS,
} from '@/features/dashboard/chartPalette';

interface Stats {
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

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="mt-0.5 text-xs font-poppins text-gray-500">{subtitle}</p>}
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

export function Dashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPatients, setRecentPatients] = useState<PatientRead[]>([]);
  const [todayAppts, setTodayAppts] = useState<AppointmentRead[]>([]);
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

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

        const patients = extractMembers<PatientRead>(patientsRes.data);
        const appts = extractMembers<AppointmentRead>(apptsRes.data);

        setStats({
          patients: patients.totalItems,
          todayAppointments: appts.totalItems,
          activeStays: extractMembers(staysRes.data).totalItems,
          pendingExams: extractMembers(examsRes.data).totalItems,
          scheduledOps: extractMembers(opsRes.data).totalItems,
        });

        setRecentPatients(patients.items.slice(0, 5));
        setTodayAppts(appts.items.slice(0, 6));
      } catch {
        // silently fail - network may be down
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        setDashStats(await getDashboardStats());
      } catch {
        // silently fail - le reste du dashboard reste utilisable
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
  }, []);

  const roles = user?.roles ?? [];
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isDoctor = roles.includes('ROLE_DOCTOR');

  const bedOccupancyRate = dashStats && dashStats.kpis.bedsTotal > 0
    ? Math.round(((dashStats.kpis.bedsTotal - dashStats.kpis.bedsFree) / dashStats.kpis.bedsTotal) * 100)
    : 0;

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
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KpiCard icon={<UserSquare2 className="h-5 w-5" />} label="Patients" value={stats?.patients ?? 0} loading={loading} />
        <KpiCard icon={<BedDouble className="h-5 w-5" />} label="Hospitalisés" value={dashStats?.kpis.patientsHospitalizedNow ?? 0} loading={statsLoading} color="text-amber-700" />
        <KpiCard icon={<Calendar className="h-5 w-5" />} label="RDV aujourd'hui" value={dashStats?.kpis.appointmentsToday ?? 0} loading={statsLoading} color="text-blue-700" />
        <KpiCard
          icon={<DoorOpen className="h-5 w-5" />}
          label="Occupation lits"
          value={dashStats ? `${bedOccupancyRate}%` : '—'}
          loading={statsLoading}
          color="text-emerald-700"
        />
        <KpiCard icon={<FlaskConical className="h-5 w-5" />} label="Examens" value={stats?.pendingExams ?? 0} loading={loading} />
        <KpiCard icon={<Scissors className="h-5 w-5" />} label="Opérations prévues" value={dashStats?.kpis.upcomingOperations ?? stats?.scheduledOps ?? 0} loading={loading || statsLoading} color="text-red-700" />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Occupation des lits" subtitle={`${dashStats?.kpis.bedsTotal ?? 0} lits au total`}>
          <CategoryBarChart
            data={dashStats?.bedOccupancy ?? []}
            labelMap={BED_STATUS_LABELS}
            colorFor={(label) => BED_STATUS[label] ?? '#9ca3af'}
          />
        </ChartCard>

        <ChartCard title="Rendez-vous des 14 prochains jours">
          <TrendLineChart data={dashStats?.appointmentsNext14Days ?? []} xTickFormatter={formatShortDate} />
        </ChartCard>

        <ChartCard title="Mouvements des séjours" subtitle="14 derniers jours — admissions vs sorties">
          <GroupedBarChart
            data={dashStats?.stayMovementsLast14Days ?? []}
            xKey="date"
            xTickFormatter={formatShortDate}
            series={[
              { key: 'admissions', name: 'Admissions', color: '#2a78d6' },
              { key: 'discharges', name: 'Sorties', color: '#008300' },
            ]}
          />
        </ChartCard>

        <ChartCard title="Top 5 des diagnostics (CIM-10)" subtitle="Par nombre d'occurrences">
          <RankingBarChart data={dashStats?.topIcd10 ?? []} height={220} />
        </ChartCard>

        <ChartCard title="Diagnostics par type">
          <CategoryBarChart
            data={dashStats?.diagnosesByType ?? []}
            labelMap={DIAGNOSIS_TYPE_LABELS}
            colorFor={(label) => DIAGNOSIS_TYPE_COLORS[label] ?? '#2a78d6'}
            height={220}
          />
        </ChartCard>

        <ChartCard title="Patients par genre">
          <CategoryBarChart
            data={dashStats?.patientsByGender ?? []}
            labelMap={{ M: formatGender('M'), F: formatGender('F'), O: formatGender('O') }}
            colorFor={(label) => GENDER_COLORS[label] ?? '#2a78d6'}
            height={220}
          />
        </ChartCard>

        <ChartCard title="Bloc opératoire par statut">
          <CategoryBarChart
            data={dashStats?.surgicalOperationsByStatus ?? []}
            labelMap={SURGICAL_STATUS_LABELS}
            colorFor={(label) => SURGICAL_STATUS_COLORS[label] ?? '#2a78d6'}
            height={220}
          />
        </ChartCard>

        <ChartCard title="Consentements RGPD par statut">
          <CategoryBarChart
            data={dashStats?.consentsByStatus ?? []}
            labelMap={CONSENT_STATUS_LABELS}
            colorFor={(label) => CONSENT_STATUS_COLORS[label] ?? '#2a78d6'}
            height={220}
          />
        </ChartCard>

        {isAdmin && dashStats?.auditActionsLast7Days && (
          <ChartCard title="Activité (journal d'audit)" subtitle="7 derniers jours, toutes actions confondues">
            <CategoryBarChart
              data={dashStats.auditActionsLast7Days}
              labelMap={AUDIT_ACTION_LABELS}
              colorFor={(label) => AUDIT_ACTION_COLORS[label] ?? '#2a78d6'}
              height={220}
            />
          </ChartCard>
        )}
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
