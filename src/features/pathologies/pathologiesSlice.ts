import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { PathologyRead, PathologyWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<PathologyRead, PathologyWrite>('pathologies', ENDPOINTS.PATHOLOGIES);
export const pathologiesActions = actions;
export default slice.reducer;
