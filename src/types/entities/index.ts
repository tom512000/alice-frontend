export interface IriRef {
  '@id': string;
  '@type'?: string;
}

export interface UserRead {
  '@id': string;
  id: number;
  login: string;
  roles: string[];
  lastname: string;
  firstname: string;
  birthdate: string | null;
  gender: 'M' | 'F' | 'O' | null;
  number: string | null;
  phone: string | null;
  specialty: SpecialtyRead | null;
  service: ServiceRead | null;
  totpEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IdentityStatus =
  | 'provisional'
  | 'retrieved'
  | 'validated'
  | 'qualified'
  | 'doubtful';

export interface UserWrite {
  login: string;
  roles: string[];
  plainPassword?: string;
  lastname: string;
  firstname: string;
  birthdate?: string | null;
  gender?: 'M' | 'F' | 'O' | null;
  number?: string | null;
  phone?: string | null;
  specialty?: string | null;
  service?: string | null;
}

export interface PatientRead {
  '@id': string;
  id: number;
  lastname: string;
  firstname: string;
  gender: 'M' | 'F' | 'O' | null;
  birthdate: string | null;
  nss: string | null;
  insMatricule: string | null;
  insOid: string | null;
  birthPlaceCode: string | null;
  identityStatus: IdentityStatus;
  bloodType: string | null;
  email: string | null;
  street: string | null;
  city: string | null;
  postalCode: string | null;
  phoneNumber: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  treatingDoctor: UserRead | null;
  allergies: AllergyRead[];
  consents: ConsentRead[];
  consultations: string[];
  stays: string[];
  appointments: string[];
  medicalExams: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PatientWrite {
  lastname: string;
  firstname: string;
  gender?: 'M' | 'F' | 'O' | null;
  birthdate?: string | null;
  nss?: string | null;
  insMatricule?: string | null;
  insOid?: string | null;
  birthPlaceCode?: string | null;
  identityStatus?: IdentityStatus;
  bloodType?: string | null;
  email?: string | null;
  street?: string | null;
  city?: string | null;
  postalCode?: string | null;
  phoneNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  treatingDoctor?: string | null;
  allergies?: string[];
}

export interface AppointmentRead {
  '@id': string;
  id: number;
  patient: PatientRead;
  doctor: UserRead;
  scheduledAt: string;
  durationMinutes: number | null;
  reason: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentWrite {
  patient: string;
  doctor: string;
  scheduledAt: string;
  durationMinutes?: number | null;
  reason?: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string | null;
}

export interface ConsultationRead {
  '@id': string;
  id: number;
  consultationDate: string;
  details: string | null;
  recommendations: string | null;
  price: string | null;
  patient: PatientRead;
  user: UserRead;
  prescriptions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationWrite {
  consultationDate: string;
  details?: string | null;
  recommendations?: string | null;
  price?: string | null;
  patient: string;
  user: string;
}

export interface StayRead {
  '@id': string;
  id: number;
  startDate: string;
  endDate: string | null;
  room: string | null;
  observation: string | null;
  patient: PatientRead;
  service: ServiceRead | null;
  bed: string | null;
  observations: ObservationRead[];
  createdAt: string;
  updatedAt: string;
}

export interface StayWrite {
  startDate: string;
  endDate?: string | null;
  room?: string | null;
  observation?: string | null;
  patient: string;
  service?: string | null;
  bed?: string | null;
}

export interface ObservationRead {
  '@id': string;
  id: number;
  observationDate: string;
  note: string;
  stay: string | null;
  user: UserRead;
}

export interface ObservationWrite {
  observationDate: string;
  note: string;
  stay?: string | null;
  user: string;
}

export interface VitalSignRead {
  '@id': string;
  id: number;
  patient: PatientRead;
  stay: StayRead | null;
  recordedBy: UserRead;
  recordedAt: string;
  temperature: string | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  heartRate: number | null;
  oxygenSaturation: string | null;
  respiratoryRate: number | null;
  weight: string | null;
  height: string | null;
  bloodGlucose: string | null;
  painScore: number | null;
  notes: string | null;
}

export interface VitalSignWrite {
  patient: string;
  stay?: string | null;
  recordedBy: string;
  recordedAt: string;
  temperature?: string | null;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  heartRate?: number | null;
  oxygenSaturation?: string | null;
  respiratoryRate?: number | null;
  weight?: string | null;
  height?: string | null;
  bloodGlucose?: string | null;
  painScore?: number | null;
  notes?: string | null;
}

export interface DiagnosisRead {
  '@id': string;
  id: number;
  patient: PatientRead;
  consultation: ConsultationRead | null;
  stay: StayRead | null;
  physician: UserRead;
  icd10Code: string | null;
  label: string;
  type: 'principal' | 'associated' | 'secondary' | 'complication' | 'differential';
  certainty: 'confirmed' | 'suspected' | 'excluded';
  diagnosedAt: string;
  notes: string | null;
}

export interface DiagnosisWrite {
  patient: string;
  consultation?: string | null;
  stay?: string | null;
  physician: string;
  icd10Code?: string | null;
  label: string;
  type: string;
  certainty: string;
  diagnosedAt: string;
  notes?: string | null;
}

export interface MedicalExamRead {
  '@id': string;
  id: number;
  patient: PatientRead;
  prescribedBy: UserRead;
  type: string;
  requestDate: string;
  resultDate: string | null;
  description: string | null;
  results: string | null;
  consultation: ConsultationRead | null;
  stay: StayRead | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalExamWrite {
  patient: string;
  prescribedBy: string;
  type: string;
  requestDate: string;
  resultDate?: string | null;
  description?: string | null;
  results?: string | null;
  consultation?: string | null;
  stay?: string | null;
}

export interface MedicalHistoryRead {
  '@id': string;
  id: number;
  patient: PatientRead;
  recordedBy: UserRead | null;
  type: string;
  description: string;
  diagnosisYear: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface MedicalHistoryWrite {
  patient: string;
  recordedBy?: string | null;
  type: string;
  description: string;
  diagnosisYear?: number | null;
  isActive?: boolean;
}

export interface MedicineRead {
  '@id': string;
  id: number;
  name: string;
  cisCode: string | null;
  dci: string | null;
  pharmaceuticalForm: string | null;
  routeOfAdministration: string | null;
  dosage: string | null;
  marketingStatus: string | null;
}

export interface MedicineWrite {
  name: string;
  cisCode?: string | null;
  dci?: string | null;
  pharmaceuticalForm?: string | null;
  routeOfAdministration?: string | null;
  dosage?: string | null;
  marketingStatus?: string | null;
}

export interface PathologyRead {
  '@id': string;
  id: number;
  name: string;
  chronicPerDay: number | null;
  durationBetweenTakes: number | null;
}

export interface PathologyWrite {
  name: string;
  chronicPerDay?: number | null;
  durationBetweenTakes?: number | null;
}

export interface TreatmentRead {
  '@id': string;
  id: number;
  name: string;
  numberOfIntakes: number | null;
  posology: string | null;
  medicines: MedicineRead[];
  pathologies: PathologyRead[];
}

export interface TreatmentWrite {
  name: string;
  numberOfIntakes?: number | null;
  posology?: string | null;
  medicines?: string[];
  pathologies?: string[];
}

export interface PrescriptionRead {
  '@id': string;
  id: number;
  number: string | null;
  consultation: ConsultationRead;
  user: UserRead;
  treatments: TreatmentRead[];
}

export interface PrescriptionWrite {
  number?: string | null;
  consultation: string;
  user: string;
  treatments?: string[];
  // Confirme la prescription malgré une alerte allergie croisée (surcharge du prescripteur).
  overrideAllergyWarning?: boolean;
}

export interface TakeRead {
  '@id': string;
  id: number;
  datetime: string;
  treatment: TreatmentRead;
}

export interface TakeWrite {
  datetime: string;
  treatment: string;
}

export interface AllergyRead {
  '@id': string;
  id: number;
  name: string;
}

export interface AllergyWrite {
  name: string;
}

export interface ServiceRead {
  '@id': string;
  id: number;
  serviceName: string;
}

export interface ServiceWrite {
  serviceName: string;
}

export interface RoomRead {
  '@id': string;
  id: number;
  name: string;
  service: ServiceRead | string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
}

export interface RoomWrite {
  name: string;
  service: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
}

export type BedStatus = 'free' | 'reserved' | 'occupied';

export interface BedRoomRef {
  '@id': string;
  id: number;
  name: string;
}

export interface BedCurrentStay {
  '@id': string;
  id: number;
  startDate: string;
  endDate: string | null;
  patient: { '@id': string; id: number; lastname: string; firstname: string };
}

export interface BedRead {
  '@id': string;
  id: number;
  label: string;
  room: BedRoomRef | string;
  status: BedStatus;
  currentStay?: BedCurrentStay | null;
}

export interface BedWrite {
  label: string;
  room: string;
}

export interface SpecialtyRead {
  '@id': string;
  id: number;
  name: string;
}

export interface SpecialtyWrite {
  name: string;
}

export interface HolidayRead {
  '@id': string;
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  user: UserRead;
}

export interface HolidayWrite {
  startDate: string;
  endDate: string;
  status: string;
  user: string;
}

export interface SurgicalOperationRead {
  '@id': string;
  id: number;
  patient: PatientRead;
  stay: StayRead | null;
  leadSurgeon: UserRead;
  anesthesiologist: UserRead | null;
  operationType: string;
  status: 'scheduled' | 'performed' | 'cancelled' | 'postponed';
  scheduledAt: string;
  performedAt: string | null;
  durationMinutes: number | null;
  operatingRoom: string | null;
  anesthesiaType: string | null;
  ccamCode: string | null;
  preoperativeNotes: string | null;
  operativeReport: string | null;
  complications: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SurgicalOperationWrite {
  patient: string;
  stay?: string | null;
  leadSurgeon: string;
  anesthesiologist?: string | null;
  operationType: string;
  status: string;
  scheduledAt: string;
  performedAt?: string | null;
  durationMinutes?: number | null;
  operatingRoom?: string | null;
  anesthesiaType?: string | null;
  ccamCode?: string | null;
  preoperativeNotes?: string | null;
  operativeReport?: string | null;
  complications?: string | null;
}

export interface DocumentRead {
  '@id': string;
  id: number;
  type: string;
  title: string | null;
  patient: PatientRead;
  uploadedBy: UserRead | null;
  uploadedAt: string | null;
  originalName: string | null;
  mimeType: string | null;
  filePath: string | null;
}

export interface DocumentWrite {
  type: string;
  title?: string | null;
  patient: string;
  uploadedBy?: string | null;
  // Contenu du fichier encodé en base64 (data URI acceptée). Décodé côté serveur.
  base64Content?: string | null;
  originalName?: string | null;
  mimeType?: string | null;
}

export interface CommentRead {
  '@id': string;
  id: number;
  patient: PatientRead;
  consultation: ConsultationRead | null;
  author: UserRead;
  writtenAt: string;
  content: string;
}

export interface CommentWrite {
  patient: string;
  consultation?: string | null;
  author: string;
  writtenAt: string;
  content: string;
}

export interface TreatPersonRead {
  '@id': string;
  id: number;
  patient: PatientRead | null;
  lastName: string;
  firstName: string | null;
  relationship: string | null;
  phone: string | null;
  personNumber: string | null;
  initialDate: string;
  finalDate: string | null;
}

export interface TreatPersonWrite {
  patient?: string | null;
  lastName: string;
  firstName?: string | null;
  relationship?: string | null;
  phone?: string | null;
  personNumber?: string | null;
  initialDate: string;
  finalDate?: string | null;
}

export interface Icd10CodeRead {
  '@id': string;
  id: number;
  code: string;
  label: string;
  chapter: string | null;
}

export interface Icd10CodeWrite {
  code: string;
  label: string;
  chapter?: string | null;
}

export interface AuditLogRead {
  '@id': string;
  id: number;
  action: 'create' | 'update' | 'delete' | 'read';
  entityClass: string;
  entityId: number | null;
  username: string | null;
  changes: Record<string, [unknown, unknown]> | null;
  ipAddress: string | null;
  createdAt: string;
}

export type ConsentType = 'care' | 'data_sharing' | 'dmp' | 'research' | 'mssante';
export type ConsentStatus = 'granted' | 'refused' | 'withdrawn';

export interface ConsentRead {
  '@id': string;
  id: number;
  patient: PatientRead | string;
  type: ConsentType;
  status: ConsentStatus;
  recordedAt: string;
  notes: string | null;
}

export interface ConsentWrite {
  patient: string;
  type: ConsentType;
  status: ConsentStatus;
  recordedAt: string;
  notes?: string | null;
}
