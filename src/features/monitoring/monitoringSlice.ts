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
}

const initialState: MonitoringState = { entries: [], loaded: false };

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    // Alimenté par le flux SSE (voir MonitoringAlerts).
    setVitals(state, action: PayloadAction<BedVitals[]>) {
      state.entries = action.payload;
      state.loaded = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchVitals.fulfilled, (state, action) => {
      state.entries = action.payload;
      state.loaded = true;
    });
  },
});

export const { setVitals } = monitoringSlice.actions;
export default monitoringSlice.reducer;
