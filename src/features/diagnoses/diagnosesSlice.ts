import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { DiagnosisRead, DiagnosisWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<DiagnosisRead, DiagnosisWrite>('diagnoses', ENDPOINTS.DIAGNOSES);
export const diagnosesActions = actions;
export default slice.reducer;
