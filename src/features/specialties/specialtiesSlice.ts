import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { SpecialtyRead, SpecialtyWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<SpecialtyRead, SpecialtyWrite>('specialties', ENDPOINTS.SPECIALTIES);
export const specialtiesActions = actions;
export default slice.reducer;
