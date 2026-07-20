import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { Icd10CodeRead, Icd10CodeWrite } from '@/types/entities';

// Référentiel CIM-10 (lecture pour tous, écriture admin).
const { slice, actions } = createEntitySlice<Icd10CodeRead, Icd10CodeWrite>(
  'icd10',
  ENDPOINTS.ICD10_CODES
);

export const icd10Actions = actions;
export default slice.reducer;
