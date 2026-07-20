import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { ConsentRead, ConsentWrite } from '@/types/entities';

// Consentements RGPD rattachés au patient.
const { slice, actions } = createEntitySlice<ConsentRead, ConsentWrite>(
  'consents',
  ENDPOINTS.CONSENTS
);

export const consentsActions = actions;
export default slice.reducer;
