import { createEntitySlice } from '@/features/createEntitySlice';
import { ENDPOINTS } from '@/api/endpoints';
import type { CommentRead, CommentWrite } from '@/types/entities';

const { slice, actions } = createEntitySlice<CommentRead, CommentWrite>('comments', ENDPOINTS.COMMENTS);
export const commentsActions = actions;
export default slice.reducer;
