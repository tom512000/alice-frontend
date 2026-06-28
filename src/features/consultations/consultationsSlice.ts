import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { ConsultationRead, ConsultationWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<ConsultationRead, ConsultationWrite>('consultations', ENDPOINTS.CONSULTATIONS);
export const consultationsActions = actions;
export default slice.reducer;
