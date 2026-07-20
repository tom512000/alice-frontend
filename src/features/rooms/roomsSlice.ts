import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { RoomRead, RoomWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<RoomRead, RoomWrite>('rooms', ENDPOINTS.ROOMS);
export const roomsActions = actions;
export default slice.reducer;
