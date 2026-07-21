import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';

export type VitalSeverity = 'normal' | 'warning' | 'critical';

export interface VitalMetric {
  key: string;
  label: string;
  unit: string;
  value: number | string;
  severity: VitalSeverity;
}

export interface BedVitals {
  bedId: number;
  bedLabel: string;
  roomName: string | null;
  patient: { id: number; firstname: string | null; lastname: string | null } | null;
  severity: VitalSeverity;
  metrics: VitalMetric[];
}

export const fetchVitals = createAsyncThunk('monitoring/fetchVitals', async () => {
  const res = await apiClient.get<BedVitals[]>(ENDPOINTS.MONITORING_VITALS);
  return res.data;
});

interface MonitoringState {
  entries: BedVitals[];
  loaded: boolean;
  /** Lits épinglés en card flottante (suivent l'utilisateur sur toute l'app). */
  pinnedBedIds: number[];
}

function loadPinned(): number[] {
  try {
    const raw = localStorage.getItem('alice_pinned_beds');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'number') : [];
  } catch {
    return [];
  }
}

const initialState: MonitoringState = { entries: [], loaded: false, pinnedBedIds: loadPinned() };

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    // Alimenté par le flux SSE (voir MonitoringAlerts).
    setVitals(state, action: PayloadAction<BedVitals[]>) {
      state.entries = action.payload;
      state.loaded = true;
    },
    togglePin(state, action: PayloadAction<number>) {
      const id = action.payload;
      state.pinnedBedIds = state.pinnedBedIds.includes(id)
        ? state.pinnedBedIds.filter((x) => x !== id)
        : [...state.pinnedBedIds, id];
    },
    unpin(state, action: PayloadAction<number>) {
      state.pinnedBedIds = state.pinnedBedIds.filter((x) => x !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchVitals.fulfilled, (state, action) => {
      state.entries = action.payload;
      state.loaded = true;
    });
  },
});

export const { setVitals, togglePin, unpin } = monitoringSlice.actions;
export default monitoringSlice.reducer;
