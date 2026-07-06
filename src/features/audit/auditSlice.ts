import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { AuditLogRead } from '@/types/entities';

// Journal d'audit en lecture seule (aucune écriture exposée côté API).
const { slice, actions } = createEntitySlice<AuditLogRead, Record<string, never>>(
  'audit',
  ENDPOINTS.AUDIT_LOGS
);

export const auditActions = actions;
export default slice.reducer;
