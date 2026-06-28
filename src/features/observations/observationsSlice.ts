import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { ObservationRead, ObservationWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<ObservationRead, ObservationWrite>('observations', ENDPOINTS.OBSERVATIONS);
export const observationsActions = actions;
export default slice.reducer;
