import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { UserRead, UserWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<UserRead, UserWrite>('users', ENDPOINTS.USERS);
export const usersActions = actions;
export default slice.reducer;
