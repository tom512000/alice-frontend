import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { MedicineRead, MedicineWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<MedicineRead, MedicineWrite>('medicines', ENDPOINTS.MEDICINES);
export const medicinesActions = actions;
export default slice.reducer;
