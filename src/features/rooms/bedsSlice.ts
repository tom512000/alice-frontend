import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { BedRead, BedWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<BedRead, BedWrite>('beds', ENDPOINTS.BEDS);
export const bedsActions = actions;
export default slice.reducer;
