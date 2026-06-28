import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { StayRead, StayWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<StayRead, StayWrite>('stays', ENDPOINTS.STAYS);
export const staysActions = actions;
export default slice.reducer;
