import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export interface Icd10Suggestion {
  code: string;
  label: string;
  rationale: string;
}

const JSON_HEADERS = { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } };

/** Suggère des codes CIM-10 pertinents à partir d'un motif clinique en texte libre (assistance IA). */
export async function suggestIcd10(text: string): Promise<Icd10Suggestion[]> {
  const res = await apiClient.post<{ suggestions: Icd10Suggestion[] }>(
    `/${ENDPOINTS.AI_ICD10_SUGGEST}`,
    { text },
    JSON_HEADERS
  );
  return res.data.suggestions;
}

/** Génère un brouillon de compte-rendu de sortie pour un séjour, à partir des données structurées (assistance IA). */
export async function generateDischargeSummary(stayId: number | string): Promise<string> {
  const res = await apiClient.get<{ summary: string }>(
    `/stays/${stayId}/discharge-summary`,
    JSON_HEADERS
  );
  return res.data.summary;
}
