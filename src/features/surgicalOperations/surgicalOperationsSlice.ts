import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { SurgicalOperationRead, SurgicalOperationWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<SurgicalOperationRead, SurgicalOperationWrite>('surgicalOperations', ENDPOINTS.SURGICAL_OPERATIONS);
export const surgicalOperationsActions = actions;
export default slice.reducer;
