import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { MedicalHistoryRead, MedicalHistoryWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<MedicalHistoryRead, MedicalHistoryWrite>('medicalHistories', ENDPOINTS.MEDICAL_HISTORIES);
export const medicalHistoriesActions = actions;
export default slice.reducer;
