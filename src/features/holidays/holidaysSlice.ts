import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { HolidayRead, HolidayWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<HolidayRead, HolidayWrite>('holidays', ENDPOINTS.HOLIDAYS);
export const holidaysActions = actions;
export default slice.reducer;
