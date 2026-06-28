import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { VitalSignRead, VitalSignWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<VitalSignRead, VitalSignWrite>('vitalSigns', ENDPOINTS.VITAL_SIGNS);
export const vitalSignsActions = actions;
export default slice.reducer;
