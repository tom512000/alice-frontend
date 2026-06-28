import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { AllergyRead, AllergyWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<AllergyRead, AllergyWrite>('allergies', ENDPOINTS.ALLERGIES);
export const allergiesActions = actions;
export default slice.reducer;
