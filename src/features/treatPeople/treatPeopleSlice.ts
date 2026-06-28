import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { TreatPersonRead, TreatPersonWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<TreatPersonRead, TreatPersonWrite>('treatPeople', ENDPOINTS.TREAT_PEOPLE);
export const treatPeopleActions = actions;
export default slice.reducer;
