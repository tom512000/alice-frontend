import { ENDPOINTS, type EndpointValue } from '@/api/endpoints';

export function toIri(endpoint: EndpointValue, id: number | string): string {
  return `/api/${endpoint}/${id}`;
}

export function extractId(iri: string): number {
  const parts = iri.split('/');
  return parseInt(parts[parts.length - 1], 10);
}

export function getIdFromResource(resource: { '@id': string } | string | null | undefined): number | null {
  if (!resource) return null;
  const iri = typeof resource === 'string' ? resource : resource['@id'];
  return extractId(iri);
}

export const IRI = {
  user: (id: number) => toIri(ENDPOINTS.USERS, id),
  patient: (id: number) => toIri(ENDPOINTS.PATIENTS, id),
  appointment: (id: number) => toIri(ENDPOINTS.APPOINTMENTS, id),
  consultation: (id: number) => toIri(ENDPOINTS.CONSULTATIONS, id),
  stay: (id: number) => toIri(ENDPOINTS.STAYS, id),
  observation: (id: number) => toIri(ENDPOINTS.OBSERVATIONS, id),
  vitalSign: (id: number) => toIri(ENDPOINTS.VITAL_SIGNS, id),
  medicalExam: (id: number) => toIri(ENDPOINTS.MEDICAL_EXAMS, id),
  medicalHistory: (id: number) => toIri(ENDPOINTS.MEDICAL_HISTORIES, id),
  diagnosis: (id: number) => toIri(ENDPOINTS.DIAGNOSES, id),
  prescription: (id: number) => toIri(ENDPOINTS.PRESCRIPTIONS, id),
  treatment: (id: number) => toIri(ENDPOINTS.TREATMENTS, id),
  medicine: (id: number) => toIri(ENDPOINTS.MEDICINES, id),
  pathology: (id: number) => toIri(ENDPOINTS.PATHOLOGIES, id),
  allergy: (id: number) => toIri(ENDPOINTS.ALLERGIES, id),
  service: (id: number) => toIri(ENDPOINTS.SERVICES, id),
  specialty: (id: number) => toIri(ENDPOINTS.SPECIALTIES, id),
  holiday: (id: number) => toIri(ENDPOINTS.HOLIDAYS, id),
  surgicalOperation: (id: number) => toIri(ENDPOINTS.SURGICAL_OPERATIONS, id),
  treatPerson: (id: number) => toIri(ENDPOINTS.TREAT_PEOPLE, id),
};
