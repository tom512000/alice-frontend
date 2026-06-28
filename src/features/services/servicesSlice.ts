import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { ServiceRead, ServiceWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<ServiceRead, ServiceWrite>('services', ENDPOINTS.SERVICES);
export const servicesActions = actions;
export default slice.reducer;
