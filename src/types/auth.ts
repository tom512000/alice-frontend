export interface LoginCredentials {
  login: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  requires2fa?: boolean;
  preAuthToken?: string;
}

export interface JwtPayload {
  iat: number;
  exp: number;
  roles: string[];
  username: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AuthUser {
  login: string;
  roles: string[];
  exp: number;
}

export type UserRole = 'ROLE_ADMIN' | 'ROLE_DOCTOR' | 'ROLE_NURSE' | 'ROLE_USER';
