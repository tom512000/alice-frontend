import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { TreatmentRead, TreatmentWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<TreatmentRead, TreatmentWrite>('treatments', ENDPOINTS.TREATMENTS);
export const treatmentsActions = actions;
export default slice.reducer;
