import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { PrescriptionRead, PrescriptionWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<PrescriptionRead, PrescriptionWrite>('prescriptions', ENDPOINTS.PRESCRIPTIONS);
export const prescriptionsActions = actions;
export default slice.reducer;
