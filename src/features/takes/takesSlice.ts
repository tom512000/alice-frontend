import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { TakeRead, TakeWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<TakeRead, TakeWrite>('takes', ENDPOINTS.TAKES);
export const takesActions = actions;
export default slice.reducer;
