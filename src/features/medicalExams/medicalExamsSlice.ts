import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { MedicalExamRead, MedicalExamWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<MedicalExamRead, MedicalExamWrite>('medicalExams', ENDPOINTS.MEDICAL_EXAMS);
export const medicalExamsActions = actions;
export default slice.reducer;
