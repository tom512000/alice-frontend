import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { PatientRead, PatientWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<PatientRead, PatientWrite>(
  'patients',
  ENDPOINTS.PATIENTS
);

export const patientsActions = actions;
export default slice.reducer;
