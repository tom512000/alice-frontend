import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiClient, buildParams, extractMembers } from '@/api/client';
import type { ListParams, ListResult } from '@/types/api';

export interface EntityState<T> {
  items: T[];
  current: T | null;
  totalItems: number;
  page: number;
  itemsPerPage: number;
  loading: boolean;
  saving: boolean;
  error: string | null;
  violations: Record<string, string>;
}

function createEntityState<T>(): EntityState<T> {
  return {
    items: [],
    current: null,
    totalItems: 0,
    page: 1,
    itemsPerPage: 30,
    loading: false,
    saving: false,
    error: null,
    violations: {},
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEntityState = EntityState<any>;

export function createEntitySlice<TRead extends { '@id': string }, TWrite>(
  name: string,
  endpoint: string
) {
  const fetchList = createAsyncThunk<ListResult<TRead>, ListParams, { rejectValue: string }>(
    `${name}/fetchList`,
    async (params, { rejectWithValue }) => {
      try {
        const res = await apiClient.get(`/${endpoint}`, { params: buildParams(params) });
        const result = extractMembers<TRead>(res.data);
        result.page = params.page ?? 1;
        result.itemsPerPage = params.itemsPerPage ?? 30;
        return result;
      } catch (err) {
        const e = err as { message: string };
        return rejectWithValue(e.message);
      }
    }
  );

  const fetchOne = createAsyncThunk<TRead, number | string, { rejectValue: string }>(
    `${name}/fetchOne`,
    async (id, { rejectWithValue }) => {
      try {
        const res = await apiClient.get(`/${endpoint}/${id}`);
        return res.data as TRead;
      } catch (err) {
        const e = err as { message: string };
        return rejectWithValue(e.message);
      }
    }
  );

  const createOne = createAsyncThunk<TRead, TWrite, { rejectValue: string }>(
    `${name}/createOne`,
    async (data, { rejectWithValue }) => {
      try {
        const res = await apiClient.post(`/${endpoint}`, data);
        return res.data as TRead;
      } catch (err) {
        const e = err as { message: string };
        return rejectWithValue(e.message);
      }
    }
  );

  const updateOne = createAsyncThunk<TRead, { id: number | string; data: Partial<TWrite> }, { rejectValue: string }>(
    `${name}/updateOne`,
    async ({ id, data }, { rejectWithValue }) => {
      try {
        const res = await apiClient.put(`/${endpoint}/${id}`, data);
        return res.data as TRead;
      } catch (err) {
        const e = err as { message: string };
        return rejectWithValue(e.message);
      }
    }
  );

  const patchOne = createAsyncThunk<TRead, { id: number | string; data: Partial<TWrite> }, { rejectValue: string }>(
    `${name}/patchOne`,
    async ({ id, data }, { rejectWithValue }) => {
      try {
        const res = await apiClient.patch(`/${endpoint}/${id}`, data, {
          headers: { 'Content-Type': 'application/merge-patch+json' },
        });
        return res.data as TRead;
      } catch (err) {
        const e = err as { message: string };
        return rejectWithValue(e.message);
      }
    }
  );

  const deleteOne = createAsyncThunk<number | string, number | string, { rejectValue: string }>(
    `${name}/deleteOne`,
    async (id, { rejectWithValue }) => {
      try {
        await apiClient.delete(`/${endpoint}/${id}`);
        return id;
      } catch (err) {
        const e = err as { message: string };
        return rejectWithValue(e.message);
      }
    }
  );

  const slice = createSlice({
    name,
    initialState: createEntityState<TRead>() as AnyEntityState,
    reducers: {
      setCurrent(state, action: PayloadAction<TRead | null>) {
        state.current = action.payload;
      },
      clearError(state) {
        state.error = null;
        state.violations = {};
      },
      setPage(state, action: PayloadAction<number>) {
        state.page = action.payload;
      },
    },
    extraReducers(builder) {
      builder
        .addCase(fetchList.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(fetchList.fulfilled, (state, action) => {
          state.loading = false;
          state.items = action.payload.items;
          state.totalItems = action.payload.totalItems;
          state.page = action.payload.page;
          state.itemsPerPage = action.payload.itemsPerPage;
        })
        .addCase(fetchList.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload ?? 'Erreur';
        })

        .addCase(fetchOne.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(fetchOne.fulfilled, (state, action) => {
          state.loading = false;
          state.current = action.payload;
        })
        .addCase(fetchOne.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload ?? 'Erreur';
        })

        .addCase(createOne.pending, (state) => { state.saving = true; state.error = null; state.violations = {}; })
        .addCase(createOne.fulfilled, (state, action) => {
          state.saving = false;
          state.items.unshift(action.payload);
          state.current = action.payload;
        })
        .addCase(createOne.rejected, (state, action) => {
          state.saving = false;
          state.error = action.payload ?? 'Erreur';
        })

        .addCase(updateOne.pending, (state) => { state.saving = true; state.error = null; state.violations = {}; })
        .addCase(updateOne.fulfilled, (state, action) => {
          state.saving = false;
          const idx = state.items.findIndex((i) => i['@id'] === action.payload['@id']);
          if (idx !== -1) state.items[idx] = action.payload;
          state.current = action.payload;
        })
        .addCase(updateOne.rejected, (state, action) => {
          state.saving = false;
          state.error = action.payload ?? 'Erreur';
        })

        .addCase(patchOne.pending, (state) => { state.saving = true; state.error = null; state.violations = {}; })
        .addCase(patchOne.fulfilled, (state, action) => {
          state.saving = false;
          const idx = state.items.findIndex((i) => i['@id'] === action.payload['@id']);
          if (idx !== -1) state.items[idx] = action.payload;
          state.current = action.payload;
        })
        .addCase(patchOne.rejected, (state, action) => {
          state.saving = false;
          state.error = action.payload ?? 'Erreur';
        })

        .addCase(deleteOne.pending, (state) => { state.saving = true; state.error = null; })
        .addCase(deleteOne.fulfilled, (state, action) => {
          state.saving = false;
          state.items = state.items.filter(
            (i) => !i['@id'].endsWith(`/${action.payload}`)
          );
          if (state.current && state.current['@id'].endsWith(`/${action.payload}`)) {
            state.current = null;
          }
        })
        .addCase(deleteOne.rejected, (state, action) => {
          state.saving = false;
          state.error = action.payload ?? 'Erreur';
        });
    },
  });

  return {
    slice,
    actions: {
      ...slice.actions,
      fetchList,
      fetchOne,
      createOne,
      updateOne,
      patchOne,
      deleteOne,
    },
  };
}
