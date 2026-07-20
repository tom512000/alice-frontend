import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import { apiClient } from '@/api/client';
import type { DocumentRead, DocumentWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<DocumentRead, DocumentWrite>('documents', ENDPOINTS.DOCUMENTS);
export const documentsActions = actions;
export default slice.reducer;

/**
 * Télécharge le fichier d'un document via l'endpoint authentifié, puis déclenche
 * l'enregistrement côté navigateur. Le token JWT est ajouté par l'intercepteur axios.
 */
export async function downloadDocument(doc: DocumentRead): Promise<void> {
  const res = await apiClient.get(`/${ENDPOINTS.DOCUMENTS}/${doc.id}/download`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(res.data as Blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = doc.originalName ?? doc.title ?? `document-${doc.id}`;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/** Lit un File en chaîne base64 (sans le préfixe data URI). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
