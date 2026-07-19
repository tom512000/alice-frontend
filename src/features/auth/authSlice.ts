import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, LoginResponse, AuthUser } from '@/types/auth';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { ApiError } from '@/types/api';

function decodeJwt(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      login: payload.username as string,
      roles: payload.roles as string[],
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}

function loadFromStorage(): Partial<AuthState> {
  const token = localStorage.getItem('alice_token');
  if (!token) return {};
  const user = decodeJwt(token);
  if (!user || user.exp * 1000 < Date.now()) {
    localStorage.removeItem('alice_token');
    return {};
  }
  return { token, user, isAuthenticated: true };
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  ...loadFromStorage(),
};

export const login = createAsyncThunk<
  { token: string; user: AuthUser } | { requires2fa: true; preAuthToken: string },
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<LoginResponse>(
      ENDPOINTS.LOGIN,
      credentials,
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (response.data.requires2fa) {
      return { requires2fa: true, preAuthToken: response.data.preAuthToken ?? '' };
    }
    const token = response.data.token ?? '';
    const user = decodeJwt(token);
    if (!user) throw new Error('Token invalide');
    localStorage.setItem('alice_token', token);
    return { token, user };
  } catch (err) {
    const apiErr = err as ApiError;
    return rejectWithValue(
      apiErr.message || 'Identifiants incorrects'
    );
  }
});

/** Étape 2 du login quand la 2FA est activée : échange le code TOTP contre le vrai JWT. */
export const verifyTwoFactorLogin = createAsyncThunk<
  { token: string; user: AuthUser },
  { preAuthToken: string; code: string },
  { rejectValue: string }
>('auth/verifyTwoFactorLogin', async ({ preAuthToken, code }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<{ token: string }>(
      '/2fa/login-verify',
      { preAuthToken, code },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const { token } = response.data;
    const user = decodeJwt(token);
    if (!user) throw new Error('Token invalide');
    localStorage.setItem('alice_token', token);
    return { token, user };
  } catch (err) {
    const apiErr = err as ApiError;
    return rejectWithValue(apiErr.message || 'Code invalide');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('alice_token');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if ('requires2fa' in action.payload) {
          return;
        }
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Erreur de connexion';
        state.isAuthenticated = false;
      })
      .addCase(verifyTwoFactorLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyTwoFactorLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyTwoFactorLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Code invalide';
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
