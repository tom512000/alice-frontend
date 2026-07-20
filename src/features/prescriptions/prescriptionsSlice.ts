import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import { apiClient } from '@/api/client';
import type { PrescriptionRead, PrescriptionWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<PrescriptionRead, PrescriptionWrite>('prescriptions', ENDPOINTS.PRESCRIPTIONS);
export const prescriptionsActions = actions;
export default slice.reducer;

/**
 * Télécharge l'ordonnance PDF, générée à la demande côté serveur (aucun fichier
 * stocké : régénérée depuis les données structurées à chaque appel).
 */
export async function downloadPrescriptionPdf(prescription: PrescriptionRead): Promise<void> {
  const res = await apiClient.get(`/${ENDPOINTS.PRESCRIPTIONS}/${prescription.id}/pdf`, {
    responseType: 'blob',
    headers: { Accept: 'application/pdf' },
  });
  const url = window.URL.createObjectURL(res.data as Blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = `ordonnance-${prescription.number ?? prescription.id}.pdf`;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
