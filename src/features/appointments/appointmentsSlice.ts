import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { AppointmentRead, AppointmentWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<AppointmentRead, AppointmentWrite>('appointments', ENDPOINTS.APPOINTMENTS);
export const appointmentsActions = actions;
export default slice.reducer;
