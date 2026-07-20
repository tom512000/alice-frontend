import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';

export interface DashboardKpis {
  patientsTotal: number;
  patientsHospitalizedNow: number;
  appointmentsToday: number;
  bedsTotal: number;
  bedsFree: number;
  bedsReserved: number;
  bedsOccupied: number;
  upcomingOperations: number;
}

export interface LabelCount {
  label: string;
  count: number;
}

export interface DayCount {
  date: string;
  count: number;
}

export interface StayMovement {
  date: string;
  admissions: number;
  discharges: number;
}

export interface Icd10Count {
  code: string;
  label: string;
  count: number;
}

export interface DashboardStats {
  kpis: DashboardKpis;
  bedOccupancy: LabelCount[];
  appointmentsNext14Days: DayCount[];
  stayMovementsLast14Days: StayMovement[];
  diagnosesByType: LabelCount[];
  topIcd10: Icd10Count[];
  patientsByGender: LabelCount[];
  surgicalOperationsByStatus: LabelCount[];
  consentsByStatus: LabelCount[];
  auditActionsLast7Days: LabelCount[] | null;
}

const JSON_HEADERS = { headers: { Accept: 'application/json' } };

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await apiClient.get<DashboardStats>(`/${ENDPOINTS.DASHBOARD_STATS}`, JSON_HEADERS);
  return res.data;
}
